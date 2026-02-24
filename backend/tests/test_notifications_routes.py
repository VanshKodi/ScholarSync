"""
tests/test_notifications_routes.py
------------------------------------
Tests for routes/notifications.py.
"""

import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from tests.conftest import make_app

NOTIF_UNREAD = {
    "notification_id": "notif-1",
    "user_id": "user-test-001",
    "title": "Test notification",
    "message": "Hello",
    "is_read": False,
    "created_at": "2024-01-01T10:00:00Z",
}
NOTIF_READ = {**NOTIF_UNREAD, "notification_id": "notif-2", "is_read": True}


@pytest.fixture()
def client():
    from routes.notifications import router
    return TestClient(make_app(router), raise_server_exceptions=False)


# ── GET /notifications ────────────────────────────────────────────────────────

class TestGetNotifications:
    def test_returns_list(self, client, mock_supabase):
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .order.return_value \
            .order.return_value \
            .limit.return_value \
            .execute.return_value = MagicMock(data=[NOTIF_UNREAD, NOTIF_READ])

        resp = client.get("/notifications")

        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_returns_empty_list_when_no_notifications(self, client, mock_supabase):
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .order.return_value \
            .order.return_value \
            .limit.return_value \
            .execute.return_value = MagicMock(data=[])

        resp = client.get("/notifications")

        assert resp.status_code == 200
        assert resp.json() == []


# ── POST /notifications/{id}/read ─────────────────────────────────────────────

class TestMarkNotificationRead:
    def test_success(self, client, mock_supabase):
        # Ownership check returns matching user_id
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[NOTIF_UNREAD])
        # Update call
        mock_supabase.table.return_value \
            .update.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[{**NOTIF_UNREAD, "is_read": True}])

        resp = client.post("/notifications/notif-1/read")

        assert resp.status_code == 200
        assert resp.json()["message"] == "Notification marked as read"

    def test_not_found_returns_404(self, client, mock_supabase):
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[])

        resp = client.post("/notifications/nonexistent/read")

        assert resp.status_code == 404
        assert "Notification not found" in resp.json()["detail"]

    def test_wrong_user_returns_403(self, client, mock_supabase):
        other_users_notif = {**NOTIF_UNREAD, "user_id": "someone-else"}
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[other_users_notif])

        resp = client.post("/notifications/notif-1/read")

        assert resp.status_code == 403
        assert "Not your notification" in resp.json()["detail"]


# ── POST /notifications/read-all ─────────────────────────────────────────────

class TestMarkAllNotificationsRead:
    def test_success(self, client, mock_supabase):
        mock_supabase.table.return_value \
            .update.return_value \
            .eq.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[])

        resp = client.post("/notifications/read-all")

        assert resp.status_code == 200
        assert resp.json()["message"] == "All notifications marked as read"
