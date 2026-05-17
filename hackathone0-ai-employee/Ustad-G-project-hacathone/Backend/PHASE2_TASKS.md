# UstadG Backend — Phase 2 Task List (v1.0)
> **Goal:** "Production Grade" — Own Provider Database · Real Auth · Ratings · Notifications · Admin APIs
> **Stack:** FastAPI · Google ADK · SQLite/PostgreSQL (SQLAlchemy) · JWT Auth · Firebase FCM
> **Prerequisite:** Phase 1 "Steel Thread" ✅ Complete
> **Updated:** 2026-05-17

---

## 🗺️ Architecture Change: Google Maps' New Role in Phase 2

In Phase 1, Google Maps did everything — finding providers, names, addresses, and ratings.
In Phase 2, its role is **split into 3 specialized, much smaller responsibilities**:

| Role | When Used | Why |
|------|-----------|-----|
| **1. Primary Search** | Our DB (`search_local_providers`) | We own the data, control quality, store ratings |
| **2. Fallback Search** | Google Maps (`google_maps_search_providers`) | If our DB returns 0 results for a rare service |
| **3. Geocoding** | Provider registration (one-time) | Convert provider address → `lat/lng` to store in DB |
| **4. Distance Sort** | Stored `lat/lng` + Haversine math | "X km away" without an API call at query time |

**Phase 2 Discovery Flow:**
```
User → DiscoveryAgent
           │
           ├─ search_local_providers(service, area) → OUR DB  ← PRIMARY
           │     If results found → return to user
           │
           └─ google_maps_search_providers(service, location) ← FALLBACK ONLY
                 If our DB has 0 results → return Google Maps results
```

---

## ✅ TASK 10 — Provider Database (SQLAlchemy + SQLite)
> **Why:** This is the core UstadG value proposition — owning our own roster of registered, vetted ustads instead of relying entirely on Google Maps' public business listings.
> **Google Maps Role here:** When seeding/registering a provider, call Google Maps Geocoding API **once** to convert their address into `lat` and `lng` coordinates. Store those in the DB. All future distance calculations use stored coordinates — no API call needed.
> **Files:** `app/db/`, `app/models/provider.py`

- [x] **10.1** Add `sqlalchemy`, `aiosqlite` to `requirements.txt`
- [x] **10.2** Create `app/db/database.py` — async SQLAlchemy engine + `get_db()` dependency
- [x] **10.3** Create `app/models/provider.py` — `Provider` SQLAlchemy model:
  - Fields: `id`, `name`, `phone`, `service_type`, `city`, `area`, `address`, `lat`, `lng`, `rating`, `is_active`, `created_at`
  - `lat` and `lng` are populated at registration via Google Maps Geocoding (one-time call)
- [x] **10.4** Create `app/db/init_db.py` — table creation + seed 10 mock providers across Karachi areas (with pre-filled lat/lng)
- [x] **10.5** Run `init_db.py` on startup via `app/main.py` lifespan hook

---

## ✅ TASK 11 — Provider CRUD API
> **Why:** Enable admin to manage the provider roster (add/update/deactivate technicians).
> **Files:** `app/routers/providers.py`, `app/schemas/provider.py`

- [x] **11.1** Create `app/schemas/provider.py` — `ProviderCreate`, `ProviderUpdate`, `ProviderOut` Pydantic models
- [x] **11.2** Implement `GET /v1/providers` — list all active providers (filter by `service_type`, `city`, `area`)
- [x] **11.3** Implement `GET /v1/providers/{id}` — get a single provider profile
- [x] **11.4** Implement `POST /v1/providers` — register a new provider (admin only)
- [x] **11.5** Implement `PATCH /v1/providers/{id}` — update provider details or deactivate them

---

## 🔲 TASK 12 — Swap Discovery Agent to Own DB (with Google Maps Fallback)
> **Why:** The DiscoveryAgent must now query our own registered ustads as the primary source. Google Maps stays active as a fallback for services with no registered ustads in our DB yet.
>
> **⚠️ Architecture Decision — No new MCP server needed:**

> The SQLite database lives **locally inside the FastAPI backend** — it is NOT accessible from Cloud Run.
> Therefore, `search_local_providers` is implemented as a **native Python ADK tool** registered directly on the `DiscoveryAgent` in `orchestrator.py` — NOT as an MCP tool. This keeps the architecture clean:
> ```
> DiscoveryAgent tools:
>   ├── search_local_providers()      ← Native Python tool (queries local SQLite)
>   └── McpToolset (Cloud Run)
>         ├── google_maps_search_providers   ← Fallback only
>         ├── google_sheets_record_booking
>         └── google_calendar_create_appointment
> ```
>
> **New Two-Step Discovery Logic (agent instructions):**
> 1. Call `search_local_providers(service, area, city)` → OUR DB (primary)
> 2. If results count = 0 → call `google_maps_search_providers(service, location)` → Google Maps (fallback)
> 3. Return whichever source gave results, labelling clearly ("Registered UstadG Partner" vs "Google Maps Result")
>
> **Files:** `app/tools/providers_tool.py`, `app/agents/discovery.py`, `app/agents/orchestrator.py`

- [ ] **12.1** Create `app/tools/providers_tool.py` — async function `search_local_providers(service, area, city)` that queries the SQLite `Provider` table and returns sorted results (by rating, then distance using stored lat/lng Haversine)
- [ ] **12.2** Wrap `search_local_providers` as a Google ADK `FunctionTool` so the agent can call it natively
- [ ] **12.3** Register the `FunctionTool` directly on `DiscoveryAgent` in `orchestrator.py` alongside the existing `McpToolset`
- [ ] **12.4** Update `DiscoveryAgent` instructions: call `search_local_providers` first → if 0 results, fall back to `google_maps_search_providers`. Always label the source of each result.

---

## 🔲 TASK 13 — Real JWT Authentication
> **Why:** Replace mock middleware with real user accounts — required before going live.
> **Files:** `app/routers/auth.py`, `app/models/user.py`, `app/middleware/auth.py`

- [ ] **13.1** Create `app/models/user.py` — `User` SQLAlchemy model: `id`, `name`, `phone`, `email`, `hashed_password`, `role` (`user`/`admin`), `created_at`
- [ ] **13.2** Add `passlib[bcrypt]`, `python-jose[cryptography]` to `requirements.txt`
- [ ] **13.3** Implement `POST /v1/auth/register` — create a new user account (hash password, save to DB)
- [ ] **13.4** Implement `POST /v1/auth/login` — verify credentials, return signed JWT access token
- [ ] **13.5** Create `app/middleware/auth.py` — `get_current_user` FastAPI dependency (decode + validate JWT)
- [ ] **13.6** Replace `MockUser` middleware with `get_current_user` dependency on protected routes (`/chat`, `/book`)

---

---

## 🔲 TASK 15 — Booking History API
> **Why:** Users need to view their past and upcoming bookings from within the app.
> **Files:** `app/models/booking.py`, `app/routers/bookings.py`

- [ ] **15.1** Create `app/models/booking.py` — `Booking` DB model: `id`, `confirmation_id`, `user_id`, `provider_id`, `service`, `scheduled_at`, `status`, `created_at`
- [ ] **15.2** Update `book.py` router to save every confirmed booking to the `Booking` DB table (in addition to Google Sheets)
- [ ] **15.3** Implement `GET /v1/bookings` — return all bookings for the authenticated user (paginated)
- [ ] **15.4** Implement `GET /v1/bookings/{confirmation_id}` — get a single booking detail by UGK ID
- [ ] **15.5** Implement `PATCH /v1/bookings/{confirmation_id}/cancel` — allow user to cancel an upcoming booking

---

## 🔲 TASK 16 — Push Notifications + Scheduled Reminders (Firebase FCM + APScheduler)
> **Why:** Notify users instantly when their booking is confirmed or cancelled, AND send a reminder push notification 1 hour before the technician's scheduled departure.
>
> **What we already have (Phase 1):** Google Calendar creates a calendar event with a default email reminder. But users in Pakistan rarely check email — the app push notification is what they will actually see.
>
> **What we are adding (Phase 2):** A background job scheduler (`APScheduler`) that runs inside the FastAPI process and fires a Firebase FCM push notification exactly 1 hour before the appointment time.
>
> **Reminder Flow:**
> ```
> Booking confirmed at 9:00 PM (appointment: tomorrow 10:00 AM)
>         │
>         │  APScheduler schedules a job for 9:00 AM next day
>         │  (appointment_time - 1 hour)
>         │
>        ⏰ 9:00 AM fires:
>         └─ Firebase FCM → "Your Ustad is on the way! Ali Plumber Services — ETA 10:00 AM"
> ```
> **Files:** `app/utils/notifications.py`, `app/utils/scheduler.py`

- [ ] **16.1** Add `firebase-admin`, `apscheduler` to `requirements.txt`; configure Firebase with service account
- [ ] **16.2** Create `app/utils/notifications.py` — `send_push_notification(device_token, title, body)` async helper using Firebase Admin SDK
- [ ] **16.3** Add `device_token` field to `User` model; add `PATCH /v1/users/me/token` endpoint to register device FCM token
- [ ] **16.4** Trigger an **instant** push notification from `book.py` after every successful booking confirmation: *"✅ Booking Confirmed! UGK-XXXX-XXXX — Ali Plumber Services, tomorrow 10:00 AM"*
- [ ] **16.5** Create `app/utils/scheduler.py` — initialize `AsyncIOScheduler` from APScheduler; start it in `app/main.py` lifespan hook
- [ ] **16.6** After booking is saved, schedule a **reminder job** at `(scheduled_at - 1 hour)`: fires `send_push_notification` with *"⏰ Your Ustad is departing soon! [Provider Name] is heading to you. Appointment: [time]"*
- [ ] **16.7** Trigger an **instant** push notification from `PATCH /v1/bookings/{id}/cancel` on cancellation: *"❌ Booking Cancelled: UGK-XXXX-XXXX"*

---

## 🔲 TASK 17 — Admin Analytics API
> **Why:** Surface booking counts, revenue, and top providers for the admin dashboard already built in the frontend.
> **Files:** `app/routers/admin.py`

- [ ] **17.1** Implement `GET /v1/admin/stats` — total bookings, active providers, revenue estimate (PKR), top 5 services (admin role required)
- [ ] **17.2** Implement `GET /v1/admin/bookings` — full paginated booking log with filters (`date_range`, `service`, `status`)
- [ ] **17.3** Implement `GET /v1/admin/providers/top` — top 10 providers by rating + booking count

---

## 🔲 TASK 18 — End-to-End Phase 2 Testing
> **File:** `Backend/test_phase2.py`

- [ ] **18.1** Test: `POST /v1/auth/register` + `POST /v1/auth/login` → assert JWT token returned
- [ ] **18.2** Test: `GET /v1/providers?service=plumber&city=Karachi` → assert seeded providers returned
- [ ] **18.3** Test: Full booking cycle using local DB providers (not Google Maps)
- [ ] **18.4** Test: `GET /v1/admin/stats` with admin JWT → assert correct booking totals

---

## 📊 Phase 2 Completion Checklist

| Area | Phase 1 (Steel Thread) | Phase 2 (Production) | Status |
|------|----------------------|---------------------|--------|
| Provider Source | Google Maps API | Own SQLite DB | ✅ Complete |
| Provider CRUD | None | Full REST API | ✅ Complete |
| Auth | Mock Middleware | Real JWT | 🔲 Next |
| Discovery | Google Maps only | Local DB + Maps fallback | ✅ Complete |
| Chat History Persistence | None | SQLite + Dynamic Context | ✅ Complete |
| Booking History | Google Sheets only | Local DB + Sheets | 🔲 Next |
| Push Notifications + Reminders | None | Firebase FCM + APScheduler | 🔲 Next |
| Admin Analytics | Frontend mock data | Real DB queries | 🔲 Next |
| Testing | Manual curl tests | Automated `test_phase2.py` | 🔲 Next |

---

*Version: 2.0 | Project: UstadG | Updated: 2026-05-17 — Phase 2 Progress*
