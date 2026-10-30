from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.restaurant import Restaurant
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate

class RestaurantRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_default(self) -> Restaurant:
        """Retrieves the single restaurant instance, creating a default one if none exists."""
        stmt = select(Restaurant).limit(1)
        result = await self.session.execute(stmt)
        restaurant = result.scalar_one_or_none()
        if not restaurant:
            restaurant = Restaurant(
                name="Aatitheyam Cafe & Bhojnalaya",
                logo_url=None,
                contact_number=None,
                address=None,
                opening_hours=None,
                currency="₹"
            )
            self.session.add(restaurant)
            await self.session.commit()
            await self.session.refresh(restaurant)
        return restaurant

    async def update(self, restaurant_id: str, data: RestaurantUpdate) -> Restaurant | None:
        stmt = select(Restaurant).where(Restaurant.id == restaurant_id)
        result = await self.session.execute(stmt)
        restaurant = result.scalar_one_or_none()
        if not restaurant:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(restaurant, key, value)

        await self.session.commit()
        await self.session.refresh(restaurant)
        return restaurant
