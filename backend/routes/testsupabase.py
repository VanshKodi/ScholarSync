from fastapi import APIRouter
from config.supabase import supabase

router = APIRouter()

@router.get("/test-supabase")
async def test_supabase():
    try:
        # This will hit Supabase auth endpoint
        response = supabase.auth.get_session()

        return {
            "status": "Supabase connected successfully"
        }

    except Exception as e:
        return {
            "status": "Error",
            "detail": str(e)
        }