import uuid
from typing import TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.restaurant import Restaurant
    from app.models.category import Category

class FoodItem(Base, TimestampMixin):
    __tablename__ = "food_items"
    __table_args__ = (
        CheckConstraint("price >= 0", name="chk_food_item_positive_price"),
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
    category_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_public_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    food_type: Mapped[str] = mapped_column(String(20), nullable=False, default="VEG", index=True)  # VEG, NON_VEG
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)

    restaurant: Mapped["Restaurant"] = relationship("Restaurant", back_populates="food_items")
    category: Mapped["Category"] = relationship("Category", back_populates="food_items")
