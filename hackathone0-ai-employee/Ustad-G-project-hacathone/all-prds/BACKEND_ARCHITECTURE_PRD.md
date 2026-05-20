# BACKEND ARCHITECTURE PRD: UstadG (v2.0)
> **Major Update v2.0:** Migrated orchestration framework from OpenAI Agents SDK to **Google Agent Development Kit (ADK)** for native Gemini support, reliable API key authentication, and production-ready multi-agent pipelines.

## 1. Executive Summary
UstadG is an Agentic AI system designed to automate service discovery and booking. The backend development is divided into two phases to ensure a fast, functional delivery:
- **Phase 1 (MVP/Winning Feature):** Establish the "Steel Thread" with the **"Munasib" Negotiation Agent** — a localized reasoning engine that simulates bargaining to find the best value-for-money deals in Urdu/English.
- **Phase 2 (Feature Richness):** Implement Supabase-based User Management, personalized agent reasoning, real-time push notifications, and an analytics dashboard.

## 2. Technical Stack

| Component | Technology | Notes |
| :--- | :--- | :--- |
| **Web Framework** | FastAPI (Python 3.10+) | REST API, streaming support |
| **Agent Orchestration** | **Google ADK (`google-adk`)** | ✅ Replaces OpenAI Agents SDK |
| **Primary LLM** | `gemini-2.5-flash` via ADK | Native API key auth (no OAuth issues) |
| **Tool Architecture** | FastMCP Server (Google Maps + Sheets + Calendar) | Port 8001 |
| **Session Management** | ADK `InMemorySessionService` → Supabase (Phase 2) | |
| **Identity & DB** | Supabase (Auth, PostgreSQL) | Phase 2 |
| **Persistence** | Google Sheets (Bookings) + Supabase (Trace Logs) | |
| **Notifications** | Expo Push Notification SDK | Phase 2 |
| **External APIs** | Google Maps Places API, Google Sheets API, Google Calendar API | Via MCP |
| **Authentication** | `GEMINI_API_KEY` (direct, no Bearer/OAuth issues) | |

### 2.1 Why Google ADK?

> **Root Cause of Previous Failures:**
> The Gemini OpenAI-compatible shim (`v1beta/openai/`) requires `Authorization: Bearer <OAuth_token>` — NOT the `x-goog-api-key` format. Google Gemini API keys are NOT OAuth Bearer tokens. This caused all "API key not valid" errors when using the OpenAI SDK or OpenAI Agents SDK.

**Google ADK solves this by:**
- Using the native Gemini Python client internally, which correctly handles `x-goog-api-key` authentication.
- Providing first-class support for multi-agent handoffs, tool calling, and session memory.
- Offering a `Runner` + `InMemorySessionService` pattern that maps directly to our FastAPI session architecture.
- Built-in `adk web` development UI for visualizing agent traces and handoffs.

## 3. Agent Orchestration & Services

The system uses Google ADK's `LlmAgent` with a **hierarchical sub-agent** delegation model. Each agent has a `description` that the Gemini model uses to decide when to hand off to a sub-agent.

### 3.1 Agent Definitions

```
TriageAgent (root)
    └── DiscoveryAgent (sub_agent)
            └── NegotiationAgent (sub_agent)
                    └── BookingAgent (sub_agent)
```

#### 1. Triage / Intent Agent (`TriageAgent`)
- **ADK Class:** `LlmAgent`
- **Model:** `gemini-2.5-flash`
- **Goal:** Extract `service`, `location`, `time`, `budget_sensitivity` from multilingual (Urdu/English) input.
- **Handoff Trigger:** When intent is parsed, delegate to `DiscoveryAgent` via `sub_agents`.
- **Language:** Greets in Urdu/English mix ("Assalam-o-Alaikum!")

#### 2. Discovery Agent (`DiscoveryAgent`)
- **ADK Class:** `LlmAgent`
- **Model:** `gemini-2.5-flash`
- **Goal:** Query Google Maps for providers within a 10km radius.
- **Tool:** `google_maps_search_providers` (via FastMCP)
- **Handoff Trigger:** Passes provider list to `NegotiationAgent`.

#### 3. Negotiation Agent — "Munasib" ⭐ CORE FEATURE (`NegotiationAgent`)
- **ADK Class:** `LlmAgent`
- **Model:** `gemini-2.5-flash`
- **Goal:** Rank providers and negotiate the best deal. Present **Top 3 with Munasib Price Estimates**.
- **Logic:**
    - **Initial Bargain:** Weight by `distance (40%) + rating (40%) + availability_estimate (20%)`
    - **Iterative Loop:** Respond to *"Aur sasta dhoondo"* by re-ranking.
    - **Price Floor Reasoning:** Explain why a lower price isn't feasible.
- **Output:** JSON array of 3 providers with `munasib_price_estimate` and `justification_ur`/`justification_en`.
- **Handoff Trigger:** When user selects a provider, delegate to `BookingAgent`.

#### 4. Booking Agent (`BookingAgent`)
- **ADK Class:** `LlmAgent`
- **Model:** `gemini-2.5-flash`
- **Goal:** Generate `UGK-YYYY-XXXX` confirmation ID and record booking.
- **Tools:** `google_sheets_record_booking`, `google_calendar_create_appointment` (via FastMCP)
- **Output:** Final confirmation in Urdu/English ("Shukriya!")

### 3.2 Google ADK Integration Pattern

```python
# app/agents/orchestrator.py
from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Native Gemini auth — no OAuth/Bearer issues
os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key

booking_agent = LlmAgent(
    name="BookingAgent",
    model="gemini-2.5-flash",
    description="Finalizes bookings and records them in Google Sheets.",
    instruction=booking_instructions,
    tools=[google_sheets_record_booking, google_calendar_create_appointment]
)

negotiation_agent = LlmAgent(
    name="NegotiationAgent",
    model="gemini-2.5-flash",
    description="Ranks providers and negotiates Munasib prices.",
    instruction=negotiation_instructions,
    sub_agents=[booking_agent]
)

discovery_agent = LlmAgent(
    name="DiscoveryAgent",
    model="gemini-2.5-flash",
    description="Finds service providers near the user using Google Maps.",
    instruction=discovery_instructions,
    tools=[google_maps_search_providers],
    sub_agents=[negotiation_agent]
)

triage_agent = LlmAgent(
    name="TriageAgent",
    model="gemini-2.5-flash",
    description="Entry point. Greets user and parses service intent.",
    instruction=triage_instructions,
    sub_agents=[discovery_agent]
)

# Session + Runner
session_service = InMemorySessionService()
runner = Runner(agent=triage_agent, session_service=session_service, app_name="ustadg")
```

### 3.3 FastAPI Integration Pattern

```python
# app/routers/chat.py
from google.adk.types import Content, Part

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session = await session_service.get_or_create_session(
        app_name="ustadg", session_id=request.session_id
    )
    content = Content(parts=[Part(text=request.message)], role="user")
    
    async for event in runner.run_async(
        session_id=request.session_id,
        user_id="mock_user",
        new_message=content
    ):
        if event.is_final_response():
            return ChatResponse(reply=event.text, session_id=request.session_id)
```

## 4. Multi-Model Strategy

- **Primary Model:** `gemini-2.5-flash` (all agents) — fast, cost-effective, native ADK support.
- **Phase 2 Option:** `gemini-2.5-pro` for NegotiationAgent deep reasoning.
- **Authentication:** `GEMINI_API_KEY` via `GOOGLE_API_KEY` environment variable (ADK standard).

## 5. API Endpoints (FastAPI)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/v1/chat` | Primary entry point; runs the ADK agent pipeline |
| `GET` | `/v1/providers` | Returns ranked providers for a session |
| `POST` | `/v1/book` | Explicitly triggers the booking agent |
| `GET` | `/v1/trace/{session_id}` | Streams agent event logs (SSE) |
| `GET` | `/v1/health` | System status + Gemini API + MCP connectivity |
| `POST` | `/v1/auth/signup` | User registration (Phase 2) |
| `POST` | `/v1/auth/login` | JWT issuance (Phase 2) |
| `GET` | `/v1/analytics` | Admin dashboard data (Phase 2) |

## 6. Data Schema & Persistence

### 6.1 Google Sheets Booking Schema
| Column | Description |
| :--- | :--- |
| ID | Auto-incrementing unique ID |
| Timestamp | ISO-8601 creation time |
| User | Mock user or authenticated user name |
| Service | Type of service (e.g., Plumber, Electrician) |
| Provider | Name of the assigned provider |
| Status | Pending / Confirmed / Completed |
| Confirmation ID | `UGK-YYYY-XXXX` format |

### 6.2 Agent Trace Schema (ADK Events)
- `timestamp`: ISO-8601
- `agent_name`: Name of the active ADK agent
- `event_type`: `tool_call`, `handoff`, `final_response`, `error`
- `input`: Prompt or tool arguments received
- `output`: Text response or tool result
- `session_id`: Linked session

## 7. Security & Configuration

```env
# .env
GEMINI_API_KEY=...              # Used as GOOGLE_API_KEY for ADK
GOOGLE_MAPS_API_KEY=...         # Maps Places API
GOOGLE_SHEETS_CREDENTIALS=...  # service_account.json path
GOOGLE_SHEETS_BOOKING_ID=...    # Target spreadsheet ID
GOOGLE_CALENDAR_ID=...          # Calendar for appointments
MCP_SERVER_URL=http://localhost:8001
CORS_ORIGINS=*
```

## 8. Dependencies

```txt
# Core
fastapi>=0.115.0
uvicorn[standard]>=0.35
python-dotenv>=1.1.0
pydantic-settings>=2.0.0

# Google ADK (replaces openai-agents)
google-adk>=1.0.0

# MCP Server
mcp>=1.23.1
fastmcp==2.14.0

# Google APIs (MCP Tools)
google-api-python-client==2.127.0
google-auth==2.29.0

# Utilities
httpx>=0.28.1
python-dateutil==2.9.0
```

## 9. Implementation Roadmap

### 9.1 Phase 1 — "Steel Thread" (Current Sprint)
| # | Task | Status |
| :- | :--- | :--- |
| 1 | FastAPI scaffolding + schemas | ✅ Done |
| 2 | FastMCP server (Maps + Sheets + Calendar) | ✅ Done |
| 3 | Mock identity middleware | ✅ Done |
| 4 | **Install & configure `google-adk`** | 🔲 Next |
| 5 | **Refactor agents → `LlmAgent` with `sub_agents`** | 🔲 Next |
| 6 | **Refactor orchestrator → ADK `Runner`** | 🔲 Next |
| 7 | **Update chat router → ADK session events** | 🔲 Next |
| 8 | End-to-end test (Triage → Booking) | 🔲 Next |

### 9.2 Phase 2 — Feature Richness
1. **Identity & Auth:** Supabase Auth + JWT on all protected endpoints.
2. **Personalized Agents:** Saved addresses, preferred language, past providers.
3. **Analytics Service:** Aggregated data for the admin dashboard.
4. **Notification Service:** Expo Push Notifications for booking lifecycle.
5. **Persistent Trace:** ADK event logs stored in Supabase PostgreSQL.

---
**Version:** 2.0 | **Project:** UstadG | **Author:** Antigravity Agent | **Updated:** 2026-05-16
