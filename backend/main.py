import os
import requests
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env vars
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

app = FastAPI()

# -----------------------
# CORS (allow frontend)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Helpers
# -----------------------
def get_user_from_token(token: str):
    res = requests.get(
        f"{SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": SERVICE_ROLE_KEY
        }
    )

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")

    return res.json()


# -----------------------
# Schemas
# -----------------------
class InitProfileRequest(BaseModel):
    requested_role: str


# -----------------------
# Routes
# -----------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/init-profile")
def init_profile(
    payload: InitProfileRequest,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = authorization.replace("Bearer ", "")
    user = get_user_from_token(token)

    return {
        "message": "Auth OK",
        "user_id": user["id"],
        "email": user["email"],
        "requested_role": payload.requested_role,
        "assigned_role": "faculty"
    }


@app.get("/auth/me")
def me(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user = get_user_from_token(token)

    return {
        "id": user["id"],
        "email": user["email"]
    }
