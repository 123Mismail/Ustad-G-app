import asyncio
import os
from dotenv import load_dotenv

# Force reload environment
load_dotenv(override=True)

def print(*args, **kwargs):
    import sys
    try:
        msg = " ".join(str(arg) for arg in args)
        enc = sys.stdout.encoding or 'utf-8'
        sys.stdout.write(msg.encode(enc, errors='replace').decode(enc) + kwargs.get('end', '\n'))
        sys.stdout.flush()
    except Exception:
        import builtins
        builtins.print(*args, **kwargs)

async def test_swarm():
    from app.agents.orchestrator import run_ustadg_swarm
    
    print("Starting 4-Turn Booking Confirmation Swarm Test...")
    print(f"Using MCP URL: {os.getenv('MCP_SERVER_URL')}")
    
    session_id = "test-swarm-multi-008"
    
    # Turn 1: Discovery
    m1 = "I need a plumber in Gulshan Karachi"
    print(f"\n[TURN 1] User: {m1}")
    print("-" * 30)
    r1 = await run_ustadg_swarm(session_id, m1, user_phone="+923001234567")
    print(f"UstadG Reply:\n{r1['reply']}")
    
    # Turn 2: Select Provider & Negotiation
    m2 = "I want to book Ali Plumber Services"
    print(f"\n[TURN 2] User: {m2}")
    print("-" * 30)
    r2 = await run_ustadg_swarm(session_id, m2, user_phone="+923001234567")
    print(f"UstadG Reply:\n{r2['reply']}")

    # Turn 3: Confirmation Initiated
    m3 = "Yes, I agree to the price. Please book it for tomorrow at 3:00 PM"
    print(f"\n[TURN 3] User: {m3}")
    print("-" * 30)
    r3 = await run_ustadg_swarm(session_id, m3, user_phone="+923001234567")
    print(f"UstadG Reply:\n{r3['reply']}")

    # Turn 4: Provide name to complete booking
    m4 = "My name is Ali Jilani"
    print(f"\n[TURN 4] User: {m4}")
    print("-" * 30)
    r4 = await run_ustadg_swarm(session_id, m4, user_phone="+923001234567")
    print(f"UstadG Reply:\n{r4['reply']}")

    from app.agents.orchestrator import close_ustadg_swarm
    await close_ustadg_swarm()

if __name__ == "__main__":
    asyncio.run(test_swarm())
