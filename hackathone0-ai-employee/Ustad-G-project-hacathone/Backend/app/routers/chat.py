"""
routers/chat.py — POST /v1/chat

Connects the FastAPI chat endpoint to the Google ADK agent pipeline.
Session history is managed automatically by ADK InMemorySessionService.
"""

from fastapi import APIRouter, Depends
from app.schemas.chat import ChatRequest, ChatResponse
from app.config import Settings, get_settings
from app.agents.orchestrator import run_ustadg_swarm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(tags=["Agent"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the UstadG agent pipeline",
    description=(
        "Primary entry point. Runs Triage → Discovery → Negotiation → Booking agents. "
        "Session history is automatically maintained per session_id by Google ADK."
    ),
)
async def chat(
    request: ChatRequest,
    settings: Settings = Depends(get_settings),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    """
    Runs the Google ADK agent swarm for a given user message and session.
    ADK InMemorySessionService handles conversation history — no SESSION_STORE needed.
    """
    try:
        result = await run_ustadg_swarm(
            session_id=request.session_id,
            message=request.message,
            user_phone=request.user_phone or current_user.phone,
        )

        reply = result.get("reply", "I'm sorry, I couldn't process that.")

        # ── INTERCEPT AGENT CONFIRMATION & PERSIST TO SQL NEON DB ──
        is_booking_agent = result.get("agent") == "BookingAgent"
        is_booking_phrase = "booking confirmed" in reply.lower() or "ugk-" in reply.lower() or "بکنگ" in reply or "تصدیق" in reply or "شکریہ" in reply
        if is_booking_agent or is_booking_phrase:
            import re
            from app.models.booking import Booking
            from app.utils.notifications import send_push_notification
            from app.utils.scheduler import scheduler
            from datetime import datetime, timedelta, timezone

            # Extract UGK ID using regex
            ugk_match = re.search(r"UGK-\d{4}-\d{4}", reply)
            confirmation_id = ugk_match.group(0) if ugk_match else None

            if not confirmation_id:
                import random
                year = datetime.now(timezone.utc).year
                rand_num = random.randint(1000, 9999)
                confirmation_id = f"UGK-{year}-{rand_num}"
                if any(x in reply for x in ["بکنگ", "شکریہ", "آپ کی"]):
                    reply += f"\n\nبکنگ نمبر: {confirmation_id}"
                else:
                    reply += f"\n\nConfirmation ID: {confirmation_id}"

            if confirmation_id:
                # Check if this booking is already saved in SQL DB to avoid double saving
                from sqlalchemy import select
                existing_check = await db.execute(
                    select(Booking).where(Booking.confirmation_id == confirmation_id)
                )
                if not existing_check.scalars().first():
                    # Try to extract the provider name from the reply
                    provider_name = "Selected Provider"
                    provider_match = re.search(r"Provider:\s*([^\n\r]+)", reply, re.IGNORECASE)
                    if provider_match:
                        provider_name = provider_match.group(1).strip()

                    # Extract service type
                    service_name = "General"
                    service_match = re.search(r"Service:\s*([^\n\r]+)", reply, re.IGNORECASE)
                    if service_match:
                        service_name = service_match.group(1).strip()

                    # Save to Postgres Neon database
                    scheduled_time = datetime.now(timezone.utc) + timedelta(days=1)  # Mocking tomorrow
                    
                    # Parse time from reply/request message if present (e.g. 12:50 or 12 50)
                    time_match = re.search(r"(\d{1,2})[\s:-](\d{2})\s*(AM|PM)?", reply + " " + request.message, re.IGNORECASE)
                    if time_match:
                        try:
                            hour = int(time_match.group(1))
                            minute = int(time_match.group(2))
                            is_pm = time_match.group(3) and time_match.group(3).upper() == "PM"
                            if is_pm and hour < 12:
                                hour += 12
                            elif not is_pm and hour == 12:
                                hour = 0
                            
                            # Check if user specified "today" vs "tomorrow"
                            is_tomorrow = "tomorrow" in (reply + " " + request.message).lower()
                            
                            pkt_tz = timezone(timedelta(hours=5))
                            pkt_now = datetime.now(pkt_tz)
                            scheduled_pkt = pkt_now.replace(hour=hour, minute=minute, second=0, microsecond=0)
                            if is_tomorrow:
                                scheduled_pkt += timedelta(days=1)
                            elif scheduled_pkt < pkt_now - timedelta(minutes=5):
                                # If time has passed today, assume tomorrow
                                scheduled_pkt += timedelta(days=1)
                                
                            scheduled_time = scheduled_pkt.astimezone(timezone.utc)
                            print(f"[CHAT INTERCEPT] Parsed scheduled time: {scheduled_pkt} PKT -> {scheduled_time} UTC")
                        except Exception as parse_err:
                            print(f"[CHAT INTERCEPT] Error parsing time: {parse_err}")

                    new_booking = Booking(
                        confirmation_id=confirmation_id,
                        user_id=current_user.id,
                        provider_id=provider_name,  # Place ID or name
                        service=service_name,
                        scheduled_at=scheduled_time,
                        status="Confirmed"
                    )
                    db.add(new_booking)
                    await db.commit()
                    print(f"[CHAT INTERCEPT] Successfully saved booking {confirmation_id} to SQL Neon DB!")

                    # Format dynamic local time for notifications
                    pkt_tz = timezone(timedelta(hours=5))
                    scheduled_local = scheduled_time.astimezone(pkt_tz)
                    time_str = scheduled_local.strftime('%I:%M %p')

                    # ── NOTIFY THE PROVIDER (BETA SMS LOG) ──
                    try:
                        from sqlalchemy import select
                        from app.models.provider import Provider
                        provider_q = await db.execute(
                            select(Provider).where(Provider.name == provider_name)
                        )
                        db_provider = provider_q.scalars().first()

                        if db_provider:
                            sms_alert = (
                                f"\n--------------------------------------------------\n"
                                f"📢 [BETA] [SMS PROVIDER ALERT] Sent to {db_provider.phone}:\n"
                                f"Dear Ustad {db_provider.name},\n"
                                f"You have a new booking {confirmation_id} for {service_name} services.\n"
                                f"Customer: {current_user.name} ({current_user.phone})\n"
                                f"Location: {current_user.area}, {current_user.city}\n"
                                f"Scheduled Time: {time_str}\n"
                                f"Please arrive on time.\n"
                                f"--------------------------------------------------\n"
                            )
                            print(sms_alert)
                    except Exception as prov_err:
                        print(f"[CHAT INTERCEPT] Provider lookup failed: {prov_err}")

                    # Trigger instant FCM notification!
                    try:
                        token = getattr(current_user, "device_token", None) or ""
                        await send_push_notification(
                            device_token=token,
                            title="✅ Booking Confirmed!",
                            body=f"{confirmation_id} — {provider_name}. Scheduled for {time_str}."
                        )
                    except Exception as e:
                        print(f"[CHAT INTERCEPT] Push error: {e}")

                    # Schedule Reminder Job (1 Minute Before)
                    try:
                        reminder_time = scheduled_time - timedelta(minutes=1)
                        # If the calculated reminder time has already passed (or is too close),
                        # schedule it to run in 5 seconds so it executes instantly for testing!
                        if reminder_time <= datetime.now(timezone.utc):
                            reminder_time = datetime.now(timezone.utc) + timedelta(seconds=5)
                            
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
                        print(f"[CHAT INTERCEPT] Reminder queued for {reminder_time} (booking {confirmation_id})")

                    except Exception as e:
                        print(f"[CHAT INTERCEPT] Scheduler error: {e}")

        return ChatResponse(
            session_id=request.session_id,
            reply=reply,
            providers=result.get("providers"),  # Now populated from tool calls
            trace_steps=None,  # Populated in Phase 2 from ADK event stream
        )

    except Exception as e:
        error_msg = str(e)
        print(f"[CHAT_ROUTER] Error: {error_msg}")
        
        # Gracefully handle Gemini Free Tier Rate Limits (429)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            friendly_reply = (
                "معذرت، اس وقت سسٹم پر بہت زیادہ بوجھ ہے۔ براہ کرم 30 سیکنڈ بعد دوبارہ کوشش کریں۔\n\n"
                "(The system is currently experiencing high traffic. Please try again in 30 seconds.)"
            )
            return ChatResponse(
                session_id=request.session_id,
                reply=friendly_reply,
                providers=None,
                trace_steps=None,
            )
            
        return ChatResponse(
            session_id=request.session_id,
            reply=f"An error occurred: {error_msg}",
            providers=None,
            trace_steps=None,
        )
