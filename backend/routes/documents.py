from fastapi import APIRouter, Depends, HTTPException
from config.supabase import supabase
from config.auth import get_current_user

router = APIRouter()

@router.get("/documents-visible-to-user")
def documents_visible_to_user(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    # Get user profile
    profile = supabase.table("profiles") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    university_id = profile.data[0].get("university_id")

    # Fetch document groups visible to user
    groups = supabase.table("document_groups") \
        .select("*") \
        .or_(f"scope.eq.global,created_by.eq.{user_id},university_id.eq.{university_id}") \
        .execute()

    results = []

    for group in groups.data:
        if not group.get("active_document_id"):
            continue

        doc = supabase.table("documents") \
            .select("*") \
            .eq("document_id", group["active_document_id"]) \
            .eq("status", "ready") \
            .execute()

        if doc.data:
            d = doc.data[0]
            results.append({
                "title": group["title"],
                "scope": group["scope"],
                "human_description": d.get("human_description"),
                "created_at": d.get("created_at")
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
        .select("doc_group_id, title") \
        .or_(f"created_by.eq.{user_id},university_id.eq.{university_id}") \
        .execute()

    return groups.data

from fastapi import UploadFile, File, Form
import uuid

@router.post("/create-document-group-and-upload")
async def create_document_group_and_upload(
    title: str = Form(...),
    description: str = Form(None),
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

    # 1️⃣ Create document group
    group_resp = supabase.table("document_groups").insert({
        "title": title,
        "scope": "local",
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
        "status": "uploaded"
    }).execute()

    document_id = doc_resp.data[0]["document_id"]

    # Update active version
    supabase.table("document_groups") \
        .update({"active_document_id": document_id}) \
        .eq("doc_group_id", group_id) \
        .execute()

    return {"message": "New version uploaded"}