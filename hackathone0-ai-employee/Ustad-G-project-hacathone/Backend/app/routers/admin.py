from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List

from app.db.database import get_db
from app.config import get_settings
from app.models.booking import Booking
from app.models.provider import Provider
from app.schemas.admin import AdminStats, AdminBookingItem, ProviderBookingStats

router = APIRouter(prefix="/admin", tags=["Admin Analytics"])

def verify_admin(x_admin_key: str | None = Header(default=None)):
    """Dependency to authenticate admin requests via API key."""
    settings = get_settings()
    if not x_admin_key or x_admin_key != settings.admin_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid admin key")

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

    # Revenue estimate
    avg_price_result = await db.scalar(select(func.avg(Provider.price)))
    avg_price = int(avg_price_result or 1000)
    estimated_revenue = (confirmed or 0) * avg_price

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

@router.get("/bookings", response_model=List[AdminBookingItem])
async def get_admin_bookings(
    service: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _=Depends(verify_admin)
):
    try:
        query = select(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit)
        if service:
            query = query.where(Booking.service == service.lower())
        if status:
            query = query.where(Booking.status == status)
        result = await db.execute(query)
        return list(result.scalars().all())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
