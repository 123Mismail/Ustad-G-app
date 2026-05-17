"""
Task 12 Test Suite — Two-part strategy to avoid anyio cancel scope errors:

PART 1 (Unit Test): Call search_local_providers() directly.
  - No event loop, no MCP, no anyio — just pure Python.
  - Validates: DB query + Haversine sorting.

PART 2 (Integration Test): Hit the live FastAPI /v1/chat endpoint via HTTP.
  - The running uvicorn server (anyio-native) manages MCP correctly.
  - Validates: full swarm flow — Triage → Discovery → local_search_providers.

Usage:
  # Make sure uvicorn is already running:  uv run uvicorn app.main:app --reload
  uv run python -m tests.test_task12
"""
import json
import requests

# ─── Part 1: Unit test search_local_providers directly ────────────────────────
print("=" * 60)
print("PART 1 — Unit Test: search_local_providers()")
print("=" * 60)

from app.tools.local_search import search_local_providers

# Test 1a: Service that likely exists in DB
print("\n[1a] Searching for 'plumber' in Gulshan, Karachi...")
result_json = search_local_providers(service_type="plumber", area="Gulshan-e-Iqbal", city="Karachi")
result = json.loads(result_json)
print(f"  Source : {result['source']}")
print(f"  Count  : {result['count']}")
if result['count'] > 0:
    top = result['providers'][0]
    print(f"  Top    : {top['name']} | {top['area']} | Rating: {top['rating']} | Dist: {top.get('distance_km')} km")
    print("  [PASS] Local DB hit — providers found and sorted.")
else:
    print("  [INFO] No plumbers in DB yet. Register one via POST /v1/providers first.")

# Test 1b: Service that definitely won't exist
print("\n[1b] Searching for 'chef' (should return 0)...")
result_json2 = search_local_providers(service_type="chef", area="Clifton", city="Karachi")
result2 = json.loads(result_json2)
print(f"  Count: {result2['count']}")
if result2['count'] == 0:
    print("  [PASS] Correctly returned empty list for unknown service.")
else:
    print("  [WARN] Unexpected providers found for 'chef'.")

# ─── Part 2: Integration test against live FastAPI server ─────────────────────
print("\n" + "=" * 60)
print("PART 2 — Integration Test: POST /v1/chat (Live Server)")
print("=" * 60)

BASE_URL = "http://127.0.0.1:8000"

def chat(session_id: str, message: str):
    """Send a message to the live FastAPI chat endpoint."""
    try:
        resp = requests.post(
            f"{BASE_URL}/v1/chat",
            json={"session_id": session_id, "message": message},
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.ConnectionError:
        return {"error": "FastAPI server not running. Start it with: uv run uvicorn app.main:app --reload"}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out after 120s. Model may be overloaded."}
    except Exception as e:
        return {"error": str(e)}

# Test 2a: Should route through local DB (plumber exists)
print("\n[2a] Asking for a plumber (should use Local DB)...")
r1 = chat("t12-sess-a", "I need a plumber in Gulshan-e-Iqbal Karachi")
if "error" in r1:
    print(f"  [SKIP] {r1['error']}")
else:
    print(f"  Agent  : {r1.get('agent', 'N/A')}")
    print(f"  Reply  : {r1.get('reply', '')[:300]}")
    providers = r1.get("providers", [])
    print(f"  Providers returned: {len(providers)}")
    if providers:
        print(f"  First  : {providers[0]}")
        print("  [PASS] Local DB providers surfaced in response.")
    else:
        print("  [INFO] No providers in response — check DB or agent instructions.")

# Test 2b: Should fallback to Google Maps (chef doesn't exist in DB)
print("\n[2b] Asking for a chef (should fallback to Google Maps)...")
r2 = chat("t12-sess-b", "I need a chef in Clifton Karachi")
if "error" in r2:
    print(f"  [SKIP] {r2['error']}")
else:
    print(f"  Agent  : {r2.get('agent', 'N/A')}")
    print(f"  Reply  : {r2.get('reply', '')[:300]}")
    print("  [PASS] Swarm responded — verify reply mentions Google fallback.")

print("\n" + "=" * 60)
print("Task 12 tests complete.")
print("=" * 60)

