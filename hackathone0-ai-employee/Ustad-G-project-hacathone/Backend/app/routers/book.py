import re
import os
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.booking import BookRequest, BookResponse
from app.config import Settings, get_settings
from app.agents.orchestrator import run_ustadg_swarm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.booking import Booking
from app.models.user import User
from sqlalchemy import select
from app.utils.notifications import send_push_notification
from app.utils.scheduler import scheduler
from app.dependencies.auth import get_current_user
from datetime import datetime, timedelta, timezone
import asyncio

router = APIRouter(tags=["Booking"])


@router.post(
    "/",
    response_model=BookResponse,
    summary="Confirm a booking for a selected provider",
    description="Triggers the Booking Agent or manual record. Returns a UGK-YYYY-XXXX confirmation ID.",
)
async def book(
    request: BookRequest,
    settings: Settings = Depends(get_settings),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookResponse:
    """
    Runs the agent swarm with a direct booking confirmation instruction or records manually.
    """
    try:
        user_name = request.user_name if request.user_name != "Guest" else current_user.name
        confirmation_id = f"UGK-{datetime.now().year}-{os.urandom(2).hex().upper()}"
        reply = f"Manual Booking Created! ID: {confirmation_id}"
        provider_name = request.provider_id

        # 1. Swarm Path (if session_id present)
        if request.session_id:
            booking_instruction = (
                f"I want to book the provider '{request.provider_id}' directly. "
                f"My name is '{user_name}'. Please confirm the booking. "
                f"Generate a unique UGK ID (e.g. UGK-2026-1234), call both google_sheets_record_booking "
                f"and google_calendar_create_appointment tools, and provide the confirmation."
            )

            result = await run_ustadg_swarm(
                session_id=request.session_id,
                message=booking_instruction,
            )
            reply = result.get("reply", "")
            
            # Extract UGK ID from swarm reply
            ugk_match = re.search(r"UGK-\d{4}-[\dA-F]{4}", reply)
            if ugk_match:
                confirmation_id = ugk_match.group(0)
            
            # Extract Provider Name from swarm reply
            provider_match = re.search(r"Provider:\s*([^\n\r]+)", reply, re.IGNORECASE)
            if provider_match:
                provider_name = provider_match.group(1).strip()

        # 2. Time Logic
        scheduled_time = request.scheduled_at
        if not scheduled_time:
            scheduled_time = datetime.now(timezone.utc) + timedelta(days=1)
            # Try to parse time from reply if it exists
            time_match = re.search(r"(\d{1,2})[\s:-](\d{2})\s*(AM|PM)?", reply, re.IGNORECASE)
            if time_match:
                try:
                    hour = int(time_match.group(1))
                    minute = int(time_match.group(2))
                    if time_match.group(3) and time_match.group(3).upper() == "PM" and hour < 12: hour += 12
                    elif time_match.group(3) and time_match.group(3).upper() == "AM" and hour == 12: hour = 0
                    scheduled_time = datetime.now(timezone.utc).replace(hour=hour, minute=minute, second=0, microsecond=0)
                except: pass

        # 3. Save to DB
        new_booking = Booking(
            confirmation_id=confirmation_id,
            user_id=current_user.id,
            provider_id=request.provider_id,
            service=request.service or "General",
            scheduled_at=scheduled_time,
            status="Confirmed"
        )
        db.add(new_booking)
        await db.commit()

        # 4. Notifications & Reminders
        pkt_tz = timezone(timedelta(hours=5))
        time_str = scheduled_time.astimezone(pkt_tz).strftime('%I:%M %p')
        token = getattr(current_user, "device_token", None) or ""

        try:
            await send_push_notification(
                device_token=token,
                title="✅ Booking Confirmed!",
                body=f"{confirmation_id} — {provider_name}. Scheduled for {time_str}."
            )
        except: pass

        try:
            reminder_time = scheduled_time - timedelta(minutes=1)
            if reminder_time <= datetime.now(timezone.utc):
                reminder_time = datetime.now(timezone.utc) + timedelta(seconds=60)
                
            scheduler.add_job(
                send_push_notification,
                trigger="date",
                run_date=reminder_time,
                kwargs={
                    "device_token": token,
                    "title": "⏰ Your Ustad is departing soon!",
                    "body": f"{provider_name} is heading your way. Appointment at {time_str}."
                },
                id=f"reminder_{confirmation_id}",
                replace_existing=True,
            )
        except: pass

        return BookResponse(
            confirmation_id=confirmation_id,
            status="Confirmed",
            message=reply,
            provider_name=provider_name
        )

    except Exception as e:
        print(f"[BOOK_ROUTER] Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during booking: {str(e)}"
        )
