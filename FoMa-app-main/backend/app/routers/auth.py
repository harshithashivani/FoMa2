from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import (
    AvatarUpdateRequest,
    LoginRequest,
    PasswordResetRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Rough cap on the base64 avatar payload (~2MB of actual image data).
MAX_AVATAR_LENGTH = 2_800_000


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/avatar", response_model=UserOut)
async def update_avatar(
    payload: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if len(payload.avatar_data) > MAX_AVATAR_LENGTH:
        raise HTTPException(status_code=413, detail="Image too large — please use a smaller photo (max ~2MB)")

    current_user.avatar_data = payload.avatar_data
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me/avatar", response_model=UserOut)
async def remove_avatar(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.avatar_data = None
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.patch("/me", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.name = payload.name
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/reset-password", status_code=204)
async def reset_password(payload: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    """
    Resets a user's password given only their email - no proof of email
    ownership required, since this app has no email-sending capability
    configured yet. Always responds the same way whether or not the email
    exists, so this endpoint alone can't be used to check which emails are
    registered - but it genuinely does let anyone who knows an account's
    email address take it over. Fine for local testing; replace with a
    real emailed reset-link flow before relying on this for real accounts.
    """
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if user is not None:
        user.hashed_password = hash_password(payload.new_password)
        await db.commit()