# Phase 2 — TASK 18: End-to-End Phase 2 Testing

> **Parent:** `PHASE2_TASKS.md` → Task 18
> **Goal:** Write a single automated test script (`tests/test_phase2.py`) that validates the full user journey through the UstadG backend — from registration to booking to admin analytics — using real HTTP calls against the live local server.
> **Status:** 🔲 Not Started

---

## Context: What Has Been Built (Phase 2 Summary)

| Task | Feature | Status |
|------|---------|--------|
| Task 11 | Provider CRUD (SQLite) | ✅ Complete |
| Task 12 | Discovery Agent → Local DB first, Maps fallback | ✅ Complete |
| Task 13 | Real JWT Authentication | ✅ Complete |
| Task 15 | Booking History API | ✅ Complete |
| Task 16 | Push Notifications + APScheduler Reminders | ✅ Complete |
| Task 17 | Admin Analytics API | ✅ Complete |

All phase 2 features are live. This final task verifies they all work together end-to-end.

---

## What We're Testing

```
User Journey:
  │
  ├─ [1] POST /v1/auth/register     → Create JWT-enabled user
  ├─ [2] POST /v1/auth/login        → Get JWT access token
  ├─ [3] GET  /v1/providers         → Verify local DB providers returned
  ├─ [4] GET  /v1/providers/{id}    → Verify single provider lookup
  ├─ [5] GET  /v1/bookings          → Verify empty booking history (new user)
  ├─ [6] GET  /v1/admin/stats       → Verify admin analytics (X-Admin-Key)
  └─ [7] GET  /v1/admin/providers/top → Verify provider leaderboard
```

> **Note on booking cycle:** `POST /v1/book` invokes the full ADK agent swarm (LLM + MCP tools), which is non-deterministic and slow. We will test only the REST API endpoints that are purely database-backed. The booking agent test is documented as a manual verification step.

---

## Step-by-Step Test Plan

---

### TEST 1 — User Registration
**Endpoint:** `POST /v1/auth/register`

| Field | Value |
|-------|-------|
| name | `E2E Test User` |
| phone | `03007777777` |
| email | `e2e@ustadg.com` |
| city | `Karachi` |
| area | `Gulshan-e-Iqbal` |
| password | `e2epassword123` |

**Expected:** `201 Created` — user object returned with `id`, `name`, `phone`.

---

### TEST 2 — Duplicate Registration Rejected
**Endpoint:** `POST /v1/auth/register` (same phone again)

**Expected:** `409 Conflict` — `"Phone number already registered"`

---

### TEST 3 — Login with Wrong Password
**Endpoint:** `POST /v1/auth/login`

```json
{ "phone": "03007777777", "password": "WRONGPASSWORD" }
```

**Expected:** `401 Unauthorized` — `"Invalid phone or password"`

---

### TEST 4 — Login with Correct Password
**Endpoint:** `POST /v1/auth/login`

```json
{ "phone": "03007777777", "password": "e2epassword123" }
```

**Expected:** `200 OK` — response contains `access_token` (JWT string).

---

### TEST 5 — Access Protected Route Without Token
**Endpoint:** `GET /v1/bookings` (no `Authorization` header)

**Expected:** `401 Unauthorized`

---

### TEST 6 — Access Protected Route With Token
**Endpoint:** `GET /v1/bookings` (with `Authorization: Bearer <token>`)

**Expected:** `200 OK` — returns `[]` (no bookings yet for new user)

---

### TEST 7 — Provider Discovery (Local DB)
**Endpoint:** `GET /v1/providers?service_type=plumber&city=Karachi`

**Expected:** `200 OK` — returns 2 seeded plumbers (`Ali Plumber Services`, `Karachi Plumbing Pros`).

---

### TEST 8 — Single Provider Lookup
**Endpoint:** `GET /v1/providers/1`

**Expected:** `200 OK` — returns `Ali Plumber Services` provider object.

---

### TEST 9 — Admin Stats (No Auth)
**Endpoint:** `GET /v1/admin/stats` (no `X-Admin-Key` header)

**Expected:** `403 Forbidden`

---

### TEST 10 — Admin Stats (With Auth)
**Endpoint:** `GET /v1/admin/stats` (with `X-Admin-Key: <ADMIN_KEY>`)

**Expected:** `200 OK` — returns stats object:
```json
{
  "total_bookings": 0,
  "confirmed_bookings": 0,
  "cancelled_bookings": 0,
  "active_providers": 10,
  "total_providers": 12,
  "estimated_revenue_pkr": 0,
  "top_services": []
}
```

---

### TEST 11 — Admin Bookings Log
**Endpoint:** `GET /v1/admin/bookings`

**Expected:** `200 OK` — returns array (may be empty or contain leftover test bookings).

---

### TEST 12 — Admin Top Providers
**Endpoint:** `GET /v1/admin/providers/top`

**Expected:** `200 OK` — returns list of 10 providers sorted by `rating` desc.

---

## Manual Verification (Out of Scope for Automation)

The following steps require the full ADK agent + LLM to run and are verified manually:

| Step | Method |
|------|--------|
| `POST /v1/book` with a booking prompt | Hit via curl or Postman with `Authorization: Bearer <token>` |
| Verify booking saved via `GET /v1/bookings` | Check the user's booking history |
| Cancel booking via `PATCH /v1/bookings/{id}/cancel` | Verify status changes to `Cancelled` |
| Re-check `GET /v1/admin/stats` | Confirm cancelled booking appears in counts |

---

## Files Summary

| File | Action |
|------|--------|
| `tests/test_phase2.py` | **NEW** — Full E2E test script (12 automated tests) |

---

## Verification Command

```bash
# Server must be running first
.venv\Scripts\python.exe tests\test_phase2.py
```

Expected final output:
```
==================================================
Phase 2 — End-to-End Integration Tests
==================================================
[TEST 1]  [PASS] User registered
[TEST 2]  [PASS] Duplicate rejected (409)
[TEST 3]  [PASS] Wrong password rejected (401)
[TEST 4]  [PASS] Login successful, JWT received
[TEST 5]  [PASS] Unauthenticated access blocked (401)
[TEST 6]  [PASS] Authenticated access to /v1/bookings (200)
[TEST 7]  [PASS] 2 plumbers found in local DB
[TEST 8]  [PASS] Provider #1 fetched correctly
[TEST 9]  [PASS] Admin stats blocked without key (403)
[TEST 10] [PASS] Admin stats returned (200)
[TEST 11] [PASS] Admin bookings log returned (200)
[TEST 12] [PASS] Admin top providers returned (200)

12/12 tests passed. Phase 2 is production-ready!
```

---

*Version: 1.0 | Task: 18 | Project: UstadG | Created: 2026-05-18*
