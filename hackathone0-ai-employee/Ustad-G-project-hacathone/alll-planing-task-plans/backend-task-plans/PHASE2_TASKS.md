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

## ✅ TASK 12 — Swap Discovery Agent to Own DB (with Google Maps Fallback)
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

- [x] **12.1** Create `app/tools/local_search.py` — async function `search_local_providers(service, area, city)` that queries the SQLite `Provider` table and returns sorted results (by rating, then distance using stored lat/lng Haversine)
- [x] **12.2** Wrap `search_local_providers` as a Google ADK `FunctionTool` so the agent can call it natively
- [x] **12.3** Register the `FunctionTool` directly on `DiscoveryAgent` in `orchestrator.py` alongside the existing `McpToolset`
- [x] **12.4** Update `DiscoveryAgent` instructions: call `search_local_providers` first → if 0 results, fall back to `google_maps_search_providers`. Always label the source of each result.

---

## 🔲 TASK 13 — Real JWT Authentication
> **Why:** Replace mock middleware with real user accounts — required before going live.
>
> **Strategy:** `phone` + `password` login. JWT contains `sub` (user_id) and `role`. 7-day expiry by default.
>
> **Migration Note:** Existing no-password users can't log in via password; new `POST /v1/auth/register` creates a user with a password. Test users are seeded in the test script.
>
> **📄 Detailed Plan:** [`plans/TASK13_JWT_AUTH.md`](plans/TASK13_JWT_AUTH.md)
>
> **Files:** `requirements.txt`, `app/models/user.py`, `app/config.py`, `app/schemas/user.py`, `app/utils/auth.py`, `app/routers/auth.py`, `app/dependencies/auth.py`, `app/routers/bookings.py`, `app/routers/book.py`, `app/routers/users.py`, `app/main.py`

- [x] **13.1** Add `python-jose[cryptography]>=3.3.0` and `passlib[bcrypt]>=1.7.4` to `requirements.txt`, then install
- [x] **13.2** Add `hashed_password` (`String(256)`, nullable) and `role` (`String(20)`, default=`"user"`) columns to `app/models/user.py`
- [x] **13.3** Add `jwt_secret`, `jwt_algorithm`, `jwt_expire_minutes` to `app/config.py` and `.env.example`
- [x] **13.4** Add `UserRegister`, `LoginRequest`, `TokenOut` Pydantic schemas to `app/schemas/user.py`
- [x] **13.5** Create `app/utils/auth.py` — `hash_password`, `verify_password`, `create_access_token`, `decode_access_token`
- [x] **13.6** Create `app/routers/auth.py` — `POST /v1/auth/register` (hash + save) and `POST /v1/auth/login` (verify + JWT)
- [x] **13.7** Create `app/dependencies/auth.py` — `get_current_user` FastAPI dependency (decode Bearer token → return `User`)
- [x] **13.8** Update `app/routers/bookings.py` — replace `get_current_user_id()` mock with `get_current_user` dependency
- [x] **13.9** Update `app/routers/book.py` — add `current_user: User = Depends(get_current_user)` and replace `user_id=1`
- [x] **13.10** Update `app/routers/users.py` — use `get_current_user` in `PATCH /v1/users/me/token`
- [x] **13.11** Mount `auth.router` in `app/main.py` under `/v1` prefix
- [x] **13.12** Write and run `tests/test_task13.py` — register, login, token-protected route checks

---

---

## ✅ TASK 15 — Booking History API
> **Why:** Users need to view their past and upcoming bookings from within the app.
> **Files:** `app/models/booking.py`, `app/routers/bookings.py`

- [x] **15.1** Create `app/models/booking.py` — `Booking` DB model: `id`, `confirmation_id`, `user_id`, `provider_id`, `service`, `scheduled_at`, `status`, `created_at`
- [x] **15.2** Update `book.py` router to save every confirmed booking to the `Booking` DB table (in addition to Google Sheets)
- [x] **15.3** Implement `GET /v1/bookings` — return all bookings for the authenticated user (paginated)
- [x] **15.4** Implement `GET /v1/bookings/{confirmation_id}` — get a single booking detail by UGK ID
- [x] **15.5** Implement `PATCH /v1/bookings/{confirmation_id}/cancel` — allow user to cancel an upcoming booking

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
>
> **⚠️ Firebase Credential Note:** The existing `service_account.json` is for Google Cloud (Sheets + Calendar), NOT Firebase FCM. A separate Firebase project service account is needed. To allow development without a Firebase project, `send_push_notification()` will support a **dry-run mode**: if `FIREBASE_CREDENTIALS_PATH` is not set, notifications are logged to stdout instead of being sent — no crash, fully testable.
>
> **📄 Detailed Plan:** [`plans/TASK16_PUSH_NOTIFICATIONS.md`](plans/TASK16_PUSH_NOTIFICATIONS.md)
>
> **Files:** `app/utils/notifications.py`, `app/utils/scheduler.py`, `app/models/user.py`, `app/routers/book.py`, `app/routers/bookings.py`, `app/routers/users.py`, `app/main.py`

- [x] **16.1** Add `firebase-admin>=6.5.0`, `apscheduler>=3.10.0` to `requirements.txt`
- [x] **16.2** Add `firebase_credentials_path` optional field to `app/config.py` + `.env.example`
- [x] **16.3** Create `app/utils/notifications.py` — `send_push_notification(device_token, title, body)` with live FCM + dry-run fallback mode
- [x] **16.4** Create `app/utils/scheduler.py` — shared `AsyncIOScheduler` instance; start/stop in `app/main.py` lifespan hook
- [x] **16.5** Add `device_token` column to `User` model; add `PATCH /v1/users/me/token` endpoint to register device FCM token
- [x] **16.6** Trigger **instant** push notification from `book.py` after every successful booking confirmation: *"✅ Booking Confirmed! UGK-XXXX-XXXX — Provider Name, tomorrow 10:00 AM"*
- [x] **16.7** Schedule **reminder job** at `(scheduled_at - 1 hour)`: fires `send_push_notification` with *"⏰ Your Ustad is departing soon! [Provider Name] is heading to you."*
- [x] **16.8** Trigger **instant** push notification + **remove scheduler reminder** from `PATCH /v1/bookings/{id}/cancel`: *"❌ Booking Cancelled: UGK-XXXX-XXXX"*


---

## 🔲 TASK 17 — Admin Analytics API
> **Why:** Surface booking counts, revenue, and top providers for the admin dashboard already built in the frontend.
>
> **Auth Strategy:** Simple `X-Admin-Key` header checked against `Settings.admin_key` (default: `ustadg-admin-secret`, set via `ADMIN_KEY` in `.env`). No JWT needed yet — that’s Task 13.
>
> **Revenue Estimate:** Calculated as `confirmed_booking_count × average_provider_price_in_PKR` from the `providers` table.
>
> **Provider Booking Count:** Counted by matching `bookings.provider_id` (stored as a string) against `providers.id`.
>
> **📄 Detailed Plan:** [`plans/TASK17_ADMIN_ANALYTICS.md`](plans/TASK17_ADMIN_ANALYTICS.md)
>
> **Files:** `app/schemas/admin.py`, `app/routers/admin.py`, `app/main.py`

- [x] **17.1** Create `app/schemas/admin.py` — `AdminStats`, `AdminBookingItem`, `ProviderBookingStats` Pydantic models
- [x] **17.2** Create `admin_key` auth dependency `verify_admin(x_admin_key: str = Header(...))` — returns `403` on mismatch
- [x] **17.3** Implement `GET /v1/admin/stats` — total/confirmed/cancelled bookings, active providers, estimated revenue (PKR), top 5 services by booking count
- [x] **17.4** Implement `GET /v1/admin/bookings` — full paginated booking log with optional filters (`?service=plumber`, `?status=Confirmed`)
- [x] **17.5** Implement `GET /v1/admin/providers/top` — top providers sorted by booking count then rating
- [x] **17.6** Mount `admin.router` under `/v1` prefix in `app/main.py`

---

## 🔲 TASK 18 — End-to-End Phase 2 Testing
> **Why:** Validate the full user journey — auth, discovery, booking history, and admin analytics — works together in integration.
>
> **Scope:** Automated HTTP tests only. The ADK booking agent (`POST /v1/book`) requires manual verification due to LLM non-determinism.
>
> **📄 Detailed Plan:** [`plans/TASK18_E2E_TESTING.md`](plans/TASK18_E2E_TESTING.md)
>
> **File:** `tests/test_phase2.py`

- [x] **18.1** `POST /v1/auth/register` → assert `201` + user object returned
- [x] **18.2** `POST /v1/auth/register` (duplicate phone) → assert `409 Conflict`
- [x] **18.3** `POST /v1/auth/login` (wrong password) → assert `401 Unauthorized`
- [x] **18.4** `POST /v1/auth/login` (correct) → assert `200` + `access_token` in response
- [x] **18.5** `GET /v1/bookings` (no token) → assert `401`
- [x] **18.6** `GET /v1/bookings` (with JWT) → assert `200` + empty array for new user
- [x] **18.7** `GET /v1/providers?service_type=plumber&city=Karachi` → assert 2 seeded plumbers returned
- [x] **18.8** `GET /v1/providers/1` → assert `Ali Plumber Services` returned
- [x] **18.9** `GET /v1/admin/stats` (no key) → assert `403`
- [x] **18.10** `GET /v1/admin/stats` (with `X-Admin-Key`) → assert `200` + stats object
- [x] **18.11** `GET /v1/admin/bookings` (with key) → assert `200`
- [x] **18.12** `GET /v1/admin/providers/top` (with key) → assert `200` + 10 providers

---

## 📊 Phase 2 Completion Checklist

| Area | Phase 1 (Steel Thread) | Phase 2 (Production) | Status |
|------|----------------------|---------------------|--------|
| Provider Source | Google Maps API | Own SQLite DB | ✅ Complete |
| Provider CRUD | None | Full REST API | ✅ Complete |
| Auth | Mock Middleware | Real JWT | ✅ Complete |
| Chat History Persistence | None | SQLite + Dynamic Context | ✅ Complete |
| Booking History | Google Sheets only | Local DB + Sheets | ✅ Complete |
| Push Notifications + Reminders | None | Firebase FCM + APScheduler | ✅ Complete |
| Admin Analytics | Frontend mock data | Real DB queries | ✅ Complete |
| Testing | Manual curl tests | Automated `test_phase2.py` | ✅ Complete |

---

*Version: 2.0 | Project: UstadG | Updated: 2026-05-17 — Phase 2 Progress*
