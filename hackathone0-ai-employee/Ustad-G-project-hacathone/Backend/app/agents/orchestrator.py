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

# ── Safe Print for Emoji/Unicode support on Windows terminals ──────────────────
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

# ── Global state ───────────────────────────────────────────────────────────────
_runner: Runner | None = None
_session_service: PersistentSessionService | None = None
_maps_toolset: MCPToolset | None = None
_booking_toolset: MCPToolset | None = None
APP_NAME = "ustadg"


async def _init_runner() -> tuple:
    """
    Initialize MCP connection and ADK Runner once at startup.
    """
    global _runner, _session_service, _maps_toolset, _booking_toolset

    if _runner is not None:
        return _runner, _maps_toolset, _booking_toolset

    print(f"[ORCHESTRATOR] Initializing MCPToolset for {MCP_SSE_URL} ...")

    # ── Define Toolsets ───────────────────────────────────────────────────────
    _maps_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SSE_URL, timeout=30.0),
        tool_filter=["google_maps_search_providers"]
    )

    _booking_toolset = MCPToolset(
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
        tools=[_booking_toolset],
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
        tools=[local_search_tool, _maps_toolset],
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
    return _runner, _maps_toolset, _booking_toolset


async def close_ustadg_swarm():
    """
    Cleanly release SSE toolset connection resources.
    Call this during application shutdown.
    """
    global _maps_toolset, _booking_toolset
    try:
        if _maps_toolset:
            await _maps_toolset.close()
            _maps_toolset = None
        if _booking_toolset:
            await _booking_toolset.close()
            _booking_toolset = None
        print("[ORCHESTRATOR] Cleanly closed MCP toolsets and SSE connections.")
    except Exception as e:
        print(f"[ORCHESTRATOR] Error closing toolsets: {e}")


async def run_ustadg_swarm(session_id: str, message: str, user_phone: str | None = None) -> dict:
    """
    Run the UstadG agent pipeline for a given session and user message.
    """
    try:
        runner, maps_toolset, booking_toolset = await _init_runner()
        user_id = user_phone if user_phone else "mock_user"

        # Ensure session exists (only create if it doesn't already exist)
        try:
            existing = await _session_service.get_session(
                app_name=APP_NAME,
                user_id=user_id,
                session_id=session_id,
            )
            if not existing:
                await _session_service.create_session(
                    app_name=APP_NAME,
                    session_id=session_id,
                    user_id=user_id,
                )
                print(f"[ORCHESTRATOR] Created fresh persistent session {session_id}")
            else:
                print(f"[ORCHESTRATOR] Loaded existing persistent session {session_id}")
        except Exception as e:
            print(f"[ORCHESTRATOR] Session check/create error: {e}")

        # ── User Recognition & Minimal System Context Injection ────────────────
        user_context = ""
        if user_phone:
            from app.db.database import SyncSessionLocal
            from app.models.user import User
            
            with SyncSessionLocal() as db_session:
                try:
                    user_row = db_session.query(User).filter_by(phone=user_phone).first()
                    if user_row:
                        user_context = f"[User Profile — Name: {user_row.name}, Saved Location: {user_row.area}, {user_row.city}]\n"
                        print(f"[ORCHESTRATOR] Injected system context: {user_context.strip()}")
                except Exception as e:
                    print(f"[ORCHESTRATOR] Personalization error: {e}")

        content = Content(parts=[Part(text=user_context + message)], role="user")
        final_reply = ""
        active_agent = "TriageAgent"
        providers = []
        trace_steps = []

        from contextlib import aclosing
        from datetime import datetime

        try:
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

                    step_data = {
                        "name": author,
                        "status": "done",
                        "timestamp": datetime.now().strftime("%I:%M:%S %p"),
                        "input": "",
                        "thinking": "",
                        "output": ""
                    }
                    has_useful_data = False

                    # Print content if available
                    if hasattr(event, 'content') and event.content and event.content.parts:
                        text = event.content.parts[0].text
                        if text:
                            print(f"    Text: {text[:200]}...")
                            step_data["thinking"] = text.strip()
                            has_useful_data = True

                    # Print function calls
                    if hasattr(event, 'get_function_calls'):
                        calls = list(event.get_function_calls())
                        if calls:
                            for call in calls:
                                print(f"    CALL: {call.name}({call.args})")
                            call_strs = [f"{c.name}({c.args})" for c in calls]
                            step_data["thinking"] += f"\nCalling Tools: {', '.join(call_strs)}"
                            has_useful_data = True

                    # Capture tool results
                    if hasattr(event, 'get_function_responses'):
                        resps = list(event.get_function_responses())
                        if resps:
                            for resp in resps:
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
                            
                            resp_strs = [f"{r.name} result captured." for r in resps]
                            step_data["output"] = "\n".join(resp_strs)
                            has_useful_data = True

                    if hasattr(event, 'is_final_response') and event.is_final_response():
                        if getattr(event, 'content', None) and getattr(event.content, 'parts', None):
                            final_reply = event.content.parts[0].text
                        active_agent = author or active_agent
                        
                    if has_useful_data and author != 'System':
                        trace_steps.append(step_data)

        except Exception as run_err:
            print(f"[ORCHESTRATOR] Runner execution exception: {run_err}")

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
            "providers": providers,
            "trace_steps": trace_steps
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "reply": f"An error occurred: {str(e)}",
            "agent": "TriageAgent",
            "providers": [],
            "trace_steps": []
        }
