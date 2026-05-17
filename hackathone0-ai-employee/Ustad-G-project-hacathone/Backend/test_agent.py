import asyncio
import os
import sys
from app.agents.orchestrator import run_ustadg_swarm

async def main():
    print("Starting UstadG Agent Swarm Test CLI...")
    print("Type 'exit' to quit.\n")
    
    messages = []
    
    while True:
        user_input = input("User: ")
        if user_input.lower() in ["exit", "quit"]:
            break
            
        messages.append({"role": "user", "content": user_input})
        
        print("Agent thinking...")
        result = await run_ustadg_swarm(messages)
        
        reply = result.get("reply", "No response")
        agent_name = result.get("agent", "Unknown")
        messages = result.get("messages", messages)
        
        print(f"[{agent_name}]: {reply}\n")

if __name__ == "__main__":
    # Ensure the Backend directory is in the python path
    sys.path.append(os.getcwd())
    asyncio.run(main())
