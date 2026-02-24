"""
tests/test_documents_routes.py
--------------------------------
Tests for routes/documents.py key endpoints.
"""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from tests.conftest import make_app

FACULTY_PROFILE = {
    "id": "user-test-001",
    "role": "faculty",
    "university_id": "uni-abc",
}

ADMIN_PROFILE = {
    "id": "user-test-001",
    "role": "admin",
    "university_id": "uni-abc",
}


@pytest.fixture()
def client():
    from routes.documents import router
    return TestClient(make_app(router), raise_server_exceptions=False)


# ── GET /documents-visible-to-user ────────────────────────────────────────────

class TestDocumentsVisibleToUser:
    def test_returns_active_documents(self, client, mock_supabase):
        active_doc = {
            "document_id": "doc-1",
            "group_id": "grp-1",
            "status": "ready",
            "human_description": "Test doc",
            "ai_description": None,
            "created_at": "2024-01-01T00:00:00Z",
        }
        group = {
            "doc_group_id": "grp-1",
            "title": "Test Group",
            "scope": "global",
            "active_document_id": "doc-1",
            "documents": [active_doc],
        }
        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            mock_supabase.table.return_value \
                .select.return_value \
                .or_.return_value \
                .execute.return_value = MagicMock(data=[group])

            resp = client.get("/documents-visible-to-user")

        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["document_id"] == "doc-1"
        assert data[0]["is_active"] is True

    def test_skips_groups_with_no_active_document(self, client, mock_supabase):
        group = {
            "doc_group_id": "grp-1",
            "title": "Empty Group",
            "scope": "global",
            "active_document_id": None,
            "documents": [],
        }
        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            mock_supabase.table.return_value \
                .select.return_value \
                .or_.return_value \
                .execute.return_value = MagicMock(data=[group])

            resp = client.get("/documents-visible-to-user")

        assert resp.status_code == 200
        assert resp.json() == []


# ── GET /my-document-groups ───────────────────────────────────────────────────

class TestMyDocumentGroups:
    def test_returns_groups(self, client, mock_supabase):
        groups = [
            {"doc_group_id": "grp-1", "title": "Alpha", "scope": "local"},
            {"doc_group_id": "grp-2", "title": "Beta",  "scope": "global"},
        ]
        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            mock_supabase.table.return_value \
                .select.return_value \
                .or_.return_value \
                .order.return_value \
                .execute.return_value = MagicMock(data=groups)

            resp = client.get("/my-document-groups")

        assert resp.status_code == 200
        assert len(resp.json()) == 2


# ── GET /download-document/{document_id} ─────────────────────────────────────

class TestDownloadDocument:
    def _mock_doc_and_group(self, mock_supabase, scope="local"):
        doc = {
            "document_id": "doc-1",
            "group_id":    "grp-1",
            "file_path":   "uni-abc/grp-1/file.pdf",
        }
        group = {
            "doc_group_id":  "grp-1",
            "scope":         scope,
            "university_id": "uni-abc",
        }
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[doc])
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.side_effect = [
                MagicMock(data=[doc]),
                MagicMock(data=[group]),
            ]
        return doc, group

    def test_faculty_can_download_local_doc_from_own_university(self, client, mock_supabase):
        self._mock_doc_and_group(mock_supabase, scope="local")
        signed_url = {"signedURL": "https://storage.example.com/signed"}
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = signed_url

        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            resp = client.get("/download-document/doc-1")

        assert resp.status_code == 200
        assert "url" in resp.json()

    def test_faculty_cannot_download_global_doc(self, client, mock_supabase):
        self._mock_doc_and_group(mock_supabase, scope="global")

        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            resp = client.get("/download-document/doc-1")

        assert resp.status_code == 403

    def test_missing_document_returns_404(self, client, mock_supabase):
        mock_supabase.table.return_value \
            .select.return_value \
            .eq.return_value \
            .execute.return_value = MagicMock(data=[])

        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            resp = client.get("/download-document/nonexistent")

        assert resp.status_code == 404
        assert "Document not found" in resp.json()["detail"]


# ── POST /search-documents ────────────────────────────────────────────────────

class TestSearchDocuments:
    def test_empty_query_returns_400(self, client, mock_supabase):
        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            resp = client.post("/search-documents", json={"query": "  "})

        assert resp.status_code == 400
        assert "Query must not be empty" in resp.json()["detail"]

    def test_text_mode_returns_results(self, client, mock_supabase):
        with patch("routes.documents.get_profile", return_value=FACULTY_PROFILE):
            with patch("routes.documents._text_search", return_value=[]) as mock_ts:
                resp = client.post("/search-documents", json={"query": "machine learning", "mode": "text"})

        assert resp.status_code == 200
        mock_ts.assert_called_once()
