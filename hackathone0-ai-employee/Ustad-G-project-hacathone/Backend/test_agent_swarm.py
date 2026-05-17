import asyncio
import os
from dotenv import load_dotenv

# Force reload environment
load_dotenv(override=True)

async def test_swarm():
    from app.agents.orchestrator import run_ustadg_swarm
    
    print("🚀 Starting Agent Swarm Test...")
    print(f"Using MCP URL: {os.getenv('MCP_SERVER_URL')}")
    
    # Test Message: Needs discovery agent (Google Maps)
    user_message = "مجھے کراچی گلشن اقبال میں ایک اچھا پلمبر چاہیے" 
    # (Translation: I need a good plumber in Gulshan-e-Iqbal, Karachi)
    
    session_id = "test-swarm-001"
    
    print(f"\nUser: {user_message}")
    print("-" * 30)
    
    result = await run_ustadg_swarm(session_id, user_message)
    
    print("\n" + "=" * 50)
    print(f"Final Agent: {result['agent']}")
    print(f"UstadG: {result['reply']}")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_swarm())
