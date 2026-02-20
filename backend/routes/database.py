from fastapi import APIRouter, Depends,HTTPException
from config.supabase import supabase
from config.auth import get_current_user


router = APIRouter()
@router.post("/create-profile")
def create_profile(current_user: dict = Depends(get_current_user)):
    print("Creating profile for user:", current_user)
    user_id = current_user.get("id")
    resp = supabase.table("profiles").insert({"id": user_id, "role": "faculty", "status": "active"}).execute()
    if resp.error:
        raise HTTPException(status_code=400, detail="Failed to create profile")
    return resp.data

@router.post("/create-university/{university_name}")
def create_university(university_name: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    uni_resp = supabase.table("universities").insert({"name": university_name}).execute()
    if not uni_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university")

    university_id = uni_resp.data[0]["university_id"]

    supabase.table("profiles").update({"role": "admin", "university_id": university_id}).eq("id", user_id).execute()

    return {"message": "You are now admin"}
    