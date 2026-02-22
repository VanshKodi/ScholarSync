## Project gist (Academic Administration Assistant)

### Architecture
- **Frontend:** Raw HTML/CSS/JS single-page app (SPA).
  - Entry point: `index.html`
  - Typically run via VS Code Live Server (or similar static server).
- **Backend:** **FastAPI**.
- **Platform/Services:** Heavy use of **Supabase**:
  - Auth
  - Database
  - Storage buckets

### Product overview
- An **Academic Administration Assistant**.
- Core deliverable centers on **chat with documents** using:
  - **RAG** + **agentic AI**
  - Preferably **LangGraph** (or similar orchestration libraries)

### RAG pipeline requirements
- Must treat documents differently based on type:

1) **NLP-friendly files** (e.g., PDF, Word, Markdown, etc.)
   - Extract text as needed
   - Chunk + embed
   - Store vectors for retrieval

2) **Non-NLP / structured or semi-structured files** (e.g., CSV, PPT, Excel)
   - Use document loaders / parsing approaches that **extract meaning/structure**
   - Convert to a representation suitable for retrieval (tables/rows/slides/metadata-aware chunks)
   - Then index appropriately (vector + metadata and/or hybrid retrieval)

- Goal: a **robust RAG pipeline** rather than “just embed everything blindly”.

### Secondary features (lower priority)
- Attendance management
- CLO attainment
- Innovative activity
- TA activity allotment
> These are expected to be implementable via straightforward DB tables + CRUD/API routes.

### Document sharing model (major functionality)
- Documents are scoped by **university_id**.
- Two visibility levels:

1) **Global documents**
   - Accessible to everyone within the same `university_id`
   - Can be uploaded/owned **only by Admin**
   - Stored as global copies (Admin-controlled)

2) **Local documents**
   - Visible only to the uploader
   - Stored under the user’s local scope

- **Promotion request flow (Local → Global):**
  - Users can request Admin to add/update a user-local file into the global directory.
  - Admin process must **copy** the file into Admin/global storage, then publish/update global.
  - Explicitly **do not** attempt storage deduplication by referencing the user’s local file.
  - Global should always have its own Admin-owned copy.

### Implementation notes / reminders
- Favor clear separation between:
  - ingestion/parsing pipeline
  - embedding/indexing
  - retrieval strategy (possibly hybrid)
  - agent orchestration (LangGraph)
  - try to keep code maintable yet not too complex
  - the code need to run once no need to overdo it
  - attempt to avoid RLS as much as possible later on RLS focused changes will be applied but for now prefer rar backend apis 
- Supabase storage permissions and RLS should enforce local vs global visibility.
