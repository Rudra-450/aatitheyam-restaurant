import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_owner_login_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "testowner", "password": "Secret@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["owner"]["username"] == "testowner"
    assert "restaurant_owner_session" in response.cookies

@pytest.mark.asyncio
async def test_owner_login_invalid_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "testowner", "password": "WrongPassword!"}
    )
    assert response.status_code == 401
    assert "Incorrect" in response.json()["detail"]

@pytest.mark.asyncio
async def test_owner_get_me_protected(client: AsyncClient):
    # Try without auth
    unauth_resp = await client.get("/api/v1/auth/me")
    assert unauth_resp.status_code == 401

    # Login and check
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "testowner@example.com", "password": "Secret@123"}
    )
    token = login_resp.json()["access_token"]

    auth_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert auth_resp.status_code == 200
    assert auth_resp.json()["username"] == "testowner"
