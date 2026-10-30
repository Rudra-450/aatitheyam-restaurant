import uuid
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.restaurant import Restaurant
    from app.models.food_item import FoodItem

class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    __table_args__ = (
        UniqueConstraint("restaurant_id", "name", name="uq_restaurant_category_name"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    restaurant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("restaurants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)

    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="categories")
    food_items: Mapped[list["FoodItem"]] = relationship(
        "FoodItem",
        back_populates="category",
        cascade="all",
        passive_deletes=False
    )
