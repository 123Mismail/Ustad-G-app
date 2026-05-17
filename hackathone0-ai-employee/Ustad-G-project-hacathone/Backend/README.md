# UstadG Backend — Phase 1

> **Stack:** FastAPI · Google ADK · Gemini 2.0 Flash · FastMCP · Google APIs · Arize Phoenix (Tracing)

---

## Prerequisites

- Python **3.10+**
- `pip`
- API keys (see Environment Setup below)

---

## Setup

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Create & activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
# source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux

# Fill in your API keys in .env
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key | ✅ Yes |
| `GOOGLE_MAPS_API_KEY` | Google Maps Places API key | ✅ Yes |
| `GOOGLE_SHEETS_CREDENTIALS` | Path to service account JSON | ✅ Yes |
| `GOOGLE_SHEETS_BOOKING_ID` | Google Sheet ID for bookings | ✅ Yes |
| `PRIMARY_MODEL` | LLM for Negotiation Agent | Optional (default: gemini-pro-1.5) |
| `FAST_MODEL` | LLM for Triage Agent | Optional (default: gemini-flash-1.5) |
| `MCP_SERVER_URL` | URL of FastMCP server | Optional (default: localhost:8001) |

---

## Running the App

```bash
# Development (with hot reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Verify Setup

| Check | URL | Expected |
|-------|-----|----------|
| API Root | http://localhost:8000/ | `{"project": "UstadG", ...}` |
| Swagger UI | http://localhost:8000/docs | Interactive API docs |
| Health Check | http://localhost:8000/v1/health | `{"status": "ok" or "degraded", ...}` |
| Chat (stub) | POST http://localhost:8000/v1/chat | `501 Not Implemented` |

---

## Running the MCP Server (Task 2)

### Local Development
```bash
# In a separate terminal
python -m mcp_server.server
# Runs on port 8080 (or as configured in .env)
```

### Deployment (Google Cloud Run)
The MCP server is containerized and deployed to Google Cloud Run.

1. **Prepare Environment:**
   ```bash
   python scratch/prepare_env_yaml.py
   ```
2. **Build & Deploy:**
   ```powershell
   powershell -File scratch/deploy_mcp.ps1
   ```

**Current Production URL:** `https://ustadg-mcp-603056402651.us-central1.run.app`

---

## Project Structure

```
Backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Settings (pydantic-settings)
│   ├── routers/             # One file per endpoint group
│   ├── agents/              # OpenAI Agents SDK swarm (Task 5)
│   ├── tools/               # MCP client wrapper (Task 7)
│   ├── middleware/          # MockUser injection (Phase 1)
│   └── schemas/             # Pydantic request/response models
├── mcp_server/              # FastMCP server (Task 2)
├── plans/                   # Task-level implementation plans
├── .env.example             # Environment variable template
├── requirements.txt         # Python dependencies
└── README.md
```

---

## Phase 1 Task Progress

See [`PHASE1_TASKS.md`](./PHASE1_TASKS.md) for the full task list.

| Task | Status |
|------|--------|
| Task 1 — Project Scaffolding | ✅ Complete |
| Task 2 — MCP Server | ✅ Complete |
| Task 3 — FastAPI Scaffolding | ✅ Complete |
| Task 4 — Mock Identity | ✅ Complete |
| Task 5 — Agent Swarm | ⬜ In Progress (ADK Migration) |
| Task 6 — API Endpoints | ⬜ In Progress |
| Task 7 — Google ADK Integration | ⬜ In Progress |
| Task 8 — Testing & Tracing | ⬜ In Progress (Phoenix Setup) |
