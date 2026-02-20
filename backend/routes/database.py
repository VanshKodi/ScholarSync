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

@router.post("/apply-to-join-university/{university_id}")
def apply_to_join_university(university_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    resp = supabase.table("university_join_requests").insert({
        "requester_id": user_id,
        "university_id": university_id,
        "message": "message"
    }).execute()

    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to submit join request")

    return {"message": "Join request submitted successfully"}
    
@router.get("/all-join-requests/{university_id}")
def get_all_join_requests(university_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    profile_resp = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not profile_resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = profile_resp.data[0]
    if profile["role"] != "admin" or profile["university_id"] != university_id:
        raise HTTPException(status_code=403, detail="Not authorized to view join requests")

    resp = supabase.table("university_join_requests").select("*").eq("university_id", university_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="No join requests found for this university")

    return resp.data
@router.get("/get-user-profile")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    resp = supabase.table("profiles") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if not resp.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    return resp.data[0]

from fastapi import APIRouter, Depends, HTTPException, Request

@router.post("/handle-join-request")
async def handle_join_request(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        body = await request.json()
        request_id = body.get("request_id")
        action = body.get("action")

        if not request_id or not action:
            raise HTTPException(status_code=400, detail="Missing request_id or action")

        admin_id = current_user.get("id")

        # 1️⃣ Check admin role
        admin_profile = supabase.table("profiles") \
            .select("*") \
            .eq("id", admin_id) \
            .execute()

        if not admin_profile.data or admin_profile.data[0]["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only admin can handle requests")

        university_id = admin_profile.data[0]["university_id"]

        # 2️⃣ Get join request
        req_resp = supabase.table("university_join_requests") \
            .select("*") \
            .eq("request_id", request_id) \
            .eq("university_id", university_id) \
            .execute()

        if not req_resp.data:
            raise HTTPException(status_code=404, detail="Request not found")

        join_request = req_resp.data[0]

        if action == "accept":
            supabase.table("profiles") \
                .update({
                    "university_id": university_id,
                    "role": "faculty"
                }) \
                .eq("id", join_request["requester_id"]) \
                .execute()
            supabase.table("university_join_requests") \
                .delete() \
                .eq("request_id", request_id) \
                .execute()
            return {"message": "Request approved"}

        elif action == "reject":
            supabase.table("university_join_requests") \
                .delete() \
                .eq("request_id", request_id) \
                .execute()
            
            return {"message": "Request rejected"}

        else:
            raise HTTPException(status_code=400, detail="Invalid action")

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail="Internal server error")