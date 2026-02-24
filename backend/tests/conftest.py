"""
tests/conftest.py
-----------------
Pre-import mocks for modules that require live external credentials
(Supabase, Gemini).  These must be inserted into sys.modules BEFORE any
route or config module that imports them is loaded by pytest.
"""

import sys
from unittest.mock import MagicMock

import pytest

# ── Pre-import stubs ─────────────────────────────────────────────────────────
# Create a single shared mock supabase client so every module that does
#   `from config.supabase import supabase`
# gets the same object, making per-test patching straightforward.

_mock_supabase = MagicMock(name="supabase_client")
_mock_supabase_module = MagicMock(name="config.supabase")
_mock_supabase_module.supabase = _mock_supabase

_mock_gemini_client = MagicMock(name="gemini_client")
_mock_gemini_module = MagicMock(name="config.gemini")
_mock_gemini_module.client = _mock_gemini_client

sys.modules.setdefault("config.supabase", _mock_supabase_module)
sys.modules.setdefault("config.gemini", _mock_gemini_module)

# ── Fixtures ─────────────────────────────────────────────────────────────────

FAKE_USER = {"id": "user-test-001", "email": "test@scholarsync.test"}


@pytest.fixture()
def mock_supabase():
    """Yield the shared mock supabase client, reset between tests."""
    _mock_supabase.reset_mock()
    yield _mock_supabase
    _mock_supabase.reset_mock()


@pytest.fixture()
def fake_user():
    return FAKE_USER


def make_app(router):
    """Create a minimal FastAPI app that includes *router* with auth stubbed."""
    from fastapi import FastAPI
    from config.auth import get_current_user

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_current_user] = lambda: FAKE_USER
    return app
