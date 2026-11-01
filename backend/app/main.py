import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1.router import api_router
from app.cli.bootstrap import seed_data
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directories exist
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    (upload_path / "foods").mkdir(exist_ok=True)
    (upload_path / "logos").mkdir(exist_ok=True)

    # Automatically bootstrap DB with initial restaurant, owner and menu if empty (skip during testing)
    if not os.environ.get("TESTING"):
        try:
            await seed_data()
        except Exception as e:
            print(f"[!] Startup bootstrap notice: {e}")

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-Ready Restaurant Digital Menu Management Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media uploads directory for serving static images safely
upload_dir_path = Path(settings.UPLOAD_DIR)
upload_dir_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir_path)), name="uploads")

# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Mount compiled frontend dist for unified serving
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    from starlette.responses import FileResponse

    # Serve static frontend assets (/assets/...)
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend_assets")

    # Catch-all SPA route for React Router (/menu, /admin, /login, etc.)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Exclude /api, /uploads, /health, /docs, /redoc, /openapi.json from SPA fallback
        if full_path.startswith(("api/", "uploads/", "health", "docs", "redoc", "openapi.json")):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API route not found")

        file_candidate = frontend_dist / full_path
        if full_path and file_candidate.exists() and file_candidate.is_file():
            return FileResponse(file_candidate)
        return FileResponse(frontend_dist / "index.html")

