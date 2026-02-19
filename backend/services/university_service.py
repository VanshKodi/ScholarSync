from config.supabase import supabase
from fastapi import HTTPException


def create_university_and_assign_admin(university_name: str, user_id: str):
    uni_resp = supabase.table("universities").insert({"name": university_name}).execute()
    if not uni_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university")

    university_id = uni_resp.data[0]["university_id"]

    supabase.table("profiles").update({"role": "admin", "university_id": university_id}).eq("id", user_id).execute()

    return {"message": "You are now admin"}


def apply_to_join_university(university_id: str, user_id: str):
    # Check if user already has a university
    profile_resp = supabase.table("profiles").select("university_id").eq("id", user_id).single().execute()
    if not profile_resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = profile_resp.data
    if profile.get("university_id") is not None:
        raise HTTPException(
            status_code=400, 
            detail="You are already part of a university. Users can only join one university."
        )
    
    # Check if user already has a pending request for any university
    existing_req = supabase.table("university_join_requests").select("*").eq("requester_id", user_id).eq("status", "pending").execute()
    if existing_req.data:
        raise HTTPException(
            status_code=400, 
            detail="You already have a pending join request. Please wait for it to be processed."
        )
    
    join_resp = supabase.table("university_join_requests").insert({
        "university_id": university_id,
        "requester_id": user_id,
        "message": "",
        "status": "pending"
    }).execute()

    if not join_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university request")

    return {"message": "Join request sent successfully"}


def become_faculty(user_id: str):
    profile_resp = supabase.table("profiles").select("role, university_id").eq("id", user_id).single().execute()
    if not profile_resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = profile_resp.data

    # Prevent admins from becoming faculty - they are locked to their university
    if profile.get("role") == "admin" and profile.get("university_id"):
        raise HTTPException(
            status_code=403, 
            detail="Admins cannot change roles. You are locked to your university as an admin."
        )

    supabase.table("profiles").update({"role": "faculty", "university_id": None}).eq("id", user_id).execute()

    return {"message": "You are now faculty"}

