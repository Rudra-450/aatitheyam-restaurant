import asyncio
import os
import sys

os.environ["TESTING"] = "1"
from pathlib import Path
import pytest
import pytest_asyncio

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.base import Base
from app.database.session import get_db
from app.main import app
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.owner import Owner
from app.models.restaurant import Restaurant

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)



@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        # Seed test restaurant and owner
        restaurant = Restaurant(
            name="Aatitheyam Cafe & Bhojnalaya",
            currency="₹",
            contact_number="+91 1234567890",
            address="Test Promenade",
            opening_hours="10 AM - 10 PM"
        )
        session.add(restaurant)
        await session.commit()
        await session.refresh(restaurant)

        owner = Owner(
            restaurant_id=restaurant.id,
            username="testowner",
            email="testowner@example.com",
            password_hash=get_password_hash("Secret@123"),
            is_active=True
        )
        session.add(owner)

        category = Category(
            restaurant_id=restaurant.id,
            name="Starters",
            display_order=1,
            is_active=True
        )
        session.add(category)
        await session.commit()
        await session.refresh(category)

        food = FoodItem(
            restaurant_id=restaurant.id,
            category_id=category.id,
            name="Paneer Tikka",
            price=250.00,
            food_type="VEG",
            is_available=True,
            display_order=1
        )
        session.add(food)
        await session.commit()

        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
