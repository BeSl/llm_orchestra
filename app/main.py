from fastapi import FastAPI
from app.api.endpoints import auth, tasks, users
from app.api.endpoints.admin import router as admin_router
from app.core.startup import create_admin_user_if_not_exists

app = FastAPI(title="LLM Orchestrator Service")

# Startup event to create admin user if not exists
@app.on_event("startup")
async def startup_event():
    create_admin_user_if_not_exists()

app.include_router(auth.router, tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])
app.include_router(users.router, tags=["Users"])
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the LLM Orchestrator Service"}