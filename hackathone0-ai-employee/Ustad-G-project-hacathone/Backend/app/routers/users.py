from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserCreate, UserProfileUpdate
from app.dependencies.auth import get_current_user
from pydantic import BaseModel

class TokenUpdate(BaseModel):
    device_token: str

router = APIRouter(tags=["Users"])

@router.post(
    "/users",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user profile",
)
async def register_user(
    body: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> User:
    # 1. Duplicate check — Email uniqueness only
    if body.email:
        existing_email = await db.execute(
            select(User).where(User.email == body.email)
        )
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=409,
                detail=f"A user with email '{body.email}' is already registered."
            )

    # 3. Create the user profile
    user_data = body.model_dump()
    user = User(**user_data)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user



@router.get(
    "/users/me",
    response_model=UserOut,
    summary="Get current user's own profile",
)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
) -> User:
    """Returns the authenticated user's own profile."""
    return current_user

@router.patch(
    "/users/me",
    response_model=UserOut,
    summary="Update current user's profile (name, email, city, area)",
)
async def update_my_profile(
    body: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """Update name, email, city or area for the authenticated user."""
    updates = body.model_dump(exclude_unset=True)

    # Check email uniqueness if being changed
    if "email" in updates and updates["email"] and updates["email"] != current_user.email:
        existing = await db.execute(select(User).where(User.email == updates["email"]))
        if existing.scalars().first():
            raise HTTPException(status_code=409, detail="Email already in use by another account.")

    for key, value in updates.items():
        setattr(current_user, key, value)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.patch("/users/me/token", summary="Register device FCM token")
async def register_device_token(
    body: TokenUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Store the user's Firebase FCM device token for push notifications."""
    current_user.device_token = body.device_token
    db.add(current_user)
    await db.commit()
    return {"message": "Device token registered successfully."}

@router.get(
    "/users/{user_id}",
    response_model=UserOut,
    summary="Get user profile by ID",
)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
