"""
workers/processor.py
--------------------
Background document processing pipeline.

Runs as a scheduled polling loop (every POLL_INTERVAL seconds) inside a
dedicated daemon thread started at application startup.

Pipeline for each unprocessed document:
  1. Download file bytes from Supabase Storage.
  2. Extract plain text (PDF via pypdf, DOCX via python-docx).
  3. Call Google Gemini to generate an AI description.
  4. Chunk the text and embed each chunk with Gemini text-embedding-004.
  5. Store chunks + embeddings in Supabase.
  6. Mark document as `ready` and `is_embedded = true`.
  7. Create a `file_ready` notification for the uploader.
"""

import io
import html
import time
import threading
import traceback
from typing import List

# ── Third-party ───────────────────────────────────────────────────────────────
import pypdf
from docx import Document as DocxDocument

# ── Internal ──────────────────────────────────────────────────────────────────
from config.supabase import supabase
from config.gemini import client as gemini_client
from config.logger import get_logger

log = get_logger("PROCESSOR")

# ── Constants ─────────────────────────────────────────────────────────────────
POLL_INTERVAL = 30          # seconds between each poll cycle
# Chunk size and overlap are character-level.  500/50 is a reasonable default
# for typical academic paragraphs; tune via env vars if needed.
CHUNK_SIZE    = 500         # target characters per chunk
CHUNK_OVERLAP = 50          # character overlap between consecutive chunks
EMBED_MODEL   = "gemini-embedding-001"
GEN_MODEL     = "gemini-2.0-flash"
STORAGE_BUCKET = "scholar-sync-documents"

SUPPORTED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
SUPPORTED_EXTENSIONS = {".pdf", ".docx"}


# ──────────────────────────────────────────────────────────────────────────────
# Text Extraction
# ──────────────────────────────────────────────────────────────────────────────

def extract_text_from_pdf(file_bytes: bytes) -> str:
    log.info("Extracting text from PDF …")
    reader = pypdf.PdfReader(io.BytesIO(file_bytes))
    pages_text = []
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        pages_text.append(page_text)
        log.debug("PDF page %d/%d: %d chars", i + 1, len(reader.pages), len(page_text))
    full_text = "\n".join(pages_text)
    log.info("PDF extraction complete – %d total chars", len(full_text))
    return full_text


def extract_text_from_docx(file_bytes: bytes) -> str:
    log.info("Extracting text from DOCX …")
    doc = DocxDocument(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n".join(paragraphs)
    log.info("DOCX extraction complete – %d paragraphs, %d total chars", len(paragraphs), len(full_text))
    return full_text


def extract_text(file_bytes: bytes, file_name: str, mime_type: str | None) -> str | None:
    """Return plain text or None if the file type is unsupported."""
    lower_name = (file_name or "").lower()
    if lower_name.endswith(".pdf") or mime_type == "application/pdf":
        return extract_text_from_pdf(file_bytes)
    if lower_name.endswith(".docx") or mime_type == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ):
        return extract_text_from_docx(file_bytes)
    log.warning("Unsupported file type: name=%s, mime=%s – skipping", file_name, mime_type)
    return None


# ──────────────────────────────────────────────────────────────────────────────
# Chunking
# ──────────────────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """
    Split text into overlapping character-level chunks.
    Tries to break at paragraph boundaries first.
    """
    log.debug("Chunking text (chunk_size=%d, overlap=%d) …", chunk_size, overlap)
    paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
    chunks: List[str] = []
    current = ""

    for para in paragraphs:
        if len(current) + len(para) + 1 <= chunk_size:
            current = (current + "\n" + para).strip()
        else:
            if current:
                chunks.append(current)
            # If the paragraph itself is too long, hard-split it
            while len(para) > chunk_size:
                chunks.append(para[:chunk_size])
                para = para[chunk_size - overlap:]
            current = para

    if current:
        chunks.append(current)

    log.debug("Chunking complete – %d chunks", len(chunks))
    return chunks


# ──────────────────────────────────────────────────────────────────────────────
# Gemini Helpers
# ──────────────────────────────────────────────────────────────────────────────

def generate_ai_description(human_description: str, text_excerpt: str) -> str:
    log.info("Calling Gemini to generate AI description …")
    prompt = (
        "You are an academic document assistant. "
        "Given the human-written description and an excerpt from the document, "
        "write a concise, informative AI-generated description (2–4 sentences) "
        "that captures the document's academic purpose, topic, and key details.\n\n"
        f"Human description: {human_description}\n\n"
        f"Document excerpt (first 2000 chars):\n{text_excerpt[:2000]}\n\n"
        "AI description:"
    )
    response = gemini_client.models.generate_content(model=GEN_MODEL, contents=prompt)
    description = response.text.strip()
    log.info("AI description generated (%d chars)", len(description))
    return description


def embed_text(text: str) -> List[float]:
    """Return a 768-dimensional embedding vector for the given text."""
    response = gemini_client.models.embed_content(model=EMBED_MODEL, content=text)
    return response.embeddings[0].values


# ──────────────────────────────────────────────────────────────────────────────
# Notification Helper
# ──────────────────────────────────────────────────────────────────────────────

def _create_notification(user_id: str, notif_type: str, title: str, message: str,
                          doc_id: str | None = None, group_id: str | None = None):
    try:
        payload = {
            "user_id": user_id,
            "type": notif_type,
            "title": title,
            "message": message,
        }
        if doc_id:
            payload["related_doc_id"] = doc_id
        if group_id:
            payload["related_group_id"] = group_id
        supabase.table("notifications").insert(payload).execute()
        log.info("Notification created: type=%s for user=%s", notif_type, user_id)
    except Exception as exc:
        log.warning("Failed to create notification: %s", exc)


# ──────────────────────────────────────────────────────────────────────────────
# Core Processing Function
# ──────────────────────────────────────────────────────────────────────────────

def process_document(doc: dict):
    document_id = doc["document_id"]
    group_id    = doc.get("group_id")
    file_path   = doc.get("file_path") or doc.get("storage_path")
    file_name   = doc.get("file_name", "")
    mime_type   = doc.get("mime_type")
    human_desc  = doc.get("human_description") or ""

    log.info("══════════════════════════════════════════")
    log.info("Processing document_id=%s", document_id)
    log.info("file_name=%s, mime_type=%s", file_name, mime_type)
    log.info("══════════════════════════════════════════")

    # ── 1. Mark as processing and notify uploader ─────────────────────────────
    supabase.table("documents").update({"status": "processing"}) \
        .eq("document_id", document_id).execute()
    log.info("Status → processing")

    # Resolve uploader user_id via the document_groups table
    uploader_id: str | None = None
    try:
        grp = supabase.table("document_groups").select("created_by") \
            .eq("doc_group_id", group_id).execute()
        if grp.data:
            uploader_id = grp.data[0].get("created_by")
    except Exception:
        pass

    if uploader_id:
        safe_name = html.escape(file_name)
        _create_notification(
            uploader_id,
            "file_processing",
            "Document processing started",
            f'<strong>{safe_name}</strong> is being analysed and indexed. This may take a moment.',
            doc_id=document_id,
            group_id=group_id,
        )

    # ── 2. Download file from Supabase Storage ────────────────────────────────
    log.info("Downloading file from storage: %s", file_path)
    try:
        file_bytes = supabase.storage.from_(STORAGE_BUCKET).download(file_path)
        log.info("Downloaded %d bytes", len(file_bytes))
    except Exception as exc:
        log.error("Error downloading file: %s", exc)
        supabase.table("documents").update({"status": "uploaded"}) \
            .eq("document_id", document_id).execute()
        return

    # ── 3. Extract text ───────────────────────────────────────────────────────
    text = extract_text(file_bytes, file_name, mime_type)
    if not text or not text.strip():
        log.info("No text extracted – marking as ready without embeddings")
        supabase.table("documents").update({"status": "ready"}) \
            .eq("document_id", document_id).execute()
        if uploader_id:
            _create_notification(
                uploader_id, "file_ready",
                "Document ready",
                f'<strong>{html.escape(file_name)}</strong> has been uploaded (no text content to index).',
                doc_id=document_id, group_id=group_id,
            )
        return

    # ── 4. Generate AI description ────────────────────────────────────────────
    log.info("Generating AI description …")
    try:
        ai_description = generate_ai_description(human_desc, text)
        supabase.table("documents").update({"ai_description": ai_description}) \
            .eq("document_id", document_id).execute()
        # Also update the group-level ai_description
        if group_id:
            supabase.table("document_groups").update({"ai_description": ai_description}) \
                .eq("doc_group_id", group_id).execute()
        log.info("AI description saved to database")
    except Exception as exc:
        log.warning("AI description generation failed: %s", exc)
        ai_description = human_desc  # fall back to human description

    # ── 5. Chunk text ─────────────────────────────────────────────────────────
    chunks = chunk_text(text)
    if not chunks:
        log.info("No chunks produced – skipping embedding")
        supabase.table("documents").update({"status": "ready"}) \
            .eq("document_id", document_id).execute()
        return

    # ── 6. Embed and store each chunk ─────────────────────────────────────────
    log.info("Embedding %d chunks …", len(chunks))
    for idx, chunk_text_content in enumerate(chunks):
        log.debug("Embedding chunk %d/%d (%d chars)", idx + 1, len(chunks), len(chunk_text_content))
        try:
            # Insert chunk record
            chunk_resp = supabase.table("document_chunks").insert({
                "document_id": document_id,
                "chunk_index": idx,
                "text_content": chunk_text_content,
            }).execute()

            if not chunk_resp.data:
                log.warning("Chunk insert returned no data for index %d", idx)
                continue

            chunk_id = chunk_resp.data[0]["chunk_id"]

            # Generate embedding
            vector = embed_text(chunk_text_content)
            log.debug("Embedding vector length: %d", len(vector))

            # Store embedding
            supabase.table("embeddings").insert({
                "chunk_id":    chunk_id,
                "document_id": document_id,
                "group_id":    group_id,
                "model_name":  EMBED_MODEL,
                "vector":      vector,
            }).execute()
            log.debug("Chunk %d embedded and stored", idx + 1)

        except Exception as exc:
            log.error("Error on chunk %d: %s", idx + 1, exc)
            traceback.print_exc()

    # ── 7. Mark as ready ──────────────────────────────────────────────────────
    supabase.table("documents").update({
        "status":      "ready",
        "is_embedded": True,
    }).eq("document_id", document_id).execute()
    log.info("document_id=%s → status=ready, is_embedded=True", document_id)

    # ── 8. Notify uploader ────────────────────────────────────────────────────
    if uploader_id:
        _create_notification(
            uploader_id,
            "file_ready",
            "Document ready",
            f'<strong>{html.escape(file_name)}</strong> has been processed and is now searchable.',
            doc_id=document_id,
            group_id=group_id,
        )

    log.info("Processing complete for document_id=%s", document_id)


# ──────────────────────────────────────────────────────────────────────────────
# Polling Loop
# ──────────────────────────────────────────────────────────────────────────────

def _poll_once():
    """Look for one unprocessed document and process it."""
    log.debug("Polling for unprocessed documents …")
    try:
        resp = supabase.table("documents") \
            .select("*") \
            .eq("status", "uploaded") \
            .order("created_at") \
            .limit(1) \
            .execute()

        if not resp.data:
            log.debug("No pending documents found.")
            return

        doc = resp.data[0]
        process_document(doc)

    except Exception as exc:
        log.error("Error during poll: %s", exc)
        traceback.print_exc()


def _run_loop():
    log.info("Background worker started (polling every %ds)", POLL_INTERVAL)
    while True:
        try:
            _poll_once()
        except Exception as exc:
            log.error("Unhandled error in poll loop: %s", exc)
            traceback.print_exc()
        time.sleep(POLL_INTERVAL)


def start_background_worker():
    """Start the processor as a daemon thread so it dies with the main process."""
    t = threading.Thread(target=_run_loop, name="doc-processor", daemon=True)
    t.start()
    log.info("Daemon thread launched.")
    return t
