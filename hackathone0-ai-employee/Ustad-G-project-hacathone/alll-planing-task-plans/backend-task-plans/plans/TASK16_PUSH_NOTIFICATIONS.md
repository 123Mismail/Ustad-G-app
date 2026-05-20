# Phase 2 — TASK 16: Push Notifications + Scheduled Reminders

> **Parent:** `PHASE2_TASKS.md` → Task 16
> **Goal:** Notify users instantly on booking confirmation/cancellation, and send a timed reminder 1 hour before their Ustad's scheduled departure via Firebase FCM.
> **Stack:** `firebase-admin` · `apscheduler` · `AsyncIOScheduler` · FastAPI lifespan hook
> **Status:** 🔲 Not Started

---

## Overview

This task introduces two new capabilities into the UstadG backend:

1. **Instant Push Notifications** — triggered immediately when a booking is created (`POST /v1/book`) or cancelled (`PATCH /v1/bookings/{id}/cancel`). Sent via Firebase Cloud Messaging (FCM).

2. **Scheduled Reminders** — after a booking is saved, a background job is queued using `APScheduler` to fire exactly **1 hour before** the `scheduled_at` time. This fires another FCM notification: *"Your Ustad is departing soon!"*

### Reminder Flow
```
User books at 9:00 PM → appointment: tomorrow 10:00 AM
        │
        │  APScheduler schedules a background job
        │  at:  scheduled_at − 1 hour = 9:00 AM
        │
       ⏰ 9:00 AM next day fires:
        └─ Firebase FCM → "⏰ Your Ustad is on the way! Ali Plumber Services — ETA 10:00 AM"
```

---

## Architecture Notes

### Firebase vs Google Cloud Service Account
> **Important:** The existing `service_account.json` is for **Google Cloud** (Sheets + Calendar). Firebase Admin SDK requires a **separate Firebase project service account**.
>
> Two paths forward:
> - **Production Path (Firebase):** Create a Firebase project at `console.firebase.google.com`, enable Cloud Messaging, download `firebase_service_account.json`, and set its path in `.env`.
> - **Development/Demo Path (Dry-Run):** Implement the full notification infrastructure (scheduler, models, endpoints), but if no Firebase service account is configured, log notification payloads to the console instead of sending. This lets us test and demo the full flow without a Firebase project.
>
> **We will implement both** — the notification helper will check for a configured Firebase credential and fall back gracefully to console logging. This makes the feature demostable immediately and production-ready when Firebase is set up.

### APScheduler + FastAPI AsyncIO
`AsyncIOScheduler` from `apscheduler` runs inside the same event loop as FastAPI — no separate threads needed. It is started in the FastAPI `lifespan` startup hook and stopped gracefully on shutdown.

---

## Files to Create / Modify

### Dependencies

#### [MODIFY] `requirements.txt`
```
# ── Notifications & Scheduler ──────────────────────────────────────────────────
firebase-admin>=6.5.0
apscheduler>=3.10.0
```

### 1. User Model — Add `device_token`

#### [MODIFY] `app/models/user.py`
Add one nullable column to the `User` model to store the user's FCM device token:
```python
device_token = Column(String(500), nullable=True)  # Firebase FCM registration token
```
The column is `nullable=True` so existing users are unaffected. SQLAlchemy will add the column automatically via `create_all` on next startup.

### 2. Firebase FCM Notification Helper

#### [NEW] `app/utils/notifications.py`
Core async helper for sending FCM push notifications. Supports two modes:
- **Live mode** (Firebase configured): sends real push via `firebase_admin.messaging`.
- **Dry-run mode** (no Firebase config): logs the notification payload to stdout — no crash, fully testable.

```python
"""
utils/notifications.py — Firebase FCM Push Notification Helper

Dry-run mode: if FIREBASE_CREDENTIALS_PATH is not set or file is missing,
notifications are logged to stdout instead of being sent.
"""
import os
import json
from app.config import get_settings

_firebase_initialized = False

def _get_app():
    """Lazily initialize Firebase Admin SDK (once per process)."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    import firebase_admin
    from firebase_admin import credentials

    settings = get_settings()
    cred_path = settings.firebase_credentials_path
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        print("[FCM] Firebase Admin SDK initialized.")
    else:
        print("[FCM] No Firebase credentials found — running in dry-run mode.")


async def send_push_notification(device_token: str, title: str, body: str) -> bool:
    """
    Send a push notification to a device via Firebase FCM.
    Falls back to console log if Firebase is not configured.

    Returns True if sent successfully (or dry-run), False on error.
    """
    if not device_token:
        print(f"[FCM DRY-RUN] No device_token — would send:\n  Title: {title}\n  Body: {body}")
        return True

    _get_app()

    settings = get_settings()
    cred_path = settings.firebase_credentials_path
    if not cred_path or not os.path.exists(cred_path):
        print(f"[FCM DRY-RUN] Title: {title} | Body: {body}")
        return True

    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=device_token,
        )
        response = messaging.send(message)
        print(f"[FCM] Notification sent: {response}")
        return True
    except Exception as e:
        print(f"[FCM] Error sending notification: {e}")
        return False
```

### 3. APScheduler Background Scheduler

#### [NEW] `app/utils/scheduler.py`
Initializes and exposes the `AsyncIOScheduler` instance. This module is the single source of truth for the scheduler — imported by `main.py` to start/stop it, and by `book.py`/`bookings.py` to schedule jobs.

```python
"""
utils/scheduler.py — APScheduler AsyncIOScheduler

Provides a shared scheduler instance for scheduling background jobs.
Lifecycle: started in main.py lifespan startup, shut down on shutdown.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()
```

#### [MODIFY] `app/main.py`
Wire the scheduler into the FastAPI lifespan hook:
```python
from app.utils.scheduler import scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- startup ---
    scheduler.start()
    print("[STARTUP] APScheduler started.")

    # ... (existing db init and adk warm-start) ...

    yield  # App runs

    # --- shutdown ---
    scheduler.shutdown(wait=False)
    print("[SHUTDOWN] APScheduler stopped.")
```

### 4. User FCM Token Registration Endpoint

#### [MODIFY] `app/routers/users.py`
Add a new endpoint `PATCH /v1/users/me/token` so the mobile app can register its Firebase FCM token with the backend after login:

```python
class TokenUpdate(BaseModel):
    user_phone: str
    device_token: str

@router.patch("/users/me/token", summary="Register device FCM token")
async def register_device_token(
    body: TokenUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Store the user's Firebase FCM device token for push notifications."""
    result = await db.execute(select(User).where(User.phone == body.user_phone))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.device_token = body.device_token
    db.add(user)
    await db.commit()
    return {"message": "Device token registered successfully."}
```

### 5. Instant Notification on Booking Confirmation

#### [MODIFY] `app/routers/book.py`
After the booking is saved to DB, trigger an instant FCM notification. The flow:
1. Look up `user_id=1` (mock) → fetch `device_token` from `users` table.
2. Call `send_push_notification(device_token, title, body)` with the confirmation message.

```python
from app.utils.notifications import send_push_notification
import asyncio

# After: db.add(new_booking); await db.commit()
# Fetch user for device token (async, non-blocking on error)
try:
    from app.models.user import User
    from sqlalchemy import select
    user_result = await db.execute(select(User).where(User.id == 1))
    user = user_result.scalars().first()
    token = getattr(user, "device_token", None)
    await send_push_notification(
        device_token=token or "",
        title="✅ Booking Confirmed!",
        body=f"{confirmation_id} — {provider_name}. Tomorrow 10:00 AM."
    )
except Exception as e:
    print(f"[BOOK] Notification error: {e}")  # Non-blocking: don't fail the booking
```

### 6. Schedule Reminder Job (1 Hour Before Appointment)

#### [MODIFY] `app/routers/book.py`
After firing the instant notification, schedule a **reminder job** in APScheduler for `(scheduled_at - 1 hour)`:

```python
from app.utils.scheduler import scheduler
from datetime import timedelta

reminder_time = new_booking.scheduled_at - timedelta(hours=1)
if reminder_time > datetime.now(timezone.utc):
    scheduler.add_job(
        send_push_notification,
        trigger="date",
        run_date=reminder_time,
        kwargs={
            "device_token": token or "",
            "title": "⏰ Your Ustad is departing soon!",
            "body": f"{provider_name} is heading your way. Appointment at 10:00 AM."
        },
        id=f"reminder_{confirmation_id}",
        replace_existing=True,
    )
    print(f"[SCHEDULER] Reminder queued for {reminder_time} (booking {confirmation_id})")
```

### 7. Cancellation Notification

#### [MODIFY] `app/routers/bookings.py`
After setting `booking.status = "Cancelled"`, fire a notification and also remove any pending reminder from the scheduler:

```python
from app.utils.notifications import send_push_notification
from app.utils.scheduler import scheduler

# After: booking.status = "Cancelled"
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
    token = getattr(user, "device_token", None)
    await send_push_notification(
        device_token=token or "",
        title="❌ Booking Cancelled",
        body=f"Your booking {confirmation_id} has been cancelled."
    )
except Exception as e:
    print(f"[BOOKINGS] Cancel notification error: {e}")
```

---

## `.env` / Config Changes

#### [MODIFY] `app/config.py`
Add one new optional setting:
```python
firebase_credentials_path: str = Field(
    default="",
    description="Path to Firebase service account JSON file for FCM push notifications."
)
```

#### [MODIFY] `.env.example`
```
# ── Firebase FCM Push Notifications ──────────────────────────────────────────
# Download from: Firebase Console → Project Settings → Service Accounts
# Leave empty to run in dry-run mode (logs to console, no real notifications sent)
FIREBASE_CREDENTIALS_PATH=./firebase_service_account.json
```

---

## Verification Plan

### Automated Tests (`tests/test_task16.py`)
1. **Dry-run test**: Call `send_push_notification(device_token="", title="Test", body="Hello")` directly and assert it returns `True` without crashing.
2. **Scheduler test**: Start the `scheduler`, add a test job with `run_date = now + 2s`, sleep 3 seconds, assert the job ran.
3. **Token registration test**: `PATCH /v1/users/me/token` — verify `device_token` is saved to the `users` table.
4. **Booking notification test**: Verify that after a booking is confirmed, `[FCM DRY-RUN]` log lines appear in the output (since no Firebase is configured in dev).
5. **Cancel notification test**: Cancel a booking, verify `[FCM DRY-RUN]` cancel message is logged and the scheduler job is removed.

### Manual Verification (when Firebase is set up)
- Set `FIREBASE_CREDENTIALS_PATH` in `.env` to a real Firebase service account JSON.
- Register a real device token via `PATCH /v1/users/me/token`.
- Make a booking → phone receives "✅ Booking Confirmed!" notification.
- Wait for reminder time (or set `scheduled_at` to `now + 2 mins` in a test) → phone receives "⏰ Your Ustad is departing soon!" notification.

---

## Acceptance Criteria

- [x] `requirements.txt` has `firebase-admin` and `apscheduler`.
- [x] `User` model has `device_token` column.
- [x] `PATCH /v1/users/me/token` saves device token to DB.
- [x] `send_push_notification()` works in both live (Firebase) and dry-run mode.
- [x] `APScheduler` starts on FastAPI startup, stops on shutdown.
- [x] Booking confirmation triggers instant FCM notification.
- [x] Booking confirmation schedules a 1-hour-before reminder.
- [x] Booking cancellation triggers instant FCM notification AND removes pending reminder.
- [x] All flows work without crashing even when Firebase is not configured.

---

*Version: 1.0 | Task: 16 | Project: UstadG | Created: 2026-05-17*
