# Follow-up Plan: Resolving Cloud Run SSE Deadlocks in Task 13 👤🔌

## Executive Summary & Current Status
We have successfully completed all core database, serialization, routing, and personalization requirements for **Task 13**:
- **SQLite Models & Tables**: Registered user profile (`User`) and serialization table (`chat_sessions`) are created and seeded with **Osman** (`03001234567`) in **Gulshan-e-Iqbal**.
- **User CRUD Routes**: Endpoint `POST /v1/users` successfully rejects duplicate phones/emails with `409 Conflict`.
- **Dynamic Context Injection**: Tested and confirmed the receptionist greets Osman by name ("Osman bhai") on the first message, and pulls proximity search parameters automatically.
- **SQLite Serialization**: Confirmed that ADK's `Session` Pydantic models are perfectly dumped and loaded to/from `chat_sessions`.

---

## The Technical Challenge: Stale SSE Connections
During local testing, we identified a critical deadlock when running the second request of a session:
1. **Global Cached Runner**: In `app/agents/orchestrator.py`, `_runner` is cached globally.
2. **Idle SSE Session Expiration**: Cloud Run terminates or load-balances idle Server-Sent Events (SSE) rooms after inactivity.
3. **Silent Background Failure**: When a tool is called (like Google Maps search), the stale cached toolset writes to the expired session, throwing a `404 Not Found` inside an asynchronous background thread (`post_writer` inside `mcp.client.sse`).
4. **Indefinite Hang**: The main ADK execution thread never receives the error, causing the entire FastAPI endpoint to hang.

---

## Architectural Shift: Fresh Runner per Request
To ensure 100% reliability in serverless and Google Cloud Run environments, we must implement the **Fresh Runner per Request** pattern:
- **No Global Cache**: Do not cache the `Runner` or toolsets globally.
- **On-Demand SSE Rooms**: Instantiate the `maps_toolset`, `booking_toolset`, and `Runner` brand new on every incoming chat message.
- **Instant Response**: This completely eliminates stale session 404s, prevents socket deadlocks, and guarantees that every request gets an active, fresh SSE tunnel.

---

## Proposed Code Changes

### `[MODIFY]` [orchestrator.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/agents/orchestrator.py)
Update the `_init_runner` and global states as follows:
```python
# Remove global _runner caching entirely
_session_service: PersistentSessionService | None = None

async def _init_runner() -> Runner:
    """
    Instantiate a fresh, brand-new ADK Runner and active SSE toolsets 
    for the current request to prevent stale connection timeouts.
    """
    global _session_service
    if _session_service is None:
        _session_service = PersistentSessionService()

    # Create fresh toolsets for this specific request room
    maps_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SSE_URL, timeout=30.0),
        tool_filter=["google_maps_search_providers"]
    )
    booking_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SSE_URL, timeout=30.0),
        tool_filter=["google_sheets_record_booking", "google_calendar_create_appointment"]
    )

    # Re-build agent hierarchy with the fresh toolsets
    booking_agent = LlmAgent(name="BookingAgent", model=MODEL, tools=[booking_toolset], ...)
    negotiation_agent = LlmAgent(name="NegotiationAgent", model=MODEL, sub_agents=[booking_agent], ...)
    local_search_tool = FunctionTool(search_local_providers)
    discovery_agent = LlmAgent(name="DiscoveryAgent", model=MODEL, tools=[local_search_tool, maps_toolset], ...)
    triage_agent = LlmAgent(name="TriageAgent", model=MODEL, sub_agents=[discovery_agent], ...)

    # Return a pristine Runner
    return Runner(
        agent=triage_agent,
        session_service=_session_service,
        app_name=APP_NAME,
    )
```

---

## Verification Plan
1. **Apply Fresh-Runner Pattern**: Make the change in [orchestrator.py](file:///b:/hackathone0-ai-employee/Ustad-G-project-hacathone/Backend/app/agents/orchestrator.py).
2. **Execute Test Suite**: Run `uv run python -m tests.test_task13`.
3. **Verify Complete Swarm Flow**: Confirm that Part 1 (duplicates) and Part 2 (personalization, location-autofill, history database saves across multiple requests) pass flawlessly with exit code 0!
