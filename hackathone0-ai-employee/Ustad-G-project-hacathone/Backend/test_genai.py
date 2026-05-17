import os
import asyncio
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)

async def main():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"Key: {api_key[:10]}...")
    client = genai.Client(api_key=api_key)
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents='Tell me a joke.'
        )
        print(response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
