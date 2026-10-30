from pydantic import BaseModel
from app.schemas.restaurant import RestaurantResponse
from app.schemas.category import CategoryResponse
from app.schemas.food_item import FoodItemResponse

class PublicCategoryWithItems(CategoryResponse):
    items: list[FoodItemResponse] = []

class PublicMenuResponse(BaseModel):
    restaurant: RestaurantResponse
    categories: list[PublicCategoryWithItems]
    total_items: int

class DashboardStatsResponse(BaseModel):
    total_food_items: int
    available_food_items: int
    unavailable_food_items: int
    total_categories: int
    recently_updated_items: list[FoodItemResponse] = []
