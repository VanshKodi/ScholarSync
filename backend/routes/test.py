from fastapi import APIRouter, Header, HTTPException, Depends
from typing import Optional
from config.auth import get_current_user

router = APIRouter()


@router.get("/ping")
async def ping():
    return {
        "status": "ok",
        "message": "Backend connected successfully"
    }


@router.get('/ping-protected')
async def ping_protected(user: dict = Depends(get_current_user)):
    return {"status": "ok", "user": user}