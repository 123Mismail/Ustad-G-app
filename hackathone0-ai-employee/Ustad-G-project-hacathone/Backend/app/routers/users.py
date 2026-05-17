from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserOut, UserCreate

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
    # 1. Duplicate check — Phone uniqueness
    existing_phone = await db.execute(
        select(User).where(User.phone == body.phone)
    )
    if existing_phone.scalars().first():
        raise HTTPException(
            status_code=409,
            detail=f"A user with phone '{body.phone}' is already registered."
        )

    # 2. Duplicate check — Email uniqueness
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
