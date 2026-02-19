# ScholarSync Developer Guide

A step-by-step guide for adding new functionality to the ScholarSync codebase.

## Project Structure Overview

```
scholarsync-backup/
├── backend/               # FastAPI server
│   ├── main.py           # App entry point, router registration, CORS config
│   ├── config/           # Configuration modules
│   │   ├── auth.py       # JWT token verification, get_current_user dependency
│   │   ├── supabase.py   # Supabase client initialization
│   │   └── gemini.py     # Gemini AI client
│   ├── routes/           # API endpoint definitions
│   │   ├── database.py   # University/join request endpoints
│   │   ├── join_requests.py # Join request approval/rejection
│   │   └── services/     # Business logic layer
│   │       ├── university_service.py
│   │       └── join_service.py
│   └── sql/              # Database schema files
│
└── frontend/             # Vanilla JS frontend
    ├── index.html        # App shell (loads JS files in order)
    ├── css/              # Styles
    ├── js/
    │   ├── 1_config.js   # Global config first
    │   ├── 2_app.js      # App initialization, session setup
    │   ├── 3_router.js   # Hash-based routing setup
    │   ├── api.js        # API client with auto token injection
    │   ├── components/   # Reusable UI components
    │   │   ├── Navbar.js
    │   │   ├── Sidebar.js
    │   │   └── ...
    │   ├── utils/
    │   │   ├── auth.js   # Authentication helpers
    │   │   └── supabase.js
    │   └── views/        # Page components
    │       ├── Landing.js
    │       ├── Login.js
    │       └── Dashboard/
    │           ├── Dashboard.js (main layout)
    │           ├── Overview.js
    │           ├── Documents.js
    │           └── ...
    └── resources/        # Static files (icons, fonts)
```

### Key Patterns

**Backend:**
- **Routers:** Each route file is registered in `main.py` with `app.include_router()`
- **Authentication:** All protected routes use `Depends(get_current_user)` dependency injection
- **Services:** Business logic lives in `services/`, routes call service functions
- **Database:** All DB queries use Supabase REST API via `supabase.table()` calls

**Frontend:**
- **Routing:** Hash-based router in `3_router.js` matches paths to view handlers
- **Components:** Vanilla JS functions that return DOM elements (no JSX)
- **API:** `api.js` provides `request()` function that auto-injects JWT token
- **Views:** Components in `views/` folder that render to the DOM
- **Sidebar:** Dashboard views use Sidebar component to switch sub-views

---

## How to Add Functionality

### 1. Add a New Backend API Endpoint

**Example:** Create `GET /university-join-requests/:id` to fetch join requests for a university

**Step 1:** Add endpoint to `backend/routes/database.py`

```python
@router.get("/university-join-requests/{university_id}")
async def get_university_join_requests(university_id: str, user: dict = Depends(get_current_user)):
    # Verify user is admin of this university
    profile = supabase.table("profiles").select("role, university_id").eq("id", user.get("id")).single().execute()
    
    if not profile.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.data["role"] != "admin" or profile.data["university_id"] != university_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch join requests
    return supabase.table("university_join_requests").select("*").eq("university_id", university_id).order("request_id", desc=True).execute().data or []
```

**Step 2 (optional):** If business logic is complex, create a service function in `backend/services/university_service.py`

```python
def get_join_requests_for_university(university_id: str, user_id: str):
    # Verify admin access
    profile = supabase.table("profiles").select("role, university_id").eq("id", user_id).single().execute()
    
    if not profile.data or profile.data["role"] != "admin" or profile.data["university_id"] != university_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return supabase.table("university_join_requests").select("*").eq("university_id", university_id).order("request_id", desc=True).execute().data
```

Then call it from the route:
```python
@router.get("/university-join-requests/{university_id}")
async def get_university_join_requests(university_id: str, user: dict = Depends(get_current_user)):
    return get_join_requests_for_university(university_id, user.get("id"))
```

**Step 3:** Restart backend with `uvicorn main:app --reload`

**Important:** All routes are automatically included in `main.py` - no registration needed if file already exists.

---

### 2. Add a New Frontend API Call

**Example:** Create `getUniversityJoinRequests(id)` function

**Step 1:** Add to `frontend/js/api.js`

```javascript
export async function getUniversityJoinRequests(universityId) {
  return request(`/university-join-requests/${universityId}`, {
    method: "GET"
  });
}
```

**Step 2:** Import and use in a view

```javascript
import { getUniversityJoinRequests } from "../../api.js";

export function MyViewComponent(container) {
  async function loadRequests() {
    try {
      const requests = await getUniversityJoinRequests("some-id");
      console.log(requests);
      // Render to DOM
    } catch (error) {
      console.error("Failed to load requests:", error);
    }
  }
  
  loadRequests();
}
```

**Key:** The `request()` function automatically:
- Injects the JWT token from `Session.get()`
- Sets `Authorization: Bearer <token>` header
- Parses JSON response
- Throws error if response is not OK

---

### 3. Add a UI Button That Calls an API

**Example:** Add a button in Dashboard that approves a join request

**Step 1:** Create or edit a view component (e.g., `frontend/js/views/Dashboard/JoinRequests.js`)

```javascript
import { request } from "../../api.js";

export function JoinRequests(container) {
  const section = document.createElement("div");
  section.className = "join-requests-section";
  
  // Fetch and display requests
  async function loadAndRender() {
    const requests = await request("/university-join-requests/uni-123", { method: "GET" });
    
    const list = document.createElement("div");
    requests.forEach(req => {
      const item = document.createElement("div");
      item.className = "request-item";
      
      const btnContainer = document.createElement("div");
      
      // Approve button
      const approveBtn = document.createElement("button");
      approveBtn.textContent = "Approve";
      approveBtn.onclick = async () => {
        try {
          await request("/handle-join-request", {
            method: "POST",
            body: { request_id: req.request_id, action: "accept" }
          });
          loadAndRender(); // Refresh list
        } catch (error) {
          alert("Error approving request: " + error);
        }
      };
      
      btnContainer.appendChild(approveBtn);
      item.append(document.createTextNode(req.requester_id), btnContainer);
      list.appendChild(item);
    });
    
    section.innerHTML = "";
    section.appendChild(list);
  }
  
  loadAndRender();
  container.appendChild(section);
}
```

**Step 2:** Import and call this component from Dashboard

```javascript
import { JoinRequests } from "./JoinRequests.js";

export default function Dashboard({ root }) {
  // ... existing code ...
  
  function render(view) {
    main.innerHTML = "";
    
    if (view === "join-requests") {
      JoinRequests(main);
      return;
    }
    
    Overview(main);
  }
  
  const sidebar = Sidebar({ onSelect: render });
  // ...
}
```

**Key:** Always use `await request()` and wrap in try/catch for error handling.

---

### 4. Add a New Page and Configure Routing

**Example:** Create a new "Reports" page

**Step 1:** Create the view component at `frontend/js/views/Reports.js`

```javascript
export default function Reports({ root }) {
  root.innerHTML = "";
  
  const navbar = Navbar();
  const content = document.createElement("div");
  content.className = "reports-page";
  content.innerHTML = `
    <h1>Reports</h1>
    <p>Reports content here</p>
  `;
  
  root.append(navbar, content);
}
```

**Step 2:** Register route in `frontend/js/3_router.js`

```javascript
import Reports from "./views/Reports.js";

routes.push({
  match: path => path === "/reports",
  handler: ({ root }) => {
    Reports({ root });
  }
});
```

**Step 3:** Test by navigating in browser: `/#/reports`

**Important:** 
- Routes are matched by hash, not actual URL paths
- Always include exact path matching (e.g., `path === "/reports"`)
- Each route handler receives `{ root, path }` object
- `root` is the HTML element where content should be rendered

---

### 5. Add Navigation to Navbar or Sidebar

**Example:** Add "Reports" link to Sidebar

**Step 1:** Edit `frontend/js/components/Sidebar.js`

Sidebar uses the `item(icon, text, id)` function. Each item calls `onSelect(id)` when clicked. The Dashboard component handles the `onSelect` callback:

```javascript
export default function Sidebar({ onSelect }) {
  // ... existing code ...
  
  nav.append(
    item("📊", "Overview", "overview"),
    
    section("Academic"),
    item("📄", "Reports", "reports"),  // Add this line
    // ... rest of items
  );
  
  // ...
}
```

**Step 2:** Handle the selection in Dashboard.js

```javascript
export default function Dashboard({ root }) {
  // ... existing code ...
  
  function render(view) {
    main.innerHTML = "";
    
    if (view === "documents") {
      Documents(main);
      return;
    }
    
    if (view === "reports") {
      Reports(main);  // Add this
      return;
    }
    
    Overview(main);
  }
  
  const sidebar = Sidebar({ onSelect: render });
  // ...
}
```

**Step 3:** Import the Reports component

```javascript
import { Reports } from "./Reports.js";
```

**For Navbar:** Edit `frontend/js/components/Navbar.js` to add buttons

```javascript
nav.innerHTML = `
  <div class="nav-left">
    <!-- ... existing ... -->
  </div>
  
  <div class="nav-right">
    ${isAuth ? `
      <button class="nav-btn" id="reportsBtn">Reports</button>
      <button class="nav-btn" id="dashboardBtn">Dashboard</button>
      <button class="nav-btn outline" id="logoutBtn">Logout</button>
    ` : `
      <button class="nav-btn primary" id="getStartedBtn">Get Started</button>
    `}
  </div>
`;

if (isAuth) {
  nav.querySelector("#reportsBtn").onclick = () => {
    window.location.hash = "#/reports";
  };
  // ... existing handlers ...
}
```

---

### 6. Add New Content Blocks/Components to Existing Pages

**Example:** Add a statistics card component to Dashboard Overview

**Step 1:** Create a component at `frontend/js/components/StatCard.js`

```javascript
export function StatCard({ title, value, icon }) {
  const card = document.createElement("div");
  card.className = "stat-card";
  card.innerHTML = `
    <div class="stat-icon">${icon}</div>
    <div class="stat-content">
      <div class="stat-title">${title}</div>
      <div class="stat-value">${value}</div>
    </div>
  `;
  return card;
}
```

**Step 2:** Import and use in `frontend/js/views/Dashboard/Overview.js`

```javascript
import { StatCard } from "../../components/StatCard.js";
import { request } from "../../api.js";

export function Overview(container) {
  container.innerHTML = "";
  
  const overview = document.createElement("div");
  overview.className = "overview";
  
  // Fetch data
  request("/some-stats", { method: "GET" }).then(data => {
    const statsContainer = document.createElement("div");
    statsContainer.className = "stats-grid";
    
    statsContainer.appendChild(StatCard({
      title: "Documents",
      value: data.documentCount,
      icon: "📄"
    }));
    
    statsContainer.appendChild(StatCard({
      title: "Universities",
      value: data.universityCount,
      icon: "🏫"
    }));
    
    overview.appendChild(statsContainer);
  });
  
  container.appendChild(overview);
}
```

**Step 3:** Add CSS to `frontend/css/views/views.css`

```css
.stat-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.stat-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.stat-title {
  font-size: 0.875rem;
  color: #666;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

---

## Common Pitfalls

### 1. CORS Errors
**Problem:** `Cross-Origin Request Blocked`

**Cause:** Frontend URL not whitelisted in backend CORS config

**Fix:** Add your frontend URL to `backend/main.py`:
```python
allow_origins=[
    "http://localhost:5500",  # Add your dev server URL
    "https://api.vanshkodi.in",
    # ... existing origins
]
```

### 2. "Bearer token invalid" or 401 errors
**Problem:** API returns 401 Unauthorized

**Cause:** 
- Token expired or missing
- `Authorization` header not sent correctly

**Debug:** 
- Check browser DevTools Network tab - should see `Authorization: Bearer <token>` header
- Call `Session.get()` to verify token exists
- Verify Supabase JWT_SECRET is correct

### 3. API_BASE URL mismatch
**Problem:** API calls go to wrong URL or fail

**Cause:** `API_BASE` in `frontend/js/api.js` doesn't match backend URL

**Fix:** Update `api.js` based on environment:
```javascript
const API_BASE = process.env.NODE_ENV === "production" 
  ? "https://api.vanshkodi.in"
  : "http://localhost:8000";
```

For dev: Use Cloudflare tunnel URL or localhost:8000

### 4. Routing not working (hash navigation)
**Problem:** `#/newpage` doesn't navigate anywhere

**Cause:** Route not registered in `3_router.js`

**Fix:** Ensure route is added:
```javascript
routes.push({
  match: path => path === "/newpage",
  handler: ({ root }) => {
    MyNewPage({ root });
  }
});
```

### 5. Authentication state lost on page reload
**Problem:** User logged out after refresh

**Cause:** `Session` cache not initialized or Supabase session lost

**Fix:** Ensure `2_app.js` runs first (index.html load order) and `Session.get()` is called:
```javascript
const session = await Session.get();
if (!session) window.location.hash = "#/";
```

### 6. Sidebar/Navbar not updating after auth change
**Problem:** Buttons don't reflect login state

**Cause:** Component doesn't call `onAuthChange` callback

**Fix:** Register auth change listener in component:
```javascript
import { onAuthChange } from "../utils/auth.js";

onAuthChange(() => {
  render(); // Re-render component
});
```

### 7. Service layer queries failing silently
**Problem:** Backend endpoint returns empty data or 500 error

**Cause:** Supabase query error not caught

**Fix:** Add error handling:
```python
try:
    result = supabase.table("users").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No data found")
    return result.data
except Exception as e:
    raise HTTPException(status_code=400, detail=str(e))
```

---

## Deployment & Testing Checklist

### Before Deploying:

- [ ] **Backend:** All routes tested with Postman/curl
  - Test authenticated endpoints with valid JWT token
  - Test error cases (401, 404, 500)

- [ ] **Frontend:** All pages accessible via hash routes
  - Test `#/`, `#/login`, `#/dashboard`, etc.
  - Test navigation between pages

- [ ] **API Integration:** Frontend → Backend calls work
  - Check DevTools Network tab for request/response
  - Verify auth token in headers
  - Test error handling (catch blocks)

- [ ] **Auth Flow:** Login/logout/session persistence works
  - Login redirects to dashboard
  - Logout clears session
  - Page reload maintains session

- [ ] **Environment Variables:** All secrets configured
  - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
  - `API_BASE` in `frontend/js/api.js` matches backend URL

- [ ] **CORS:** No blocked requests
  - Frontend URL in `main.py` allow_origins

- [ ] **Database Migrations:** Schema up to date
  - Run any new SQL in `backend/sql/`
  - Verify table structure matches queries

- [ ] **Cloudflare Tunnel:** Running if prod deployment
  - Backend tunnel URL stable
  - Frontend configured to use tunnel URL

### Deployment Steps:

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend:**
   - Static files served from `frontend/` directory
   - Configure web server to serve `index.html` for all routes (SPA mode)

3. **Database:**
   - Ensure Supabase project initialized with schema from `backend/sql/`

4. **Testing:**
   - Verify all endpoints respond correctly
   - Test login/authentication flow
   - Validate API responses match frontend expectations

---

## File Reference Guide

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI app, router registration, CORS config |
| `backend/routes/*.py` | API endpoint definitions |
| `backend/services/*.py` | Business logic, reusable functions |
| `backend/config/auth.py` | JWT token verification |
| `backend/config/supabase.py` | Supabase client |
| `frontend/index.html` | App shell, loads JS in order |
| `frontend/js/1_config.js` | Global constants (must load first) |
| `frontend/js/2_app.js` | App init, session setup |
| `frontend/js/3_router.js` | Route definitions |
| `frontend/js/api.js` | HTTP client with auto token injection |
| `frontend/js/views/*.js` | Page components |
| `frontend/js/components/*.js` | Reusable UI components |
| `frontend/js/utils/auth.js` | Auth helper functions |
| `frontend/css/` | Stylesheets |
