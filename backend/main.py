from fastapi import FastAPI
from routes import test
from routes.testgemini import router as gemini_router 
from routes.testsupabase import router as supabase_router 
from routes.join_requests import router as join_requests_router
from fastapi.middleware.cors import CORSMiddleware
# To be used oterwhere
from config.supabase import supabase
from config.gemini import client
#
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # Allow local dev and production frontend on Render
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://scholarsync-3s4e.onrender.com",
        "https://scholarsync.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(test.router)
app.include_router(gemini_router)
app.include_router(supabase_router)
app.include_router(join_requests_router)