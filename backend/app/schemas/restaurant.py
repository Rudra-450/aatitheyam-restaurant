from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RestaurantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    logo_url: str | None = None
    contact_number: str | None = Field(None, max_length=50)
    address: str | None = None
    opening_hours: str | None = Field(None, max_length=100)
    currency: str = Field(default="₹", max_length=10)

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    logo_url: str | None = None
    contact_number: str | None = Field(None, max_length=50)
    address: str | None = None
    opening_hours: str | None = Field(None, max_length=100)
    currency: str | None = Field(None, max_length=10)

class RestaurantResponse(RestaurantBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

