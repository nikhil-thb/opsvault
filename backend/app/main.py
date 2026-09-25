from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.api import auth, users, projects, problems, fixes, search, categories

app = FastAPI(title="OpsVault API")

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(problems.router, prefix="/api/problems", tags=["problems"])
app.include_router(fixes.router, prefix="/api", tags=["fixes"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
