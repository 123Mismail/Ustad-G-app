import asyncio
from openai import AsyncOpenAI
import os

async def main():
    api_key = "your_gemini_api_key_here"
    print(f"Testing with key: {api_key[:10]}...")
    base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
    
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    
    tools = [
        {
            "type": "function",
            "function": {
                "name": "transfer_to_discovery",
                "description": "Call this when user asks for a service.",
                "parameters": {"type": "object", "properties": {}}
            }
        }
    ]
    
    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "hi"}
            ],
            tools=tools,
            tool_choice="auto"
        )
        print("Success!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
