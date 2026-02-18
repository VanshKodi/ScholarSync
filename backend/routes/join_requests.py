from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from config.auth import get_current_user
from services.join_service import approve_join_request, reject_join_request

router = APIRouter()


class HandleRequestBody(BaseModel):
    request_id: str
    action: str  # 'accept' or 'reject'


@router.post('/handle-join-request')
async def handle_join_request(body: HandleRequestBody, user=Depends(get_current_user)):
    if body.action not in ('accept', 'reject'):
        raise HTTPException(status_code=400, detail='invalid action')

    if body.action == 'reject':
        reject_join_request(body.request_id)
        return {'status': 'ok', 'detail': 'rejected'}

    approve_join_request(body.request_id)
    return {'status': 'ok', 'detail': 'accepted'}
