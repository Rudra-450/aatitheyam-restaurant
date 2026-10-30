from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.category import Category
from app.models.food_item import FoodItem
from app.schemas.category import CategoryCreate, CategoryReorderItem, CategoryUpdate

class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, restaurant_id: str, active_only: bool = False) -> list[tuple[Category, int]]:
        """Returns categories ordered by display_order with item counts."""
        stmt = (
            select(
                Category,
                func.count(FoodItem.id).label("item_count")
            )
            .outerjoin(FoodItem, FoodItem.category_id == Category.id)
            .where(Category.restaurant_id == restaurant_id)
        )
        if active_only:
            stmt = stmt.where(Category.is_active == True)  # noqa: E712

        stmt = stmt.group_by(Category.id).order_by(Category.display_order.asc(), Category.name.asc())
        result = await self.session.execute(stmt)
        return [(row[0], row[1]) for row in result.all()]

    async def get_by_id(self, category_id: str) -> Category | None:
        stmt = select(Category).where(Category.id == category_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, restaurant_id: str, name: str) -> Category | None:
        stmt = select(Category).where(
            Category.restaurant_id == restaurant_id,
            func.lower(Category.name) == name.strip().lower()
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, restaurant_id: str, data: CategoryCreate) -> Category:
        existing = await self.get_by_name(restaurant_id, data.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A category named '{data.name}' already exists."
            )

        # Automatically calculate next display_order if not provided
        if data.display_order == 0:
            max_order_stmt = select(func.max(Category.display_order)).where(Category.restaurant_id == restaurant_id)
            max_val = (await self.session.execute(max_order_stmt)).scalar() or 0
            order = max_val + 1
        else:
            order = data.display_order

        category = Category(
            restaurant_id=restaurant_id,
            name=data.name.strip(),
            display_order=order,
            is_active=data.is_active
        )
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def update(self, category_id: str, data: CategoryUpdate) -> Category:
        category = await self.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        if data.name and data.name.strip().lower() != category.name.lower():
            existing = await self.get_by_name(category.restaurant_id, data.name)
            if existing and existing.id != category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Category with name '{data.name}' already exists."
                )
            category.name = data.name.strip()

        if data.display_order is not None:
            category.display_order = data.display_order
        if data.is_active is not None:
            category.is_active = data.is_active

        await self.session.commit()
        await self.session.refresh(category)
        return category

    async def delete(self, category_id: str) -> bool:
        category = await self.get_by_id(category_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

        # Check for existing food items
        items_count_stmt = select(func.count(FoodItem.id)).where(FoodItem.category_id == category_id)
        items_count = (await self.session.execute(items_count_stmt)).scalar() or 0
        if items_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete category '{category.name}' because it contains {items_count} food item(s). Please reassign or delete the items first."
            )

        await self.session.delete(category)
        await self.session.commit()
        return True

    async def reorder(self, restaurant_id: str, items: list[CategoryReorderItem]) -> bool:
        for item in items:
            cat = await self.get_by_id(item.id)
            if cat and cat.restaurant_id == restaurant_id:
                cat.display_order = item.display_order
        await self.session.commit()
        return True
