import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.owner import Owner
    from app.models.category import Category
    from app.models.food_item import FoodItem

class Restaurant(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False, default="Aatitheyam Cafe & Bhojnalaya")
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    contact_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    opening_hours: Mapped[str | None] = mapped_column(String(100), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="₹")

    # Relationships
    owners: Mapped[list["Owner"]] = relationship("Owner", back_populates="restaurant", cascade="all, delete-orphan")
    categories: Mapped[list["Category"]] = relationship("Category", back_populates="restaurant", cascade="all, delete-orphan")
    food_items: Mapped[list["FoodItem"]] = relationship("FoodItem", back_populates="restaurant", cascade="all, delete-orphan")
