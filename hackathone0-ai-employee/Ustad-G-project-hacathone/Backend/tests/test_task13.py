import asyncio
import httpx
import os
import sys

# Add the Backend folder to the sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = "http://127.0.0.1:8002"

async def test_auth_flow():
    print("="*50)
    print("Task 13 — JWT Authentication Tests")
    print("="*50)
    
    async with httpx.AsyncClient() as client:
        # 1. Register a test user
        print("\n[TEST 1] POST /v1/auth/register")
        test_phone = "03009999999"
        register_data = {
            "name": "Test JWT User",
            "phone": test_phone,
            "email": "jwt.test@example.com",
            "city": "Karachi",
            "area": "Clifton",
            "password": "strongpassword123"
        }
        
        r1 = await client.post(f"{BASE_URL}/v1/auth/register", json=register_data)
        if r1.status_code == 201:
            print("[PASS] User registered successfully")
        elif r1.status_code == 409:
            print(f"[INFO] User already registered. Continuing...")
        else:
            print(f"[FAIL] Expected 201 or 409, got {r1.status_code}: {r1.text}")

        # 2. Login with correct password
        print("\n[TEST 2] POST /v1/auth/login")
        login_data = {
            "phone": test_phone,
            "password": "strongpassword123"
        }
        r2 = await client.post(f"{BASE_URL}/v1/auth/login", json=login_data)
        
        access_token = None
        if r2.status_code == 200:
            data = r2.json()
            access_token = data.get("access_token")
            print(f"[PASS] Logged in successfully. Token received: {access_token[:15]}...")
        else:
            print(f"[FAIL] Expected 200, got {r2.status_code}: {r2.text}")
            return

        # 3. Access protected route without token
        print("\n[TEST 3] GET /v1/bookings (No Token)")
        r3 = await client.get(f"{BASE_URL}/v1/bookings")
        if r3.status_code == 401:
            print(f"[PASS] 401 Unauthorized properly returned when token is missing.")
        else:
            print(f"[FAIL] Expected 401, got {r3.status_code}: {r3.text}")

        # 4. Access protected route with token
        print("\n[TEST 4] GET /v1/bookings (With Token)")
        headers = {"Authorization": f"Bearer {access_token}"}
        r4 = await client.get(f"{BASE_URL}/v1/bookings", headers=headers)
        if r4.status_code == 200:
            print(f"[PASS] 200 OK. Successfully accessed protected route!")
            bookings = r4.json()
            print(f"       Found {len(bookings)} bookings for this user.")
        else:
            print(f"[FAIL] Expected 200, got {r4.status_code}: {r4.text}")

if __name__ == "__main__":
    try:
        asyncio.run(test_auth_flow())
        print("\nTask 13 Auth tests completed.")
    except httpx.ConnectError:
        print("\n[ERROR] Could not connect to FastAPI server. Is it running?")
