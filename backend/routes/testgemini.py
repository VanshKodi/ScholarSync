from fastapi import APIRouter
from config.gemini import client

router = APIRouter()

@router.get("/test-gemini")
async def test_gemini():
    response = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents="What is the latest occurence in the world that you have knowledge for."
    )

    return {"response": response.text}

@router.get("/test-gemini-chat")
async def test_gemini_chat(message: str):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=message
    )

    return {
        "user_message": message,
        "gemini_reply": response.text
    }