# Phase 2 — TASK 17: Admin Analytics API

> **Parent:** `PHASE2_TASKS.md` → Task 17
> **Goal:** Expose a secure admin-only REST layer that queries the live SQLite database and returns real statistics — powering the admin dashboard built in the frontend with actual data instead of mocked JSON.
> **Stack:** FastAPI · SQLAlchemy Async · SQLite
> **Auth:** Simple Admin API Key header (`X-Admin-Key`) — full JWT auth deferred to Task 13.
> **Status:** 🔲 Not Started

---

## Overview

The UstadG admin dashboard exists in the frontend already. Right now it likely renders hardcoded or mock data. Task 17 wires these dashboard panels to a real backend:

| Dashboard Panel | API Endpoint | Source Table |
|----------------|-------------|-------------|
| Overview stats (total bookings, revenue, providers) | `GET /v1/admin/stats` | `bookings` + `providers` |
| Bookings table (filterable) | `GET /v1/admin/bookings` | `bookings` |
| Top Providers leaderboard | `GET /v1/admin/providers/top` | `providers` + `bookings` |

---

## Authentication Strategy

> **Why not JWT yet?** Task 13 (Real JWT auth) is planned for the end. For now we protect admin endpoints with a simple **API Key header**.
>
> The key is already in `Settings.admin_key` (value: `ustadg-admin-secret`, overridable via `ADMIN_KEY` in `.env`).
> The frontend or any admin client must include:
> ```
> X-Admin-Key: ustadg-admin-secret
> ```
> This is trivial to swap for JWT role-checking when Task 13 is done.

### Admin Auth Dependency

```python
# In app/routers/admin.py
from fastapi import Header, HTTPException
from app.config import get_settings

def verify_admin(x_admin_key: str = Header(...)):
    """Dependency to authenticate admin requests via API key."""
    settings = get_settings()
    if x_admin_key != settings.admin_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid admin key")
```

---

## Files to Create / Modify

### 1. Pydantic Schemas

#### [NEW] `app/schemas/admin.py`
Typed response models for all three endpoints:

```python
from pydantic import BaseModel
from typing import List
from datetime import datetime

class ServiceBreakdown(BaseModel):
    service: str
    count: int

class AdminStats(BaseModel):
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    active_providers: int
    total_providers: int
    estimated_revenue_pkr: int         # Sum of provider.price for each confirmed booking
    top_services: List[ServiceBreakdown]  # Top 5 service types by booking count

class AdminBookingItem(BaseModel):
    id: int
    confirmation_id: str
    user_id: int
    provider_id: str
    service: str | None
    status: str
    scheduled_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True

class ProviderBookingStats(BaseModel):
    id: int
    name: str
    service_type: str
    area: str
    rating: float
    price: int
    is_active: bool
    booking_count: int       # Total bookings referencing this provider's ID
```

---

### 2. Admin Router

#### [NEW] `app/routers/admin.py`
Implements all three admin endpoints under the `/admin` prefix.

---

#### 2a. `GET /v1/admin/stats`

**What it returns:**
```json
{
  "total_bookings": 42,
  "confirmed_bookings": 38,
  "cancelled_bookings": 4,
  "active_providers": 10,
  "total_providers": 10,
  "estimated_revenue_pkr": 38000,
  "top_services": [
    {"service": "plumber", "count": 14},
    {"service": "electrician", "count": 9},
    ...
  ]
}
```

**Logic:**
```python
from sqlalchemy import select, func, case
from app.models.booking import Booking
from app.models.provider import Provider

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(db: AsyncSession = Depends(get_db), _=Depends(verify_admin)):
    # Total bookings
    total = await db.scalar(select(func.count()).select_from(Booking))

    # Confirmed/Cancelled
    confirmed = await db.scalar(select(func.count()).where(Booking.status == "Confirmed"))
    cancelled  = await db.scalar(select(func.count()).where(Booking.status == "Cancelled"))

    # Providers
    active_providers = await db.scalar(select(func.count()).where(Provider.is_active == True))
    total_providers  = await db.scalar(select(func.count()).select_from(Provider))

    # Revenue estimate: sum all provider prices for each "Confirmed" booking
    # (joined via provider_id string — works for our seeded DB providers)
    # Simpler fallback: count confirmed bookings × average provider price
    avg_price_result = await db.scalar(select(func.avg(Provider.price)))
    avg_price = int(avg_price_result or 1000)
    estimated_revenue = confirmed * avg_price

    # Top 5 services from bookings table
    top_services_result = await db.execute(
        select(Booking.service, func.count(Booking.id).label("count"))
        .where(Booking.service.is_not(None))
        .group_by(Booking.service)
        .order_by(func.count(Booking.id).desc())
        .limit(5)
    )
    top_services = [{"service": row.service, "count": row.count} for row in top_services_result]

    return AdminStats(
        total_bookings=total or 0,
        confirmed_bookings=confirmed or 0,
        cancelled_bookings=cancelled or 0,
        active_providers=active_providers or 0,
        total_providers=total_providers or 0,
        estimated_revenue_pkr=estimated_revenue,
        top_services=top_services
    )
```

---

#### 2b. `GET /v1/admin/bookings`

**What it supports:**
- `?service=plumber` — filter by service type
- `?status=Confirmed` — filter by booking status
- `?skip=0&limit=20` — pagination

```python
@router.get("/bookings", response_model=List[AdminBookingItem])
async def get_admin_bookings(
    service: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(verify_admin)
):
    query = select(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit)
    if service:
        query = query.where(Booking.service == service.lower())
    if status:
        query = query.where(Booking.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())
```

---

#### 2c. `GET /v1/admin/providers/top`

**What it returns:** Top 10 providers ordered by:
1. `booking_count` (bookings where `provider_id` matches) — descending
2. `rating` — descending (tiebreaker)

```python
@router.get("/providers/top", response_model=List[ProviderBookingStats])
async def get_top_providers(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    _=Depends(verify_admin)
):
    # Get all DB providers
    providers_result = await db.execute(
        select(Provider).where(Provider.is_active == True).order_by(Provider.rating.desc())
    )
    providers = providers_result.scalars().all()

    # For each provider, count how many bookings reference it (by provider_id string)
    result = []
    for p in providers:
        count = await db.scalar(
            select(func.count()).where(Booking.provider_id == str(p.id))
        )
        result.append(ProviderBookingStats(
            id=p.id,
            name=p.name,
            service_type=p.service_type,
            area=p.area,
            rating=p.rating,
            price=p.price,
            is_active=p.is_active,
            booking_count=count or 0
        ))

    # Sort by booking_count desc, then rating desc
    result.sort(key=lambda x: (-x.booking_count, -x.rating))
    return result[:limit]
```

---

### 3. Register in `app/main.py`

#### [MODIFY] `app/main.py`
```python
from app.routers import admin
app.include_router(admin.router, prefix="/v1")
```

---

## API Reference Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/admin/stats` | `X-Admin-Key` | Overview stats |
| GET | `/v1/admin/bookings` | `X-Admin-Key` | Filterable booking log |
| GET | `/v1/admin/providers/top` | `X-Admin-Key` | Provider leaderboard |

---

## Verification Plan

### Automated Tests (`tests/test_task17.py`)
1. **Stats test (no auth):** `GET /v1/admin/stats` without header → assert `403 Forbidden`.
2. **Stats test (with auth):** Add `X-Admin-Key: ustadg-admin-secret` → assert `200 OK` with all expected fields.
3. **Booking log test:** `GET /v1/admin/bookings` → assert list returned and pagination works.
4. **Filter test:** `GET /v1/admin/bookings?status=Confirmed` → assert all items have `status == "Confirmed"`.
5. **Top providers test:** `GET /v1/admin/providers/top` → assert list returned with `booking_count` field.

---

## Acceptance Criteria

- [ ] `GET /v1/admin/stats` returns correct totals from real DB data.
- [ ] `GET /v1/admin/bookings` supports `service`, `status`, `skip`, `limit` filters.
- [ ] `GET /v1/admin/providers/top` returns providers sorted by booking_count → rating.
- [ ] All three endpoints return `403 Forbidden` without a valid `X-Admin-Key` header.
- [ ] Tests in `tests/test_task17.py` all pass.

---

*Version: 1.0 | Task: 17 | Project: UstadG | Created: 2026-05-17*
