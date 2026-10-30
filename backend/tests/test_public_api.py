import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_public_restaurant(client: AsyncClient):
    response = await client.get("/api/v1/restaurant")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert data["currency"] == "₹"

@pytest.mark.asyncio
async def test_get_public_menu(client: AsyncClient):
    response = await client.get("/api/v1/menu")
    assert response.status_code == 200
    data = response.json()
    assert "restaurant" in data
    assert "categories" in data
    assert isinstance(data["categories"], list)
    assert len(data["categories"]) >= 1
    assert data["categories"][0]["name"] == "Starters"
    assert len(data["categories"][0]["items"]) >= 1
    assert data["categories"][0]["items"][0]["name"] == "Paneer Tikka"
    assert float(data["categories"][0]["items"][0]["price"]) == 250.0

@pytest.mark.asyncio
async def test_filter_public_food_items(client: AsyncClient):
    # Query with food_type=VEG
    response = await client.get("/api/v1/food-items?food_type=VEG")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert items[0]["food_type"] == "VEG"

    # Query with non-matching query
    response_empty = await client.get("/api/v1/food-items?q=NonExistentDish123")
    assert response_empty.status_code == 200
    assert len(response_empty.json()) == 0
