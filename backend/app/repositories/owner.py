from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.owner import Owner

class OwnerRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, owner_id: str) -> Owner | None:
        stmt = select(Owner).where(Owner.id == owner_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username_or_email(self, identifier: str) -> Owner | None:
        clean_identifier = identifier.strip().lower()
        stmt = select(Owner).where(
            or_(
                Owner.username == clean_identifier,
                Owner.email == clean_identifier
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def count(self) -> int:
        stmt = select(Owner)
        result = await self.session.execute(stmt)
        return len(result.scalars().all())

    async def create(self, restaurant_id: str, username: str, email: str, password_hash: str) -> Owner:
        owner = Owner(
            restaurant_id=restaurant_id,
            username=username.strip().lower(),
            email=email.strip().lower(),
            password_hash=password_hash,
            is_active=True
        )
        self.session.add(owner)
        await self.session.commit()
        await self.session.refresh(owner)
        return owner
