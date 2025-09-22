from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, tasks, users
from app.api.endpoints.admin import router as admin_router
from app.api.endpoints.llm import router as llm_router
from app.core.startup import create_admin_user_if_not_exists

app = FastAPI(title="LLM Orchestrator Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://ui:3000"],  # Allow both local development and Docker container
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Authorization"],
)

# Startup event to create admin user if not exists
@app.on_event("startup")
async def startup_event():
    create_admin_user_if_not_exists()

app.include_router(auth.router, tags=["Authentication"])
app.include_router(tasks.router, tags=["Tasks"])
app.include_router(users.router, tags=["Users"])
app.include_router(admin_router)
app.include_router(llm_router, tags=["LLM"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the LLM Orchestrator Service"}