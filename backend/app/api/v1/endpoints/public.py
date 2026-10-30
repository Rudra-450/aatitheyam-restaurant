from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.repositories.category import CategoryRepository
from app.repositories.food_item import FoodItemRepository
from app.repositories.restaurant import RestaurantRepository
from app.schemas.category import CategoryResponse
from app.schemas.food_item import FoodItemResponse
from app.schemas.public import PublicCategoryWithItems, PublicMenuResponse
from app.schemas.restaurant import RestaurantResponse

router = APIRouter(tags=["Public Menu"])

@router.get("/restaurant", response_model=RestaurantResponse, summary="Get public restaurant profile")
async def get_public_restaurant(db: AsyncSession = Depends(get_db)):
    repo = RestaurantRepository(db)
    restaurant = await repo.get_or_create_default()
    return restaurant

@router.get("/menu", response_model=PublicMenuResponse, summary="Get aggregated public digital menu")
async def get_public_menu(db: AsyncSession = Depends(get_db)):
    restaurant_repo = RestaurantRepository(db)
    category_repo = CategoryRepository(db)
    food_repo = FoodItemRepository(db)

    restaurant = await restaurant_repo.get_or_create_default()
    categories_with_counts = await category_repo.get_all(restaurant.id, active_only=True)
    all_items = await food_repo.get_all(restaurant.id, active_categories_only=True)

    # Group items by category_id
    items_by_cat: dict[str, list[FoodItemResponse]] = {}
    total_count = 0
    for item, cat_name in all_items:
        item_resp = FoodItemResponse(
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
        items_by_cat.setdefault(item.category_id, []).append(item_resp)
        total_count += 1

    result_categories: list[PublicCategoryWithItems] = []
    for cat, count in categories_with_counts:
        cat_items = items_by_cat.get(cat.id, [])
        result_categories.append(
            PublicCategoryWithItems(
                id=cat.id,
                restaurant_id=cat.restaurant_id,
                name=cat.name,
                display_order=cat.display_order,
                is_active=cat.is_active,
                item_count=len(cat_items),
                created_at=cat.created_at,
                updated_at=cat.updated_at,
                items=cat_items,
            )
        )

    return PublicMenuResponse(
        restaurant=RestaurantResponse.model_validate(restaurant),
        categories=result_categories,
        total_items=total_count,
    )

@router.get("/categories", response_model=list[CategoryResponse], summary="Get active categories")
async def get_public_categories(db: AsyncSession = Depends(get_db)):
    restaurant_repo = RestaurantRepository(db)
    category_repo = CategoryRepository(db)
    restaurant = await restaurant_repo.get_or_create_default()
    categories = await category_repo.get_all(restaurant.id, active_only=True)
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

@router.get("/food-items", response_model=list[FoodItemResponse], summary="Query public food items")
async def get_public_food_items(
    category_id: str | None = Query(None),
    food_type: str | None = Query(None, description="VEG or NON_VEG"),
    is_available: bool | None = Query(None),
    q: str | None = Query(None, description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    restaurant_repo = RestaurantRepository(db)
    food_repo = FoodItemRepository(db)
    restaurant = await restaurant_repo.get_or_create_default()
    items = await food_repo.get_all(
        restaurant_id=restaurant.id,
        category_id=category_id,
        food_type=food_type,
        is_available=is_available,
        search_query=q,
        active_categories_only=True,
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
