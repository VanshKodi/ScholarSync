from fastapi import HTTPException
from config.supabase import supabase


def get_profile(user_id: str) -> dict:
    """Fetch the profile row for *user_id*, raising 404 if not found."""
    resp = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return resp.data[0]
