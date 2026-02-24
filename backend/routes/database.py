from fastapi import APIRouter, Depends, HTTPException, Request
from config.supabase import supabase
from config.auth import get_current_user
from config.helpers import get_profile


router = APIRouter()
@router.post("/create-profile")
def create_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    resp = supabase.table("profiles") \
        .insert({
            "id": user_id,
            "role": "faculty",
            "status": "active"
        }) \
        .execute()

    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to create profile")

    return resp.data[0]

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
        "university_id": university_id
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
    return resp.data or []

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

@router.post("/handle-join-request")
async def handle_join_request(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    try:
        body = await request.json()
        request_id = body.get("request_id")
        action = body.get("action")

        if action not in ["accept", "reject"]:
            raise HTTPException(status_code=400, detail="Invalid action")

        if not request_id:
            raise HTTPException(status_code=400, detail="Missing request_id")

        admin_id = current_user.get("id")

        # 1️⃣ Verify admin
        admin_profile = supabase.table("profiles") \
            .select("*") \
            .eq("id", admin_id) \
            .execute()

        if not admin_profile.data:
            raise HTTPException(status_code=404, detail="Profile not found")

        profile = admin_profile.data[0]

        if profile["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only admin can handle requests")

        university_id = profile["university_id"]

        # 2️⃣ Get request
        req_resp = supabase.table("university_join_requests") \
            .select("*") \
            .eq("request_id", request_id) \
            .eq("university_id", university_id) \
            .execute()

        if not req_resp.data:
            raise HTTPException(status_code=404, detail="Request not found")

        join_request = req_resp.data[0]

        # 3️⃣ If accept → update profile
        if action == "accept":

            update_profile = supabase.table("profiles") \
                .update({
                    "university_id": university_id,
                    "role": "faculty"
                }) \
                .eq("id", join_request["requester_id"]) \
                .execute()

            if not update_profile.data:
                raise HTTPException(status_code=500, detail="Failed to update user profile")

            # Notify the accepted user
            try:
                uni_resp = supabase.table("universities") \
                    .select("name") \
                    .eq("university_id", university_id) \
                    .execute()
                uni_name = uni_resp.data[0]["name"] if uni_resp.data else "your university"
                supabase.table("notifications").insert({
                    "user_id": join_request["requester_id"],
                    "type":    "application_accepted",
                    "title":   "Application accepted",
                    "message": f"You have been accepted as a faculty member of {uni_name}.",
                }).execute()
            except Exception as notif_exc:
                print(f"WARNING – could not create acceptance notification: {notif_exc}")

        # 4️⃣ Delete request (both accept & reject)
        delete_resp = supabase.table("university_join_requests") \
            .delete() \
            .eq("request_id", request_id) \
            .execute()

        if not delete_resp.data:
            raise HTTPException(status_code=500, detail="Failed to delete request")

        return {"message": f"Request {action}ed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail="Internal server error")