from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

FoodTypeEnum = Literal["VEG", "NON_VEG"]

class FoodItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    category_id: str
    image_url: str | None = None
    image_public_id: str | None = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    food_type: FoodTypeEnum = "VEG"
    is_available: bool = True
    display_order: int = Field(default=0, ge=0)

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    category_id: str | None = None
    image_url: str | None = None
    image_public_id: str | None = None
    price: Decimal | None = Field(None, ge=0, decimal_places=2)
    food_type: FoodTypeEnum | None = None
    is_available: bool | None = None
    display_order: int | None = Field(None, ge=0)

class FoodItemAvailabilityUpdate(BaseModel):
    is_available: bool

class FoodItemResponse(FoodItemBase):
    id: str
    restaurant_id: str
    category_name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

