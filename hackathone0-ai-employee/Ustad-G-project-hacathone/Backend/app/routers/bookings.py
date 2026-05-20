from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingOut
from app.utils.notifications import send_push_notification
from app.utils.scheduler import scheduler
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/bookings", tags=["Bookings History"])

@router.get("", response_model=List[BookingOut])
async def get_bookings(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for the authenticated user (paginated)"""
    result = await db.execute(
        select(Booking)
        .where(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())

@router.get("/{confirmation_id}", response_model=BookingOut)
async def get_booking(
    confirmation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single booking detail by UGK ID"""
    result = await db.execute(
        select(Booking)
        .where(Booking.confirmation_id == confirmation_id)
        .where(Booking.user_id == current_user.id)
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@router.patch("/{confirmation_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    confirmation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel an upcoming booking"""
    result = await db.execute(
        select(Booking)
        .where(Booking.confirmation_id == confirmation_id)
        .where(Booking.user_id == current_user.id)
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
        
    booking.status = "Cancelled"
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    # Remove scheduled reminder (if any)
    try:
        scheduler.remove_job(f"reminder_{confirmation_id}")
        print(f"[SCHEDULER] Cancelled reminder for {confirmation_id}")
    except Exception:
        pass  # Job may not exist

    # Notify user
    try:
        user_result = await db.execute(select(User).where(User.id == booking.user_id))
        user = user_result.scalars().first()
        if user:
            token = getattr(user, "device_token", None) or ""
            await send_push_notification(
                device_token=token,
                title="❌ Booking Cancelled",
                body=f"Your booking {confirmation_id} has been cancelled."
            )
    except Exception as e:
        print(f"[BOOKINGS] Cancel notification error: {e}")

    return booking
