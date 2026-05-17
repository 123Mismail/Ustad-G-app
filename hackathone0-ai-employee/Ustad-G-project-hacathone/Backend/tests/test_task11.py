import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://localhost:8000/v1"
ADMIN_HEADERS = {"X-Admin-Key": "ustadg-admin-2026"}
BAD_HEADERS = {"X-Admin-Key": "wrong-key"}

async def test_crud():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60.0) as client:
        print("\n--- 1. Testing GET /providers (List) ---")
        res = await client.get("/providers")
        assert res.status_code == 200
        providers = res.json()
        print(f"Found {len(providers)} active providers.")
        assert len(providers) >= 10

        print("\n--- 2. Testing GET /providers with filters ---")
        res = await client.get("/providers", params={"service_type": "plumber"})
        plumbers = res.json()
        print(f"Found {len(plumbers)} plumbers.")
        assert all(p["service_type"] == "plumber" for p in plumbers)

        res = await client.get("/providers", params={"area": "Gulshan"})
        gulshan_providers = res.json()
        print(f"Found {len(gulshan_providers)} providers in Gulshan.")
        assert all("Gulshan" in p["area"] for p in gulshan_providers)

        print("\n--- 3. Testing POST /providers (Admin Auth & Duplicates) ---")
        timestamp = datetime.now().timestamp()
        new_provider = {
            "name": f"Test Plumber {timestamp}",
            "phone": f"0300{int(timestamp % 10000000):07d}",
            "email": f"test.plumber.{int(timestamp)}@ustadg.com",
            "service_type": "plumber",
            "city": "Karachi",
            "area": "Clifton",
            "address": "Test Address",
            "rating": 4.5,
            "price": 1000
        }
        
        # Test 403 Forbidden
        res = await client.post("/providers", json=new_provider, headers=BAD_HEADERS)
        print(f"Auth check (wrong key) status: {res.status_code}")
        assert res.status_code == 403

        # Test valid creation
        res = await client.post("/providers", json=new_provider, headers=ADMIN_HEADERS)
        print(f"Create provider status: {res.status_code}")
        assert res.status_code == 201
        created = res.json()
        provider_id = created["id"]
        print(f"Created Provider ID: {provider_id}")

        # Test duplicate phone (409 Conflict)
        res = await client.post("/providers", json=new_provider, headers=ADMIN_HEADERS)
        print(f"Duplicate phone status: {res.status_code} - {res.json().get('detail')}")
        assert res.status_code == 409

        # Test duplicate email (409 Conflict)
        new_provider["phone"] = f"0300{int(timestamp % 10000000) + 1:07d}"  # Unique phone
        res = await client.post("/providers", json=new_provider, headers=ADMIN_HEADERS)
        print(f"Duplicate email status: {res.status_code} - {res.json().get('detail')}")
        assert res.status_code == 409

        # Test duplicate name+area+service (409 Conflict)
        new_provider["phone"] = None  # Remove phone to test second level dup check
        new_provider["email"] = None  # Remove email to test second level dup check
        res = await client.post("/providers", json=new_provider, headers=ADMIN_HEADERS)
        print(f"Duplicate name/area status: {res.status_code} - {res.json().get('detail')}")
        assert res.status_code == 409

        print("\n--- 4. Testing PATCH /providers/{id} (Update & Deactivate) ---")
        # Update
        update_data = {"rating": 5.0, "is_active": False}
        res = await client.patch(f"/providers/{provider_id}", json=update_data, headers=ADMIN_HEADERS)
        print(f"Deactivate status: {res.status_code}")
        assert res.status_code == 200
        updated = res.json()
        assert updated["rating"] == 5.0
        assert updated["is_active"] is False

        # Verify it no longer appears in active list
        res = await client.get(f"/providers/{provider_id}")
        assert res.json()["is_active"] is False

        res = await client.get("/providers")
        active_ids = [p["id"] for p in res.json()]
        assert provider_id not in active_ids
        print("Verified deactivated provider does not appear in active list.")

        print("\n[PASS] All CRUD endpoints and duplicate rules verified successfully!")

if __name__ == "__main__":
    asyncio.run(test_crud())
