"""
routers/providers.py — CRUD API for UstadG Providers
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import Settings, get_settings
from app.db.database import get_db
from app.models.provider import Provider
from app.schemas.provider import ProviderOut, ProviderCreate, ProviderUpdate
from app.utils.geocoding import geocode_address

router = APIRouter(tags=["Providers"])


@router.get(
    "/providers",
    response_model=list[ProviderOut],
    summary="List active providers",
    description="Returns active providers filtered by service, city, and area.",
)
async def list_providers(
    service_type: str | None = Query(None, description="e.g. plumber"),
    city: str | None = Query("Karachi", description="Default is Karachi"),
    area: str | None = Query(None, description="e.g. Gulshan"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> list[Provider]:
    query = select(Provider).where(Provider.is_active == True)
    
    if service_type:
        query = query.where(Provider.service_type == service_type.lower())
    if city:
        query = query.where(Provider.city == city)
    if area:
        query = query.where(Provider.area.ilike(f"%{area}%"))
        
    result = await db.execute(
        query.order_by(Provider.rating.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())


@router.get(
    "/providers/{provider_id}",
    response_model=ProviderOut,
    summary="Get single provider",
)
async def get_provider(
    provider_id: int, 
    db: AsyncSession = Depends(get_db)
) -> Provider:
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post(
    "/providers",
    response_model=ProviderOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new provider (Admin)",
)
async def create_provider(
    body: ProviderCreate,
    x_admin_key: str = Header(..., description="Admin Key for Phase 2"),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> Provider:
    # 1. Validate admin key
    if x_admin_key != settings.admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")

    # 2. Duplicate check — Level 1: Phone uniqueness
    if body.phone:
        existing_phone = await db.execute(
            select(Provider).where(Provider.phone == body.phone)
        )
        if existing_phone.scalars().first():
            raise HTTPException(
                status_code=409,
                detail=f"A provider with phone '{body.phone}' is already registered."
            )

    # 2.5 Duplicate check — Level 1.5: Email uniqueness
    if body.email:
        existing_email = await db.execute(
            select(Provider).where(Provider.email == body.email)
        )
        if existing_email.scalars().first():
            raise HTTPException(
                status_code=409,
                detail=f"A provider with email '{body.email}' is already registered."
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

    # 4. Create the provider
    provider_data = body.model_dump()
    
    # 5. Automatically geocode address if coordinates are missing
    if provider_data.get("lat") is None or provider_data.get("lng") is None:
        print(f"[REGISTRATION] Coordinates missing. Geocoding address: '{body.address}, {body.area}, {body.city}'...")
        lat, lng = await geocode_address(body.address, body.area, body.city)
        if lat is not None and lng is not None:
            provider_data["lat"] = lat
            provider_data["lng"] = lng
        else:
            print("[REGISTRATION] Geocoding failed, creating provider without lat/lng coordinates.")

    provider = Provider(**provider_data)
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider


@router.patch(
    "/providers/{provider_id}",
    response_model=ProviderOut,
    summary="Update or deactivate a provider (Admin)",
)
async def update_provider(
    provider_id: int,
    body: ProviderUpdate,
    x_admin_key: str = Header(..., description="Admin Key for Phase 2"),
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
) -> Provider:
    # 1. Validate admin key
    if x_admin_key != settings.admin_key:
        raise HTTPException(status_code=403, detail="Invalid admin key")
        
    # 2. Get provider
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    # 3. Apply updates
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(provider, key, value)
        
    await db.commit()
    await db.refresh(provider)
    return provider
