"""
orchestrator.py — UstadG Agent Swarm (Google ADK + Native MCP Toolset)

Architecture:
  triage_agent
      └── discovery_agent (google_maps_search_providers via MCP)
              └── negotiation_agent
                      └── booking_agent (google_sheets + google_calendar via MCP)

Using ADK's native MCPToolset to connect to the Cloud Run SSE endpoint.
The toolset is passed directly to agents, and discovery happens automatically.
"""
import os
import json
import asyncio
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from app.db.session_service import PersistentSessionService
from google.adk.tools import FunctionTool
from google.adk.tools.mcp_tool import MCPToolset, SseConnectionParams
from google.genai.types import Content, Part

from app.tools.local_search import search_local_providers

from app.config import get_settings
from app.agents.triage import triage_instructions
from app.agents.discovery import discovery_instructions
from app.agents.negotiation import negotiation_instructions
from app.agents.booking import booking_instructions

settings = get_settings()

# ── Auth: Set GOOGLE_API_KEY for native Gemini authentication ──────────────────
os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key.strip()
os.environ["GEMINI_API_KEY"] = settings.gemini_api_key.strip()

MODEL = settings.fast_model  # "gemini-2.5-flash" from .env
MCP_SSE_URL = f"{settings.mcp_server_url.rstrip('/')}/sse"

# ── Global state ───────────────────────────────────────────────────────────────
_runner: Runner | None = None
_session_service: PersistentSessionService | None = None
APP_NAME = "ustadg"


async def _init_runner() -> Runner:
    """
    Initialize MCP connection and ADK Runner once at startup.
    """
    global _runner, _session_service

    if _runner is not None:
        return _runner

    print(f"[ORCHESTRATOR] Initializing MCPToolset for {MCP_SSE_URL} ...")

    # ── Define Toolsets ───────────────────────────────────────────────────────
    # We create toolsets with filters so each agent only sees its relevant tools.
    
    maps_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SSE_URL, timeout=30.0),
        tool_filter=["google_maps_search_providers"]
    )

    booking_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SSE_URL, timeout=30.0),
        tool_filter=["google_sheets_record_booking", "google_calendar_create_appointment"]
    )

    # ── Build agent hierarchy bottom-up (leaf → root) ─────────────────────────
    booking_agent = LlmAgent(
        name="BookingAgent",
        model=MODEL,
        description=(
            "Handles the final step of booking a service. Confirms details, "
            "records the booking in Google Sheets, creates a calendar appointment, "
            "and returns a UGK-YYYY-XXXX confirmation ID."
        ),
        instruction=booking_instructions,
        tools=[booking_toolset],
    )

    negotiation_agent = LlmAgent(
        name="NegotiationAgent",
        model=MODEL,
        description=(
            "Ranks the discovered providers and presents Munasib (fair) price estimates "
            "in Urdu and English. Handles re-negotiation requests like 'Aur sasta dhoondo'."
        ),
        instruction=negotiation_instructions,
        sub_agents=[booking_agent],
    )

    local_search_tool = FunctionTool(search_local_providers)

    discovery_agent = LlmAgent(
        name="DiscoveryAgent",
        model=MODEL,
        description=(
            "Finds nearby service providers (plumbers, electricians, etc.) using our local database first, "
            "and falls back to Google Maps if no registered providers are found. "
            "Use this agent when the user needs to find a service provider."
        ),
        instruction=discovery_instructions,
        tools=[local_search_tool, maps_toolset],
        sub_agents=[negotiation_agent],
    )

    triage_agent = LlmAgent(
        name="TriageAgent",
        model=MODEL,
        description=(
            "The entry point for all user requests. Greets users in Urdu/English "
            "and routes service requests to the appropriate specialist agent."
        ),
        instruction=triage_instructions,
        sub_agents=[discovery_agent],
    )

    # ── ADK Session + Runner ───────────────────────────────────────────────────
    _session_service = PersistentSessionService()
    _runner = Runner(
        agent=triage_agent,
        session_service=_session_service,
        app_name=APP_NAME,
    )

    print("[ORCHESTRATOR] Pristine ADK Runner ready with fresh MCP Toolsets.")
    return runner, maps_toolset, booking_toolset


async def run_ustadg_swarm(session_id: str, message: str, user_phone: str | None = None) -> dict:
    """
    Run the UstadG agent pipeline for a given session and user message.
    """
    maps_toolset = None
    booking_toolset = None
    try:
        runner, maps_toolset, booking_toolset = await _init_runner()
        user_id = user_phone if user_phone else "mock_user"

        # Ensure session exists
        try:
            await _session_service.create_session(
                app_name=APP_NAME,
                session_id=session_id,
                user_id=user_id,
            )
        except Exception:
            pass 

        # ── User Recognition & Minimal System Context Injection ────────────────
        user_context = ""
        if user_phone:
            import sqlite3
            conn = sqlite3.connect("ustadg.db")
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            try:
                cursor.execute("SELECT name, area, city FROM users WHERE phone = ?", (user_phone,))
                user_row = cursor.fetchone()
                if user_row:
                    # Get the session to inspect event history
                    session = await _session_service.get_session(
                        app_name=APP_NAME,
                        user_id=user_id,
                        session_id=session_id
                    )
                    # Only inject on the very first message to prevent token bloat
                    if session and len(session.events) == 0:
                        user_context = f"[Saved Location: {user_row['area']}, {user_row['city']} | User Name: {user_row['name']}]\n"
                        print(f"[ORCHESTRATOR] Injected system context: {user_context.strip()}")
            except Exception as e:
                print(f"[ORCHESTRATOR] Personalization error: {e}")
            finally:
                conn.close()

        content = Content(parts=[Part(text=user_context + message)], role="user")
        final_reply = ""
        active_agent = "TriageAgent"
        providers = []

        from contextlib import aclosing

        async with aclosing(runner.run_async(
            session_id=session_id,
            user_id=user_id,
            new_message=content,
        )) as agen:
            async for event in agen:
                # ADK Event Logging
                author = getattr(event, 'author', 'System')
                event_type = event.__class__.__name__
                print(f"[ADK EVENT] {author}: {event_type}")

                # Print content if available
                if hasattr(event, 'content') and event.content and event.content.parts:
                    text = event.content.parts[0].text
                    if text:
                        print(f"    Text: {text[:200]}...")

                # Print function calls
                if hasattr(event, 'get_function_calls'):
                    for call in event.get_function_calls():
                        print(f"    CALL: {call.name}({call.args})")

                # Capture tool results
                if hasattr(event, 'get_function_responses'):
                    for resp in event.get_function_responses():
                        print(f"    RESPONSE: {resp.name} -> {str(resp.response)[:100]}...")
                        if resp.name in ("google_maps_search_providers", "search_local_providers"):
                            try:
                                # In ADK/GenAI, resp.response contains the tool output
                                output_data = resp.response
                                if isinstance(output_data, dict) and "providers" in output_data:
                                    providers = output_data["providers"]
                                elif isinstance(output_data, str):
                                    data = json.loads(output_data)
                                    if "providers" in data:
                                        providers = data["providers"]
                            except Exception:
                                pass

                if hasattr(event, 'is_final_response') and event.is_final_response():
                    if getattr(event, 'content', None) and getattr(event.content, 'parts', None):
                        final_reply = event.content.parts[0].text
                    active_agent = author or active_agent

        # ── Database Session Persistence ───────────────────────────────────────
        try:
            session = await _session_service.get_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id
            )
            if session:
                _session_service.save_session_sync(session)
        except Exception as e:
            print(f"[ORCHESTRATOR] Error persisting session: {e}")

        return {
            "reply": final_reply or "No response generated.",
            "agent": active_agent,
            "providers": providers
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "reply": f"An error occurred: {str(e)}",
            "agent": "TriageAgent",
            "providers": []
        }
    finally:
        # Cleanly release SSE toolset connection resources
        try:
            if maps_toolset:
                await maps_toolset.close()
            if booking_toolset:
                await booking_toolset.close()
            print("[ORCHESTRATOR] Cleanly closed MCP toolsets and SSE connections.")
        except Exception as e:
            print(f"[ORCHESTRATOR] Error closing toolsets: {e}")
