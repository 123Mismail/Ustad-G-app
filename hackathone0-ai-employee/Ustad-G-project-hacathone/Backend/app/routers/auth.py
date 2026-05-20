from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, LoginRequest, TokenOut, UserOut
from app.utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user with a password."""
    try:
        # Check phone duplicate
        result = await db.execute(select(User).where(User.phone == body.phone))
        if result.scalars().first():
            raise HTTPException(status_code=409, detail="Phone number already registered")

        # Check email duplicate
        email_val = body.email.strip() if (body.email and body.email.strip()) else None
        if email_val:
            result = await db.execute(select(User).where(User.email == email_val))
            if result.scalars().first():
                raise HTTPException(status_code=409, detail="Email already registered")

        # Hash password
        hashed_pw = hash_password(body.password)

        # Save to DB
        role_val = "admin" if "admin" in body.name.lower() else "user"
        new_user = User(
            name=body.name,
            phone=body.phone,
            email=email_val,
            city=body.city,
            area=body.area,
            hashed_password=hashed_pw,
            role=role_val
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        return new_user
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = "".join(traceback.format_exception(type(e), e, e.__traceback__))
        raise HTTPException(status_code=500, detail=error_msg)

@router.post("/login", response_model=TokenOut)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    result = await db.execute(select(User).where(User.phone == body.phone))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid phone or password")
    
    if not user.hashed_password:
        raise HTTPException(status_code=401, detail="User has no password set. Please register again.")

    if not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone or password")

    # Generate token
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(token_data)

    return TokenOut(
        access_token=access_token,
        token_type="bearer",
        user=user
    )
