# ScholarSync – Database Schema Changes

This document defines the Supabase (PostgreSQL) table additions and column updates required
for the following features: Document Groups, individual file versions, RAG embeddings, and
the Notification system.  Run each block in the Supabase SQL Editor (or via a migration tool)
in the order shown.

---

## 1. Updates to `document_groups`

Add an `ai_description` column so the group-level AI summary can be stored independently
of individual document versions.

```sql
ALTER TABLE public.document_groups
  ADD COLUMN IF NOT EXISTS ai_description TEXT;
```

---

## 2. Updates to `documents` (individual file versions)

Add two columns:
- `is_embedded`  – tracks whether the RAG pipeline has processed this version.
- `mime_type`    – stores the detected MIME type of the uploaded file.

Status lifecycle: `uploaded` → `processing` → `ready` (or back to `uploaded` on failure).

```sql
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS is_embedded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS mime_type   TEXT;
```

---

## 3. `document_chunks` (RAG pipeline – text chunks)

Stores the individual text chunks extracted from each document version.

```sql
CREATE TABLE IF NOT EXISTS public.document_chunks (
    chunk_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id   UUID        NOT NULL
                              REFERENCES public.documents(document_id)
                              ON DELETE CASCADE,
    chunk_index   INTEGER     NOT NULL,
    text_content  TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. `embeddings` (RAG pipeline – vector embeddings)

Stores the vector embedding for each chunk.  Requires the `pgvector` extension.

```sql
-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.embeddings (
    embedding_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id      UUID        NOT NULL
                              REFERENCES public.document_chunks(chunk_id)
                              ON DELETE CASCADE,
    document_id   UUID        NOT NULL
                              REFERENCES public.documents(document_id)
                              ON DELETE CASCADE,
    group_id      UUID        NOT NULL
                              REFERENCES public.document_groups(doc_group_id)
                              ON DELETE CASCADE,
    model_name    TEXT        NOT NULL DEFAULT 'text-embedding-004',
    vector        VECTOR(768) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approximate nearest-neighbour index (cosine distance)
CREATE INDEX IF NOT EXISTS embeddings_vector_idx
    ON public.embeddings
    USING ivfflat (vector vector_cosine_ops)
    WITH (lists = 100);
```

### Supabase RPC – `match_embeddings`

Create this PostgreSQL function so the backend can perform vector similarity search via
the Supabase client's `.rpc()` call.

```sql
CREATE OR REPLACE FUNCTION public.match_embeddings(
    query_vector     VECTOR(768),
    match_count      INTEGER  DEFAULT 10,
    filter_group_ids UUID[]   DEFAULT NULL
)
RETURNS TABLE (
    embedding_id UUID,
    chunk_id     UUID,
    document_id  UUID,
    group_id     UUID,
    text_content TEXT,
    similarity   FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.embedding_id,
        e.chunk_id,
        e.document_id,
        e.group_id,
        c.text_content,
        1 - (e.vector <=> query_vector) AS similarity
    FROM   public.embeddings e
    JOIN   public.document_chunks c ON c.chunk_id = e.chunk_id
    WHERE  filter_group_ids IS NULL
        OR e.group_id = ANY(filter_group_ids)
    ORDER  BY e.vector <=> query_vector
    LIMIT  match_count;
END;
$$;
```

---

## 5. `notifications` (Notification system)

Tracks document lifecycle events and user-action events.  The frontend polls
`GET /notifications` on a short interval to deliver these to the user.

Supported `type` values:

| Value                 | Triggered when …                                      |
|-----------------------|-------------------------------------------------------|
| `file_processing`     | A document starts AI/embedding processing             |
| `file_ready`          | Processing completes successfully                     |
| `application_accepted`| A university join request is accepted                 |
| `file_request`        | A user requests to add a new file                     |
| `update_request`      | A user requests to update an existing file            |

```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL
                                 REFERENCES auth.users(id)
                                 ON DELETE CASCADE,
    type             TEXT        NOT NULL
                                 CHECK (type IN (
                                     'file_processing',
                                     'file_ready',
                                     'application_accepted',
                                     'file_request',
                                     'update_request'
                                 )),
    title            TEXT        NOT NULL,
    message          TEXT        NOT NULL,
    is_read          BOOLEAN     NOT NULL DEFAULT FALSE,
    related_doc_id   UUID        REFERENCES public.documents(document_id)
                                 ON DELETE SET NULL,
    related_group_id UUID        REFERENCES public.document_groups(doc_group_id)
                                 ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast unread-notification polling per user
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
    ON public.notifications (user_id, is_read, created_at DESC);
```

---

## 6. Row-Level Security (RLS) Policies

Enable RLS and add read-side policies so the Supabase JS client (anon/authenticated
role) can query these tables directly from the frontend without going through the
FastAPI backend.  The backend service-role key bypasses RLS, so these policies only
affect browser clients.

### `document_groups`

```sql
ALTER TABLE public.document_groups ENABLE ROW LEVEL SECURITY;

-- Users can see global groups, groups they created, or groups that belong
-- to their university.
CREATE POLICY "document_groups_select" ON public.document_groups
  FOR SELECT
  USING (
    scope = 'global'
    OR created_by = auth.uid()
    OR university_id = (
        SELECT university_id FROM public.profiles WHERE id = auth.uid()
    )
  );
```

### `documents`

```sql
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- A document is readable if its parent group is readable by the current user.
CREATE POLICY "documents_select" ON public.documents
  FOR SELECT
  USING (
    group_id IN (
      SELECT doc_group_id FROM public.document_groups
      WHERE scope = 'global'
         OR created_by = auth.uid()
         OR university_id = (
             SELECT university_id FROM public.profiles WHERE id = auth.uid()
         )
    )
  );
```

### `document_chunks`

```sql
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- Inherit the same visibility rules as their parent document.
CREATE POLICY "document_chunks_select" ON public.document_chunks
  FOR SELECT
  USING (
    document_id IN (
      SELECT d.document_id FROM public.documents d
      JOIN public.document_groups g ON g.doc_group_id = d.group_id
      WHERE g.scope = 'global'
         OR g.created_by = auth.uid()
         OR g.university_id = (
             SELECT university_id FROM public.profiles WHERE id = auth.uid()
         )
    )
  );
```

### `embeddings`

```sql
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;

-- Inherit the same visibility rules as their parent document group.
CREATE POLICY "embeddings_select" ON public.embeddings
  FOR SELECT
  USING (
    group_id IN (
      SELECT doc_group_id FROM public.document_groups
      WHERE scope = 'global'
         OR created_by = auth.uid()
         OR university_id = (
             SELECT university_id FROM public.profiles WHERE id = auth.uid()
         )
    )
  );
```

### `notifications`

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications.
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can update (mark as read) only their own notifications.
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid());
```

### `profiles`

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Every authenticated user can read all profiles (needed for university look-ups).
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can only update their own profile.
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE
  USING (id = auth.uid());
```

---

## Summary of all changes

| Table              | Change type    | Details                                                       |
|--------------------|----------------|---------------------------------------------------------------|
| `document_groups`  | Column added   | `ai_description TEXT`                                         |
| `documents`        | Columns added  | `is_embedded BOOLEAN DEFAULT FALSE`, `mime_type TEXT`         |
| `document_chunks`  | **New table**  | Stores RAG text chunks per document version                   |
| `embeddings`       | **New table**  | pgvector 768-dim embeddings + `match_embeddings` RPC          |
| `notifications`    | **New table**  | Lifecycle & user-action events for polling delivery           |
| `document_groups`  | RLS policies   | select – global/own/university visibility                     |
| `documents`        | RLS policies   | select – inherits document_groups visibility                  |
| `document_chunks`  | RLS policies   | select – inherits document_groups visibility                  |
| `embeddings`       | RLS policies   | select – inherits document_groups visibility                  |
| `notifications`    | RLS policies   | select/update – own notifications only                        |
| `profiles`         | RLS policies   | select – all authenticated; update – own row only             |
