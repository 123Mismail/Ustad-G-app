import httpx
from app.config import get_settings

async def geocode_address(address: str, area: str, city: str) -> tuple[float | None, float | None]:
    """
    Geocode an address using the Google Maps Geocoding API.
    Returns (lat, lng) tuple, or (None, None) if geocoding fails.
    """
    settings = get_settings()
    if not settings.google_maps_api_key or "your_google_maps_api_key" in settings.google_maps_api_key:
        print("[GEOCODING] No valid Google Maps API Key found in settings.")
        return None, None

    full_address = f"{address}, {area}, {city}"
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": full_address,
        "key": settings.google_maps_api_key.strip()
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK" and data.get("results"):
                    location = data["results"][0]["geometry"]["location"]
                    lat = location.get("lat")
                    lng = location.get("lng")
                    print(f"[GEOCODING] Successfully resolved '{full_address}' to ({lat}, {lng})")
                    return lat, lng
                else:
                    print(f"[GEOCODING] API returned non-OK status: {data.get('status')} for '{full_address}'")
            else:
                print(f"[GEOCODING] Geocoding request failed with status code: {response.status_code}")
    except Exception as e:
        print(f"[GEOCODING] Error during geocoding: {e}")

    return None, None
