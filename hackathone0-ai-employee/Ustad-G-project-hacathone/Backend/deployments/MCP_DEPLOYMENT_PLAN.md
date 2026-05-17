# FastMCP Deployment Strategy: Google Cloud Run

Deploying the UstadG MCP server as a standalone service on Google Cloud Run is the ideal approach. Cloud Run is serverless, auto-scales, and natively supports Server-Sent Events (SSE) which FastMCP requires.

## Open Questions for You

> [!IMPORTANT]
> **Authentication Method**: The MCP server connects to Google Sheets using a `service_account.json` file. When deploying to Cloud Run, we can either:
> 1. Store the JSON contents as a Secret in Google Secret Manager and write it to a file at runtime.
> 2. Bind the Cloud Run service directly to a Google Cloud Service Account (recommended for security).
> 
> **Please let me know if you prefer to use the existing `service_account.json` approach or bind a native Cloud Run Service Account.**

1. Do you already have a Google Cloud Project set up with billing enabled? If so, what is the Project ID?
2. Do you have the `gcloud` CLI installed locally on your Windows machine, or would you prefer I provide instructions to use the Google Cloud Console (web interface)?

---

## The Strategy

### 1. Docker Configuration
We will create a lightweight, production-ready container for the FastMCP server.

**Dockerfile.mcp**
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy MCP server code
COPY mcp_server/ ./mcp_server/
# Copy the config module if it is shared (or adjust imports)
COPY app/config.py ./app/config.py 

# Ensure Python doesn't buffer stdout/stderr so logs appear immediately in Cloud Logging
ENV PYTHONUNBUFFERED=1

# Cloud Run sets the PORT environment variable natively
ENV MCP_PORT=8080

EXPOSE 8080

# Run the FastMCP server
CMD ["python", "-m", "mcp_server.server"]
```

**.dockerignore**
```
.venv
__pycache__
*.pyc
.env
service_account.json
```

### 2. Build and Push the Container
Using Google Cloud Build, we will build the Docker container and push it to the Artifact Registry in one command:
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/ustadg-mcp-server . -f Dockerfile.mcp
```

### 3. Configure Secret Manager
Instead of hardcoding keys in a `.env` file on the cloud, we will store them securely:
- `GOOGLE_MAPS_API_KEY` -> Secret Manager
- `GOOGLE_SHEETS_CREDENTIALS` -> Secret Manager (we will inject the raw JSON string into the environment)

### 4. Deploy to Cloud Run
We will deploy the container, ensuring that Server-Sent Events (SSE) don't timeout.
```bash
gcloud run deploy ustadg-mcp-server \
  --image gcr.io/[PROJECT_ID]/ustadg-mcp-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --timeout 3600 \
  --set-secrets="GOOGLE_MAPS_API_KEY=maps_key:latest" \
  --set-env-vars="MCP_PORT=8080"
```

> [!TIP]
> **SSE Optimization**: Cloud Run supports HTTP streaming perfectly, but we will increase the `--timeout` parameter so long-running MCP agent sessions do not get disconnected prematurely.

### 5. Update Main Backend
Once deployed, Cloud Run will provide a public HTTPS URL (e.g., `https://ustadg-mcp-server-xxxxx.a.run.app`). 
We will update the `MCP_SERVER_URL` in the main UstadG FastAPI backend's `.env` file to point to this new secure endpoint instead of `http://localhost:8001`.
