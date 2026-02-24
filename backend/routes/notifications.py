from fastapi import APIRouter, Depends, HTTPException
from config.supabase import supabase
from config.auth import get_current_user
from config.logger import get_logger

log = get_logger("NOTIFICATIONS")

router = APIRouter()


@router.get("/notifications")
def get_notifications(current_user: dict = Depends(get_current_user)):
    """
    Return the 50 most recent notifications for the authenticated user,
    unread ones first.
    """
    user_id = current_user.get("id")

    resp = supabase.table("notifications") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("is_read", desc=False) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()

    log.debug("Fetched %d notifications for user_id=%s", len(resp.data or []), user_id)
    return resp.data or []


@router.post("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a single notification as read (only the owning user may do this)."""
    user_id = current_user.get("id")

    # Verify ownership
    notif = supabase.table("notifications") \
        .select("notification_id, user_id") \
        .eq("notification_id", notification_id) \
        .execute()

    if not notif.data:
        raise HTTPException(status_code=404, detail="Notification not found")

    if notif.data[0]["user_id"] != user_id:
        log.warning("User %s attempted to read notification %s belonging to another user", user_id, notification_id)
        raise HTTPException(status_code=403, detail="Not your notification")

    supabase.table("notifications") \
        .update({"is_read": True}) \
        .eq("notification_id", notification_id) \
        .execute()

    log.debug("Notification %s marked as read by user_id=%s", notification_id, user_id)
    return {"message": "Notification marked as read"}


@router.post("/notifications/read-all")
def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    """Mark every unread notification for the current user as read."""
    user_id = current_user.get("id")

    supabase.table("notifications") \
        .update({"is_read": True}) \
        .eq("user_id", user_id) \
        .eq("is_read", False) \
        .execute()

    log.info("All notifications marked as read for user_id=%s", user_id)
    return {"message": "All notifications marked as read"}
