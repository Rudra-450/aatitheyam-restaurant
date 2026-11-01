"""Aatitheyam Cafe & Bhojnalaya - Restaurant Digital Menu Seeding System.

This script imports all 25 menu categories and all menu offerings extracted
from the restaurant's authentic original menu into the database.
It is strictly idempotent: re-running it does not duplicate categories or items.
"""

import asyncio
import logging
import os
import sys
from decimal import Decimal
from pathlib import Path

# Ensure UTF-8 console output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import func, select
from app.core.security import get_password_hash
from app.database.base import Base
from app.database.session import AsyncSessionLocal, engine
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.owner import Owner
from app.models.restaurant import Restaurant

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("seed_restaurant_menu")

# The 25 categories in exact order
CATEGORIES_DATA = [
    {"name": "Coffee / Tea", "display_order": 1},
    {"name": "Fresh Drinks", "display_order": 2},
    {"name": "Soft Beverages", "display_order": 3},
    {"name": "Breakfast", "display_order": 4},
    {"name": "Sandwiches", "display_order": 5},
    {"name": "Burgers", "display_order": 6},
    {"name": "Rolls", "display_order": 7},
    {"name": "Pizza", "display_order": 8},
    {"name": "Pasta", "display_order": 9},
    {"name": "South Indian", "display_order": 10},
    {"name": "Starters", "display_order": 11},
    {"name": "Noodles", "display_order": 12},
    {"name": "Combos", "display_order": 13},
    {"name": "Chinese Rice", "display_order": 14},
    {"name": "Soup Special", "display_order": 15},
    {"name": "Seasonal Veg", "display_order": 16},
    {"name": "Paneer Indian Section", "display_order": 17},
    {"name": "Mushroom Specials", "display_order": 18},
    {"name": "Kofta Varieties", "display_order": 19},
    {"name": "Dal", "display_order": 20},
    {"name": "Rice (Indian Section)", "display_order": 21},
    {"name": "Roti", "display_order": 22},
    {"name": "Papad", "display_order": 23},
    {"name": "Salad", "display_order": 24},
    {"name": "Raita", "display_order": 25},
]

# Complete food offerings extracted item-by-item from the authentic menu PDF
MENU_ITEMS_DATA: dict[str, list[tuple[str, int]]] = {
    "Coffee / Tea": [
        ("Black Tea", 20),
        ("Milk Tea", 30),
        ("Lemon Tea", 30),
        ("Masala Tea", 35),
        ("Black Coffee", 40),
        ("Coffee", 50),
        ("Milk ( Glass)", 50),
        ("Cold Coffee", 140),
    ],
    "Fresh Drinks": [
        ("Fresh Lime Soda", 100),
        ("Mint Mojito", 150),
        ("Hot Chocolate", 150),
        ("Blue Lagoon", 170),
        ("Bubble Blast Mojito", 190),
        ("Chocolate Shake", 190),
    ],
    "Soft Beverages": [
        ("Butter Milk", 40),
        ("Masala Butter Milk", 50),
        ("Dahi", 50),
        ("Masala Soda", 50),
        ("Masala Cold Drink", 60),
        ("Lassi", 80),
        ("Banana Shake", 120),
        ("Mango Shake", 140),
        ("Milk Shake", 180),
    ],
    "Breakfast": [
        ("Plain Paratha", 30),
        ("Poha", 70),
        ("Aloo Paratha with Curd", 100),
        ("Onion Paratha with Curd", 100),
        ("Puri Sabji (4 pcs)", 120),
        ("Veg Cutlet", 120),
        ("Gobhi Paratha with Curd", 120),
        ("Mix Paratha with Curd", 130),
        ("Paneer Paratha wih Curd", 150),
        ("Butter Cheese Paratha with Curd", 160),
        ("Chole Bhature (2 pcs)", 200),
    ],
    "Sandwiches": [
        ("Bread Butter", 50),
        ("Bread Butter Toast", 70),
        ("Veg Sandwich", 110),
        ("Aloo Masala Sandwich", 140),
        ("Grill Sandwich", 150),
        ("Corn Capsicum Sandwich", 160),
        ("Cheese Sandwich", 180),
        ("Paneer Masala Sandwich", 190),
        ("Cheese Corn Sandwich", 190),
        ("Veg Club Sandwich", 210),
    ],
    "Burgers": [
        ("Veg Burger", 80),
        ("Crispy Veg Burger", 100),
        ("Cheese Burger", 110),
        ("Schezwan Burger", 120),
        ("Paneer Burger", 140),
        ("Paneer Cheese Burger", 160),
    ],
    "Rolls": [
        ("Veg Roll", 150),
        ("Aloo Tikki Roll", 160),
        ("Paneer Tikka Roll", 180),
        ("Cheese Paneer Roll", 200),
    ],
    "Pizza": [
        ("Margherita Pizza", 180),
        ("Simple Veg Pizza", 200),
        ("Cheese & Tomato", 220),
        ("Onion & Capsicum", 240),
        ("Paneer Tikka Pizza", 260),
        ("Double Cheese Margherita", 270),
        ("Paneer Corn Burst", 280),
        ("Mexican Veg", 290),
        ("Farm House Pizza", 340),
    ],
    "Pasta": [
        ("Masala Pasta", 180),
        ("Baby Corn Pasta", 200),
        ("Cheese Pasta", 210),
        ("Red Spicy Pasta", 220),
        ("White Sauce Pasta", 230),
        ("Pink Sauce Pasta", 240),
        ("Red Sauce Pasta", 240),
        ("Mix Pasta", 250),
        ("Mushroom Pasta", 260),
    ],
    "South Indian": [
        ("Plain Idli (2 pcs)", 60),
        ("Plain Dosa", 90),
        ("Butter Plain Dosa", 100),
        ("Upma", 100),
        ("Onion Dosa", 120),
        ("Masala Dosa", 130),
        ("Butter Masala Dosa", 140),
        ("Uttapam", 150),
        ("Cheese Plain Dosa", 160),
        ("Tomato Uttapam", 170),
        ("Cheese Masala Dosa", 180),
        ("Onion Uttapam", 180),
        ("Aatitheyam Dosa", 180),
        ("Veg Uttapam", 190),
        ("Capsicum Uttapam", 190),
        ("Paneer Masala Dosa", 200),
        ("Paneer Uttapam", 220),
    ],
    "Starters": [
        ("Maggi Plain", 60),
        ("Maggi Masala", 80),
        ("Chana Roast", 80),
        ("Peanut Fry", 120),
        ("Classic French Fries", 140),
        ("Onion Rings", 150),
        ("Peanut Masala", 150),
        ("Masala Fries", 150),
        ("Onion Pakoda", 150),
        ("Veg Chowmein", 180),
        ("Gobi Chilli", 180),
        ("Chinese Bhel", 180),
        ("Mix Pakoda", 200),
        ("Paneer Slice", 200),
        ("Chilli Potato", 220),
        ("Chana Chilli", 220),
        ("Lovely Corn", 230),
        ("Veg Crispy", 240),
        ("Soya Chilli", 240),
        ("Paneer Pakoda", 240),
        ("Hara Bhara Kabab", 240),
        ("Veg Lollipop", 250),
        ("Veg Manchurian", 250),
        ("Veg 65", 250),
        ("Green Kebab", 250),
        ("Mushroom Garlic", 250),
        ("Baby Corn Crispy", 260),
        ("Paneer Garlic", 280),
        ("Paneer Ginger Garlic", 280),
        ("Paneer Chilli", 300),
        ("Mushroom Chilli", 300),
        ("Paneer 65", 320),
        ("Mushroom 65", 320),
        ("Kaju Fry", 350),
    ],
    "Noodles": [
        ("Veg Noodles", 180),
        ("Veg Hakka Noodles", 200),
        ("Schezwan Noodles", 210),
        ("Singapuri Noodles", 230),
        ("Manchurian Noodles", 250),
        ("Paneer Chowmein", 260),
    ],
    "Combos": [
        ("Veg Hakka Noodles + Manchurian + Cold Drink", 300),
        ("Manchurian + Fried Rice + Cold Drink", 300),
        ("Paneer Chilli + Fried Rice + Cold Drink", 360),
    ],
    "Chinese Rice": [
        ("Veg Fried Rice", 210),
        ("Corn Rice", 230),
        ("Singapuri Rice", 240),
        ("Schezwan Fried Rice", 240),
        ("Manchurian Rice", 250),
        ("Paneer Fried Rice", 260),
        ("Mushroom Fried Rice", 270),
        ("Triple Veg Fried Rice", 290),
    ],
    "Soup Special": [
        ("Veg Clear Soup", 90),
        ("Mushroom Soup", 120),
        ("Veg Manchow Soup", 140),
        ("Mushroom Garlic Soup", 140),
        ("Sweet Corn Soup", 150),
        ("Tomato Soup", 150),
        ("Hot N Sour Soup", 160),
    ],
    "Seasonal Veg": [
        ("Bhindi Kurkuri", 200),
        ("Aloo Jeera", 200),
        ("Tamatar Chutney Fry", 200),
        ("Bhindi Fry", 210),
        ("Baingan Masala", 220),
        ("Bhindi Masala", 220),
        ("Aloo Dum", 230),
        ("Sev Tamatar", 230),
        ("Aloo Matar", 230),
        ("Gobhi Masala", 240),
        ("Chana Masala", 240),
        ("Aloo Methi Matar", 240),
        ("Bhindi Do Pyaza", 240),
        ("Veg Kolhapuri", 250),
        ("Mix Veg", 250),
        ("Baingan Bharta", 250),
        ("Aloo Dum Kashmiri", 250),
        ("Dum Aloo Punjabi", 260),
        ("Veg Handi", 280),
        ("Veg Navratan Korma", 280),
        ("Veg Kadai", 280),
        ("Corn Palak", 280),
        ("Methi Matar Malai", 290),
    ],
    "Paneer Indian Section": [
        ("Paneer Masala", 290),
        ("Palak Paneer", 290),
        ("Paneer Matar Masala", 300),
        ("Paneer 69", 300),
        ("Paneer Punjabi", 310),
        ("Paneer Kolhapuri", 310),
        ("Paneer Butter Masala", 320),
        ("Paneer Do Pyaza", 320),
        ("Paneer Chatpata", 320),
        ("Shahi Paneer (sweet)", 330),
        ("Kaju Paneer Masala", 340),
        ("Kaju Masala", 340),
        ("Aatitheyam Special Panner", 340),
        ("Paneer Kadai", 350),
        ("Paneer Bhurji", 350),
        ("Kaju Curry (sweet)", 350),
        ("Paneer Lababdar", 350),
        ("Paneer Lachedar", 350),
        ("Paneer Pasanda", 350),
        ("Paneer Handi", 370),
    ],
    "Mushroom Specials": [
        ("Mushroom Masala", 290),
        ("Mushroom Butter Masala (Sweet)", 300),
        ("Mushroom Matar Masala", 300),
        ("Mushroom Chatpata", 320),
        ("Mushroom Do Pyaza", 320),
        ("Mushroom Kadai", 350),
        ("Mushroom Navratan Korma", 350),
        ("Mushroom Handi", 370),
    ],
    "Kofta Varieties": [
        ("Lauki Kofta", 250),
        ("Veg Kofta", 270),
        ("Dum Aloo Kashmiri Kofta", 270),
        ("Adraki Kofta", 290),
        ("Malai Kofta", 300),
        ("Paneer Kofta", 320),
        ("Nargisi Kofta", 340),
    ],
    "Dal": [
        ("Plain Dal", 120),
        ("Dal Jeera", 130),
        ("Dal Fry", 140),
        ("Dal Tadka", 150),
        ("Dal Punjabi", 180),
        ("Dal Palak", 200),
        ("Dal Makhani", 220),
    ],
    "Rice (Indian Section)": [
        ("Steam Rice", 120),
        ("Jeera Rice", 130),
        ("Lemon Rice", 150),
        ("Onion & TomatoRice", 160),
        ("Fried Rice", 180),
        ("Dal Khichdi", 200),
        ("Gobi Rice", 200),
        ("Curd Rice", 200),
        ("Butter Khichdi", 220),
        ("Mushroom Rice", 230),
        ("Matar Pulao", 240),
        ("Paneer Rice", 240),
        ("Veg Pulao", 250),
        ("Kashmiri Pulao", 250),
        ("Masala Rice", 250),
        ("Paneer Pulao", 250),
        ("Veg Biryani (with Gravy & Raita)", 300),
    ],
    "Roti": [
        ("Plain Roti", 15),
        ("Butter Roti", 20),
        ("Ghee Roti", 25),
        ("Laccha Paratha", 50),
    ],
    "Papad": [
        ("Papad Roasted", 20),
        ("Papad Fry", 30),
        ("Masala Papad", 50),
    ],
    "Salad": [
        ("Onion Salad", 70),
        ("Green Salad", 100),
        ("Kachumber Salad", 110),
        ("Family Salad", 350),
    ],
    "Raita": [
        ("Veg Raita", 80),
        ("Boondi Raita", 90),
        ("Sirki Salad", 100),
        ("Family Salad", 300),
    ],
}

async def init_tables():
    """Ensure database schema tables exist."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_restaurant_menu():
    """Executes the idempotent menu import process."""
    await init_tables()

    stats = {
        "categories_imported": 0,
        "categories_updated": 0,
        "categories_skipped": 0,
        "categories_failed": 0,
        "items_imported": 0,
        "items_updated": 0,
        "items_skipped": 0,
        "items_failed": 0,
    }

    async with AsyncSessionLocal() as session:
        async with session.begin():
            # 1. Ensure restaurant exists
            stmt = select(Restaurant).limit(1)
            res = await session.execute(stmt)
            restaurant = res.scalar_one_or_none()

            if not restaurant:
                restaurant = Restaurant(
                    name="Aatitheyam Cafe & Bhojnalaya",
                    address="Near Kalyan Aashrama, Amarkantak",
                    contact_number="9111787710",
                    opening_hours="8:00 AM - 10:30 PM",
                    currency="₹",
                )
                session.add(restaurant)
                await session.flush()
                logger.info(f"Created restaurant: {restaurant.name} (ID: {restaurant.id})")
            else:
                # Update contact and address if not set
                if not restaurant.address or not restaurant.contact_number:
                    restaurant.address = "Near Kalyan Aashrama, Amarkantak"
                    restaurant.contact_number = "9111787710"
                    restaurant.opening_hours = restaurant.opening_hours or "8:00 AM - 10:30 PM"
                    session.add(restaurant)
                    await session.flush()
                logger.info(f"Using existing restaurant: {restaurant.name} (ID: {restaurant.id})")

            # 2. Ensure default owner exists
            owner_stmt = select(Owner).where(Owner.username == "admin")
            owner_res = await session.execute(owner_stmt)
            owner = owner_res.scalar_one_or_none()
            if not owner:
                owner = Owner(
                    restaurant_id=restaurant.id,
                    username="admin",
                    email="owner@aatitheyam.com",
                    password_hash=get_password_hash("Admin@12345"),
                    is_active=True,
                )
                session.add(owner)
                await session.flush()
                logger.info("Initialized default owner account: admin (owner@aatitheyam.com)")

            # 3. Seed / Update Categories
            cat_map: dict[str, str] = {}
            for cat_data in CATEGORIES_DATA:
                cat_name = cat_data["name"]
                order = cat_data["display_order"]

                try:
                    cat_query = select(Category).where(
                        Category.restaurant_id == restaurant.id,
                        func.lower(Category.name) == cat_name.lower().strip()
                    )
                    existing_cat = (await session.execute(cat_query)).scalar_one_or_none()

                    if existing_cat:
                        changed = False
                        if existing_cat.display_order != order:
                            existing_cat.display_order = order
                            changed = True
                        if not existing_cat.is_active:
                            existing_cat.is_active = True
                            changed = True
                        if existing_cat.name != cat_name:
                            existing_cat.name = cat_name
                            changed = True

                        if changed:
                            session.add(existing_cat)
                            stats["categories_updated"] += 1
                            logger.info(f"Updated category: '{cat_name}' (Order: {order})")
                        else:
                            stats["categories_skipped"] += 1

                        cat_map[cat_name] = existing_cat.id
                    else:
                        new_cat = Category(
                            restaurant_id=restaurant.id,
                            name=cat_name,
                            display_order=order,
                            is_active=True,
                        )
                        session.add(new_cat)
                        await session.flush()
                        cat_map[cat_name] = new_cat.id
                        stats["categories_imported"] += 1
                        logger.info(f"Imported category: '{cat_name}' (Order: {order}, ID: {new_cat.id})")
                except Exception as e:
                    stats["categories_failed"] += 1
                    logger.error(f"Failed to process category '{cat_name}': {e}")
                    raise

            # 4. Seed / Update Food Items
            for cat_name, items in MENU_ITEMS_DATA.items():
                cat_id = cat_map.get(cat_name)
                if not cat_id:
                    logger.error(f"Category '{cat_name}' not resolved in cat_map!")
                    stats["items_failed"] += len(items)
                    continue

                for idx, (item_name, item_price) in enumerate(items):
                    item_order = idx + 1
                    dec_price = Decimal(str(item_price)).quantize(Decimal("0.01"))

                    try:
                        # Idempotent match on restaurant_id, category_id, AND lowercase name
                        food_query = select(FoodItem).where(
                            FoodItem.restaurant_id == restaurant.id,
                            FoodItem.category_id == cat_id,
                            func.lower(FoodItem.name) == item_name.lower().strip()
                        )
                        existing_food = (await session.execute(food_query)).scalar_one_or_none()

                        if existing_food:
                            changed = False
                            if existing_food.price != dec_price:
                                existing_food.price = dec_price
                                changed = True
                            if existing_food.display_order != item_order:
                                existing_food.display_order = item_order
                                changed = True
                            if existing_food.food_type != "VEG":
                                existing_food.food_type = "VEG"
                                changed = True
                            if not existing_food.is_available:
                                existing_food.is_available = True
                                changed = True
                            if existing_food.name != item_name:
                                existing_food.name = item_name
                                changed = True

                            if changed:
                                session.add(existing_food)
                                stats["items_updated"] += 1
                                logger.info(f"Updated item: '{item_name}' in '{cat_name}' (₹{dec_price})")
                            else:
                                stats["items_skipped"] += 1
                        else:
                            new_food = FoodItem(
                                restaurant_id=restaurant.id,
                                category_id=cat_id,
                                name=item_name,
                                price=dec_price,
                                food_type="VEG",
                                is_available=True,
                                display_order=item_order,
                            )
                            session.add(new_food)
                            stats["items_imported"] += 1
                            logger.info(f"Imported item: '{item_name}' in '{cat_name}' (₹{dec_price}, Order: {item_order})")

                    except Exception as e:
                        stats["items_failed"] += 1
                        logger.error(f"Failed to process food item '{item_name}' in '{cat_name}': {e}")
                        raise

    # Final summary report
    print("\n" + "=" * 60)
    print("AATITHEYAM CAFE & BHOJNALAYA - MENU IMPORT REPORT")
    print("=" * 60)
    print(f"Categories Imported : {stats['categories_imported']}")
    print(f"Categories Updated  : {stats['categories_updated']}")
    print(f"Categories Skipped  : {stats['categories_skipped']}")
    print(f"Categories Failed   : {stats['categories_failed']}")
    print("-" * 60)
    print(f"Food Items Imported : {stats['items_imported']}")
    print(f"Food Items Updated  : {stats['items_updated']}")
    print(f"Food Items Skipped  : {stats['items_skipped']}")
    print(f"Food Items Failed   : {stats['items_failed']}")
    print("=" * 60)
    total_processed = stats["items_imported"] + stats["items_updated"] + stats["items_skipped"]
    print(f"Total Menu Offerings Processed: {total_processed}")
    print("=" * 60 + "\n", flush=True)

    await engine.dispose()
    return stats

if __name__ == "__main__":
    asyncio.run(seed_restaurant_menu())
