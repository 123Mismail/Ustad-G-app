import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_openai_endpoint():
    api_key = os.getenv("GEMINI_API_KEY")
    url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "gemini-1.5-flash",
        "messages": [{"role": "user", "content": "hi"}]
    }
    
    async with httpx.AsyncClient() as client:
        print(f"Testing URL: {url}")
        try:
            response = await client.post(url, json=payload, headers=headers, timeout=30)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text}")
        except Exception as e:
            print(f"Error: {str(e)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_openai_endpoint())
