# UstadG — Frontend ↔ Backend Integration Plan

> **Document Type:** Architecture & Integration Design  
> **Stack:** React Native (Expo) ↔ FastAPI (Python) + Neon PostgreSQL + Google ADK  
> **Backend URL (Local):** `http://localhost:8002`  
> **Backend URL (Production):** Google Cloud Run (TBD)  
> **Updated:** 2026-05-18

---

## 1. Overview

The UstadG frontend is a React Native (Expo) app currently running entirely on **mock/hardcoded data**. The backend is a **fully functional FastAPI service** backed by Neon PostgreSQL, JWT authentication, and a Google ADK AI agent swarm.

The goal of this integration phase is to **wire every screen to its real API endpoint**, replace all mock data files, add real authentication, and configure the app for both local development and production deployment.

---

## 2. Current State Audit

### 2.1 Frontend — What Is Mocked Today

| Screen | Mock Data Source | Real API Needed |
|--------|-----------------|-----------------|
| `ChatScreen.js` | No API call, static layout | `POST /v1/chat` |
| `ResultsScreen.js` | `MOCK_PROVIDERS` hardcoded in file | `GET /v1/providers` |
| `ConfirmationScreen.js` | `booking = { id: 'UGK-2026-1234', ... }` | `POST /v1/book` |
| `AnalyticsScreen.js` | `MOCK_REVENUE_DATA` hardcoded | `GET /v1/admin/stats` |
| `ProfileScreen.js` | No real user, toggle only | Auth context + user data |
| `NotificationScreen.js` | `mockNotifications.js` | Firebase FCM |
| `AgentTraceScreen.js` | Static trace UI | `GET /v1/trace/{session_id}` |

### 2.2 Backend — What Is Already Ready

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/v1/auth/register` | POST | None | ✅ Live |
| `/v1/auth/login` | POST | None | ✅ Live |
| `/v1/chat` | POST | JWT | ✅ Live |
| `/v1/book` | POST | JWT | ✅ Live |
| `/v1/providers` | GET | None | ✅ Live |
| `/v1/providers/{id}` | GET | None | ✅ Live |
| `/v1/bookings` | GET | JWT | ✅ Live |
| `/v1/bookings/{id}/cancel` | PATCH | JWT | ✅ Live |
| `/v1/admin/stats` | GET | Admin Key | ✅ Live |
| `/v1/admin/bookings` | GET | Admin Key | ✅ Live |
| `/v1/admin/providers/top` | GET | Admin Key | ✅ Live |
| `/v1/users/me/token` | PATCH | JWT | ✅ Live |
| `/v1/health` | GET | None | ✅ Live |

---

## 3. Local Development Connection

### 3.1 How Local Connectivity Works

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
│                                                             │
│  ┌──────────────────┐        HTTP/REST        ┌──────────┐ │
│  │  Expo App        │ ──────────────────────► │ FastAPI  │ │
│  │  (React Native)  │                         │ :8002    │ │
│  │                  │ ◄────────────────────── │          │ │
│  └──────────────────┘       JSON Response     └────┬─────┘ │
│                                                    │       │
│  Device Type Matters:                              │       │
│  • Android Emulator → 10.0.2.2:8002               ▼       │
│  • iOS Simulator   → localhost:8002          Neon PG       │
│  • Physical Device → 192.168.x.x:8002       (Cloud)        │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 CORS — Already Configured
The backend `.env` has `CORS_ORIGINS=*` — all origins are allowed in development. ✅

### 3.3 Environment Config File
```js
// frontend/config/env.js
const LOCAL_ANDROID_EMULATOR = 'http://10.0.2.2:8002';
const LOCAL_IOS_SIMULATOR    = 'http://localhost:8002';
const LOCAL_PHYSICAL_DEVICE  = 'http://192.168.x.x:8002'; // Replace with your machine's IP

export const API_BASE_URL = __DEV__
  ? LOCAL_ANDROID_EMULATOR  // Change this based on your test device
  : 'https://ustadg-api-XXXXX.run.app'; // Production URL
```

### 3.4 Starting the Stack Locally
```bash
# Terminal 1 — Backend
cd Backend
.venv\Scripts\python.exe -m uvicorn app.main:app --port 8002 --reload

# Terminal 2 — Frontend  
cd frontend
npx expo start
```

### 3.5 Verify Connection
```bash
# From your dev machine:
curl http://localhost:8002/v1/health

# Expected:
# { "status": "ok", "services": { "gemini": "ok", "mcp_server": "ok" } }
```

---

## 4. Production Architecture

### 4.1 Production Connection Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      PRODUCTION                                  │
│                                                                  │
│  ┌──────────────────┐    HTTPS/443     ┌────────────────────┐   │
│  │  Expo App        │ ──────────────► │ Google Cloud Run   │   │
│  │  (APK / IPA)     │                 │ ustadg-api.run.app  │   │
│  │                  │ ◄────────────── │ FastAPI + Gunicorn  │   │
│  └──────────┬───────┘   JSON Response └────────┬───────────┘   │
│             │                                   │               │
│             │ FCM Push                          ▼               │
│             │ Notifications             ┌──────────────┐        │
│             ▼                           │ Neon PG      │        │
│  ┌──────────────────┐                  │ (Cloud DB)   │        │
│  │ Firebase Cloud   │                  └──────────────┘        │
│  │ Messaging (FCM)  │                                           │
│  └──────────────────┘                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Production Environment Variables (Cloud Run)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...neon.tech/neondb?sslmode=require` |
| `GEMINI_API_KEY` | From Google AI Studio |
| `JWT_SECRET` | Strong random 64-char string |
| `ADMIN_KEY` | Strong random key |
| `FIREBASE_CREDENTIALS_PATH` | `/app/firebase_service_account.json` |
| `CORS_ORIGINS` | `https://your-expo-domain.com,exp://...` |
| `APP_ENV` | `production` |

### 4.3 CORS for Production
In production, restrict `CORS_ORIGINS` to your actual Expo/app domain:
```env
CORS_ORIGINS=https://ustadg.app,https://api.ustadg.app
```

---

## 5. API Client Architecture

### 5.1 File Structure (New Files to Create)

```
frontend/
├── config/
│   └── env.js                   ← Base URL config (local vs prod)
├── services/
│   ├── api.js                   ← Axios instance + interceptors
│   ├── auth.service.js          ← register(), login()
│   ├── providers.service.js     ← getProviders(), getProvider()
│   ├── bookings.service.js      ← createBooking(), getBookings(), cancel()
│   ├── chat.service.js          ← sendMessage()
│   └── admin.service.js         ← getStats(), getBookings(), getTopProviders()
├── context/
│   └── AuthContext.js           ← Global auth state (user, token, login, logout)
├── utils/
│   ├── tokenStorage.js          ← SecureStore wrapper (saveToken, getToken, clear)
│   └── notifications.js         ← FCM token registration
├── screens/
│   ├── LoginScreen.js           ← NEW: Phone + password login
│   └── RegisterScreen.js        ← NEW: Registration form
└── navigation/
    └── AuthNavigator.js         ← NEW: Shown when not logged in
```

### 5.2 Axios Instance Pattern

```js
// services/api.js
import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { getToken, clearToken } from '../utils/tokenStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await clearToken();
      // Trigger navigation reset to Login (via AuthContext)
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## 6. Screen-by-Screen Integration Map

### 6.1 ChatScreen → Agent Flow

```
User types → AIChatCard
     ↓
POST /v1/chat  { session_id, message }
     ↓
ADK Agent response (Urdu/English reply)
     ↓
Display reply + extract provider list
     ↓ (if booking intent detected)
Navigate → ResultsScreen  { providers: [...], query }
```

### 6.2 ResultsScreen → Provider Selection

```
GET /v1/providers?service_type=plumber&city=Karachi
     ↓
Map ProviderOut → ProviderCard props
     ↓
User selects provider
     ↓
Navigate → ConfirmationScreen { provider, service, scheduledAt }
```

### 6.3 ConfirmationScreen → Booking

```
POST /v1/book  { provider_id, service, scheduled_at }
Authorization: Bearer <token>
     ↓
Response: { confirmation_id: "UGK-2026-XXXX", ... }
     ↓
Display real confirmation_id
FCM notification triggered by backend automatically
```

### 6.4 AnalyticsScreen → Admin Stats

```
(Only visible for admin users)
GET /v1/admin/stats
X-Admin-Key: <admin_key>
     ↓
{ total_bookings, active_providers, estimated_revenue_pkr, top_services }
     ↓
Replace MOCK_REVENUE_DATA → real top_services chart
```

---

## 7. Authentication Flow

### 7.1 Registration + Login Sequence

```
App Start
    ↓
AuthContext checks SecureStore for token
    ├── Token exists & valid → Show Dashboard
    └── No token / expired  → Show LoginScreen

LoginScreen
    ↓
POST /v1/auth/login { phone, password }
    ↓
{ access_token, token_type, user }
    ↓
Save token to SecureStore
Set user in AuthContext
Navigate → Dashboard
```

### 7.2 JWT Token Lifetime
- **Expiry:** 7 days (configured in backend `JWT_EXPIRE_MINUTES=10080`)
- **Storage:** `expo-secure-store` (encrypted on device)
- **Auto-refresh:** Not needed for v1 — user re-logs every 7 days
- **Logout:** Clear token from SecureStore, reset navigation

---

## 8. Key Backend Endpoints Reference

### Auth
```
POST   /v1/auth/register    Body: { name, phone, email, city, area, password }
POST   /v1/auth/login       Body: { phone, password }
                            Response: { access_token, token_type, user }
```

### Chat (AI Agent)
```
POST   /v1/chat             Body: { session_id, message }
                            Auth: Bearer token
                            Response: { reply, agent, session_id }
```

### Providers
```
GET    /v1/providers        Query: ?service_type=plumber&city=Karachi&area=DHA
GET    /v1/providers/{id}
POST   /v1/providers        Admin only (provider registration)
```

### Bookings
```
POST   /v1/book             Body: { provider_id, service, scheduled_at }
                            Auth: Bearer token
GET    /v1/bookings         Auth: Bearer token (returns user's own bookings)
GET    /v1/bookings/{id}    Auth: Bearer token
PATCH  /v1/bookings/{id}/cancel  Auth: Bearer token
```

### Admin
```
GET    /v1/admin/stats           X-Admin-Key header required
GET    /v1/admin/bookings        X-Admin-Key header required
GET    /v1/admin/providers/top   X-Admin-Key header required
```

### Users
```
PATCH  /v1/users/me/token   Body: { device_token }
                            Auth: Bearer token (registers FCM push token)
```

### System
```
GET    /v1/health           No auth — connectivity check
```

---

## 9. Data Shape Mapping

### 9.1 ProviderOut → ProviderCard

| Backend Field | Frontend Prop | Notes |
|---------------|---------------|-------|
| `id` | `id` | Integer, use for booking |
| `name` | `name` | Display name |
| `service_type` | `serviceKey` | e.g., `"plumber"` |
| `rating` | `rating` | Float 0–5 |
| `lat`, `lng` | `lat`, `lng` | For distance calc |
| `area` | Display in card | Sub-area name |
| `price` | Display in card | Integer PKR |
| — | `distanceVal` | Calculate with Haversine from user location |
| — | `totalScore` | Calculate: `rating * 20 + 100 / (1+distance)` |

### 9.2 BookingOut → Booking History Item

| Backend Field | Frontend Display | Notes |
|---------------|-----------------|-------|
| `confirmation_id` | Booking ID | `UGK-2026-XXXX` |
| `service` | Service name | e.g., `"plumber"` |
| `status` | Status badge | `Confirmed`, `Cancelled` |
| `scheduled_at` | Date/Time | ISO 8601 → format for display |
| `provider_id` | Provider ID | Use to fetch provider details |

### 9.3 AdminStats → Analytics Screen

| Backend Field | Frontend Widget |
|---------------|----------------|
| `total_bookings` | `StatCard` value |
| `active_providers` | `StatCard` value |
| `estimated_revenue_pkr` | `StatCard` value |
| `top_services[].service` | Chart label |
| `top_services[].count` | Chart bar height |
| `confirmed_bookings` | StatCard secondary |
| `cancelled_bookings` | StatCard secondary |

---

## 10. Error Handling Strategy

| HTTP Code | Cause | Frontend Action |
|-----------|-------|-----------------|
| `401` | Token expired/invalid | Clear token → navigate to Login |
| `403` | Not admin | Hide admin features |
| `404` | Resource not found | Show "Not found" message |
| `409` | Duplicate (phone/email) | Show validation error in form |
| `422` | Validation error | Show field-level error from `detail` |
| `500` | Server error | Show generic "Something went wrong" |
| Network error | No connection | Show offline banner + retry button |

---

## 11. Production Deployment Checklist

```
Backend (Cloud Run):
  [ ] Docker image built + pushed to GCR
  [ ] Cloud Run service deployed with all env vars set
  [ ] CORS_ORIGINS restricted to app domain
  [ ] Health check passes: GET /v1/health → { status: "ok" }
  [ ] Firebase service account JSON mounted in container

Frontend (Expo / EAS):
  [ ] API_BASE_URL points to Cloud Run URL
  [ ] firebase google-services.json added (Android)
  [ ] GoogleService-Info.plist added (iOS)
  [ ] EAS build configured (eas.json)
  [ ] Production build: eas build --platform android
  [ ] Push token registration tested end-to-end
```

---

*Version: 1.0 | Project: UstadG | Created: 2026-05-18*
