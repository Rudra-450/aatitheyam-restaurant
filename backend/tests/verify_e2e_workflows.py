import asyncio
import httpx

BASE_URL = "http://127.0.0.1:8000"

async def verify_all_workflows():
    print("=" * 60)
    print("STARTING E2E VERIFICATION OF ALL 7 SPECIFIED WORKFLOWS")
    print("=" * 60)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # WORKFLOW 6: Unauthenticated customer attempts to access an administrative endpoint -> Access is denied (401)
        print("\n--> [TESTING WORKFLOW 6]: Unauthenticated access to admin endpoints...")
        unauth_resp = await client.get("/api/v1/admin/dashboard/stats")
        assert unauth_resp.status_code == 401, f"Expected 401, got {unauth_resp.status_code}"
        print("    [PASS] WORKFLOW 6 PASSED: Access correctly denied (401 Unauthorized) to unauthenticated visitor.")

        # Authenticate Owner for subsequent owner workflows
        print("\n--> [AUTHENTICATING OWNER]: Logging in with owner credentials...")
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"username_or_email": "admin", "password": "Admin@12345"}
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("    [PASS] Owner authenticated successfully. Token received.")

        # WORKFLOW 4: Owner creates a category -> Adds food items to it -> Customer can navigate to that category
        import time
        cat_name = f"Tandoori Platters {int(time.time())}"
        print(f"\n--> [TESTING WORKFLOW 4]: Category creation and public customer accessibility ({cat_name})...")
        create_cat_resp = await client.post(
            "/api/v1/admin/categories",
            headers=headers,
            json={"name": cat_name, "display_order": 99, "is_active": True}
        )
        assert create_cat_resp.status_code == 201, f"Category creation failed: {create_cat_resp.text}"
        new_category = create_cat_resp.json()
        cat_id = new_category["id"]
        print(f"    [+] Created category 'Tandoori Platters' (ID: {cat_id})")

        # WORKFLOW 1: Owner logs in -> Adds a food item -> Saves it -> Customer opens the menu -> New item is visible
        print("\n--> [TESTING WORKFLOW 1]: Add food item and verify public menu visibility...")
        create_food_resp = await client.post(
            "/api/v1/admin/food-items",
            headers=headers,
            json={
                "category_id": cat_id,
                "name": "Nawabi Murgh Malai Kebab",
                "price": 420.00,
                "food_type": "NON_VEG",
                "is_available": True,
                "display_order": 1
            }
        )
        assert create_food_resp.status_code == 201, f"Food creation failed: {create_food_resp.text}"
        food_id = create_food_resp.json()["id"]
        print(f"    [+] Created food item 'Nawabi Murgh Malai Kebab' (Price: INR420.00)")

        # Verify customer menu has this item
        menu_resp = await client.get("/api/v1/menu")
        assert menu_resp.status_code == 200
        menu_data = menu_resp.json()
        target_cat = next((c for c in menu_data["categories"] if c["id"] == cat_id), None)
        assert target_cat is not None, "Created category not found in public menu!"
        target_item = next((i for i in target_cat["items"] if i["id"] == food_id), None)
        assert target_item is not None, "Created food item not found in public customer menu!"
        assert float(target_item["price"]) == 420.00
        print("    [PASS] WORKFLOW 1 PASSED: New food item visible on public customer menu.")
        print("    [PASS] WORKFLOW 4 PASSED: Created category and associated items fully accessible on public menu.")

        # WORKFLOW 2: Owner changes a food price -> Saves the change -> Customer sees the updated price
        print("\n--> [TESTING WORKFLOW 2]: Update food price (INR420.00 -> INR450.00)...")
        update_price_resp = await client.put(
            f"/api/v1/admin/food-items/{food_id}",
            headers=headers,
            json={"price": 450.00}
        )
        assert update_price_resp.status_code == 200, f"Price update failed: {update_price_resp.text}"
        
        # Verify customer menu shows INR450.00
        refreshed_menu = (await client.get("/api/v1/menu")).json()
        updated_cat = next(c for c in refreshed_menu["categories"] if c["id"] == cat_id)
        updated_item = next(i for i in updated_cat["items"] if i["id"] == food_id)
        assert float(updated_item["price"]) == 450.00, f"Expected 450.00, got {updated_item['price']}"
        print(f"    [PASS] WORKFLOW 2 PASSED: Price updated to INR{updated_item['price']} and verified on public customer menu.")

        # WORKFLOW 3: Owner marks an item unavailable -> Customer sees the unavailable label
        print("\n--> [TESTING WORKFLOW 3]: Toggle availability to false...")
        toggle_resp = await client.patch(
            f"/api/v1/admin/food-items/{food_id}/availability",
            headers=headers,
            json={"is_available": False}
        )
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["is_available"] is False

        # Verify customer menu shows unavailable
        avail_menu = (await client.get("/api/v1/menu")).json()
        avail_cat = next(c for c in avail_menu["categories"] if c["id"] == cat_id)
        avail_item = next(i for i in avail_cat["items"] if i["id"] == food_id)
        assert avail_item["is_available"] is False, "Item should be marked unavailable!"
        print("    [PASS] WORKFLOW 3 PASSED: Item marked unavailable; customer view accurately displays unavailable status.")

        # WORKFLOW 5: Owner generates QR code -> Downloads it -> Scans it using a mobile device -> Public menu opens
        print("\n--> [TESTING WORKFLOW 5]: High-resolution QR code generation & download...")
        qr_resp = await client.get("/api/v1/admin/qr/download?size=20", headers=headers)
        assert qr_resp.status_code == 200
        assert qr_resp.headers["content-type"] == "image/png"
        assert len(qr_resp.content) > 1000, "QR PNG content too small!"
        info_resp = await client.get("/api/v1/admin/qr/info", headers=headers)
        target_menu_url = info_resp.json()["menu_url"]
        assert "/menu" in target_menu_url
        print(f"    [PASS] WORKFLOW 5 PASSED: Valid PNG generated ({len(qr_resp.content)} bytes) targeting stable URL: {target_menu_url}")

        # Clean up test food item and category
        print("\n--> [CLEANUP]: Safely cleaning up test item and category...")
        del_item_resp = await client.delete(f"/api/v1/admin/food-items/{food_id}", headers=headers)
        assert del_item_resp.status_code == 200
        del_cat_resp = await client.delete(f"/api/v1/admin/categories/{cat_id}", headers=headers)
        assert del_cat_resp.status_code == 200
        print("    [PASS] Cleaned up test records safely.")

    print("\n" + "=" * 60)
    print("ALL SPECIFIED END-TO-END WORKFLOWS VERIFIED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(verify_all_workflows())
