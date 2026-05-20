# UstadG MCP Server (FastMCP)

The UstadG Model Context Protocol (MCP) server acts as the "hands and eyes" for the AI agents, providing secure access to local services, booking persistence, and scheduling.

## 🚀 Live Endpoint
- **URL**: `https://ustadg-mcp-603056402651.us-central1.run.app`
- **Dashboard**: Visit the root URL for a status overview.
- **Transport**: SSE (Server-Sent Events)

## 🛠️ Tech Stack
- **Framework**: [FastMCP](https://github.com/jlowin/fastmcp) (Python)
- **Deployment**: Google Cloud Run
- **Storage**: Google Sheets (Booking Persistence)
- **Location**: Google Maps API
- **Scheduling**: Google Calendar API

## 🧰 Available Tools
The server exposes the following tools to AI agents:

1.  **`google_maps_search_providers`**: Searches for specific service providers (plumbers, electricians, etc.) near a user's location using Google Places.
2.  **`google_sheets_record_booking`**: Records finalized booking details (user, provider, price, time) into a centralized Google Sheet.
3.  **`google_calendar_create_appointment`**: Schedules the service appointment on the primary Google Calendar.

## 🔑 Environment Configuration
The following secrets must be configured in Google Secret Manager for the production deployment:

| Variable | Description |
| :--- | :--- |
| `GOOGLE_MAPS_API_KEY` | API Key for Places and Geocoding. |
| `GOOGLE_SHEETS_CREDENTIALS` | JSON Service Account credentials for Google Cloud. |
| `GOOGLE_SHEETS_BOOKING_ID` | The ID of the target Google Sheet for bookings. |
| `GOOGLE_CALENDAR_ID` | The ID of the calendar (defaults to `primary`). |

## 📦 Deployment
The server is containerized using `Dockerfile.mcp` and deployed via:
```bash
gcloud run deploy ustadg-mcp-server --image gcr.io/[PROJECT_ID]/ustadg-mcp-server --platform managed
```

---
*Part of the UstadG Agentic Ecosystem*
