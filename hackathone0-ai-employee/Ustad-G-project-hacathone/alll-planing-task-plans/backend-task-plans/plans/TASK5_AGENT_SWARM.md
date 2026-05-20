# TASK 5 — Agent Definitions (Google ADK)
> **Parent:** `PHASE1_TASKS.md` → Task 5
> **Goal:** Define and wire the four UstadG agents using **Google ADK `LlmAgent`** with native Gemini authentication and `sub_agents` delegation.
> **Updated:** 2026-05-16 — Migrated from OpenAI Agents SDK to Google ADK (see `BACKEND_ARCHITECTURE_PRD.md` v2.0)

> [!IMPORTANT]
> **Framework Change:** All agents now use `google.adk.agents.LlmAgent` instead of the defunct `openai-agents` `Agent` class. Handoffs are done via `sub_agents=[]` (LLM-driven delegation), NOT the `handoffs=[]` parameter.
> **Auth Fix:** Google ADK authenticates using `os.environ["GOOGLE_API_KEY"]` — the native API key format. This resolves ALL previous "API key not valid" and "Connection error" failures.

---

## 1. Overview

The agent swarm handles the full UstadG lifecycle:
```
User Message
    → TriageAgent       (intent extraction, Urdu/English greeting)
        → DiscoveryAgent    (Google Maps search via MCP)
            → NegotiationAgent  ("Munasib" price reasoning)
                → BookingAgent      (Sheets + Calendar via MCP)
```

Each agent is an `LlmAgent` with:
- A `description` (used by the parent LLM to decide when to delegate)
- An `instruction` (the agent's system prompt)
- Optional `tools` (Python functions from `app/utils/mcp_client.py`)
- Optional `sub_agents` (downstream agents it can delegate to)

---

## 2. Proposed Changes

### 🔧 Shared Utilities

#### [EXISTING] `app/utils/mcp_client.py`
- No changes needed — MCP tool functions are plain Python callables, compatible with ADK `tools=[]` directly.

---

### 🤖 Agent Instruction Files

> **Pattern:** Each file only exports an `instructions` string. The actual `LlmAgent` objects are constructed centrally in `orchestrator.py`.

#### [MODIFY] `app/agents/triage.py`
```python
# Only export the instructions string
triage_instructions = """You are the UstadG Triage Receptionist.
Greet the user in Urdu/English (e.g., 'Assalam-o-Alaikum!').
If the user wants a home service (plumber, electrician, etc.), transfer to DiscoveryAgent.
If they have a general question about UstadG, answer it directly.
"""
```

#### [MODIFY] `app/agents/discovery.py`
```python
discovery_instructions = """You are the UstadG Discovery Agent.
Use the google_maps_search_providers tool to find providers near the user.
Present the top results with name, rating, and address.
Once the user wants pricing details, transfer to NegotiationAgent.
"""
```

#### [MODIFY] `app/agents/negotiation.py`
```python
negotiation_instructions = """You are the UstadG Munasib (Negotiation) Agent.
Rank providers by distance (40%), rating (40%), and availability (20%).
Present a Top 3 list with a 'Munasib Price Estimate' in both Urdu and English.
If the user says 'Aur sasta dhoondo', re-rank prioritizing distance/price.
Once the user selects a provider, transfer to BookingAgent.
"""
```

#### [MODIFY] `app/agents/booking.py`
```python
booking_instructions = """You are the UstadG Booking Agent.
Confirm provider, service, and time with the user.
Call google_sheets_record_booking to save the booking.
Call google_calendar_create_appointment to schedule it.
Generate a confirmation ID in format UGK-YYYY-XXXX.
Respond with a confirmation message ending in 'Shukriya!' (Urdu for Thank you).
"""
```

---

### 🕸️ Orchestration

#### [FULL REWRITE] `app/agents/orchestrator.py`
```python
import os
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.types import Content, Part
from app.config import get_settings
from app.utils.mcp_client import (
    google_maps_search_providers,
    google_sheets_record_booking,
    google_calendar_create_appointment,
)
from app.agents.triage import triage_instructions
from app.agents.discovery import discovery_instructions
from app.agents.negotiation import negotiation_instructions
from app.agents.booking import booking_instructions

settings = get_settings()

# Set native Gemini API key — ADK handles auth correctly
os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key

MODEL = settings.fast_model  # "gemini-2.5-flash"

# Build agents bottom-up (leaf → root)
booking_agent = LlmAgent(
    name="BookingAgent",
    model=MODEL,
    description="Finalizes service bookings in Google Sheets and Calendar.",
    instruction=booking_instructions,
    tools=[google_sheets_record_booking, google_calendar_create_appointment]
)

negotiation_agent = LlmAgent(
    name="NegotiationAgent",
    model=MODEL,
    description="Ranks providers and presents Munasib (fair) price estimates.",
    instruction=negotiation_instructions,
    sub_agents=[booking_agent]
)

discovery_agent = LlmAgent(
    name="DiscoveryAgent",
    model=MODEL,
    description="Finds nearby service providers using Google Maps.",
    instruction=discovery_instructions,
    tools=[google_maps_search_providers],
    sub_agents=[negotiation_agent]
)

triage_agent = LlmAgent(
    name="TriageAgent",
    model=MODEL,
    description="Greets users and routes service requests to the discovery pipeline.",
    instruction=triage_instructions,
    sub_agents=[discovery_agent]
)

# Session + Runner setup
session_service = InMemorySessionService()
runner = Runner(
    agent=triage_agent,
    session_service=session_service,
    app_name="ustadg"
)

async def run_ustadg_swarm(session_id: str, message: str) -> dict:
    """Run the UstadG agent pipeline for a given session and message."""
    await session_service.get_or_create_session(
        app_name="ustadg", session_id=session_id, user_id="mock_user"
    )
    content = Content(parts=[Part(text=message)], role="user")
    final_reply = ""
    active_agent = "TriageAgent"

    async for event in runner.run_async(
        session_id=session_id,
        user_id="mock_user",
        new_message=content
    ):
        if event.is_final_response():
            final_reply = event.content.parts[0].text if event.content.parts else ""
            active_agent = event.author or active_agent

    return {
        "reply": final_reply or "No response generated.",
        "agent": active_agent
    }
```

---

## 3. Verification Plan

### Automated Tests
- Run `test_adk_basic.py` to verify `google-adk` connects to Gemini with the API key.
- POST to `/v1/chat` with `"مجھے کراچی میں ایک پلمبر چاہیے"` — assert `DiscoveryAgent` handoff occurs.

### Manual Verification
1. Run the MCP Server on port 8001: `.\.venv\Scripts\python.exe -m mcp_server.server`
2. Run uvicorn: `.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload`
3. POST `{"message": "I need a plumber in Karachi", "session_id": "test-1"}` to `/v1/chat`
4. Verify Triage agent greets and hands off to Discovery
5. Verify Booking agent returns a `UGK-YYYY-XXXX` confirmation ID

### Acceptance Criteria
- [x] `google-adk` installed and importable
- [ ] Triage agent greets user in Urdu/English
- [ ] Discovery agent calls `google_maps_search_providers` tool
- [ ] Negotiation agent presents Top 3 with Munasib estimates
- [ ] Booking agent records booking and returns `UGK-YYYY-XXXX`
- [ ] No "API key not valid" or "Connection error" from Gemini
