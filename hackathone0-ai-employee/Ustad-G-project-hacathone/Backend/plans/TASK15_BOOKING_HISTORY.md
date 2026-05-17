# Task 15 — Booking History API & Registration Rule Update 📅

This plan details the design, schema, and API route endpoints for **Task 15: Booking History API**, and documents the simple user registration flow.

---

## Architecture Context & Registration Rule Update

### 1. Registration Duplicate Rule Check Update
As per the user's directive, we have updated the user registration rules:
* **Email Uniqueness only**: We only perform uniqueness/conflict checks (`409 Conflict`) on the `email` (gmail) column.
* **Duplicate Phones Allowed**: The `User` database model has been updated to remove the uniqueness constraint on the `phone` column. Multiple users are now allowed to share the same phone number under distinct email identities.

### 2. No Verification / OTP Checks (Out of Scope)
* Registration is entirely direct and immediate.
* **No OTP, SMS verification, or email activation loops** will be implemented for now. The profile is registered instantly upon calling the REST endpoint.

---

## Proposed Changes

### 1. Database Model Layer

#### [MODIFY] [app/models/user.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/models/user.py)
Ensure that the `phone` column is marked `unique=False`:
```python
phone      = Column(String(20), unique=False, index=True, nullable=False)
```

#### [NEW] [app/models/booking.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/models/booking.py)
Create a new SQLAlchemy model `Booking` mapping to the `bookings` table:
* `id`: `Integer`, Primary Key, autoincrement.
* `confirmation_id`: `String(50)`, unique, index, nullable=False (e.g. `UGK-2026-4821`).
* `user_phone`: `String(20)`, index, nullable=False (identifies the user via phone, works for unregistered guest flows too).
* `user_id`: `Integer`, `ForeignKey("users.id")`, nullable=True (points to the user profile if registered).
* `provider_id`: `String(100)`, nullable=False (Google Maps Place ID or SQLite Provider ID).
* `provider_name`: `String(200)`, nullable=False (e.g. "Ali Plumber Services").
* `service`: `String(100)`, nullable=False (e.g. "plumber", "electrician").
* `scheduled_at`: `String(100)`, nullable=True (e.g. "tomorrow at 10:00 AM").
* `status`: `String(50)`, default="Confirmed", nullable=False (can be "Confirmed", "Cancelled", "Completed").
* `created_at`: `DateTime`, server_default=func.now().

Register the new model under the package imports in `app/models/__init__.py`.

---

### 2. Validation Schemas (Pydantic)

#### [NEW] [app/schemas/booking.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/schemas/booking.py)
Create the validation models for request/response payloads:
* `BookingOut`: Returns booking details.
  ```python
  from pydantic import BaseModel, Field
  from datetime import datetime

  class BookingOut(BaseModel):
      id: int
      confirmation_id: str
      user_phone: str
      user_id: int | None = None
      provider_id: str
      provider_name: str
      service: str
      scheduled_at: str | None = None
      status: str
      created_at: datetime

      class Config:
          from_attributes = True
  ```

#### [MODIFY] [app/schemas/booking.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/schemas/booking.py)
Extend `BookRequest` to include `user_phone`:
```python
class BookRequest(BaseModel):
    session_id: str = Field(..., description="Prior session ID")
    provider_id: str = Field(..., description="Maps Place ID or DB Provider ID")
    user_name: str = Field(default="Guest", description="Name of the user making booking")
    user_phone: str | None = Field(default=None, description="Optional phone number of registered user")
```

---

### 3. API Routers & Integration Hook

#### [MODIFY] [app/routers/users.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/routers/users.py)
Enforce that `/v1/users` only checks duplicates by `email`:
```python
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
```

#### [MODIFY] [app/routers/book.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/routers/book.py)
Update the `POST /v1/book` endpoint:
1. Resolve the `user_phone` (default to `"mock_user"` if missing).
2. Retrieve the registered `User` profile from SQLite via the phone number (if matching). If found, override `user_name` with the registered name, and store the user's integer `id` as `user_id`.
3. Check if the `provider_id` exists in our SQLite `Provider` table to pull the official registered `provider_name` and `service_type` (e.g. `"plumber"`). Otherwise, fall back to parsing regex details from the LLM or defaulting to `"plumber"`.
4. Immediately after receiving a successful response from the agent swarm, parse the `confirmation_id` (e.g. `UGK-2026-4821`).
5. **Persist the new `Booking` record directly to the local SQLite database.**
6. Return the `BookResponse`.

#### [NEW] [app/routers/bookings.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/routers/bookings.py)
Create a new bookings log router exposing:
* `GET /v1/bookings` — list bookings for the user.
  * Parameters: `user_phone: str` (mandatory to filter logs under mock auth), `skip: int = 0`, `limit: int = 10`.
  * Returns: `list[BookingOut]`.
* `GET /v1/bookings/{confirmation_id}` — retrieve details of a single booking.
  * Parameter: `confirmation_id: str`.
  * Returns: `BookingOut`.
* `PATCH /v1/bookings/{confirmation_id}/cancel` — cancel an active booking.
  * Parameter: `confirmation_id: str`.
  * Action: Updates the booking's `status` to `"Cancelled"` in SQLite.
  * Returns: The updated `BookingOut`.

#### [MODIFY] [app/main.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/main.py)
Mount the new `/v1` router prefix for `bookings.py`:
```python
from app.routers import bookings
app.include_router(bookings.router, prefix="/v1")
```

---

## Verification Plan

### Automated Tests
* Create `tests/test_task15.py` to:
  1. Register multiple users with the same phone but distinct emails. Assert both register successfully without duplicate errors!
  2. Register duplicate emails and assert `409 Conflict`.
  3. Create a mock provider in SQLite (e.g. Clifton Plumbing).
  4. Send `POST /v1/book` and assert SQLite record is successfully generated in the `bookings` table.
  5. Query `GET /v1/bookings?user_phone=...` and verify Clifton Plumbing appears in the paginated response!
  6. Fetch `GET /v1/bookings/{confirmation_id}` and assert match.
  7. Trigger `PATCH /v1/bookings/{confirmation_id}/cancel` and verify status updates to `Cancelled`.
