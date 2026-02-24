from fastapi import FastAPI
from routes.database import router as database_router
from routes.documents import router as documents_router
from routes.notifications import router as notifications_router

from fastapi.middleware.cors import CORSMiddleware
# To be used elsewhere
from config.supabase import supabase
from config.gemini import client
from config.logger import get_logger
from workers.processor import start_background_worker
# uvicorn main:app --reload
# cloudflared tunnel run scholarsync-backend
import os

log = get_logger("MAIN")

app = FastAPI()

# Base allowed origins; extend via EXTRA_CORS_ORIGINS env var (comma-separated)
_base_origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8080",
    "http://localhost:8080",
    "https://www.vanshkodi.in",
]
_extra = os.getenv("EXTRA_CORS_ORIGINS", "")
_extra_origins = [o.strip() for o in _extra.split(",") if o.strip()]
allow_origins = _base_origins + _extra_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(database_router)
app.include_router(documents_router)
app.include_router(notifications_router)


@app.on_event("startup")
def startup_event():
    log.info("Starting background document processor …")
    start_background_worker()
