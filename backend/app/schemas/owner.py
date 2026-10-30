from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class OwnerLoginRequest(BaseModel):
    username_or_email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)

class OwnerResponse(BaseModel):
    id: str
    restaurant_id: str
    username: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    owner: OwnerResponse

