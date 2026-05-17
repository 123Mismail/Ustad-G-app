import asyncio
import json
from app.agents.orchestrator import run_ustadg_swarm

async def main():
    print("--- Welcome to UstadG Mock Shell ---")
    print("-----------------------------------")
    
    messages = []
    current_agent = "TriageAgent"
    
    while True:
        user_input = input(f"\nUser: ")
        if user_input.lower() in ['exit', 'quit']:
            break
            
        messages.append({"role": "user", "content": user_input})
        
        print(f"\n[{current_agent} is thinking...]")
        result = await run_ustadg_swarm(messages, current_agent_name=current_agent)
        
        current_agent = result["agent"]
        reply = result["reply"]
        messages = result["messages"]
        
        print(f"\n{current_agent}: {reply}")

if __name__ == "__main__":
    asyncio.run(main())
