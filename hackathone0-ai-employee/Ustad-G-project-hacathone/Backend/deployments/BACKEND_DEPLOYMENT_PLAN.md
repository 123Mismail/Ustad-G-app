# FastAPI Backend Deployment Strategy: Google Cloud Run

This plan outlines the steps to deploy the UstadG FastAPI backend to Google Cloud Run, utilizing the work already done for PostgreSQL readiness and environment configuration.

## Objective
Deploy the main FastAPI backend (`Backend/app/main.py`) to a serverless, auto-scaling environment on Google Cloud Run.

## Prerequisites
1.  **Google Cloud Project**: You already have one (used for MCP).
2.  **GCloud CLI**: Installed and authenticated.
3.  **PostgreSQL Instance**: Since Cloud Run is stateless, you need a managed PostgreSQL database (e.g., Google Cloud SQL, Neon, or Supabase).
4.  **Secrets**: Sensitive keys (Gemini, OpenAI, Database URL) should be stored in Google Secret Manager.

---

## 1. Implementation Steps

### Step 1: Create Container Configuration
We need a production-ready `Dockerfile` and a `.dockerignore` file for the main application.

**Dockerfile**
```dockerfile
FROM python:3.12-slim

# Install system dependencies for psycopg2 (if needed)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Ensure Python doesn't buffer logs
ENV PYTHONUNBUFFERED=1

# Default port for Cloud Run
ENV PORT=8080

EXPOSE 8080

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**.dockerignore**
```
.venv
__pycache__
*.pyc
.env
ustadg.db
tests/
scratch/
deployments/
plans/
trace/
*.jpeg
*.png
```

### Step 2: Build and Push to Artifact Registry
Build the image and push it to Google Cloud's container registry.

```bash
gcloud builds submit --tag gcr.io/vertical-shore-471312-a5/ustadg-backend .
```

### Step 3: Secret Management (Google Secret Manager)
Ensure the following secrets are created in Google Secret Manager:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `DATABASE_URL` (format: `postgresql+asyncpg://user:pass@host:5432/db`)
- `GOOGLE_MAPS_API_KEY`
- `JWT_SECRET`

### Step 4: Deploy to Cloud Run
Deploy the backend service and map the secrets to environment variables.

```bash
gcloud run deploy ustadg-backend \
  --image gcr.io/vertical-shore-471312-a5/ustadg-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=gemini_key:latest,DATABASE_URL=db_url:latest,OPENAI_API_KEY=openai_key:latest,GOOGLE_MAPS_API_KEY=maps_key:latest" \
  --set-env-vars="APP_ENV=production,MCP_SERVER_URL=https://ustadg-mcp-603056402651.us-central1.run.app"
```

---

## 2. Verification & Testing
1.  **Health Check**: Visit `https://[SERVICE_URL]/health` (if implemented) or `https://[SERVICE_URL]/docs` to verify the Swagger UI loads.
2.  **Database Connection**: Check logs to ensure the backend successfully connected to the PostgreSQL instance.
3.  **MCP Integration**: Ensure the `MCP_SERVER_URL` environment variable is pointing to your previously deployed MCP service.

---

## 3. Migration (Optional but Recommended)
If you have existing data in `ustadg.db`, you will need to migrate it to the PostgreSQL instance.
1. Use a tool like `pgloader` or export the SQLite data to CSV and import into Postgres.
2. Ensure the tables are created by the backend (SQLAlchemy will handle this if `Base.metadata.create_all` is called, though migrations like Alembic are better for production).

*Version: 1.0 | Feature: Cloud Run Deployment | Project: UstadG | Created: 2026-05-20*
