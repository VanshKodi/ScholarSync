# Project Summary for LLMs

## Project Overview

- **What the project is:** A frontend web application repository containing static HTML, CSS, and JavaScript files. The folder `frontend` holds the primary source files.
- **Main purpose / user workflow:** Unknown from code. The app includes a Landing, Login, and Dashboard views which suggests a user-facing site where users log in and access a dashboard.

## Tech Stack

- **Frontend frameworks/libraries:** Plain HTML/CSS/JavaScript. No framework files (React/Vue/Angular) or package.json found in repository root.
- **Backend frameworks/libraries:** None present in repository. Unknown from code.
- **Database:** Not present in repository. The frontend references Supabase (see `frontend/js/utils/supabase.js`) which implies a Supabase backend is used, but the database schema and hosting are Unknown from code.
- **Auth method:** Auth-related code exists in `frontend/js/utils/auth.js` and there is a `supabase.js` helper; exact auth flows or secrets are Unknown from code.
- **Hosting / runtime assumptions:** The project appears to be static frontend files (`frontend/html/index.html`) and can be opened in a browser. No build or deployment scripts present in repository root. Hosting assumptions are Unknown from code.

## Folder Structure (high-level)

- `frontend/` — Main frontend source folder.
  - `html/` — Contains `index.html` (application entry point for the static frontend).
  - `css/` — Stylesheets (`base.css`, subfolders `components/` and `views/`).
  - `js/` — Application JavaScript, includes `1_config.js`, `2_app.js`, `3_router.js`.
    - `components/` — UI components (e.g., `Loader.js`, `Navbar.js`).
    - `utils/` — Helper utilities (`auth.js`, `supabase.js`).
    - `views/` — View modules (`Dashboard.js`, `Landing.js`, `Login.js`).
  - `resources/` — Static assets such as `favicons/` and `icons/`.

## Key Features

- Client-side routing (file `frontend/js/3_router.js`).
- Multiple UI views: Landing, Login, Dashboard (files in `frontend/js/views`).
- Reusable UI components: `Loader.js`, `Navbar.js`.
- Supabase client integration helper exists (`frontend/js/utils/supabase.js`).
- Auth helper exists (`frontend/js/utils/auth.js`).

- **Incomplete / TODO (visible from repository structure):**
  - No backend source code present in repo.
  - No tests or test framework files detected.
  - No package.json, build scripts, or CI configuration in repository root.

## Architecture

- **How frontend talks to backend:** The frontend contains a `supabase.js` helper in `frontend/js/utils/`, indicating the app uses the Supabase client from the browser to interact with backend services.
- **API style:** Unknown from code (no server/API source files). Interaction appears client-side via Supabase (client SDK) rather than custom REST/RPC endpoints in this repo.
- **Data flow:** Views (in `frontend/js/views/`) use utilities in `frontend/js/utils/` (e.g., `supabase.js`, `auth.js`). `index.html` is the entry point; `2_app.js` and `3_router.js` likely initialize and route between views.
- **Important patterns used:** Client-side routing, modular JS views and components, utilities/services pattern (`utils/` for shared logic).

## Database / Data Models

- No database schema or model files are present in the repository.
- Supabase client is referenced (`frontend/js/utils/supabase.js`) but specific tables/collections and relationships are Unknown from code.

## Important Files

- `frontend/html/index.html` — Frontend entry point (static HTML).
- `frontend/js/1_config.js` — Configuration file (check for API keys or endpoints).
- `frontend/js/2_app.js` — Main app initialization (likely).
- `frontend/js/3_router.js` — Client-side router.
- `frontend/js/utils/supabase.js` — Supabase client helper; where Supabase interactions are centralized.
- `frontend/js/utils/auth.js` — Authentication helper logic.
- `frontend/js/views/*.js` — View modules for Landing, Login, Dashboard.
- `frontend/js/components/*.js` — UI components such as `Loader.js` and `Navbar.js`.
- `frontend/css/` — Styling for the application.

## How to Run Locally

- There is no `package.json` or build script in repository root; the frontend appears static. A minimal way to run:
  1. Open `frontend/html/index.html` in a browser.
  2. Inspect `frontend/js/1_config.js` and `frontend/js/utils/supabase.js` for any API keys or config that must be set before running.

- **Environment variables needed:** Unknown from code. Look for credentials or keys in `frontend/js/1_config.js` or an untracked `.env` (none present in repo).

## How to Test

- No test files or test framework configuration found in repository. Running tests is Unknown from code.

## Common Developer Tasks

- **Where to add a new API route:** No backend code present in this repository. If the project uses Supabase, add server-side functions or REST endpoints outside this repo; client-side calls live in `frontend/js/utils/supabase.js`.
- **Where to add a new UI page/module:** Add a new view file under `frontend/js/views/` and update `frontend/js/3_router.js` and `frontend/html/index.html` or `frontend/js/2_app.js` as appropriate.
- **Where auth logic lives:** `frontend/js/utils/auth.js`.
- **Where DB queries live:** `frontend/js/utils/supabase.js` and potentially in view modules under `frontend/js/views/`.

## Known Issues / Bugs (visible in repo)

- No backend code or API server present in this repository.
- No package.json, no build scripts, and no tests present — repository lacks standard dev scripts.
- Exact environment/configuration (API keys, Supabase URL/anon key) are not visible in the repo files list; details are Unknown from code.

## Notes for Future LLMs

- **Coding conventions:** Project uses plain modular JavaScript with separate `views/`, `components/`, and `utils/` folders. Specific linting or formatting rules are Unknown from code (no `.eslintrc`, no `prettier` config found).
- **Formatting / linting rules:** Unknown from code.
- **Important constraints:** This repository appears to contain only the static frontend; any backend, database schema, or deployment configuration is external or missing from this repository.

---

If you want, I can open key files (for example `frontend/js/1_config.js` and `frontend/js/utils/supabase.js`) and extract concrete values and TODO comments to replace the "Unknown from code" items above.
