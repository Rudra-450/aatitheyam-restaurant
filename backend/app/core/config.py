import os
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aatitheyam Cafe & Bhojnalaya"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "production"
    
    # Security
    SECRET_KEY: str = "super-secret-production-grade-key-change-in-env-file-at-least-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    COOKIE_NAME: str = "restaurant_owner_session"
    COOKIE_SECURE: bool = False  # Set to True when served over HTTPS
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./restaurant.db"  # Defaults to async SQLite for out-of-the-box local execution, or set postgresql+asyncpg in .env
    
    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+asyncpg://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif v.startswith("sqlite+aiosqlite:///./"):
            rel_path = v[len("sqlite+aiosqlite:///./"):]
            abs_path = (BASE_DIR / rel_path).resolve().as_posix()
            return f"sqlite+aiosqlite:///{abs_path}"
        return v
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost",
        "https://localhost",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: any) -> list[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v
    
    # Media Storage
    UPLOAD_DIR: str = str(BASE_DIR / "static" / "uploads")
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # Public Menu URL Base for QR generation
    PUBLIC_MENU_BASE_URL: str = "http://localhost:3000/menu"
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
