from fastapi import APIRouter, Depends
from config.supabase import supabase
from config.auth import get_current_user
from services.university_service import (
    create_university_and_assign_admin,
    apply_to_join_university as svc_apply_to_join_university,
    become_faculty as svc_become_faculty,
)

router = APIRouter()


@router.get("/test-supabase")
async def test_supabase():
    try:
        supabase.auth.get_session()
        return {"status": "Supabase connected successfully"}
    except Exception as e:
        return {"status": "Error", "detail": str(e)}


@router.get("/auth/profile")
async def get_current_profile(user: dict = Depends(get_current_user)):
    """Get current authenticated user's profile"""
    profile = supabase.table("profiles").select("*").eq("id", user.get("id")).single().execute()
    
    if not profile.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile.data


@router.post("/become-admin/{university_name}")
async def become_admin(university_name: str, user: dict = Depends(get_current_user)):
    user_id = user.get("id")
    return create_university_and_assign_admin(university_name, user_id)



@router.post("/apply-to-join-university/{university_id}")
async def apply_to_join_university(university_id: str, user: dict = Depends(get_current_user)):
    user_id = user.get("id")
    return svc_apply_to_join_university(university_id, user_id)


@router.post("/become-faculty")
async def become_faculty(user: dict = Depends(get_current_user)):
    user_id = user.get("id")
    return svc_become_faculty(user_id)

@router.get("/university-join-requests/{university_id}")
async def get_university_join_requests(university_id: str, user: dict = Depends(get_current_user)):
    # Ensure requester is admin of that university
    profile = supabase.table("profiles").select("role, university_id").eq("id", user.get("id")).single().execute()

    if not profile.data:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Profile not found")

    if profile.data["role"] != "admin" or profile.data["university_id"] != university_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")

    return supabase.table("university_join_requests").select("*").eq("university_id", university_id).order("request_id", desc=True).execute().data or []

@router.post("/approve-join-request/{request_id}")
async def approve_join_request(
    request_id: str,
    user_id: str = Depends(get_current_user)
):
    # NOTE: Approval logic moved to services; route retains thin wrapper
    from services.join_service import approve_join_request as svc_approve
    return svc_approve(request_id)

@router.post("/reject-join-request/{request_id}")
async def reject_join_request(
    request_id: str,
    user_id: str = Depends(get_current_user)
):
    from services.join_service import reject_join_request as svc_reject
    return svc_reject(request_id)