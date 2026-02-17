from fastapi import APIRouter, Header, HTTPException, Depends
from config.supabase import supabase

router = APIRouter()


def get_current_user_id(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid auth format")

    user = supabase.auth.get_user(token)

    if not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    return user.user.id


@router.get("/test-supabase")
async def test_supabase():
    try:
        supabase.auth.get_session()
        return {"status": "Supabase connected successfully"}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}



@router.post("/become-admin/{university_name}")
async def become_admin(
    university_name: str,
    user_id: str = Depends(get_current_user_id)
):
    # Create university
    uni_resp = supabase.table("universities") \
        .insert({"name": university_name}) \
        .execute()

    if not uni_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university")

    university_id = uni_resp.data[0]["university_id"]

    # Update profile
    supabase.table("profiles") \
        .update({
            "role": "admin",
            "university_id": university_id
        }) \
        .eq("id", user_id) \
        .execute()

    return {"message": "You are now admin"}



@router.post("/apply-to-join-university/{university_id}")
async def apply_to_join_university(
    university_id: str,
    user_id: str = Depends(get_current_user_id)
):
    join_resp = supabase.table("university_join_requests") \
        .insert({
            "university_id": university_id,
            "requester_id": user_id,
            "message": "",
            "status": "pending"
        }) \
        .execute()

    if not join_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university request")

    return {"message": "Join request sent successfully"}


@router.post("/become-faculty")
async def become_faculty(
    user_id: str = Depends(get_current_user_id)
):
    # Get current profile
    profile_resp = supabase.table("profiles") \
        .select("role, university_id") \
        .eq("id", user_id) \
        .single() \
        .execute()

    if not profile_resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = profile_resp.data

    # If admin, delete their university
    if profile["role"] == "admin" and profile["university_id"]:
        university_id = profile["university_id"]

        # Clear references first (safe if no ON DELETE SET NULL)
        supabase.table("profiles") \
            .update({"university_id": None}) \
            .eq("university_id", university_id) \
            .execute()

        supabase.table("universities") \
            .delete() \
            .eq("university_id", university_id) \
            .execute()

    # Update user role
    supabase.table("profiles") \
        .update({
            "role": "faculty",
            "university_id": None
        }) \
        .eq("id", user_id) \
        .execute()

    return {"message": "You are now faculty"}