# Phase 2 — TASK 10: Provider Database (SQLAlchemy + SQLite)
> **Parent:** `PHASE2_TASKS.md` → Task 10
> **Goal:** Build the provider database layer — the core UstadG value proposition. Own a roster of registered, vetted ustads instead of relying entirely on Google Maps public listings.
> **Status:** 🔲 Not Started

---

## Overview

This task introduces SQLAlchemy (async) + SQLite as the persistence layer for the Provider model. It:
1. Wires the DB engine into FastAPI's dependency injection system.
2. Defines the `Provider` table with all fields needed for search, distance sorting, and profile display.
3. Seeds 10 realistic mock providers across Karachi for immediate testing.
4. Initializes the DB automatically on app startup via the existing `lifespan` hook in `main.py`.

No agent or MCP changes in this task — pure data layer setup.

---

## Files to Create / Modify

### [NEW] `app/db/__init__.py`
Empty init file to make `db` a proper Python package.

### [NEW] `app/db/database.py`
Async SQLAlchemy engine, session factory, and `get_db()` FastAPI dependency.

```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "sqlite+aiosqlite:///./ustadg.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
```

### [NEW] `app/models/__init__.py`
Empty init file.

### [NEW] `app/models/provider.py`
SQLAlchemy `Provider` ORM model.

```python
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Provider(Base):
    __tablename__ = "providers"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(200), nullable=False)
    phone         = Column(String(20), nullable=True)
    service_type  = Column(String(100), nullable=False, index=True)  # "plumber", "electrician"
    city          = Column(String(100), nullable=False, index=True)  # "Karachi"
    area          = Column(String(100), nullable=False, index=True)  # "Gulshan-e-Iqbal"
    address       = Column(String(500), nullable=False)
    lat           = Column(Float, nullable=True)   # from Google Geocoding (one-time at registration)
    lng           = Column(Float, nullable=True)
    rating        = Column(Float, default=4.0)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
```

**Field notes:**
- `service_type`: lowercase slug (`"plumber"`, `"electrician"`, `"carpenter"`) — indexed for fast filtering.
- `city` + `area`: indexed for fast filtering by location.
- `lat` / `lng`: stored at registration via Google Geocoding (one-time call). Used for Haversine distance sort at query time — no API call needed per search.
- `rating`: float average (0.0–5.0). Seeded with realistic values. Will be updated by Task 14 (ratings) in future.

### [NEW] `app/db/init_db.py`
Creates all tables and seeds 10 mock providers with realistic Karachi data.

```python
from app.db.database import engine, Base
from app.models.provider import Provider
# ... seed data with 10 providers across Karachi services & areas
```

**Seed providers (10 entries):**

| Name | Service | Area | Rating | Lat/Lng |
|------|---------|------|--------|---------|
| Ali Plumber Services | plumber | Gulshan-e-Iqbal | 4.8 | 24.9215, 67.0927 |
| Karachi Plumbing Pros | plumber | DHA Phase 6 | 4.5 | 24.8141, 67.0782 |
| Ahmed Electrician | electrician | Gulshan-e-Iqbal | 4.7 | 24.9230, 67.0910 |
| Fast Fix Electric | electrician | North Nazimabad | 4.3 | 24.9480, 67.0320 |
| Master Carpenter Bashir | carpenter | Clifton | 4.6 | 24.8100, 67.0250 |
| Karachi Woodwork Studio | carpenter | DHA Phase 4 | 4.4 | 24.8223, 67.0650 |
| SparkClean Home Services | cleaner | Gulshan-e-Iqbal | 4.9 | 24.9200, 67.0880 |
| ProPaint Karachi | painter | PECHS | 4.2 | 24.8650, 67.0600 |
| Hassan AC Repair | ac_repair | Nazimabad | 4.5 | 24.9380, 67.0250 |
| Karachi AC Solutions | ac_repair | Gulshan-e-Iqbal | 4.8 | 24.9240, 67.0935 |

### [MODIFY] `requirements.txt`
Add two lines under the `# Utilities` section:
```
sqlalchemy>=2.0.0
aiosqlite>=0.20.0
```

### [MODIFY] `app/main.py`
Add DB init call in the `lifespan` startup block (after existing ADK Runner init):
```python
from app.db.init_db import init_db
await init_db()
print("[STARTUP] Database initialized and seeded.")
```

---

## Acceptance Criteria

- [ ] `ustadg.db` file is created automatically when the server starts.
- [ ] `providers` table exists with all 10 seeded mock providers.
- [ ] `get_db()` dependency works in any router via `Depends(get_db)`.
- [ ] App starts cleanly without errors after changes: `uvicorn app.main:app --reload`
- [ ] Can query providers via raw SQLAlchemy in a test script.

---

## Notes

- SQLite is used for Phase 2 development. Migration to PostgreSQL for production (Phase 3) requires changing only the `DATABASE_URL` string.
- `aiosqlite` is the async driver for SQLite — required by SQLAlchemy's async engine.
- No agent or MCP changes in this task — that is handled in Task 12.
- The `providers.py` router (currently a stub) will be wired to this DB in Task 11.
