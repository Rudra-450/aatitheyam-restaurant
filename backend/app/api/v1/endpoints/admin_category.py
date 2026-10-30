from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_owner
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.category import CategoryRepository
from app.schemas.category import (
    CategoryCreate,
    CategoryReorderRequest,
    CategoryResponse,
    CategoryUpdate,
)

router = APIRouter(tags=["Admin Category Management"])

@router.get("", response_model=list[CategoryResponse], summary="List all categories with item counts")
async def list_admin_categories(
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = CategoryRepository(db)
    categories = await repo.get_all(current_owner.restaurant_id, active_only=False)
    return [
        CategoryResponse(
            id=c[0].id,
            restaurant_id=c[0].restaurant_id,
            name=c[0].name,
            display_order=c[0].display_order,
            is_active=c[0].is_active,
            item_count=c[1],
            created_at=c[0].created_at,
            updated_at=c[0].updated_at,
        )
        for c in categories
    ]

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Create a new category")
async def create_admin_category(
    payload: CategoryCreate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = CategoryRepository(db)
    category = await repo.create(current_owner.restaurant_id, payload)
    return CategoryResponse(
        id=category.id,
        restaurant_id=category.restaurant_id,
        name=category.name,
        display_order=category.display_order,
        is_active=category.is_active,
        item_count=0,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )

@router.put("/{category_id}", response_model=CategoryResponse, summary="Update category")
async def update_admin_category(
    category_id: str,
    payload: CategoryUpdate,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = CategoryRepository(db)
    category = await repo.update(category_id, payload)
    item_count = 0
    cat_items = await repo.get_all(current_owner.restaurant_id, active_only=False)
    for c, count in cat_items:
        if c.id == category_id:
            item_count = count
            break

    return CategoryResponse(
        id=category.id,
        restaurant_id=category.restaurant_id,
        name=category.name,
        display_order=category.display_order,
        is_active=category.is_active,
        item_count=item_count,
        created_at=category.created_at,
        updated_at=category.updated_at,
    )

@router.delete("/{category_id}", status_code=status.HTTP_200_OK, summary="Delete category safely")
async def delete_admin_category(
    category_id: str,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = CategoryRepository(db)
    await repo.delete(category_id)
    return {"message": "Category deleted successfully."}

@router.patch("/reorder", summary="Batch reorder categories")
async def reorder_admin_categories(
    payload: CategoryReorderRequest,
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    repo = CategoryRepository(db)
    await repo.reorder(current_owner.restaurant_id, payload.items)
    return {"message": "Categories reordered successfully."}
