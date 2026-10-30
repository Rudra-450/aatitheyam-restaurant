import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.models import Base

async def main():
    print("Starting test...")
    engine = create_async_engine("sqlite+aiosqlite:///./test_run.db", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created successfully!")
    await engine.dispose()
    print("Disposed engine successfully!")

if __name__ == "__main__":
    asyncio.run(main())
