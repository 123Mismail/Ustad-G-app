import asyncio
import os
import sys

# Add the Backend folder to the sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
from dotenv import load_dotenv

load_dotenv()
BASE_URL = "http://127.0.0.1:8000"
ADMIN_KEY = os.getenv("ADMIN_KEY", "ustadg-admin-secret").strip('"\'')
HEADERS = {"X-Admin-Key": ADMIN_KEY}

async def test_admin_api():
    print("="*50)
    print("Task 17 — Admin Analytics API Tests")
    print("="*50)
    
    async with httpx.AsyncClient() as client:
        # 1. Test /v1/admin/stats without auth
        print("\n[TEST 1] GET /v1/admin/stats (No Auth)")
        r1 = await client.get(f"{BASE_URL}/v1/admin/stats")
        if r1.status_code == 403:
            print("[PASS] 403 Forbidden correctly returned without X-Admin-Key")
        else:
            print(f"[FAIL] Expected 403, got {r1.status_code}")

        # 2. Test /v1/admin/stats with auth
        print("\n[TEST 2] GET /v1/admin/stats (With Auth)")
        r2 = await client.get(f"{BASE_URL}/v1/admin/stats", headers=HEADERS)
        if r2.status_code == 200:
            data = r2.json()
            print(f"[PASS] 200 OK. Total Bookings: {data.get('total_bookings')}, Revenue: {data.get('estimated_revenue_pkr')} PKR")
            print(f"       Top Services: {data.get('top_services')}")
        else:
            print(f"[FAIL] Expected 200, got {r2.status_code}: {r2.text}")

        # 3. Test /v1/admin/bookings
        print("\n[TEST 3] GET /v1/admin/bookings")
        r3 = await client.get(f"{BASE_URL}/v1/admin/bookings?limit=5", headers=HEADERS)
        if r3.status_code == 200:
            data = r3.json()
            print(f"[PASS] 200 OK. Returned {len(data)} bookings.")
            if data:
                print(f"       First booking ID: {data[0].get('confirmation_id')}")
        else:
            print(f"[FAIL] Expected 200, got {r3.status_code}: {r3.text}")

        # 4. Test /v1/admin/providers/top
        print("\n[TEST 4] GET /v1/admin/providers/top")
        r4 = await client.get(f"{BASE_URL}/v1/admin/providers/top", headers=HEADERS)
        if r4.status_code == 200:
            data = r4.json()
            print(f"[PASS] 200 OK. Returned {len(data)} top providers.")
            if data:
                top = data[0]
                print(f"       #1 Provider: {top.get('name')} (Rating: {top.get('rating')}, Bookings: {top.get('booking_count')})")
        else:
            print(f"[FAIL] Expected 200, got {r4.status_code}: {r4.text}")

if __name__ == "__main__":
    try:
        asyncio.run(test_admin_api())
        print("\n✅ Task 17 Admin API tests completed.")
    except httpx.ConnectError:
        print("\n[ERROR] Could not connect to FastAPI server. Is it running? (uv run uvicorn app.main:app --reload)")
