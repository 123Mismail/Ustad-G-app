import asyncio
from litellm import acompletion
import os
from dotenv import load_dotenv

# Load env from Backend folder
load_dotenv()

async def test_gemini():
    # Use the key directly from env
    api_key = os.getenv("GEMINI_API_KEY")
    model = f"gemini/{os.getenv('FAST_MODEL', 'gemini-2.5-flash')}"
    
    print(f"Testing LiteLLM with model: {model}")
    print(f"Key starts with: {api_key[:10]}...")
    
    try:
        response = await acompletion(
            model=model,
            messages=[{"role": "user", "content": "hi"}],
            api_key=api_key
        )
        print("Success!")
        print(f"Reply: {response.choices[0].message.content}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
