import requests

try:
    print("Hitting root endpoint with 30s timeout...")
    res = requests.get("http://127.0.0.1:8000/", timeout=30)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.json()}")
except Exception as e:
    print(f"Failed to connect to Uvicorn: {e}")
