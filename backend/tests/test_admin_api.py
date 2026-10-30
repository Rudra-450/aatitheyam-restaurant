import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_endpoints_require_auth(client: AsyncClient):
    resp = await client.get("/api/v1/admin/dashboard/stats")
    assert resp.status_code == 401

    resp2 = await client.get("/api/v1/admin/food-items")
    assert resp2.status_code == 401

@pytest.mark.asyncio
async def test_admin_food_and_category_lifecycle(client: AsyncClient):
    # 1. Login
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "testowner", "password": "Secret@123"}
    )
    token = login_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. List categories
    cat_resp = await client.get("/api/v1/admin/categories", headers=auth_headers)
    assert cat_resp.status_code == 200
    categories = cat_resp.json()
    assert len(categories) >= 1
    starters_id = categories[0]["id"]

    # 3. Create a new Category: "Desserts"
    new_cat_resp = await client.post(
        "/api/v1/admin/categories",
        headers=auth_headers,
        json={"name": "Desserts", "display_order": 2, "is_active": True}
    )
    assert new_cat_resp.status_code == 201
    desserts_id = new_cat_resp.json()["id"]

    # 4. Add food item to "Desserts"
    food_resp = await client.post(
        "/api/v1/admin/food-items",
        headers=auth_headers,
        json={
            "category_id": desserts_id,
            "name": "Kesar Pista Kulfi",
            "price": 180.00,
            "food_type": "VEG",
            "is_available": True,
            "display_order": 1,
        }
    )
    assert food_resp.status_code == 201
    food_id = food_resp.json()["id"]
    assert float(food_resp.json()["price"]) == 180.00

    # 5. Check safe category deletion (Attempt deleting Desserts while food exists -> Must fail with 409 Conflict)
    del_cat_conflict = await client.delete(f"/api/v1/admin/categories/{desserts_id}", headers=auth_headers)
    assert del_cat_conflict.status_code == 409
    assert "contains" in del_cat_conflict.json()["detail"]

    # 6. Update Food Price (₹180 -> ₹210)
    update_price_resp = await client.put(
        f"/api/v1/admin/food-items/{food_id}",
        headers=auth_headers,
        json={"price": 210.00}
    )
    assert update_price_resp.status_code == 200
    assert float(update_price_resp.json()["price"]) == 210.00

    # 7. Toggle Food Availability to False
    toggle_resp = await client.patch(
        f"/api/v1/admin/food-items/{food_id}/availability",
        headers=auth_headers,
        json={"is_available": False}
    )
    assert toggle_resp.status_code == 200
    assert toggle_resp.json()["is_available"] is False

    # 8. Verify Public Menu reflects updated price (₹210) and unavailable status
    public_menu = await client.get("/api/v1/menu")
    assert public_menu.status_code == 200
    dessert_cat = next(c for c in public_menu.json()["categories"] if c["id"] == desserts_id)
    kulfi = next(item for item in dessert_cat["items"] if item["id"] == food_id)
    assert float(kulfi["price"]) == 210.00
    assert kulfi["is_available"] is False

    # 9. Delete Food Item
    del_food_resp = await client.delete(f"/api/v1/admin/food-items/{food_id}", headers=auth_headers)
    assert del_food_resp.status_code == 200

    # 10. Now category deletion succeeds since item is gone
    del_cat_success = await client.delete(f"/api/v1/admin/categories/{desserts_id}", headers=auth_headers)
    assert del_cat_success.status_code == 200

@pytest.mark.asyncio
async def test_qr_download_endpoint(client: AsyncClient):
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "testowner", "password": "Secret@123"}
    )
    token = login_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    qr_resp = await client.get("/api/v1/admin/qr/download", headers=auth_headers)
    assert qr_resp.status_code == 200
    assert qr_resp.headers["content-type"] == "image/png"
    assert len(qr_resp.content) > 100
