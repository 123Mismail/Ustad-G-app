"""
test_adk_basic.py — Task 9.1
Verify google-adk connects to Gemini using the GEMINI_API_KEY from .env.
"""
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

import asyncio
import os
from dotenv import load_dotenv

load_dotenv(override=True)

async def test_adk():
    api_key = os.getenv("GEMINI_API_KEY", "")
    model = os.getenv("FAST_MODEL", "gemini-2.5-flash")

    print(f"Testing Google ADK with model: {model}")
    print(f"API key starts with: {api_key[:10]}...")

    # Set native auth — MUST BE BEFORE IMPORTS
    os.environ["GOOGLE_API_KEY"] = api_key

    from google.adk.agents import LlmAgent
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai.types import Content, Part

    agent = LlmAgent(
        name="TestAgent",
        model=model,
        instruction="You are a helpful assistant. Reply briefly.",
    )

    session_service = InMemorySessionService()
    runner = Runner(agent=agent, session_service=session_service, app_name="test")

    await session_service.create_session(
        app_name="test", session_id="test-001", user_id="test_user"
    )

    content = Content(parts=[Part(text="Say 'Hello from ADK!' in one sentence.")], role="user")
    reply = ""

    async for event in runner.run_async(
        session_id="test-001",
        user_id="test_user",
        new_message=content,
    ):
        if event.is_final_response():
            if event.content and event.content.parts:
                reply = event.content.parts[0].text

    print(f"\n✅ ADK Response: {reply}")
    return reply

if __name__ == "__main__":
    result = asyncio.run(test_adk())
    if result:
        print("\n🎉 Google ADK is working correctly with Gemini!")
    else:
        print("\n❌ No response received — check GOOGLE_API_KEY.")
