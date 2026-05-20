# Phase 2 — TASK 11: Provider CRUD API
> **Parent:** `PHASE2_TASKS.md` → Task 11
> **Goal:** Replace the existing stub `GET /v1/providers` with a real, database-backed API. Add `POST` and `PATCH` endpoints for admin management of the provider roster.
> **Status:** 🔲 Not Started
> **Depends On:** Task 10 (Provider DB + `Provider` ORM model) ✅

---

## Overview

This task wires the `Provider` SQLAlchemy model (Task 10) into a proper REST API. The existing `providers.py` stub currently returns a `501 Not Implemented` — we will completely replace it with real async DB queries.

**3 endpoints total:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/v1/providers` | Public | List providers filtered by `service_type`, `city`, `area` |
| `GET` | `/v1/providers/{id}` | Public | Get a single provider profile by ID |
| `POST` | `/v1/providers` | Admin (header flag for now) | Register a new provider |
| `PATCH` | `/v1/providers/{id}` | Admin (header flag for now) | Update or deactivate a provider |

> **Note on Auth:** Real JWT auth is Task 13. For Task 11, we protect `POST` and `PATCH` with a simple `X-Admin-Key` header check using a value from `.env`. This keeps Task 11 self-contained.

---

## Files to Create / Modify

### [NEW] `app/schemas/provider.py`
Pydantic models for request/response validation.

```python
class ProviderOut(BaseModel):
    id: int
    name: str
    service_type: str
    city: str
    area: str
    address: str
    lat: float | None
    lng: float | None
    rating: float
    is_active: bool
    created_at: datetime

class ProviderCreate(BaseModel):
    name: str
    phone: str | None = None
    service_type: str       # "plumber", "electrician", etc.
    city: str
    area: str
    address: str
    lat: float | None = None
    lng: float | None = None
    rating: float = 4.0

class ProviderUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    area: str | None = None
    address: str | None = None
    rating: float | None = None
    is_active: bool | None = None
```

All fields optional in `ProviderUpdate` so the caller only sends what they want to change (standard PATCH pattern).

### [MODIFY] `app/routers/providers.py`
Replace the 501 stub entirely with 4 real endpoints.

**`GET /v1/providers`** — list with optional filters:
```python
@router.get("/providers", response_model=list[ProviderOut])
async def list_providers(
    service_type: str | None = Query(None),
    city: str | None = Query(None, default="Karachi"),
    area: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Provider).where(Provider.is_active == True)
    if service_type:
        query = query.where(Provider.service_type == service_type.lower())
    if city:
        query = query.where(Provider.city == city)
    if area:
        query = query.where(Provider.area.ilike(f"%{area}%"))
    result = await db.execute(query.order_by(Provider.rating.desc()))
    return result.scalars().all()
```

**`GET /v1/providers/{id}`** — single provider:
```python
@router.get("/providers/{provider_id}", response_model=ProviderOut)
async def get_provider(provider_id: int, db: AsyncSession = Depends(get_db)):
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider
```

**`POST /v1/providers`** — create (admin-key protected, with duplicate detection):
```python
@router.post("/providers", response_model=ProviderOut, status_code=201)
async def create_provider(
    body: ProviderCreate,
    x_admin_key: str = Header(...),
    db: AsyncSession = Depends(get_db),
):
    # 1. Validate admin key
    if x_admin_key != settings.admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    # 2. Duplicate check — Level 1: Phone uniqueness (if phone provided)
    if body.phone:
        existing_phone = await db.execute(
            select(Provider).where(Provider.phone == body.phone)
        )
        if existing_phone.scalars().first():
            raise HTTPException(
                status_code=409,
                detail=f"A provider with phone '{body.phone}' is already registered."
            )

    # 3. Duplicate check — Level 2: Name + Area + Service combo
    existing_combo = await db.execute(
        select(Provider).where(
            Provider.name == body.name,
            Provider.area == body.area,
            Provider.service_type == body.service_type.lower(),
        )
    )
    if existing_combo.scalars().first():
        raise HTTPException(
            status_code=409,
            detail=f"Provider '{body.name}' already registered in '{body.area}' for service '{body.service_type}'."
        )

    # 4. All clear — create the provider
    provider = Provider(**body.model_dump())
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider
```

**Error responses for duplicate detection:**
- `409 Conflict` with clear message if phone already exists.
- `409 Conflict` with clear message if same name + area + service already exists.
- Admin can still re-register a **deactivated** provider — we only check against all records regardless of `is_active` status (deactivated ≠ deleted).

**`PATCH /v1/providers/{id}`** — update (admin-key protected):
```python
@router.patch("/providers/{provider_id}", response_model=ProviderOut)
async def update_provider(...):
    # Apply only the fields that were sent
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(provider, key, value)
    await db.commit()
    return provider
```

### [MODIFY] `app/config.py`
Add one new setting:
```python
admin_key: str = "ustadg-admin-secret"  # Override in .env as ADMIN_KEY
```

### [MODIFY] `Backend/.env`
Add:
```
ADMIN_KEY=ustadg-admin-2026
```

---

## Acceptance Criteria

- [ ] `GET /v1/providers` returns all 10 seeded providers (no filters)
- [ ] `GET /v1/providers?service_type=plumber` returns only the 2 plumbers
- [ ] `GET /v1/providers?area=Gulshan` returns providers in Gulshan (case-insensitive)
- [ ] `GET /v1/providers/1` returns Ali Plumber Services
- [ ] `GET /v1/providers/999` returns `404 Not Found`
- [ ] `POST /v1/providers` with valid `X-Admin-Key` creates a new provider
- [ ] `POST /v1/providers` with wrong/missing `X-Admin-Key` returns `403 Forbidden`
- [ ] `POST /v1/providers` with duplicate phone returns `409 Conflict`
- [ ] `POST /v1/providers` with same name + area + service returns `409 Conflict`
- [ ] `POST /v1/providers` with unique data registers successfully
- [ ] `PATCH /v1/providers/1` with `{"is_active": false}` deactivates the provider
- [ ] Deactivated provider no longer appears in `GET /v1/providers` list

---

## Notes

- Ordering in `GET /v1/providers`: sorted by `rating DESC` by default. Distance-based sorting will come in Task 12 when the agent uses Haversine.
- `service_type` filter uses exact lowercase match (`plumber` not `Plumber`). The frontend should send lowercase or we normalize it in the query with `.lower()`.
- `area` filter uses `ILIKE` (case-insensitive LIKE) to allow partial matches — e.g., `"Gulshan"` matches `"Gulshan-e-Iqbal"`.
- `POST/PATCH` use a simple `X-Admin-Key` header for now. Task 13 replaces this with real JWT role checks.
- **Duplicate detection checks ALL records regardless of `is_active`** — a deactivated provider is NOT a free slot. This prevents ghost duplicates where someone deactivates then re-registers as a new entry.
- **Deactivation vs Deletion:** Providers are never deleted from the DB. `PATCH /v1/providers/{id}` with `{"is_active": false}` is the correct way to remove them from search results while preserving their history.
