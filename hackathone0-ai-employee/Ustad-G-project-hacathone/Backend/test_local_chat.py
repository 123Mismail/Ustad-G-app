import httpx
import json

url = "http://127.0.0.1:8000/v1/chat"
payload = {
    "message": "hi",
    "session_id": "test_session_123"
}

try:
    response = httpx.post(url, json=payload, timeout=30.0)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {str(e)}")
