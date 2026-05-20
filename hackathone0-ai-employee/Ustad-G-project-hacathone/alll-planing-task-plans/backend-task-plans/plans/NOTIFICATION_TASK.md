# Notification Task — Firebase FCM Setup Guide

> **Feature:** Real Push Notifications via Firebase Cloud Messaging (FCM)
> **Current State:** Dry-run mode (logs to console only)
> **Goal:** Enable live push notifications to user mobile devices
> **Related Task:** Task 16 — Push Notifications & Scheduled Reminders

---

## Architecture Overview

```
Mobile App (React Native/Expo)
    |
    | 1. App starts -> registers with FCM -> gets FCM device token
    | 2. PATCH /v1/users/me/token { device_token: "<FCM_TOKEN>" }
    |
FastAPI Backend (UstadG)
    |
    | 3. On booking confirmed:
    |       send_push_notification(device_token, "Booking Confirmed!", "UGK-XXX...")
    |       schedule_reminder(1 hour before appointment)
    |
    | 4. On booking cancelled:
    |       remove_scheduled_reminder()
    |       send_push_notification(device_token, "Booking Cancelled", "UGK-XXX...")
    |
Firebase Cloud Messaging (Google)
    |
    | 5. FCM delivers notification to user's phone
```

---

## Current State: Dry-Run Mode

When `FIREBASE_CREDENTIALS_PATH` is **not set** or the file is **missing**, the system runs in **safe dry-run mode**:

```
[FCM DRY-RUN] No device_token -- would send:
  Title: Booking Confirmed! UGK-TEST-9999
  Body: Ali Plumber Services is scheduled for tomorrow.

[FCM DRY-RUN] Title: Booking Cancelled | Body: UGK-TEST-9999
```

No real notifications are sent. This is the **default for local development**.

---

## Step-by-Step: Enable Live Notifications

### Step 1 -- Create a Firebase Project (Free)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name it `UstadG` (or any name)
4. Disable Google Analytics (not needed for FCM)
5. Click **"Create project"**

---

### Step 2 -- Get Service Account Credentials

1. In Firebase Console, click the **gear icon** (top-left) -> **Project Settings**
2. Click the **"Service Accounts"** tab
3. Select **"Firebase Admin SDK"** -> **Python** (just for reference)
4. Click **"Generate new private key"** -> confirm -> download the `.json` file
5. Save it inside your backend folder:

```
Backend/
  firebase_service_account.json   <-- place it here
  app/
  ...
```

> **IMPORTANT:** Never commit this file to Git! It is already in `.gitignore`.

---

### Step 3 -- Enable Cloud Messaging

1. In Firebase Console -> left sidebar -> **"Build"** -> **"Cloud Messaging"**
2. Confirm it is enabled (it is by default for new projects)

---

### Step 4 -- Update `.env`

Add the path to your downloaded credentials file:

```env
FIREBASE_CREDENTIALS_PATH=./firebase_service_account.json
```

The path is relative to the `Backend/` working directory where uvicorn runs.

---

### Step 5 -- Mobile App Integration (Frontend)

In the React Native / Expo frontend, you need to:

**A) Install dependencies:**
```bash
npx expo install expo-notifications expo-device
```

**B) Register device and get FCM token:**
```javascript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

**C) After user logs in, send token to backend:**
```javascript
const token = await registerForPushNotifications();

if (token) {
  await fetch('http://<YOUR_BACKEND_URL>/v1/users/me/token', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`  // from login response
    },
    body: JSON.stringify({ device_token: token })
  });
}
```

---

## What Gets Triggered Automatically

Once a user has a `device_token` stored:

| Event | Notification Title | Notification Body |
|-------|--------------------|-------------------|
| Booking confirmed | "Booking Confirmed! UGK-XXXX" | "Provider Name is scheduled for [time]." |
| 1 hour before appointment | "Your Ustad is departing soon!" | "Provider Name is heading to you." |
| Booking cancelled | "Booking Cancelled: UGK-XXXX" | "Your booking has been cancelled." |

---

## Backend Code Reference

| File | Purpose |
|------|---------|
| `app/utils/notifications.py` | `send_push_notification(device_token, title, body)` -- FCM sender + dry-run fallback |
| `app/utils/scheduler.py` | `AsyncIOScheduler` for scheduling 1-hour-before reminder jobs |
| `app/routers/book.py` | Triggers confirmation notification + schedules reminder after booking |
| `app/routers/bookings.py` | Triggers cancellation notification + removes scheduled reminder |
| `app/routers/users.py` | `PATCH /v1/users/me/token` -- stores FCM device token per user |
| `app/models/user.py` | `device_token` column on `User` model |

---

## Environment Variables

```env
# Firebase FCM
# Download from: Firebase Console -> Project Settings -> Service Accounts
# Leave empty to run in dry-run mode (logs to console only)
FIREBASE_CREDENTIALS_PATH=./firebase_service_account.json
```

---

## Testing Notifications

Once credentials are set, you can test a notification manually:

```python
# Run from Backend/ directory
import asyncio
from app.utils.notifications import send_push_notification

async def test():
    await send_push_notification(
        device_token="<YOUR_DEVICE_FCM_TOKEN>",
        title="Test Notification",
        body="UstadG push notifications are working!"
    )

asyncio.run(test())
```

---

## Production Checklist

- [ ] Firebase project created
- [ ] Service account JSON downloaded and placed at `FIREBASE_CREDENTIALS_PATH`
- [ ] `.env` updated with `FIREBASE_CREDENTIALS_PATH`
- [ ] Mobile app registers device token on startup after login
- [ ] Mobile app calls `PATCH /v1/users/me/token` with the FCM token
- [ ] Test a booking flow end-to-end and confirm notification arrives on phone

---

*Version: 1.0 | Feature: Push Notifications | Project: UstadG | Created: 2026-05-18*
