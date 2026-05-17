import asyncio
import traceback
from app.utils.mcp_client import google_maps_search_providers

async def test():
    print("Testing MCP tool directly...")
    try:
        result = await google_maps_search_providers("plumber", "Karachi")
        print(f"Result:\n{result}")
    except Exception as e:
        print("Caught exception:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
