import asyncio
import os
import httpx
from app.utils.auth import create_access_token
from app.config import get_settings

async def main():
    token = create_access_token({"sub": "15"})
    print(f"Generated JWT token for user 15: {token}")

    # Make request to the local API
    url = "http://localhost:8000/v1/bookings"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10.0)
            print(f"API URL: {url}")
            print(f"Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Failed to connect to local API: {e}")
        print("Please check if the FastAPI server is running locally.")

if __name__ == "__main__":
    asyncio.run(main())
