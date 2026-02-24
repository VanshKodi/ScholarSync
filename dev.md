# ScholarSync — Developer Guide

> Intended for humans. Read this before adding features, endpoints, or pages.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack & Key Libraries](#tech-stack--key-libraries)
3. [Running Locally](#running-locally)
4. [Backend: Add an Endpoint](#backend-add-an-endpoint)
5. [Frontend: Call an API](#frontend-call-an-api)
6. [Frontend: Add a New Page (Route)](#frontend-add-a-new-page-route)
7. [Frontend: Add a Dashboard Sub-View](#frontend-add-a-dashboard-sub-view)
8. [Frontend: Add a Reusable Component](#frontend-add-a-reusable-component)
9. [Authentication Flow](#authentication-flow)
10. [Loading States & Refresh Buttons](#loading-states--refresh-buttons)
11. [Common Pitfalls](#common-pitfalls)
12. [Deployment Checklist](#deployment-checklist)

---

## Project Structure

```
ScholarSync/
├── backend/                    # FastAPI server
│   ├── main.py                 # App entry point; registers routers & CORS
│   ├── config/
│   │   ├── auth.py             # JWT verification, get_current_user dependency
│   │   ├── supabase.py         # Supabase admin client (service role)
│   │   └── gemini.py           # Google Gemini AI client
│   ├── routes/
│   │   ├── database.py         # University / join-request endpoints
│   │   ├── documents.py        # Document upload, search, versioning
│   │   └── notifications.py    # Notification read/list endpoints
│   ├── services/
│   │   ├── university_service.py
│   │   └── join_service.py
│   └── workers/
│       └── processor.py        # Background document-processing worker
│
└── frontend/                   # Vanilla JS SPA (no build step)
    ├── index.html              # App shell; loads JS in order
    ├── css/base.css
    └── js/
        ├── 1_config.js         # window.__ENV__ (must load first)
        ├── 2_app.js            # Session bootstrap, OAuth hash handling
        ├── 3_router.js         # Hash-based router
        ├── api.js              # fetch wrapper with auto JWT injection
        ├── components/
        │   ├── Loader.js       # Global full-screen spinner
        │   ├── Navbar.js
        │   └── Sidebar.js      # Collapsible sidebar with notification badge
        ├── utils/
        │   ├── auth.js         # loginWithGoogle, logout, isAuthenticated
        │   └── supabase.js     # Supabase JS browser client
        └── views/
            ├── Landing.js
            ├── Login.js
            └── Dashboard/
                ├── Dashboard.js    # Layout shell (Navbar + Sidebar + main)
                ├── Overview.js     # Profile overview
                ├── Documents.js    # Document list, upload, search
                ├── JoinRequests.js # Admin: approve/reject join requests
                └── Notifications.js
```

---

## Tech Stack & Key Libraries

| Layer | Technology | Docs |
|---|---|---|
| Backend framework | **FastAPI** | https://fastapi.tiangolo.com |
| Backend server | **Uvicorn** | https://www.uvicorn.org |
| Database & Auth | **Supabase** (Postgres + Auth) | https://supabase.com/docs |
| Supabase Python client | `supabase-py` | https://supabase.com/docs/reference/python/introduction |
| Supabase JS client | `@supabase/supabase-js` (via CDN) | https://supabase.com/docs/reference/javascript/introduction |
| AI embeddings & generation | **Google Gemini** (`google-genai`) | https://ai.google.dev/gemini-api/docs |
| PDF parsing | `pypdf` | https://pypdf.readthedocs.io |
| DOCX parsing | `python-docx` | https://python-docx.readthedocs.io |
| Frontend routing | **Hash-based routing** (History API) | https://developer.mozilla.org/en-US/docs/Web/API/History_API |
| Frontend HTTP client | Native `fetch` (wrapped in `api.js`) | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API |
| Deployment tunnel | **Cloudflare Tunnel** | https://developers.cloudflare.com/cloudflare-one/connections/connect-networks |

---

## Running Locally

**Backend:**
```bash
cd backend
cp .env.example .env          # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
pip install -r requirements.txt
uvicorn main:app --reload     # runs on http://localhost:8000
```

**Frontend:**
```bash
cd frontend
# Any static server works; e.g.:
npx serve .                   # or python -m http.server 5500
```

Set `API_BASE` in `frontend/js/1_config.js` to `http://localhost:8000` for local development.

---

## Backend: Add an Endpoint

### Step 1 — Write the route

Add to an existing router file (e.g. `backend/routes/database.py`) or create a new file:

```python
from fastapi import APIRouter, Depends, HTTPException
from config.supabase import supabase
from config.auth import get_current_user

router = APIRouter()

@router.get("/my-new-endpoint")
def my_new_endpoint(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    resp = supabase.table("some_table").select("*").eq("user_id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Not found")
    return resp.data
```

`Depends(get_current_user)` — validates the `Authorization: Bearer <token>` header automatically. All protected routes must include it.

### Step 2 — Register the router (only for new files)

In `backend/main.py`:
```python
from routes.my_new_module import router as my_router
app.include_router(my_router)
```

Existing router files (`database.py`, `documents.py`, `notifications.py`) are already registered — no extra step needed.

### Step 3 — Restart the server
```bash
uvicorn main:app --reload
```

---

## Frontend: Call an API

All HTTP calls go through `request()` in `frontend/js/api.js`. It automatically injects the JWT token.

```javascript
import { request } from "../../api.js";

// GET
const data = await request("/my-new-endpoint");

// POST with JSON body
await request("/create-something", {
  method: "POST",
  body: { name: "hello" }          // serialised to JSON automatically
});

// POST with FormData (file upload)
const form = new FormData();
form.append("file", fileInput.files[0]);
await request("/upload", { method: "POST", body: form });
```

Always wrap in `try/catch`:
```javascript
try {
  const result = await request("/my-new-endpoint");
  renderResult(result);
} catch (err) {
  showError(err.message);
}
```

---

## Frontend: Add a New Page (Route)

### Step 1 — Create the view

`frontend/js/views/Reports.js`:
```javascript
import Navbar from "../components/Navbar.js";

export default function Reports({ root }) {
  root.innerHTML = "";
  root.append(Navbar(), buildContent());
}

function buildContent() {
  const el = document.createElement("div");
  el.innerHTML = "<h1>Reports</h1>";
  return el;
}
```

### Step 2 — Register the route

`frontend/js/3_router.js`:
```javascript
import Reports from "./views/Reports.js";

routes.push({
  match: path => path === "/reports",
  handler: ({ root }) => Reports({ root })
});
```

### Step 3 — Navigate to it

```javascript
window.location.hash = "#/reports";
```

The router listens to `hashchange` events and matches `window.location.hash.slice(1)` against each route's `match` function.

---

## Frontend: Add a Dashboard Sub-View

Dashboard sub-views live inside `frontend/js/views/Dashboard/` and are rendered inside the existing `<main>` element (no Navbar/Sidebar needed).

### Step 1 — Create the sub-view

`frontend/js/views/Dashboard/MyFeature.js`:
```javascript
import { request } from "../../api.js";

export function MyFeature(container) {
  container.innerHTML = `<div class="my-feature"><p>Loading…</p></div>`;

  async function load() {
    try {
      const data = await request("/my-new-endpoint");
      render(data);
    } catch (err) {
      container.innerHTML = `<p>Error: ${err.message}</p>`;
    }
  }

  function render(data) {
    container.querySelector(".my-feature").textContent = JSON.stringify(data);
  }

  load();
}
```

### Step 2 — Add a Sidebar entry

`frontend/js/components/Sidebar.js` — inside `nav.append(...)`:
```javascript
item(icons.document, "My Feature", "my-feature"),
```

### Step 3 — Handle the route in Dashboard

`frontend/js/views/Dashboard/Dashboard.js`:
```javascript
import { MyFeature } from "./MyFeature.js";

// inside render():
if (view === "my-feature") {
  MyFeature(main);
  return;
}
```

---

## Frontend: Add a Reusable Component

Components return a DOM element (no framework, no JSX).

`frontend/js/components/StatusBadge.js`:
```javascript
export function StatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `status-badge status-${status}`;
  badge.textContent = status;
  return badge;
}
```

Use it anywhere:
```javascript
import { StatusBadge } from "../../components/StatusBadge.js";
container.appendChild(StatusBadge("active"));
```

---

## Authentication Flow

```
User clicks "Login with Google"
  → loginWithGoogle()  (frontend/js/utils/auth.js)
  → supabase.auth.signInWithOAuth({ provider: "google" })
  → Google OAuth redirect → back to app with #access_token=... in URL hash
  → 2_app.js parses hash, calls supabase.auth.setSession()
  → Session.onChange fires → router pushes to #/dashboard
```

**Session object** (`Session` in `api.js`):
- `Session.get()` — returns the current session (caches in memory until auth state changes)
- `Session.onChange(cb)` — fires whenever auth state changes (login/logout)

**Backend token validation** (`backend/config/auth.py`):
- `get_current_user` calls Supabase's `/auth/v1/user` endpoint with the bearer token
- Returns the user dict (`{ "id": "...", "email": "...", ... }`)

---

## Loading States & Refresh Buttons

All data-fetching views show a loading indicator while fetching and disable the Refresh button to prevent duplicate requests:

```javascript
refreshBtn.addEventListener("click", async () => {
  refreshBtn.textContent = "↻ Loading…";
  refreshBtn.disabled = true;
  await loadData();
  refreshBtn.textContent = "↻ Refresh";
  refreshBtn.disabled = false;
});
```

For a full-screen spinner (used during app boot), use the global `Loader`:

```javascript
import { showLoader, hideLoader } from "./components/Loader.js";

showLoader("Fetching data…");
await doSomethingAsync();
hideLoader();
```

---

## Common Pitfalls

### CORS error
Add your dev origin to `allow_origins` in `backend/main.py`, or set `EXTRA_CORS_ORIGINS=http://localhost:5500` in your `.env`.

### 401 Unauthorized
- Token missing or expired → call `Session.get()` and check it returns a non-null session.
- Wrong `Authorization` header format → must be `Bearer <token>`.

### Route not working
Make sure the `match` function in `3_router.js` matches the exact hash path (e.g. `"/reports"`, not `"#/reports"`).

### Supabase query returning empty `data`
Check RLS (Row Level Security) policies on the table. The service-role key used by the backend bypasses RLS; the anon key used by the frontend does not.

### Background worker not running
`startup_event` in `main.py` calls `start_background_worker()`. It only runs when started via `uvicorn`, not during tests.

---

## Deployment Checklist

- [ ] Backend `.env` has `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `frontend/js/1_config.js` `API_BASE` points to the production backend URL
- [ ] `EXTRA_CORS_ORIGINS` includes the production frontend URL (or it is in the hardcoded list in `main.py`)
- [ ] Cloudflare Tunnel is running for the backend (or equivalent)
- [ ] All new SQL migrations applied in Supabase SQL editor
- [ ] Tested login → dashboard → logout flow
- [ ] Tested all new API endpoints with a valid JWT (e.g. via Postman with `Authorization: Bearer <token>`)

