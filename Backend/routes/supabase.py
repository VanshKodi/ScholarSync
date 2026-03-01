from supabase import create_client, Client

from dotenv import load_dotenv
import os

from fastapi import APIRouter

load_dotenv()

SUPABASE_PROJECT_URL: str = os.getenv("SUPABASE_PROJECT_URL")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(
    SUPABASE_PROJECT_URL,
    SUPABASE_SERVICE_KEY
)

router = APIRouter()

@router.get("/test-supabase")
async def health(): 
    try:
        supabase.rpc("test_connection").execute()
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "supabase_down"}