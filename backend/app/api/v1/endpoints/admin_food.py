from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_owner
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.food_item import FoodItemRepository
from app.schemas.food_item import (
    FoodItemAvailabilityUpdate,
    FoodItemCreate,
    FoodItemResponse,
    FoodItemUpdate,
)
from app.storage.service import storage_service

router = APIRouter(tags=["Admin Food Management"])

@router.get("", response_model=list[FoodItemResponse], summary="List all food items for administration")
async def list_admin_food_items(
    category_id: str | None = Query(None),
    food_type: str | None = Query(None),
    is_available: bool | None = Query(None),
    q: str | None = Query(None),
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    items = await repo.get_all(
        restaurant_id=current_owner.restaurant_id,
        category_id=category_id,
        food_type=food_type,
        is_available=is_available,
        search_query=q,
        active_categories_only=False,
    )
    return [
        FoodItemResponse(
            id=item[0].id,
            restaurant_id=item[0].restaurant_id,
            category_id=item[0].category_id,
            category_name=item[1],
            name=item[0].name,
            image_url=item[0].image_url,
            image_public_id=item[0].image_public_id,
            price=item[0].price,
            food_type=item[0].food_type,  # type: ignore
            is_available=item[0].is_available,
            display_order=item[0].display_order,
            created_at=item[0].created_at,
            updated_at=item[0].updated_at,
        )
        for item in items
    ]

@router.post("", response_model=FoodItemResponse, status_code=status.HTTP_201_CREATED, summary="Create a new food item")
async def create_admin_food_item(
    payload: FoodItemCreate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    item, cat_name = await repo.create(current_owner.restaurant_id, payload)
    return FoodItemResponse(
        id=item.id,
        restaurant_id=item.restaurant_id,
        category_id=item.category_id,
        category_name=cat_name,
        name=item.name,
        image_url=item.image_url,
        image_public_id=item.image_public_id,
        price=item.price,
        food_type=item.food_type,  # type: ignore
        is_available=item.is_available,
        display_order=item.display_order,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )

@router.get("/{item_id}", response_model=FoodItemResponse, summary="Get single food item details")
async def get_admin_food_item(
    item_id: str,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    item, cat_name = await repo.get_by_id(item_id)
    return FoodItemResponse(
        id=item.id,
        restaurant_id=item.restaurant_id,
        category_id=item.category_id,
        category_name=cat_name,
        name=item.name,
        image_url=item.image_url,
        image_public_id=item.image_public_id,
        price=item.price,
        food_type=item.food_type,  # type: ignore
        is_available=item.is_available,
        display_order=item.display_order,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )

@router.put("/{item_id}", response_model=FoodItemResponse, summary="Update food item")
async def update_admin_food_item(
    item_id: str,
    payload: FoodItemUpdate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    # Check old item for image cleanup if image replaced
    old_item, _ = await repo.get_by_id(item_id)
    if old_item and payload.image_public_id and old_item.image_public_id != payload.image_public_id:
        storage_service.delete_image(old_item.image_public_id)

    item, cat_name = await repo.update(item_id, payload)
    return FoodItemResponse(
        id=item.id,
        restaurant_id=item.restaurant_id,
        category_id=item.category_id,
        category_name=cat_name,
        name=item.name,
        image_url=item.image_url,
        image_public_id=item.image_public_id,
        price=item.price,
        food_type=item.food_type,  # type: ignore
        is_available=item.is_available,
        display_order=item.display_order,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )

@router.patch("/{item_id}/availability", response_model=FoodItemResponse, summary="Toggle food item availability")
async def toggle_admin_food_availability(
    item_id: str,
    payload: FoodItemAvailabilityUpdate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    item, cat_name = await repo.update_availability(item_id, payload.is_available)
    return FoodItemResponse(
        id=item.id,
        restaurant_id=item.restaurant_id,
        category_id=item.category_id,
        category_name=cat_name,
        name=item.name,
        image_url=item.image_url,
        image_public_id=item.image_public_id,
        price=item.price,
        food_type=item.food_type,  # type: ignore
        is_available=item.is_available,
        display_order=item.display_order,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )

@router.delete("/{item_id}", summary="Delete food item and cleanup assets")
async def delete_admin_food_item(
    item_id: str,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = FoodItemRepository(db)
    deleted_item = await repo.delete(item_id)
    if deleted_item.image_public_id:
        storage_service.delete_image(deleted_item.image_public_id)
    return {"message": "Food item deleted successfully."}
