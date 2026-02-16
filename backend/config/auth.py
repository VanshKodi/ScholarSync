import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


class SupabaseAuthError(Exception):
    pass


def verify_supabase_token(token: str) -> dict:
    """
    Verify an access token by calling Supabase auth endpoint.

    Returns the user payload (dict) on success. Raises SupabaseAuthError on failure.
    """
    if not token:
        raise SupabaseAuthError("missing token")

    if not SUPABASE_URL:
        raise SupabaseAuthError("Supabase URL not configured")

    url = SUPABASE_URL.rstrip("/") + "/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
    }

    # include service role key as apikey to ensure access when needed
    if SUPABASE_KEY:
        headers["apikey"] = SUPABASE_KEY

    resp = requests.get(url, headers=headers, timeout=5)
    if resp.status_code != 200:
        raise SupabaseAuthError(f"invalid token or auth failed: {resp.status_code}")

    try:
        data = resp.json()
    except Exception as e:
        raise SupabaseAuthError("failed reading supabase response") from e

    return data
