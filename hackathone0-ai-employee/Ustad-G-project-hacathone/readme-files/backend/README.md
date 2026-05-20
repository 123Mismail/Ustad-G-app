# UstadG Backend — Production Ready

> **Stack:** FastAPI · Google ADK · Gemini 2.0 Flash · FastMCP · PostgreSQL (Neon) · Google Cloud Run

---

## 🚀 Live Deployment
- **API URL**: `https://ustadg-backend-603056402651.us-central1.run.app`
- **Documentation**: [Swagger UI](https://ustadg-backend-603056402651.us-central1.run.app/docs)
- **Health Check**: [v1/health](https://ustadg-backend-603056402651.us-central1.run.app/v1/health)

---

## 🛠️ Features
- **Agentic Orchestration**: Uses Google ADK to manage a swarm of specialized agents (Munasib, Triage, etc.).
- **Authentication**: Secure JWT-based auth system for users and admins.
- **Database**: Dialect-agnostic SQLAlchemy setup, currently using **PostgreSQL (Neon)** for production and SQLite for local tests.
- **MCP Integration**: Connects to a standalone FastMCP server for real-world tool execution (Maps, Sheets, Calendar).
- **Push Notifications**: Integrated with Firebase Admin SDK for mobile push alerts.

---

## 🔑 Production Environment Variables (Secret Manager)
The following keys must be set in **Google Secret Manager** for the Cloud Run deployment:

| Secret Name | Description |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string (asyncpg). |
| `GEMINI_API_KEY` | Google Gemini API access. |
| `OPENAI_API_KEY` | OpenAI API access (for compatibility/fallback). |
| `GOOGLE_MAPS_API_KEY` | Places and Geocoding services. |
| `JWT_SECRET` | Secret key for signing access tokens. |
| `GOOGLE_SHEETS_CREDENTIALS` | JSON string of the service account. |

---

## 📦 Deployment Instructions

### 1. Build the Image
```bash
gcloud builds submit --tag gcr.io/vertical-shore-471312-a5/ustadg-backend .
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy ustadg-backend \
  --image gcr.io/vertical-shore-471312-a5/ustadg-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="PRIMARY_MODEL=primary_model:latest,FAST_MODEL=fast_model:latest,GEMINI_API_KEY=gemini_api_key:latest,DATABASE_URL=database_url:latest" \
  --set-env-vars="APP_ENV=production,MCP_SERVER_URL=https://ustadg-mcp-603056402651.us-central1.run.app"
```

---

## 🧪 Local Development
1. `pip install -r requirements.txt`
2. Create `.env` from `.env.example`.
3. Run `uvicorn app.main:app --reload`.

*Version: 1.1 | Project: UstadG | Created: 2026-05-20*
