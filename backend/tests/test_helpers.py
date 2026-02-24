"""
tests/test_helpers.py
---------------------
Unit tests for config/helpers.py::get_profile.
"""

import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException


def test_get_profile_returns_data_when_found(mock_supabase):
    expected = {"id": "user-test-001", "role": "faculty", "university_id": "uni-1"}
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        MagicMock(data=[expected])
    )

    from config.helpers import get_profile

    result = get_profile("user-test-001")

    assert result == expected
    mock_supabase.table.assert_called_with("profiles")


def test_get_profile_raises_404_when_not_found(mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        MagicMock(data=[])
    )

    from config.helpers import get_profile

    with pytest.raises(HTTPException) as exc_info:
        get_profile("nonexistent-user")

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Profile not found"


def test_get_profile_raises_404_when_data_is_none(mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = (
        MagicMock(data=None)
    )

    from config.helpers import get_profile

    with pytest.raises(HTTPException) as exc_info:
        get_profile("user-with-none-data")

    assert exc_info.value.status_code == 404
