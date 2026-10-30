from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    display_order: int | None = Field(None, ge=0)
    is_active: bool | None = None

class CategoryReorderItem(BaseModel):
    id: str
    display_order: int = Field(..., ge=0)

class CategoryReorderRequest(BaseModel):
    items: list[CategoryReorderItem]

class CategoryResponse(CategoryBase):
    id: str
    restaurant_id: str
    item_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

