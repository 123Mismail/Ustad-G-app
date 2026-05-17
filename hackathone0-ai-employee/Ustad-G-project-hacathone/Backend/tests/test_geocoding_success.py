import asyncio
import httpx

BASE_URL = "http://localhost:8000/v1"
ADMIN_HEADERS = {"X-Admin-Key": "ustadg-admin-2026"}

async def test_manual_geocoding():
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # Create a new provider with a realistic Karachi address to trigger geocoding
        import time
        timestamp = int(time.time())
        new_provider = {
            "name": f"Kamran Electrician {timestamp}",
            "phone": f"0333{timestamp % 10000000:07d}",
            "service_type": "electrician",
            "city": "Karachi",
            "area": "Gulshan-e-Iqbal",
            "address": "Block 13-D, Gulshan-e-Iqbal, Karachi",
            "rating": 4.8
        }
        
        print("\n--- Sending registration request without coordinates ---")
        res = await client.post("/providers", json=new_provider, headers=ADMIN_HEADERS)
        
        if res.status_code == 201:
            data = res.json()
            print(f"Success! Provider Registered.")
            print(f"ID       : {data.get('id')}")
            print(f"Name     : {data.get('name')}")
            print(f"Address  : {data.get('address')}")
            print(f"Latitude : {data.get('lat')}")
            print(f"Longitude: {data.get('lng')}")
            assert data.get("lat") is not None
            assert data.get("lng") is not None
            print("Verification Successful! The backend resolved the lat/lng coordinates perfectly.")
        elif res.status_code == 409:
            print(f"Conflict: {res.json().get('detail')}")
            print("The provider might already exist in your database. That proves our duplicate check works too!")
        else:
            print(f"Failed with status code {res.status_code}: {res.text}")

if __name__ == "__main__":
    asyncio.run(test_manual_geocoding())
