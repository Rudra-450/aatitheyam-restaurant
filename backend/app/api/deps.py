from collections.abc import AsyncGenerator
from fastapi import Cookie, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import decode_access_token
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.owner import OwnerRepository

async def get_current_owner(
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(None),
    restaurant_owner_session: str | None = Cookie(None)
) -> Owner:
    """
    Authenticates the restaurant owner via Bearer token in header or secure HTTP-Only cookie.
    """
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1].strip()
    elif restaurant_owner_session:
        token = restaurant_owner_session

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    owner_repo = OwnerRepository(db)
    owner = await owner_repo.get_by_id(payload["sub"])
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Owner account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not owner.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner account has been deactivated."
        )

    return owner
