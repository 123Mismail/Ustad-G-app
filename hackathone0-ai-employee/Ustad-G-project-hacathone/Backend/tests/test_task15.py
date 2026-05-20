"""
test_task15.py — Task 15: Booking History API

Tests:
  1. DB Setup: init_db() creates the bookings table
  2. Seed: inserts a mock booking directly via DB
  3. GET /v1/bookings         — list bookings (paginated)
  4. GET /v1/bookings/{id}    — fetch single booking by confirmation_id
  5. PATCH /v1/bookings/{id}/cancel  — cancel a booking
  6. Duplicate cancel returns 400

Run: .venv\\Scripts\\python.exe tests\\test_task15.py
"""

import asyncio
import sys
import os
import httpx
from datetime import datetime, timezone, timedelta

# Ensure the project root is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import AsyncSessionLocal
from app.db.init_db import init_db
from app.models.booking import Booking
from sqlalchemy import select

BASE_URL = "http://localhost:8000/v1"
MOCK_CONFIRMATION = "UGK-TEST-9999"


async def seed_mock_booking():
    """Insert a test booking directly in the DB (bypassing the agent)."""
    async with AsyncSessionLocal() as session:
        # Remove old test booking if exists
        existing = await session.execute(
            select(Booking).where(Booking.confirmation_id == MOCK_CONFIRMATION)
        )
        b = existing.scalars().first()
        if b:
            await session.delete(b)
            await session.commit()

        # Insert fresh booking
        session.add(Booking(
            confirmation_id=MOCK_CONFIRMATION,
            user_id=1,
            provider_id="Ali Plumber Services",
            service="Plumbing",
            scheduled_at=datetime.now(timezone.utc) + timedelta(days=1),
            status="Confirmed"
        ))
        await session.commit()
    print(f"  ✔ Seeded booking: {MOCK_CONFIRMATION}")


async def run_tests():
    print("=" * 55)
    print("  Task 15 — Booking History API Test Suite")
    print("=" * 55)

    # ── Step 1: Ensure tables exist ──────────────────────────
    print("\n[1/5] Running init_db() to ensure tables exist...")
    await init_db()
    print("  ✔ Tables created/verified.")

    # ── Step 2: Seed mock booking ─────────────────────────────
    print(f"\n[2/5] Seeding mock booking ({MOCK_CONFIRMATION})...")
    await seed_mock_booking()

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:

        # ── Step 3: GET /bookings ─────────────────────────────
        print("\n[3/5] GET /v1/bookings (list)...")
        res = await client.get("/bookings")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        bookings = res.json()
        print(f"  ✔ Got {len(bookings)} booking(s) for user.")
        assert any(b["confirmation_id"] == MOCK_CONFIRMATION for b in bookings), \
            "Mock booking not found in list!"

        # ── Step 4: GET /bookings/{confirmation_id} ───────────
        print(f"\n[4/5] GET /v1/bookings/{MOCK_CONFIRMATION}...")
        res = await client.get(f"/bookings/{MOCK_CONFIRMATION}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        detail = res.json()
        print(f"  ✔ Booking retrieved: service='{detail['service']}', status='{detail['status']}'")
        assert detail["confirmation_id"] == MOCK_CONFIRMATION
        assert detail["status"] == "Confirmed"

        # Test 404 for unknown ID
        res = await client.get("/bookings/UGK-XXXX-XXXX")
        assert res.status_code == 404, f"Expected 404 for unknown ID, got {res.status_code}"
        print("  ✔ Unknown ID correctly returns 404.")

        # ── Step 5: PATCH /bookings/{id}/cancel ──────────────
        print(f"\n[5/5] PATCH /v1/bookings/{MOCK_CONFIRMATION}/cancel...")
        res = await client.patch(f"/bookings/{MOCK_CONFIRMATION}/cancel")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        cancelled = res.json()
        print(f"  ✔ Status is now: '{cancelled['status']}'")
        assert cancelled["status"] == "Cancelled"

        # Duplicate cancel → 400
        res = await client.patch(f"/bookings/{MOCK_CONFIRMATION}/cancel")
        assert res.status_code == 400, f"Expected 400 on duplicate cancel, got {res.status_code}"
        print("  ✔ Duplicate cancel correctly returns 400.")

    print("\n" + "=" * 55)
    print("  ✅ ALL TASK 15 TESTS PASSED!")
    print("=" * 55)


if __name__ == "__main__":
    asyncio.run(run_tests())
