/* =========================================================
   0. SAFETY: ensure we're working in public schema
   ========================================================= */
SET search_path = public;


/* =========================================================
   1. PROFILES
   ========================================================= */
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty')),
    university_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;


/* =========================================================
   2. DOCUMENTS (physical versions)
   ========================================================= */
CREATE TABLE documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_group_id UUID NOT NULL,
    university_id UUID NOT NULL,

    storage_bucket TEXT NOT NULL,
    storage_path TEXT NOT NULL,

    mime_type TEXT NOT NULL,
    content_hash TEXT NOT NULL,

    status TEXT NOT NULL CHECK (status IN ('active', 'superseded', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_documents_group ON documents(document_group_id);
CREATE INDEX idx_documents_university ON documents(university_id);
CREATE INDEX idx_documents_status ON documents(status);


/* =========================================================
   3. DOCUMENT SCOPE (visibility rules)
   ========================================================= */
CREATE TABLE document_scope (
    document_group_id UUID PRIMARY KEY,

    scope_type TEXT NOT NULL CHECK (scope_type IN ('university', 'user')),
    owner_university_id UUID NOT NULL,
    owner_user_id UUID NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CHECK (
        (scope_type = 'university' AND owner_user_id IS NULL)
        OR
        (scope_type = 'user' AND owner_user_id IS NOT NULL)
    )
);

ALTER TABLE document_scope DISABLE ROW LEVEL SECURITY;


/* =========================================================
   4. DOCUMENT CHUNKS
   ========================================================= */
CREATE TABLE document_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL,
    text_content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_chunks_doc ON document_chunks(doc_id);

CREATE EXTENSION IF NOT EXISTS vector;

/* =========================================================
   5. EMBEDDINGS
   ========================================================= */
CREATE TABLE embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id UUID NOT NULL REFERENCES document_chunks(chunk_id) ON DELETE CASCADE,

    model_name TEXT NOT NULL,
    vector VECTOR(768), -- adjust if you change embedding model

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE embeddings DISABLE ROW LEVEL SECURITY;

CREATE INDEX idx_embeddings_chunk ON embeddings(chunk_id);


/* =========================================================
   6. LOCK DOWN FRONTEND ACCESS
   ========================================================= */
REVOKE ALL ON TABLE
    profiles,
    documents,
    document_scope,
    document_chunks,
    embeddings
FROM anon, authenticated;


/* =========================================================
   7. DONE
   ========================================================= */
