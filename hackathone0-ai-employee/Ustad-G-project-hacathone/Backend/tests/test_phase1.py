import httpx
import asyncio

async def test_chat_endpoint():
    print("Testing /v1/chat endpoint with Triage -> Discovery handoff...")
    url = "http://localhost:8000/v1/chat"
    payload = {
        "message": "مجھے کراچی میں ایک پلمبر چاہیے", # "I need a plumber in Karachi"
        "session_id": "test-session-001"
    }
    
    # We use a 60-second timeout because the agent swarm might take a bit 
    # to hit Triage, then hit Discovery, then hit the Maps API, then reply.
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            
            # Print with ensure_ascii=False to handle Urdu text in PowerShell
            import json
            print(json.dumps(response.json(), indent=2, ensure_ascii=False))
            
            if response.status_code == 200:
                data = response.json()
                # Check if it handed off to the correct agent
                if data.get("agent") in ["DiscoveryAgent", "NegotiationAgent"]:
                    print("\n✅ SUCCESS: Handoff to Discovery/Negotiation was successful!")
                else:
                    print(f"\n⚠️ WARNING: Expected handoff to DiscoveryAgent, but got {data.get('agent')}")
            
        except httpx.RequestError as exc:
            print(f"An error occurred while requesting {exc.request.url!r}.")
            print(exc)

if __name__ == "__main__":
    # Fix for Windows Unicode printing
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    asyncio.run(test_chat_endpoint())
