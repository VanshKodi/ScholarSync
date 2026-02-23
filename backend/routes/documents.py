from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from config.supabase import supabase
from config.auth import get_current_user
from config.gemini import client as gemini_client

router = APIRouter()

GEN_MODEL        = "gemini-2.0-flash"
EMBED_MODEL      = "text-embedding-004"
BUCKET           = "scholar-sync-documents"
SIGNED_URL_TTL   = 300          # seconds (5 minutes)
HYDE_DELIMITER   = "_$_"        # separator Gemini uses between HyDE phrases


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_profile(user_id: str) -> dict:
    resp = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]


def _embed(text: str):
    resp = gemini_client.models.embed_content(model=EMBED_MODEL, content=text)
    return resp.embeddings[0].values

@router.get("/documents-visible-to-user")
def documents_visible_to_user(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    # Get user profile
    profile = supabase.table("profiles") \
        .select("university_id") \
        .eq("id", user_id) \
        .execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    university_id = profile.data[0].get("university_id")

    # Single relational query: fetch visible groups with all their document versions
    groups_resp = supabase.table("document_groups") \
        .select(
            "doc_group_id, title, scope, active_document_id, "
            "documents(document_id, group_id, status, human_description, ai_description, created_at)"
        ) \
        .or_(f"scope.eq.global,created_by.eq.{user_id},university_id.eq.{university_id}") \
        .execute()

    results = []

    for group in groups_resp.data:
        active_id = group.get("active_document_id")
        if not active_id:
            continue

        docs = group.get("documents") or []
        active_doc = next((d for d in docs if d.get("document_id") == active_id), None)

        if active_doc:
            results.append({
                "document_id":       active_doc.get("document_id"),
                "group_id":          active_doc.get("group_id"),
                "title":             group["title"],
                "scope":             group["scope"],
                "human_description": active_doc.get("human_description"),
                "ai_description":    active_doc.get("ai_description"),
                "status":            active_doc.get("status"),
                "is_active":         True,
                "created_at":        active_doc.get("created_at"),
            })

    return results

@router.get("/my-document-groups")
def my_document_groups(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    profile = supabase.table("profiles") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    university_id = profile.data[0].get("university_id")

    groups = supabase.table("document_groups") \
         .select("doc_group_id, title, scope") \
        .or_(f"created_by.eq.{user_id},university_id.eq.{university_id}") \
        .order("title") \
        .execute()

    return groups.data

import uuid

@router.post("/create-document-group-and-upload")
async def create_document_group_and_upload(
    title: str = Form(...),
    description: str = Form(""),
    scope: str = Form("local"),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")

    # Get profile
    profile = supabase.table("profiles") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    university_id = profile.data[0].get("university_id")

    if scope not in {"local", "global"}:
        raise HTTPException(status_code=400, detail="Scope must be local or global")

    # 1️⃣ Create document group
    group_resp = supabase.table("document_groups").insert({
        "title": title,
        "scope": scope,
        "created_by": user_id,
        "university_id": university_id
    }).execute()

    if not group_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create group")

    group_id = group_resp.data[0]["doc_group_id"]

    # 2️⃣ Upload file to storage
    file_id = str(uuid.uuid4())
    path = f"{university_id}/{group_id}/{file_id}_{file.filename}"

    file_bytes = await file.read()

    supabase.storage.from_("scholar-sync-documents").upload(path, file_bytes)

    # 3️⃣ Insert document record
    doc_resp = supabase.table("documents").insert({
        "group_id": group_id,
        "version_number": 1,
        "file_name": file.filename,
        "file_path": path,
        "human_description": description,
        "status": "uploaded"
    }).execute()

    document_id = doc_resp.data[0]["document_id"]

    # 4️⃣ Set active version
    supabase.table("document_groups") \
        .update({"active_document_id": document_id}) \
        .eq("doc_group_id", group_id) \
        .execute()

    return {"message": "Document uploaded successfully"}

@router.post("/upload-new-version")
async def upload_new_version(
    group_id: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("id")

    # Check group exists
    group = supabase.table("document_groups") \
        .select("*") \
        .eq("doc_group_id", group_id) \
        .execute()

    if not group.data:
        raise HTTPException(status_code=404, detail="Group not found")

    university_id = group.data[0].get("university_id")

    # Get latest version
    latest = supabase.table("documents") \
        .select("version_number") \
        .eq("group_id", group_id) \
        .order("version_number", desc=True) \
        .limit(1) \
        .execute()

    next_version = 1
    if latest.data:
        next_version = latest.data[0]["version_number"] + 1

    # Upload file
    file_id = str(uuid.uuid4())
    path = f"{university_id}/{group_id}/v{next_version}_{file_id}_{file.filename}"

    file_bytes = await file.read()

    supabase.storage.from_("scholar-sync-documents").upload(path, file_bytes)

    # Insert new document
    doc_resp = supabase.table("documents").insert({
        "group_id": group_id,
        "version_number": next_version,
        "file_name": file.filename,
        "file_path": path,
        "human_description": description,
        "status": "uploaded"
    }).execute()

    document_id = doc_resp.data[0]["document_id"]

    # Update active version
    supabase.table("document_groups") \
        .update({"active_document_id": document_id}) \
        .eq("doc_group_id", group_id) \
        .execute()

    return {"message": "New version uploaded"}


# ── Document Group Detail ─────────────────────────────────────────────────────

@router.get("/document-group/{group_id}")
def get_document_group(group_id: str, current_user: dict = Depends(get_current_user)):
    """
    Return the document group metadata together with a full list of all
    document versions (sorted by version_number descending).
    """
    user_id = current_user.get("id")
    profile = _get_profile(user_id)
    university_id = profile.get("university_id")
    role = profile.get("role")

    group_resp = supabase.table("document_groups") \
        .select("*") \
        .eq("doc_group_id", group_id) \
        .execute()

    if not group_resp.data:
        raise HTTPException(status_code=404, detail="Document group not found")

    group = group_resp.data[0]
    scope = group.get("scope")
    group_uni = group.get("university_id")

    # Access check
    can_access = (
        scope == "global"
        or group.get("created_by") == user_id
        or (university_id and group_uni == university_id)
    )
    if not can_access:
        raise HTTPException(status_code=403, detail="Access denied")

    # Fetch all versions
    docs_resp = supabase.table("documents") \
        .select("*") \
        .eq("group_id", group_id) \
        .order("version_number", desc=True) \
        .execute()

    versions = docs_resp.data or []
    active_id = group.get("active_document_id")

    for v in versions:
        v["is_latest"] = v.get("document_id") == active_id

    return {
        "group": group,
        "versions": versions,
    }


# ── Version Detail / Edit ─────────────────────────────────────────────────────

@router.patch("/document/{document_id}")
async def update_document(
    document_id: str,
    body: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Update editable fields on a document version.
    Faculty may edit documents they uploaded; admins may edit any document
    in their university.

    Accepted body fields: human_description
    """
    user_id = current_user.get("id")
    profile = _get_profile(user_id)
    role = profile.get("role")
    university_id = profile.get("university_id")

    # Fetch document + group
    doc_resp = supabase.table("documents").select("*") \
        .eq("document_id", document_id).execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = doc_resp.data[0]

    group_resp = supabase.table("document_groups").select("*") \
        .eq("doc_group_id", doc["group_id"]).execute()
    if not group_resp.data:
        raise HTTPException(status_code=404, detail="Document group not found")
    group = group_resp.data[0]

    # Permission: faculty → only own uploads; admin → any doc in their university
    if role == "faculty":
        if group.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Faculty can only edit their own documents")
    elif role == "admin":
        if group.get("university_id") != university_id:
            raise HTTPException(status_code=403, detail="Admin can only edit documents in their university")
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    allowed_fields = {"human_description"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}
    if not updates:
        raise HTTPException(status_code=400, detail="No editable fields provided")

    supabase.table("documents").update(updates) \
        .eq("document_id", document_id).execute()

    return {"message": "Document updated"}


# ── File Download (signed URL) ────────────────────────────────────────────────

@router.get("/download-document/{document_id}")
def download_document(document_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generate a short-lived (5-minute) Supabase signed URL for the requested
    document version.

    Access control:
      - Faculty  : may download local documents from their own university only.
      - Admin    : may download local documents from their university AND global docs.
    """
    user_id = current_user.get("id")
    profile = _get_profile(user_id)
    role = profile.get("role")
    university_id = profile.get("university_id")

    # Fetch document
    doc_resp = supabase.table("documents").select("*") \
        .eq("document_id", document_id).execute()
    if not doc_resp.data:
        raise HTTPException(status_code=404, detail="Document not found")
    doc = doc_resp.data[0]

    # Fetch group for scope
    group_resp = supabase.table("document_groups").select("*") \
        .eq("doc_group_id", doc["group_id"]).execute()
    if not group_resp.data:
        raise HTTPException(status_code=404, detail="Document group not found")
    group = group_resp.data[0]
    scope = group.get("scope")
    group_uni = group.get("university_id")

    # ── Role-based access control ──────────────────────────────────────────
    if role == "faculty":
        # Faculty: local docs from their own university only
        if scope != "local" or group_uni != university_id:
            raise HTTPException(
                status_code=403,
                detail="Faculty can only download local documents from their university",
            )
    elif role == "admin":
        # Admin: global docs (any) + local docs from their university
        if scope == "local" and group_uni != university_id:
            raise HTTPException(
                status_code=403,
                detail="Admin can only download local documents from their university",
            )
    else:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    file_path = doc.get("file_path") or doc.get("storage_path")
    if not file_path:
        raise HTTPException(status_code=500, detail="Document has no stored file path")

    # Generate a 5-minute signed URL
    try:
        signed = supabase.storage.from_(BUCKET).create_signed_url(file_path, SIGNED_URL_TTL)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {exc}")

    url = (
        signed.get("signedURL")
        or signed.get("signed_url")
        or (signed.get("data") or {}).get("signedUrl")
    )
    if not url:
        raise HTTPException(status_code=500, detail="Signed URL not returned by storage")

    return {"url": url, "expires_in": SIGNED_URL_TTL}


# ── HyDE Semantic Search ──────────────────────────────────────────────────────

@router.post("/search-documents")
async def search_documents(
    body: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Hypothetical Document Embeddings (HyDE) search.

    1. Forward the query to Gemini and ask it to produce a few hypothetical
       matching phrases/answers separated by  _$_ .
    2. Embed each phrase.
    3. Run a vector similarity search against the embeddings table.
    4. Aggregate, deduplicate, and return the best matching document groups.
    """
    query = (body.get("query") or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    user_id = current_user.get("id")
    profile = _get_profile(user_id)
    university_id = profile.get("university_id")

    print(f"[SEARCH] HyDE search initiated – query='{query}'")

    # ── Step 1: Gemini → hypothetical phrases ─────────────────────────────────
    hyde_prompt = (
        "You are a search engine assistant for an academic document repository. "
        "Given the following user query, generate 3 short hypothetical phrases or "
        "sentences that would likely appear in a matching academic document. "
        f"Separate each phrase with the delimiter  {HYDE_DELIMITER}  and output nothing else.\n\n"
        f"Query: {query}"
    )
    try:
        hyde_resp = gemini_client.models.generate_content(
            model=GEN_MODEL, contents=hyde_prompt
        )
        raw_phrases = hyde_resp.text.strip()
        print(f"[SEARCH] Gemini HyDE phrases: {raw_phrases}")
        phrases = [p.strip() for p in raw_phrases.split(HYDE_DELIMITER) if p.strip()]
    except Exception as exc:
        print(f"[SEARCH] Gemini HyDE generation failed: {exc} – falling back to query")
        phrases = [query]

    if not phrases:
        phrases = [query]

    # ── Step 2 & 3: Embed each phrase and collect matches ─────────────────────
    seen_group_ids: set = set()
    results: list = []

    for phrase in phrases:
        print(f"[SEARCH] Embedding phrase: '{phrase[:80]}'")
        try:
            vector = _embed(phrase)
        except Exception as exc:
            print(f"[SEARCH] Embedding failed for phrase: {exc}")
            continue

        try:
            matches = supabase.rpc("match_embeddings", {
                "query_vector": vector,
                "match_count":  10,
            }).execute()

            for match in (matches.data or []):
                gid = match.get("group_id")
                if gid in seen_group_ids:
                    continue
                seen_group_ids.add(gid)

                # Fetch document group info for display
                grp_resp = supabase.table("document_groups").select("*") \
                    .eq("doc_group_id", gid).execute()
                if not grp_resp.data:
                    continue
                grp = grp_resp.data[0]

                # Filter by visibility (same rules as documents-visible-to-user)
                scope = grp.get("scope")
                grp_uni = grp.get("university_id")
                visible = (
                    scope == "global"
                    or grp.get("created_by") == user_id
                    or (university_id and grp_uni == university_id)
                )
                if not visible:
                    continue

                # Grab active document for metadata
                active_id = grp.get("active_document_id")
                active_doc = {}
                if active_id:
                    ad = supabase.table("documents").select("*") \
                        .eq("document_id", active_id).execute()
                    if ad.data:
                        active_doc = ad.data[0]

                results.append({
                    "group_id":          gid,
                    "title":             grp.get("title"),
                    "scope":             scope,
                    "human_description": active_doc.get("human_description"),
                    "ai_description":    grp.get("ai_description") or active_doc.get("ai_description"),
                    "status":            active_doc.get("status"),
                    "document_id":       active_id,
                    "similarity":        match.get("similarity"),
                    "is_active":         True,
                    "created_at":        active_doc.get("created_at"),
                })

        except Exception as exc:
            print(f"[SEARCH] Vector search failed: {exc}")

    print(f"[SEARCH] Returning {len(results)} results")
    return results