from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.models.category import Category
from app.models.food_item import FoodItem
from app.schemas.food_item import FoodItemCreate, FoodItemUpdate

class FoodItemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(
        self,
        restaurant_id: str,
        category_id: str | None = None,
        food_type: str | None = None,
        is_available: bool | None = None,
        search_query: str | None = None,
        active_categories_only: bool = False
    ) -> list[tuple[FoodItem, str]]:
        """Returns food items joined with category name."""
        stmt = (
            select(FoodItem, Category.name.label("category_name"))
            .join(Category, FoodItem.category_id == Category.id)
            .where(FoodItem.restaurant_id == restaurant_id)
        )

        if active_categories_only:
            stmt = stmt.where(Category.is_active == True)  # noqa: E712

        if category_id:
            stmt = stmt.where(FoodItem.category_id == category_id)

        if food_type:
            stmt = stmt.where(FoodItem.food_type == food_type.upper())

        if is_available is not None:
            stmt = stmt.where(FoodItem.is_available == is_available)

        if search_query:
            clean_search = f"%{search_query.strip().lower()}%"
            stmt = stmt.where(func.lower(FoodItem.name).like(clean_search))

        stmt = stmt.order_by(Category.display_order.asc(), FoodItem.display_order.asc(), FoodItem.name.asc())
        result = await self.session.execute(stmt)
        return [(row[0], row[1]) for row in result.all()]

    async def get_by_id(self, item_id: str) -> tuple[FoodItem | None, str | None]:
        stmt = (
            select(FoodItem, Category.name.label("category_name"))
            .join(Category, FoodItem.category_id == Category.id)
            .where(FoodItem.id == item_id)
        )
        result = await self.session.execute(stmt)
        row = result.first()
        if not row:
            return None, None
        return row[0], row[1]

    async def create(self, restaurant_id: str, data: FoodItemCreate) -> tuple[FoodItem, str]:
        # Validate that category exists and belongs to restaurant
        cat_stmt = select(Category).where(
            Category.id == data.category_id,
            Category.restaurant_id == restaurant_id
        )
        cat_result = await self.session.execute(cat_stmt)
        category = cat_result.scalar_one_or_none()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Selected category does not exist or does not belong to this restaurant."
            )

        # Calculate display_order if zero
        if data.display_order == 0:
            max_order_stmt = select(func.max(FoodItem.display_order)).where(
                FoodItem.category_id == data.category_id
            )
            max_val = (await self.session.execute(max_order_stmt)).scalar() or 0
            order = max_val + 1
        else:
            order = data.display_order

        food_item = FoodItem(
            restaurant_id=restaurant_id,
            category_id=data.category_id,
            name=data.name.strip(),
            image_url=data.image_url,
            image_public_id=data.image_public_id,
            price=data.price,
            food_type=data.food_type,
            is_available=data.is_available,
            display_order=order,
        )
        self.session.add(food_item)
        await self.session.commit()
        await self.session.refresh(food_item)
        return food_item, category.name

    async def update(self, item_id: str, data: FoodItemUpdate) -> tuple[FoodItem, str]:
        food_item, _ = await self.get_by_id(item_id)
        if not food_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found.")

        category_name = None
        if data.category_id and data.category_id != food_item.category_id:
            cat_stmt = select(Category).where(
                Category.id == data.category_id,
                Category.restaurant_id == food_item.restaurant_id
            )
            cat_res = await self.session.execute(cat_stmt)
            new_cat = cat_res.scalar_one_or_none()
            if not new_cat:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected category does not exist.")
            food_item.category_id = data.category_id
            category_name = new_cat.name

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            if key != "category_id":
                setattr(food_item, key, value)

        await self.session.commit()
        await self.session.refresh(food_item)
        if not category_name:
            cat_stmt = select(Category.name).where(Category.id == food_item.category_id)
            category_name = (await self.session.execute(cat_stmt)).scalar() or ""

        return food_item, category_name

    async def update_availability(self, item_id: str, is_available: bool) -> tuple[FoodItem, str]:
        food_item, category_name = await self.get_by_id(item_id)
        if not food_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found.")

        food_item.is_available = is_available
        await self.session.commit()
        await self.session.refresh(food_item)
        return food_item, category_name or ""

    async def delete(self, item_id: str) -> FoodItem:
        food_item, _ = await self.get_by_id(item_id)
        if not food_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found.")

        await self.session.delete(food_item)
        await self.session.commit()
        return food_item

    async def get_dashboard_stats(self, restaurant_id: str) -> dict:
        total_stmt = select(func.count(FoodItem.id)).where(FoodItem.restaurant_id == restaurant_id)
        total_items = (await self.session.execute(total_stmt)).scalar() or 0

        avail_stmt = select(func.count(FoodItem.id)).where(
            FoodItem.restaurant_id == restaurant_id,
            FoodItem.is_available == True  # noqa: E712
        )
        available_items = (await self.session.execute(avail_stmt)).scalar() or 0
        unavailable_items = total_items - available_items

        cat_stmt = select(func.count(Category.id)).where(Category.restaurant_id == restaurant_id)
        total_categories = (await self.session.execute(cat_stmt)).scalar() or 0

        # Recent 5 items
        recent_stmt = (
            select(FoodItem, Category.name.label("category_name"))
            .join(Category, FoodItem.category_id == Category.id)
            .where(FoodItem.restaurant_id == restaurant_id)
            .order_by(desc(FoodItem.updated_at))
            .limit(5)
        )
        recent_res = await self.session.execute(recent_stmt)
        recent_items = [(row[0], row[1]) for row in recent_res.all()]

        return {
            "total_food_items": total_items,
            "available_food_items": available_items,
            "unavailable_food_items": unavailable_items,
            "total_categories": total_categories,
            "recently_updated_items": recent_items,
        }
