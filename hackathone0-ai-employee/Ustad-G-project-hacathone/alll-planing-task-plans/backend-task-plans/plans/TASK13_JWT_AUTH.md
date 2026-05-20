# Phase 2 — TASK 13: Real JWT Authentication

> **Parent:** `PHASE2_TASKS.md` → Task 13
> **Goal:** Replace the `user_id = 1` mock in every router with real JWT-based identity. After this task, users register with a password, log in to get a token, and all protected endpoints identify the caller from the token automatically.
> **Status:** 🔲 Not Started

---

## Context: What Exists Today

| File | Current State |
|------|-------------|
| `app/models/user.py` | Has `id`, `name`, `phone`, `email`, `city`, `area`, `device_token`, `created_at` — **NO `hashed_password` or `role`** |
| `app/schemas/user.py` | Has `UserCreate` (no password) and `UserOut` |
| `app/routers/users.py` | `POST /v1/users` registers (no password), `GET /v1/users/{id}` fetches, `PATCH /v1/users/me/token` updates FCM token |
| `app/routers/book.py` | `user_id = 1` hardcoded |
| `app/routers/bookings.py` | `get_current_user_id()` returns `1` always |

---

## What We're Building

```
Client
  │
  ├─ POST /v1/auth/register  → hash password, save User, return UserOut
  ├─ POST /v1/auth/login     → verify password, return { access_token, token_type }
  │
  └─ [protected endpoint] (e.g. GET /v1/bookings)
       Headers: Authorization: Bearer <JWT>
         │
         └─ get_current_user() dependency → decodes JWT → returns User object
```

---

## Dependencies to Add

```
python-jose[cryptography]>=3.3.0   # JWT signing/verifying
passlib[bcrypt]>=1.7.4             # Bcrypt password hashing
```

---

## Step-by-Step Implementation

---

### STEP 1 — Add Dependencies to `requirements.txt`

Add to `requirements.txt`:
```
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
```

---

### STEP 2 — Add `hashed_password` and `role` to User Model

#### [MODIFY] `app/models/user.py`

Add two new columns after `email`:
```python
hashed_password = Column(String(256), nullable=True)   # Nullable for existing users
role            = Column(String(20), default="user")    # "user" | "admin"
```

> **Why nullable?** Existing registered users (via `POST /v1/users`) have no password. They can log in via OTP later. For now, only users who register through `POST /v1/auth/register` will have a password set.

---

### STEP 3 — Add JWT Config to `app/config.py`

Add three new settings:
```python
jwt_secret: str = "changeme-in-production"      # Override: JWT_SECRET in .env
jwt_algorithm: str = "HS256"
jwt_expire_minutes: int = 60 * 24 * 7           # 7 days
```

Also add to `.env.example`:
```
JWT_SECRET=your-strong-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080
```

---

### STEP 4 — Update User Schemas

#### [MODIFY] `app/schemas/user.py`

Add these schemas:
```python
class UserRegister(BaseModel):
    """Schema for auth registration (includes password)."""
    name: str
    phone: str
    email: str | None = None
    city: str = "Karachi"
    area: str
    password: str = Field(..., min_length=6, description="Minimum 6 characters")

class TokenOut(BaseModel):
    """Schema for the JWT response."""
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    """Schema for login via phone + password."""
    phone: str
    password: str
```

---

### STEP 5 — Create Auth Utility

#### [NEW] `app/utils/auth.py`

```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    settings = get_settings()
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

def decode_access_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
```

---

### STEP 6 — Create Auth Router

#### [NEW] `app/routers/auth.py`

Two endpoints:

**`POST /v1/auth/register`**
```
- Checks duplicate phone (409 if exists)
- Checks duplicate email (409 if exists)  
- Hashes password with bcrypt
- Saves User to DB
- Returns UserOut
```

**`POST /v1/auth/login`**
```
- Looks up User by phone
- Verifies bcrypt password
- Creates JWT with sub = str(user.id), role = user.role
- Returns { access_token, token_type, user }
```

---

### STEP 7 — Create `get_current_user` Dependency

#### [NEW] `app/dependencies/auth.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.utils.auth import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = int(payload.get("sub", 0))
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user
```

---

### STEP 8 — Wire `get_current_user` into Protected Routes

#### [MODIFY] `app/routers/bookings.py`
Replace:
```python
def get_current_user_id() -> int:
    return 1
```
With:
```python
from app.dependencies.auth import get_current_user
from app.models.user import User
```
All route signatures change from `user_id: int = Depends(get_current_user_id)` to `current_user: User = Depends(get_current_user)`, and `user_id` references become `current_user.id`.

#### [MODIFY] `app/routers/book.py`
Replace:
```python
user_id=1,  # Temporary mock
```
With:
```python
current_user: User = Depends(get_current_user)
# ...
user_id=current_user.id,
```

#### [MODIFY] `app/routers/users.py`
Replace the `PATCH /v1/users/me/token` endpoint to use `get_current_user` instead of querying by phone.

---

### STEP 9 — Mount Auth Router in `app/main.py`

```python
from app.routers import auth
app.include_router(auth.router, prefix="/v1")
```

---

## Files Summary

| File | Action |
|------|--------|
| `requirements.txt` | Add `python-jose`, `passlib` |
| `app/models/user.py` | Add `hashed_password`, `role` columns |
| `app/config.py` | Add `jwt_secret`, `jwt_algorithm`, `jwt_expire_minutes` |
| `.env.example` | Document new JWT vars |
| `app/schemas/user.py` | Add `UserRegister`, `LoginRequest`, `TokenOut` |
| `app/utils/auth.py` | **NEW** — `hash_password`, `verify_password`, `create_access_token`, `decode_access_token` |
| `app/routers/auth.py` | **NEW** — `POST /v1/auth/register`, `POST /v1/auth/login` |
| `app/dependencies/auth.py` | **NEW** — `get_current_user` FastAPI dependency |
| `app/routers/bookings.py` | Replace mock `user_id = 1` with `get_current_user` |
| `app/routers/book.py` | Replace mock `user_id = 1` with `get_current_user` |
| `app/routers/users.py` | Update token endpoint to use `get_current_user` |
| `app/main.py` | Mount `auth.router` |

---

## Migration Note

Existing users in the DB (those registered via `POST /v1/users`) will have `hashed_password = NULL`. They cannot log in via `POST /v1/auth/login` yet (will get a 401). They need to either:
1. Re-register via `POST /v1/auth/register` (which checks duplicate phone → conflict)
2. Or we seed a test user during development.

For now, we will seed a **test user** (`phone: 03001234567`, `password: test1234`) in the test script.

---

## Verification Plan

### `tests/test_task13.py`
1. `POST /v1/auth/register` → `201` — new user created
2. `POST /v1/auth/register` (same phone) → `409` — duplicate
3. `POST /v1/auth/login` (wrong password) → `401`
4. `POST /v1/auth/login` (correct) → `200` + `access_token` in response
5. `GET /v1/bookings` without token → `401`
6. `GET /v1/bookings` with token → `200`

---

*Version: 1.0 | Task: 13 | Project: UstadG | Created: 2026-05-18*
