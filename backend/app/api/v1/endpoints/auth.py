from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_current_owner
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.database.session import get_db
from app.models.owner import Owner
from app.repositories.owner import OwnerRepository
from app.schemas.owner import OwnerLoginRequest, OwnerResponse, TokenResponse

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=TokenResponse, summary="Owner login")
async def login(
    payload: OwnerLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    owner_repo = OwnerRepository(db)
    owner = await owner_repo.get_by_username_or_email(payload.username_or_email)
    if not owner or not verify_password(payload.password, owner.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not owner.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated."
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(subject=owner.id, expires_delta=access_token_expires)

    # Set secure HTTP-only cookie
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        owner=OwnerResponse.model_validate(owner),
    )

@router.post("/logout", summary="Owner logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        httponly=True,
        samesite="lax",
    )
    return {"message": "Logged out successfully."}

@router.get("/me", response_model=OwnerResponse, summary="Get current authenticated owner")
async def get_me(current_owner: Owner = Depends(get_current_owner)):
    return OwnerResponse.model_validate(current_owner)
