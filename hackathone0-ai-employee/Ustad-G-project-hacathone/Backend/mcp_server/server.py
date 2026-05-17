from contextlib import asynccontextmanager
from fastmcp import FastMCP
from mcp_server.tools.maps_tool import google_maps_search_providers
from mcp_server.tools.sheets_tool import google_sheets_record_booking
from mcp_server.tools.calendar_tool import google_calendar_create_appointment
from mcp_server.config import get_mcp_settings
from starlette.responses import JSONResponse, HTMLResponse

settings = get_mcp_settings()

@asynccontextmanager
async def lifespan(app=None):
    print(f"🔌 google_services_mcp starting on port {settings.port}...")
    yield
    print("🔌 google_services_mcp shutting down...")

mcp = FastMCP("google_services_mcp", lifespan=lifespan)

# Register tools
mcp.tool()(google_maps_search_providers)
mcp.tool()(google_sheets_record_booking)
mcp.tool()(google_calendar_create_appointment)

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request):
    """Public health check endpoint."""
    return JSONResponse({
        "status": "ok",
        "server": "google_services_mcp",
        "tools_count": 3
    })

@mcp.custom_route("/", methods=["GET"])
async def dashboard(request):
    """Premium HTML Dashboard for the MCP Server."""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UstadG | Google Services MCP</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #6366f1;
                --bg: #0f172a;
                --card-bg: rgba(30, 41, 59, 0.7);
                --text: #f8fafc;
                --text-dim: #94a3b8;
            }
            body {
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                color: var(--text);
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 800px;
                width: 100%;
            }
            header {
                text-align: center;
                margin-bottom: 3rem;
            }
            h1 {
                font-weight: 600;
                letter-spacing: -0.025em;
                margin-bottom: 0.5rem;
                background: linear-gradient(to right, #818cf8, #c084fc);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .status-badge {
                display: inline-block;
                padding: 0.25rem 0.75rem;
                background: rgba(34, 197, 94, 0.2);
                color: #4ade80;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 600;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
            }
            .card {
                background: var(--card-bg);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 1rem;
                transition: transform 0.2s;
            }
            .card:hover {
                transform: translateY(-4px);
                border-color: var(--primary);
            }
            .tool-name {
                font-weight: 600;
                color: var(--primary);
                margin-bottom: 0.5rem;
                font-family: monospace;
            }
            .tool-desc {
                color: var(--text-dim);
                font-size: 0.9rem;
                line-height: 1.5;
            }
            footer {
                margin-top: auto;
                padding-top: 4rem;
                color: var(--text-dim);
                font-size: 0.8rem;
                text-align: center;
            }
            code {
                background: rgba(0,0,0,0.3);
                padding: 0.2rem 0.4rem;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>UstadG Google Services MCP</h1>
                <div class="status-badge">● System Online</div>
            </header>
            
            <div class="grid">
                <div class="card">
                    <div class="tool-name">google_maps_search_providers</div>
                    <div class="tool-desc">Discover nearby service providers using Google Places API. Supports search radius and text queries.</div>
                </div>
                <div class="card">
                    <div class="tool-name">google_sheets_record_booking</div>
                    <div class="tool-desc">Append confirmed booking details to the centralized Google Sheet records.</div>
                </div>
                <div class="card">
                    <div class="tool-name">google_calendar_create_appointment</div>
                    <div class="tool-desc">Schedule calendar events for reminders and appointment tracking.</div>
                </div>
            </div>

            <section style="margin-top: 3rem; background: var(--card-bg); padding: 1.5rem; border-radius: 1rem; border: 1px dashed rgba(255,255,255,0.1);">
                <h3 style="margin-top:0">Quick Links</h3>
                <ul style="color: var(--text-dim); line-height: 2;">
                    <li>Health Check: <a href="/health" style="color: var(--primary)">/health</a></li>
                    <li>MCP SSE Stream: <a href="/sse" style="color: var(--primary)">/sse</a></li>
                    <li>Transport: <code>SSE (Server-Sent Events)</code></li>
                </ul>
            </section>

            <footer>
                UstadG Project - Phase 1 Backend | Port 8001
            </footer>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(html_content)

if __name__ == "__main__":
    mcp.run(transport="sse", host=settings.mcp_host, port=settings.port)
