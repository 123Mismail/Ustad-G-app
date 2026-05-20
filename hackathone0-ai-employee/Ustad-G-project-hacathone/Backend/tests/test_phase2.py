"""
test_phase2.py -- End-to-End Phase 2 Integration Tests

Tests the complete UstadG backend feature set:
  Auth -> Provider Discovery -> Booking History -> Admin Analytics

Run with:
  .venv\\Scripts\\python.exe tests\\test_phase2.py

Server must be running:
  .venv\\Scripts\\python.exe -m uvicorn app.main:app --port 8002
"""

import asyncio
import httpx
import os
import sys
from dotenv import load_dotenv

# Load .env so ADMIN_KEY is available
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

BASE_URL = "http://127.0.0.1:8002"
ADMIN_KEY = os.getenv("ADMIN_KEY", "ustadg-admin-secret").strip('"')

# Test user credentials (unique phone to avoid conflicts)
TEST_PHONE = "03007777777"
TEST_PASSWORD = "e2epassword123"
TEST_EMAIL = "e2e@ustadg.com"

passed = 0
failed = 0


def log_pass(test_num: int, msg: str):
    global passed
    passed += 1
    print(f"[TEST {test_num:>2}] [PASS] {msg}")


def log_fail(test_num: int, msg: str):
    global failed
    failed += 1
    print(f"[TEST {test_num:>2}] [FAIL] {msg}")


async def run_tests():
    global passed, failed

    print("=" * 50)
    print("Phase 2 -- End-to-End Integration Tests")
    print("=" * 50)
    print(f"Server : {BASE_URL}")
    print(f"Admin  : {ADMIN_KEY}")
    print()

    async with httpx.AsyncClient(timeout=15.0) as client:

        # ─── TEST 1: Register new user ────────────────────────────
        r = await client.post(f"{BASE_URL}/v1/auth/register", json={
            "name": "E2E Test User",
            "phone": TEST_PHONE,
            "email": TEST_EMAIL,
            "city": "Karachi",
            "area": "Gulshan-e-Iqbal",
            "password": TEST_PASSWORD
        })
        if r.status_code == 201:
            user = r.json()
            log_pass(1, f"User registered -> id={user['id']}, name={user['name']}")
        elif r.status_code == 409:
            log_pass(1, f"User already exists (409) - continuing with existing account")
        else:
            log_fail(1, f"Expected 201 or 409, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 2: Duplicate phone rejected ─────────────────────
        r = await client.post(f"{BASE_URL}/v1/auth/register", json={
            "name": "Duplicate User",
            "phone": TEST_PHONE,
            "email": "other@test.com",
            "city": "Karachi",
            "area": "Clifton",
            "password": "anotherpassword"
        })
        if r.status_code == 409:
            log_pass(2, "Duplicate phone rejected (409 Conflict)")
        else:
            log_fail(2, f"Expected 409, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 3: Wrong password rejected ──────────────────────
        r = await client.post(f"{BASE_URL}/v1/auth/login", json={
            "phone": TEST_PHONE,
            "password": "WRONGPASSWORD999"
        })
        if r.status_code == 401:
            log_pass(3, "Wrong password correctly rejected (401 Unauthorized)")
        else:
            log_fail(3, f"Expected 401, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 4: Correct login -> JWT ──────────────────────────
        r = await client.post(f"{BASE_URL}/v1/auth/login", json={
            "phone": TEST_PHONE,
            "password": TEST_PASSWORD
        })
        access_token = None
        if r.status_code == 200:
            data = r.json()
            access_token = data.get("access_token")
            log_pass(4, f"Login successful -> JWT: {access_token[:20]}...")
        else:
            log_fail(4, f"Expected 200, got {r.status_code}: {r.text[:120]}")
            print("\n[ABORT] Cannot continue without a JWT token.")
            return

        auth_headers = {"Authorization": f"Bearer {access_token}"}

        # ─── TEST 5: Protected route without token ─────────────────
        r = await client.get(f"{BASE_URL}/v1/bookings")
        if r.status_code == 401:
            log_pass(5, "Unauthenticated access blocked (401 Unauthorized)")
        else:
            log_fail(5, f"Expected 401, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 6: Protected route with valid JWT ────────────────
        r = await client.get(f"{BASE_URL}/v1/bookings", headers=auth_headers)
        if r.status_code == 200:
            bookings = r.json()
            log_pass(6, f"Authenticated access to /v1/bookings -> {len(bookings)} bookings for this user")
        else:
            log_fail(6, f"Expected 200, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 7: Provider discovery (local DB) ─────────────────
        r = await client.get(f"{BASE_URL}/v1/providers", params={"service_type": "plumber", "city": "Karachi"})
        discovered_provider_id = None
        if r.status_code == 200:
            providers = r.json()
            if len(providers) >= 2:
                discovered_provider_id = providers[0]['id']
                log_pass(7, f"Local DB returned {len(providers)} plumbers: {[p['name'] for p in providers[:2]]}")
            else:
                log_fail(7, f"Expected >= 2 plumbers, got {len(providers)}: {r.text[:120]}")
        else:
            log_fail(7, f"Expected 200, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 8: Single provider lookup ───────────────────────
        lookup_id = discovered_provider_id if discovered_provider_id is not None else 1
        
        r = await client.get(f"{BASE_URL}/v1/providers/{lookup_id}")
        if r.status_code == 200:
            p = r.json()
            log_pass(8, f"Provider #{lookup_id} fetched -> '{p.get('name')}' ({p.get('service_type')})")
        else:
            log_fail(8, f"Expected 200, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 9: Admin stats without key ──────────────────────
        r = await client.get(f"{BASE_URL}/v1/admin/stats")
        if r.status_code == 403:
            log_pass(9, "Admin stats blocked without X-Admin-Key (403 Forbidden)")
        else:
            log_fail(9, f"Expected 403, got {r.status_code}: {r.text[:120]}")

        admin_headers = {"X-Admin-Key": ADMIN_KEY}

        # ─── TEST 10: Admin stats with valid key ──────────────────
        r = await client.get(f"{BASE_URL}/v1/admin/stats", headers=admin_headers)
        if r.status_code == 200:
            stats = r.json()
            log_pass(10, (
                f"Admin stats OK -> total_bookings={stats.get('total_bookings')}, "
                f"active_providers={stats.get('active_providers')}, "
                f"revenue={stats.get('estimated_revenue_pkr')} PKR"
            ))
        else:
            log_fail(10, f"Expected 200, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 11: Admin bookings log ──────────────────────────
        r = await client.get(f"{BASE_URL}/v1/admin/bookings", headers=admin_headers)
        if r.status_code == 200:
            bookings = r.json()
            log_pass(11, f"Admin bookings log returned {len(bookings)} bookings")
        else:
            log_fail(11, f"Expected 200, got {r.status_code}: {r.text[:120]}")

        # ─── TEST 12: Admin top providers ─────────────────────────
        r = await client.get(f"{BASE_URL}/v1/admin/providers/top", headers=admin_headers)
        if r.status_code == 200:
            providers = r.json()
            if len(providers) >= 10:
                top = providers[0]
                log_pass(12, f"Admin top providers returned {len(providers)} providers. #1: {top['name']} (rating={top['rating']})")
            else:
                log_fail(12, f"Expected >= 10 providers, got {len(providers)}")
        else:
            log_fail(12, f"Expected 200, got {r.status_code}: {r.text[:120]}")

    # ─── Final summary ──────────────────────────────────────────────
    total = passed + failed
    print()
    print("=" * 50)
    print(f"Results: {passed}/{total} tests passed")
    if failed == 0:
        print("Phase 2 is production-ready!")
    else:
        print(f"{failed} test(s) failed. Check above for details.")
    print("=" * 50)


if __name__ == "__main__":
    try:
        asyncio.run(run_tests())
    except httpx.ConnectError:
        print(f"\n[ERROR] Could not connect to {BASE_URL}. Is the server running?")
        sys.exit(1)
