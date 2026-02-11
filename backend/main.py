from fastapi import FastAPI
from routes import test
from routes.testgemini import router as gemini_router 
from routes.testsupabase import router as supabase_router 
from fastapi.middleware.cors import CORSMiddleware
# To be used oterwhere
from config.supabase import supabase
from config.gemini import client
#
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500","http://localhost:5500"],  # frontend port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(test.router)
app.include_router(gemini_router)

app.include_router(supabase_router)