"""
tests/test_database_routes.py
------------------------------
Integration-style tests for routes/database.py using FastAPI TestClient
and mocked Supabase / get_profile dependencies.
"""

import json
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from tests.conftest import make_app

ADMIN_PROFILE = {
    "id": "user-test-001",
    "role": "admin",
    "university_id": "uni-abc",
}

FACULTY_PROFILE = {
    "id": "user-test-001",
    "role": "faculty",
    "university_id": "uni-abc",
}


@pytest.fixture()
def client():
    from routes.database import router
    return TestClient(make_app(router), raise_server_exceptions=False)


# ── /create-profile ────────────────────────────────────────────────────────────

class TestCreateProfile:
    def test_success(self, client, mock_supabase):
        new_profile = {"id": "user-test-001", "role": "faculty", "status": "active"}
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            MagicMock(data=[new_profile])
        )

        resp = client.post("/create-profile")

        assert resp.status_code == 200
        assert resp.json()["role"] == "faculty"

    def test_insert_failure_returns_400(self, client, mock_supabase):
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            MagicMock(data=[])
        )

        resp = client.post("/create-profile")

        assert resp.status_code == 400
        assert "Failed to create profile" in resp.json()["detail"]


# ── /get-user-profile ──────────────────────────────────────────────────────────

class TestGetUserProfile:
    def test_returns_profile(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[FACULTY_PROFILE])
        )

        resp = client.get("/get-user-profile")

        assert resp.status_code == 200
        assert resp.json()["role"] == "faculty"

    def test_profile_not_found_returns_404(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[])
        )

        resp = client.get("/get-user-profile")

        assert resp.status_code == 404
        assert "Profile not found" in resp.json()["detail"]


# ── /all-join-requests/{university_id} ────────────────────────────────────────

class TestGetAllJoinRequests:
    def test_admin_can_view_own_university(self, client, mock_supabase):
        join_requests = [
            {"request_id": "req-1", "requester_id": "other-user", "university_id": "uni-abc"}
        ]
        # First call returns admin profile; second call returns join requests
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            MagicMock(data=[ADMIN_PROFILE]),
            MagicMock(data=join_requests),
        ]

        resp = client.get("/all-join-requests/uni-abc")

        assert resp.status_code == 200
        assert len(resp.json()) == 1

    def test_non_admin_gets_403(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[FACULTY_PROFILE])
        )

        resp = client.get("/all-join-requests/uni-abc")

        assert resp.status_code == 403

    def test_admin_of_different_university_gets_403(self, client, mock_supabase):
        wrong_uni_admin = {**ADMIN_PROFILE, "university_id": "uni-other"}
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[wrong_uni_admin])
        )

        resp = client.get("/all-join-requests/uni-abc")

        assert resp.status_code == 403

    def test_empty_list_returns_200(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            MagicMock(data=[ADMIN_PROFILE]),
            MagicMock(data=[]),
        ]

        resp = client.get("/all-join-requests/uni-abc")

        assert resp.status_code == 200
        assert resp.json() == []


# ── /apply-to-join-university/{university_id} ────────────────────────────────

class TestApplyToJoinUniversity:
    def test_success(self, client, mock_supabase):
        join_req = {"request_id": "req-new", "requester_id": "user-test-001", "university_id": "uni-abc"}
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            MagicMock(data=[join_req])
        )

        resp = client.post("/apply-to-join-university/uni-abc")

        assert resp.status_code == 200
        assert resp.json()["message"] == "Join request submitted successfully"

    def test_insert_failure_returns_400(self, client, mock_supabase):
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            MagicMock(data=[])
        )

        resp = client.post("/apply-to-join-university/uni-abc")

        assert resp.status_code == 400


# ── /handle-join-request ──────────────────────────────────────────────────────

class TestHandleJoinRequest:
    def _setup_admin(self, mock_supabase, action="accept"):
        """Configure mock_supabase for a full accept/reject flow."""
        join_request = {
            "request_id": "req-1",
            "requester_id": "other-user",
            "university_id": "uni-abc",
        }
        uni = {"university_id": "uni-abc", "name": "Test University"}

        def _side_effect(*args, **kwargs):
            return MagicMock(data=[ADMIN_PROFILE])

        # We'll patch get_profile directly in these tests for clarity
        return join_request, uni

    def test_invalid_action_returns_400(self, client, mock_supabase):
        resp = client.post(
            "/handle-join-request",
            json={"request_id": "req-1", "action": "invalid"},
        )
        assert resp.status_code == 400
        assert "Invalid action" in resp.json()["detail"]

    def test_missing_request_id_returns_400(self, client, mock_supabase):
        resp = client.post(
            "/handle-join-request",
            json={"action": "accept"},
        )
        assert resp.status_code == 400
        assert "Missing request_id" in resp.json()["detail"]

    def test_non_admin_cannot_handle(self, client, mock_supabase):
        with patch("routes.database.get_profile", return_value=FACULTY_PROFILE):
            resp = client.post(
                "/handle-join-request",
                json={"request_id": "req-1", "action": "accept"},
            )
        assert resp.status_code == 403
        assert "Only admin" in resp.json()["detail"]

    def test_accept_success(self, client, mock_supabase):
        join_request = {
            "request_id": "req-1",
            "requester_id": "other-user",
            "university_id": "uni-abc",
        }
        # Mock: join request lookup, profile update, university name, notification, delete
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[join_request])
        )
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[{"id": "other-user"}])
        )
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[{"name": "Test University"}])
        )
        mock_supabase.table.return_value.insert.return_value.execute.return_value = (
            MagicMock(data=[{}])
        )
        mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[join_request])
        )

        with patch("routes.database.get_profile", return_value=ADMIN_PROFILE):
            resp = client.post(
                "/handle-join-request",
                json={"request_id": "req-1", "action": "accept"},
            )

        assert resp.status_code == 200
        assert "accepted" in resp.json()["message"]

    def test_reject_success(self, client, mock_supabase):
        join_request = {
            "request_id": "req-1",
            "requester_id": "other-user",
            "university_id": "uni-abc",
        }
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[join_request])
        )
        mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[join_request])
        )

        with patch("routes.database.get_profile", return_value=ADMIN_PROFILE):
            resp = client.post(
                "/handle-join-request",
                json={"request_id": "req-1", "action": "reject"},
            )

        assert resp.status_code == 200
        assert "rejected" in resp.json()["message"]

    def test_request_not_found_returns_404(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = (
            MagicMock(data=[])
        )

        with patch("routes.database.get_profile", return_value=ADMIN_PROFILE):
            resp = client.post(
                "/handle-join-request",
                json={"request_id": "nonexistent", "action": "reject"},
            )

        assert resp.status_code == 404
        assert "Request not found" in resp.json()["detail"]
