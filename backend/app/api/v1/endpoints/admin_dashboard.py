from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_owner
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.food_item import FoodItemRepository
from app.schemas.food_item import FoodItemResponse
from app.schemas.public import DashboardStatsResponse

router = APIRouter(tags=["Admin Dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse, summary="Get dashboard summary metrics")
async def get_dashboard_stats(
    current_owner: Owner = Depends(get_current_owner),
    db: AsyncSession = Depends(get_db)
):
    food_repo = FoodItemRepository(db)
    stats_data = await food_repo.get_dashboard_stats(current_owner.restaurant_id)

    recent_items = [
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
        for item in stats_data["recently_updated_items"]
    ]

    return DashboardStatsResponse(
        total_food_items=stats_data["total_food_items"],
        available_food_items=stats_data["available_food_items"],
        unavailable_food_items=stats_data["unavailable_food_items"],
        total_categories=stats_data["total_categories"],
        recently_updated_items=recent_items,
    )
