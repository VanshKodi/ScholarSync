STEP-1 Clone Repo

git clone https://github.com/VanshKodi/ScholarSync

Step-2 Supabase Project Creation

steps might vary based on date and current supabase version

Create a new Supabase Project 
in Authentication -> CONFIGURATION -> Sign In/Providers
-disable Confirm Email
![alt text](image.png)

Step-3 DB - Setup

Copy contents of backend/db_schema.md
and run that inside the SQL-Editor inside Supabase
![alt text](image-1.png)

Step-4 KEY Extraction
- Might vary / entierly break
Create a .env inside backend and populate it with following variables
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_URL is project url found inside ProjectSettings -> Data API
SUPABASE_SERVICE_ROLE_KEY is found in ProjectSettings -> API keys -> Legacy anon/service_role
![alt text](image-2.png)

Step-4 Install Live server (VS Code extension)
Step-5 run live server on frontend/index.html
Step-6 Backend Setup
pip install -r backend/requirements.txt

uvicorn backend/main:app --reload --port 8000

Step-7 Auth Setup
in Supabase head to Authentication -> CONFIGURATION ->URL CONFIGURATION
ADD Following url
http://127.0.0.1:5500
http://127.0.0.1:8000
EVERYTHING SHOULD BE RUNNING AS OF NOW

STEP-8 SETUP BUCKETS (To store documents)
