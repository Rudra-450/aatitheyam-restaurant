from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_owner
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.restaurant import RestaurantRepository
from app.schemas.restaurant import RestaurantResponse, RestaurantUpdate

router = APIRouter(tags=["Admin Restaurant Profile"])

@router.get("", response_model=RestaurantResponse, summary="Get restaurant profile for editing")
async def get_admin_restaurant(
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = RestaurantRepository(db)
    restaurant = await repo.get_or_create_default()
    return restaurant

@router.put("", response_model=RestaurantResponse, summary="Update restaurant profile")
async def update_admin_restaurant(
    payload: RestaurantUpdate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = RestaurantRepository(db)
    updated = await repo.update(current_owner.restaurant_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found.")
    return updated
