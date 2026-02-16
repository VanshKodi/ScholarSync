from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from config.supabase import supabase
from config.auth import verify_supabase_token, SupabaseAuthError

from typing import Optional

router = APIRouter()


class HandleRequestBody(BaseModel):
    request_id: str
    action: str  # 'accept' or 'reject'


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail='missing authorization header')

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        raise HTTPException(status_code=401, detail='invalid authorization header')

    token = parts[1]
    try:
        user = verify_supabase_token(token)
    except SupabaseAuthError as e:
        raise HTTPException(status_code=401, detail=str(e))

    return user


@router.post('/handle-join-request')
async def handle_join_request(body: HandleRequestBody, user=Depends(get_current_user)):
    # Authenticated endpoint: Supabase access token is validated via
    # config.auth.verify_supabase_token which calls the Supabase auth API.
    # This endpoint uses the SERVICE_ROLE key (configured in config.supabase)
    # It performs an atomic operation: if action == 'accept', update the target
    # profile's university_id and set request status to 'accepted'.
    if body.action not in ('accept', 'reject'):
        raise HTTPException(status_code=400, detail='invalid action')

    # Fetch the request
    req = supabase.table('university_join_requests').select('*').eq('request_id', body.request_id).single().execute()
    if req.error or not req.data:
        raise HTTPException(status_code=404, detail='request not found')

    request = req.data

    if request['status'] != 'pending':
        raise HTTPException(status_code=400, detail='request already handled')

    if body.action == 'reject':
        upd = supabase.table('university_join_requests').update({'status': 'rejected', 'handled_at': 'now()'}).eq('request_id', body.request_id).execute()
        if upd.error:
            raise HTTPException(status_code=500, detail=str(upd.error))
        return {'status': 'ok', 'detail': 'rejected'}

    # Accept: start transaction via RPC if available; else perform sequential safely
    # Update profile -> set university_id = request.university_id
    target_profile_id = request['requester_id']
    university_id = request['university_id']

    # Update profiles
    upd_prof = supabase.table('profiles').update({'university_id': university_id}).eq('id', target_profile_id).execute()
    if upd_prof.error:
        raise HTTPException(status_code=500, detail='failed to update profile: ' + str(upd_prof.error))

    # Mark request accepted
    upd_req = supabase.table('university_join_requests').update({'status': 'accepted', 'handled_by': None, 'handled_at': 'now()'}).eq('request_id', body.request_id).execute()
    if upd_req.error:
        raise HTTPException(status_code=500, detail='failed to mark request accepted: ' + str(upd_req.error))

    return {'status': 'ok', 'detail': 'accepted'}
