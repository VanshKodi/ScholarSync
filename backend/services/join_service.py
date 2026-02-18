from config.supabase import supabase
from fastapi import HTTPException


def get_university_join_requests(university_id: str):
    resp = supabase.table("university_join_requests").select("*").eq("university_id", university_id).order("request_id", desc=True).execute()
    return resp.data or []


def approve_join_request(request_id: str):
    req = supabase.table("university_join_requests").select("*").eq("request_id", request_id).single().execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found")

    university_id = req.data["university_id"]
    requester_id = req.data["requester_id"]

    supabase.table("profiles").update({"university_id": university_id}).eq("id", requester_id).execute()

    supabase.table("university_join_requests").update({"status": "approved"}).eq("request_id", request_id).execute()

    return {"message": "Request approved"}


def reject_join_request(request_id: str):
    req = supabase.table("university_join_requests").select("*").eq("request_id", request_id).single().execute()
    if not req.data:
        raise HTTPException(status_code=404, detail="Request not found")

    supabase.table("university_join_requests").update({"status": "rejected"}).eq("request_id", request_id).execute()

    return {"message": "Request rejected"}

