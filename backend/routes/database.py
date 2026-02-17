from fastapi import APIRouter, Header, HTTPException
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

@router.post("/become-admin/{university_name}")
async def become_admin(
    university_name: str,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = authorization.split(" ")[1]

    user = supabase.auth.get_user(token)
    if not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = user.user.id

    # 1️⃣ Create university
    uni_resp = supabase.table("universities") \
        .insert({"name": university_name}) \
        .execute()

    if not uni_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university")

    university_id = uni_resp.data[0]["university_id"]

    # 2️⃣ Update profile
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
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = authorization.split(" ")[1]

    user = supabase.auth.get_user(token)
    if not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = user.user.id

    # 1️⃣ Create university join request
    join_resp = supabase.table("university_join_requests") \
        .insert({"university_id": university_id, "requester_id": user_id, "message": "", "status": "pending"}) \
        .execute()

    if not join_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university request")
    return {"message": "Join request sent successfully"}

@router.post("/become-faculty")
async def become_faculty(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth header")

    token = authorization.split(" ")[1]

    user = supabase.auth.get_user(token)
    if not user.user:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = user.user.id

    # Update profile
    resp = supabase.table("profiles") \
        .update({
            "role": "faculty",
            "university_id": None
        }) \
        .eq("id", user_id) \
        .execute()

    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to update profile")

    return {"message": "You are now faculty"}