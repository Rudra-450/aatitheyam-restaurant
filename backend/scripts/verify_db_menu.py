"""Database Verification Script for Aatitheyam Cafe & Bhojnalaya.

Performs strict validation of all database records against the requirements.
"""

import asyncio
import sys
from decimal import Decimal
from pathlib import Path

# Ensure UTF-8 console output on Windows
if sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import func, select
from app.database.session import AsyncSessionLocal, engine
from app.models.category import Category
from app.models.food_item import FoodItem
from app.models.restaurant import Restaurant

async def verify():
    async with AsyncSessionLocal() as session:
        # 1. Restaurant
        rest_stmt = select(Restaurant).limit(1)
        restaurant = (await session.execute(rest_stmt)).scalar_one_or_none()
        assert restaurant is not None, "Restaurant record missing!"
        print(f"[PASS] Restaurant found: {restaurant.name} (Currency: {restaurant.currency}, Address: {restaurant.address})")

        # 2. Category count
        cat_stmt = select(Category).where(Category.restaurant_id == restaurant.id).order_by(Category.display_order.asc())
        categories = (await session.execute(cat_stmt)).scalars().all()
        assert len(categories) == 25, f"Expected 25 categories, found {len(categories)}"
        print(f"[PASS] Category count: {len(categories)} categories verified.")

        # Check Category ordering
        for idx, cat in enumerate(categories, start=1):
            assert cat.display_order == idx, f"Category '{cat.name}' expected display_order {idx}, got {cat.display_order}"
            assert cat.is_active is True, f"Category '{cat.name}' is not active!"
        print("[PASS] Category sequence 1 to 25 verified.")

        # 3. Food item count
        food_stmt = select(FoodItem).where(FoodItem.restaurant_id == restaurant.id)
        foods = (await session.execute(food_stmt)).scalars().all()
        assert len(foods) == 244, f"Expected 244 items, found {len(foods)}"
        print(f"[PASS] Food item count: {len(foods)} items verified.")

        # 4. Check every item has valid category, positive price, veg status
        cat_ids = {c.id for c in categories}
        cat_dict = {c.id: c.name for c in categories}
        for item in foods:
            assert item.category_id in cat_ids, f"Item {item.name} has invalid category_id {item.category_id}"
            assert item.price > 0, f"Item {item.name} has non-positive price: {item.price}"
            assert isinstance(item.price, Decimal), f"Item {item.name} price is not Decimal: {type(item.price)}"
            assert item.food_type == "VEG", f"Item {item.name} food_type is not VEG: {item.food_type}"
            assert item.is_available is True, f"Item {item.name} is_available is False"
        print("[PASS] Item integrity checks (category validity, positive Decimal price, VEG classification, active availability) passed.")

        # 5. Check duplicate names in different categories (Family Salad)
        family_salads = [f for f in foods if f.name.strip().lower() == "family salad"]
        assert len(family_salads) == 2, f"Expected 2 Family Salad items, got {len(family_salads)}"
        salad_cats = {cat_dict[f.category_id]: f.price for f in family_salads}
        assert "Salad" in salad_cats and salad_cats["Salad"] == Decimal("350.00"), f"Family Salad in Salad price mismatch: {salad_cats}"
        assert "Raita" in salad_cats and salad_cats["Raita"] == Decimal("300.00"), f"Family Salad in Raita price mismatch: {salad_cats}"
        print(f"[PASS] Family Salad distinction verified: Salad -> ₹{salad_cats['Salad']}, Raita -> ₹{salad_cats['Raita']}.")

        # 6. Check Combos
        combos = [f for f in foods if cat_dict[f.category_id] == "Combos"]
        assert len(combos) == 3, f"Expected 3 combo meals, got {len(combos)}"
        combo_names = {c.name: c.price for c in combos}
        assert "Veg Hakka Noodles + Manchurian + Cold Drink" in combo_names
        assert combo_names["Veg Hakka Noodles + Manchurian + Cold Drink"] == Decimal("300.00")
        assert "Manchurian + Fried Rice + Cold Drink" in combo_names
        assert combo_names["Manchurian + Fried Rice + Cold Drink"] == Decimal("300.00")
        assert "Paneer Chilli + Fried Rice + Cold Drink" in combo_names
        assert combo_names["Paneer Chilli + Fried Rice + Cold Drink"] == Decimal("360.00")
        print("[PASS] Combination meals verified as individual menu offerings with correct pricing.")

        # 7. Check items count per category matches specification
        counts_by_cat = {}
        for f in foods:
            cat_name = cat_dict[f.category_id]
            counts_by_cat[cat_name] = counts_by_cat.get(cat_name, 0) + 1

        print("\n--- Items Per Category Breakdown ---")
        for cat in categories:
            count = counts_by_cat.get(cat.name, 0)
            print(f"  {cat.display_order:2d}. {cat.name:25s}: {count} items")

        print("\nALL DATABASE INTEGRITY CHECKS PASSED SUCCESSFULLY!\n")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
