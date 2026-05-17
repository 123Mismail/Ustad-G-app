import httpx
import json

url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
headers = {
    "Authorization": "Bearer your_gemini_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "hi"}]
}

try:
    response = httpx.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
