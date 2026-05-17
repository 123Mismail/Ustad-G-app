import asyncio
import json
from mcp import ClientSession
from mcp.client.sse import sse_client
from app.config import get_settings

settings = get_settings()

async def call_mcp_tool(tool_name: str, arguments: dict) -> str:
    """
    Helper function to call a tool on the local FastMCP server via SSE transport.
    
    Args:
        tool_name: The registered name of the tool (e.g., "google_maps_search_providers")
        arguments: A dictionary of arguments matching the tool's Pydantic schema
        
    Returns:
        The text output of the tool.
    """
    server_url = f"{settings.mcp_server_url.rstrip('/')}/sse"
    
    try:
        async with sse_client(server_url) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                result = await session.call_tool(tool_name, arguments=arguments)
                
                # Extract the text content from the result
                # mcp.types.CallToolResult usually has a .content list
                if not result.content:
                    return "No output returned from tool."
                    
                # Concatenate all text content parts
                texts = []
                for item in result.content:
                    if item.type == "text":
                        texts.append(item.text)
                
                return "\n".join(texts)
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"Error executing tool '{tool_name}': {str(e)}"

# Specific wrappers for the agents to use easily

async def google_maps_search_providers(service: str, location: str, radius_km: int = 10, max_results: int = 5) -> str:
    return await call_mcp_tool("google_maps_search_providers", {
        "service": service,
        "location": location,
        "radius_km": radius_km,
        "max_results": max_results
    })

async def google_sheets_record_booking(user_name: str, service: str, provider_name: str, provider_address: str, confirmation_id: str) -> str:
    return await call_mcp_tool("google_sheets_record_booking", {
        "user_name": user_name,
        "service": service,
        "provider_name": provider_name,
        "provider_address": provider_address,
        "confirmation_id": confirmation_id
    })

async def google_calendar_create_appointment(summary: str, description: str, start_time: str, end_time: str) -> str:
    return await call_mcp_tool("google_calendar_create_appointment", {
        "summary": summary,
        "description": description,
        "start_time": start_time,
        "end_time": end_time
    })
