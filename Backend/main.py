'''
venv\Scripts\activate
fastapi dev main.py

'''
from fastapi import FastAPI
from routes import supabase
app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Backend is working!"}

@app.get("/hello/{name}")
async def root(name: str):
    return {"message": f"Hello {name}"}

app.include_router(supabase.router)