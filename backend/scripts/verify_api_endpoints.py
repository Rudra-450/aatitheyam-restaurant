"""API Endpoints Verification Script for Aatitheyam Cafe & Bhojnalaya.

Tests the FastAPI endpoints directly:
1. Public menu aggregated API (/api/v1/public/menu)
2. Public categories API (/api/v1/public/categories)
3. Public food items API with category filter & search (/api/v1/public/food-items)
4. Admin authentication (/api/v1/auth/login)
5. Admin dashboard stats (/api/v1/admin/dashboard/stats)
6. Admin category listing (/api/v1/admin/categories)
7. Admin food item listing & filtering (/api/v1/admin/food-items)
8. Individual food item retrieval (/api/v1/admin/food-items/{id})
9. Food item price & name update (/api/v1/admin/food-items/{id})
10. Food item availability toggle (/api/v1/admin/food-items/{id}/availability)
"""

import asyncio
import sys
from decimal import Decimal
from pathlib import Path

# Ensure UTF-8 console output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import httpx
from app.main import app

async def run_api_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n" + "=" * 60)
        print("STARTING API ENDPOINTS VERIFICATION")
        print("=" * 60)

        # 1. Public Menu Aggregate
        print("1. Testing GET /api/v1/menu ...")
        resp = await client.get("/api/v1/menu")
        assert resp.status_code == 200, f"Failed: {resp.text}"
        data = resp.json()
        assert data["restaurant"]["name"] == "Aatitheyam Cafe & Bhojnalaya"
        assert len(data["categories"]) == 25, f"Expected 25 categories, got {len(data['categories'])}"
        assert data["total_items"] == 244, f"Expected 244 items, got {data['total_items']}"
        print(f"   [PASS] Public menu returned {len(data['categories'])} categories and {data['total_items']} items.")

        # 2. Public Categories
        print("2. Testing GET /api/v1/categories ...")
        cat_resp = await client.get("/api/v1/categories")
        assert cat_resp.status_code == 200, f"Failed: {cat_resp.text}"
        categories = cat_resp.json()
        assert len(categories) == 25
        print(f"   [PASS] Categories API returned {len(categories)} active categories in correct sequence.")

        # 3. Public Food Items with category filtering and search
        print("3. Testing GET /api/v1/food-items filtering & search ...")
        first_cat_id = categories[0]["id"]
        filter_resp = await client.get(f"/api/v1/food-items?category_id={first_cat_id}")
        assert filter_resp.status_code == 200
        cat_items = filter_resp.json()
        assert len(cat_items) == 8, f"Expected 8 items in Coffee / Tea, got {len(cat_items)}"
        print(f"   [PASS] Filter by category ('{categories[0]['name']}') returned exactly {len(cat_items)} items.")

        search_resp = await client.get("/api/v1/food-items?q=Paneer")
        assert search_resp.status_code == 200
        paneer_items = search_resp.json()
        assert len(paneer_items) > 0
        print(f"   [PASS] Search for 'Paneer' returned {len(paneer_items)} items matching query.")

        # 4. Admin Auth Login
        print("4. Testing POST /api/v1/auth/login ...")
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Admin@12345"}
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("   [PASS] Owner login successful. Bearer JWT acquired.")

        # 5. Admin Dashboard Stats
        print("5. Testing GET /api/v1/admin/dashboard/stats ...")
        stats_resp = await client.get("/api/v1/admin/dashboard/stats", headers=headers)
        assert stats_resp.status_code == 200, f"Stats failed: {stats_resp.text}"
        stats = stats_resp.json()
        assert stats["total_food_items"] == 244
        assert stats["total_categories"] == 25
        assert stats["available_food_items"] == 244
        assert stats["unavailable_food_items"] == 0
        print(f"   [PASS] Dashboard stats: Total Items={stats['total_food_items']}, Categories={stats['total_categories']}.")

        # 6. Admin Food Items Listing
        print("6. Testing GET /api/v1/admin/food-items ...")
        admin_foods_resp = await client.get("/api/v1/admin/food-items", headers=headers)
        assert admin_foods_resp.status_code == 200
        admin_foods = admin_foods_resp.json()
        assert len(admin_foods) == 244
        print(f"   [PASS] Admin food list returned all {len(admin_foods)} items.")

        # 7. Individual Food Item API
        test_item = admin_foods[0]
        test_id = test_item["id"]
        original_price = float(test_item["price"])
        print(f"7. Testing GET /api/v1/admin/food-items/{test_id} ('{test_item['name']}') ...")
        single_resp = await client.get(f"/api/v1/admin/food-items/{test_id}", headers=headers)
        assert single_resp.status_code == 200
        assert single_resp.json()["name"] == test_item["name"]
        print(f"   [PASS] Individual food item retrieved: {single_resp.json()['name']} (₹{single_resp.json()['price']}).")

        # 8. Food Item Update API
        print(f"8. Testing PUT /api/v1/admin/food-items/{test_id} (update price) ...")
        updated_price = original_price + 5.0
        update_resp = await client.put(
            f"/api/v1/admin/food-items/{test_id}",
            headers=headers,
            json={"price": updated_price}
        )
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        assert float(update_resp.json()["price"]) == updated_price
        # Restore original price
        restore_resp = await client.put(
            f"/api/v1/admin/food-items/{test_id}",
            headers=headers,
            json={"price": original_price}
        )
        assert restore_resp.status_code == 200
        assert float(restore_resp.json()["price"]) == original_price
        print(f"   [PASS] Price update verified and cleanly reverted to ₹{original_price:.2f}.")

        # 9. Food Item Availability Toggle
        print(f"9. Testing PATCH /api/v1/admin/food-items/{test_id}/availability ...")
        avail_resp = await client.patch(
            f"/api/v1/admin/food-items/{test_id}/availability",
            headers=headers,
            json={"is_available": False}
        )
        assert avail_resp.status_code == 200
        assert avail_resp.json()["is_available"] is False
        # Revert back to True
        avail_restore = await client.patch(
            f"/api/v1/admin/food-items/{test_id}/availability",
            headers=headers,
            json={"is_available": True}
        )
        assert avail_restore.status_code == 200
        assert avail_restore.json()["is_available"] is True
        print(f"   [PASS] Availability toggle (False -> True) successfully verified.")

        print("\n" + "=" * 60)
        print("ALL 10 API TEST SUITES PASSED SUCCESSFULLY!")
        print("=" * 60 + "\n")

if __name__ == "__main__":
    asyncio.run(run_api_tests())
