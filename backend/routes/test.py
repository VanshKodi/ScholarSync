from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from config.auth import verify_supabase_token, SupabaseAuthError

router = APIRouter()


@router.get("/ping")
async def ping():
    return {
        "status": "ok",
        "message": "Backend connected successfully"
    }


@router.get('/ping-protected')
async def ping_protected(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail='missing authorization')

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid authorization header')

    token = parts[1]
    try:
        user = verify_supabase_token(token)
    except SupabaseAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))

    return {"status": "ok", "user": user}