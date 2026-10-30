from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings

# Engine configuration with pool recycle and echo settings
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    # SQLite doesn't use pool_size
    **({"connect_args": {"check_same_thread": False}} if "sqlite" in settings.DATABASE_URL else {})
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an asynchronous database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
