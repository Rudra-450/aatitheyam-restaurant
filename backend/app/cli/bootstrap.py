import asyncio
import os
import sys
from decimal import Decimal
from sqlalchemy import select
from app.core.security import get_password_hash
from app.database.session import AsyncSessionLocal, engine
from app.database.base import Base
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.owner import Owner
from app.models.restaurant import Restaurant

INITIAL_CATEGORIES = [
    {"name": "Special Bhojan Thali", "display_order": 1},
    {"name": "Cafe Bites & Snacks", "display_order": 2},
    {"name": "Bhojnalaya Main Course", "display_order": 3},
    {"name": "Fresh Rotis & Rice", "display_order": 4},
    {"name": "Mithai & Desserts", "display_order": 5},
    {"name": "Beverages & Chai", "display_order": 6},
]

INITIAL_FOOD_ITEMS = [
    {
        "category": "Special Bhojan Thali",
        "name": "Aatitheyam Special Bhojan Thali",
        "price": Decimal("260.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
    {
        "category": "Special Bhojan Thali",
        "name": "Deluxe Bhojnalaya Thali",
        "price": Decimal("210.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 2,
    },
    {
        "category": "Cafe Bites & Snacks",
        "name": "Paneer Pakoda Platter",
        "price": Decimal("140.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
    {
        "category": "Cafe Bites & Snacks",
        "name": "Crispy Veg Cutlet",
        "price": Decimal("110.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 2,
    },
    {
        "category": "Bhojnalaya Main Course",
        "name": "Special Shahi Paneer",
        "price": Decimal("220.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
    {
        "category": "Bhojnalaya Main Course",
        "name": "Dal Tadka Desi Ghee",
        "price": Decimal("160.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 2,
    },
    {
        "category": "Fresh Rotis & Rice",
        "name": "Butter Tawa Roti",
        "price": Decimal("20.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
    {
        "category": "Fresh Rotis & Rice",
        "name": "Jeera Rice",
        "price": Decimal("120.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 2,
    },
    {
        "category": "Mithai & Desserts",
        "name": "Gulab Jamun (2 pcs)",
        "price": Decimal("70.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
    {
        "category": "Beverages & Chai",
        "name": "Special Masala Kulhad Chai",
        "price": Decimal("35.00"),
        "food_type": "VEG",
        "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
        "is_available": True,
        "display_order": 1,
    },
]

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_data(
    admin_username: str = "admin",
    admin_email: str = "owner@aatitheyam.com",
    admin_password: str = "Admin@12345"
):
    await init_db()
    async with AsyncSessionLocal() as session:
        # Check restaurant
        stmt = select(Restaurant).limit(1)
        res = await session.execute(stmt)
        restaurant = res.scalar_one_or_none()
        if not restaurant:
            restaurant = Restaurant(
                name="Aatitheyam Cafe & Bhojnalaya",
                logo_url=None,
                contact_number=None,
                address=None,
                opening_hours=None,
                currency="₹"
            )
            session.add(restaurant)
            await session.commit()
            await session.refresh(restaurant)
            print(f"[+] Initialized Restaurant: {restaurant.name} (ID: {restaurant.id})")

        # Check Owner
        owner_stmt = select(Owner).where(Owner.username == admin_username)
        owner_res = await session.execute(owner_stmt)
        owner = owner_res.scalar_one_or_none()
        if not owner:
            hashed_pw = get_password_hash(admin_password)
            owner = Owner(
                restaurant_id=restaurant.id,
                username=admin_username,
                email=admin_email,
                password_hash=hashed_pw,
                is_active=True,
            )
            session.add(owner)
            await session.commit()
            print(f"[+] Initialized Owner Account: {admin_username} ({admin_email})")
        else:
            print(f"[*] Owner account '{admin_username}' already exists.")

        # Seed categories and food items using complete restaurant menu system
        from scripts.seed_restaurant_menu import seed_restaurant_menu
        await seed_restaurant_menu()

if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    email = sys.argv[2] if len(sys.argv) > 2 else "owner@aatitheyam.com"
    password = sys.argv[3] if len(sys.argv) > 3 else "Admin@12345"
    asyncio.run(seed_data(username, email, password))
