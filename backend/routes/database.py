from fastapi import APIRouter, Depends, HTTPException, Request
from config.supabase import supabase
from config.auth import get_current_user
from config.helpers import get_profile
from config.logger import get_logger

log = get_logger("DATABASE")

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

    log.info("Profile created for user_id=%s", user_id)
    return resp.data[0]

@router.post("/create-university/{university_name}")
def create_university(university_name: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    uni_resp = supabase.table("universities").insert({"name": university_name}).execute()
    if not uni_resp.data:
        raise HTTPException(status_code=400, detail="Failed to create university")

    university_id = uni_resp.data[0]["university_id"]

    supabase.table("profiles").update({"role": "admin", "university_id": university_id}).eq("id", user_id).execute()

    log.info("University '%s' created, user_id=%s is now admin", university_name, user_id)
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

    log.info("Join request submitted: user_id=%s → university_id=%s", user_id, university_id)
    return {"message": "Join request submitted successfully"}
    
@router.get("/all-join-requests/{university_id}")
def get_all_join_requests(university_id: str, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")

    profile = get_profile(user_id)
    if profile["role"] != "admin" or profile["university_id"] != university_id:
        raise HTTPException(status_code=403, detail="Not authorized to view join requests")

    resp = supabase.table("university_join_requests").select("*").eq("university_id", university_id).execute()
    log.debug("Fetched %d join requests for university_id=%s", len(resp.data or []), university_id)
    return resp.data or []

@router.get("/get-user-profile")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    log.debug("Fetching profile for user_id=%s", user_id)
    return get_profile(user_id)

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
        profile = get_profile(admin_id)

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
                log.info("Acceptance notification sent to user_id=%s", join_request["requester_id"])
            except Exception as notif_exc:
                log.warning("Could not create acceptance notification: %s", notif_exc)

        # 4️⃣ Delete request (both accept & reject)
        delete_resp = supabase.table("university_join_requests") \
            .delete() \
            .eq("request_id", request_id) \
            .execute()

        if not delete_resp.data:
            raise HTTPException(status_code=500, detail="Failed to delete request")

        log.info("Join request %s %sed by admin_id=%s", request_id, action, admin_id)
        return {"message": f"Request {action}ed successfully"}

    except HTTPException:
        raise
    except Exception as e:
        log.error("Unhandled error in handle_join_request: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")