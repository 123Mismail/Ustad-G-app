import json
import math
import requests
from app.config import get_settings
from app.db.database import SyncSessionLocal
from app.models.provider import Provider

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate the great circle distance between two points on the earth."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2)
    c = 2 * math.asin(math.sqrt(a))
    return R * c

def search_local_providers(service_type: str, area: str, city: str = "Karachi", limit: int = 5) -> str:
    """
    Search our own local provider database using SQLAlchemy (db-agnostic).
    """
    print(f"[LOCAL SEARCH] Searching for {service_type} in {area}, {city}...")
    
    # Normalize/translate Urdu script and Roman Urdu variants to English DB keys
    raw_service = service_type.strip().lower()
    translation_map = {
        # Urdu Script
        "پلمبر": "plumber",
        "الیکٹریشن": "electrician",
        "بجلی والا": "electrician",
        "الیکٹرک": "electrician",
        "اے سی": "ac technician",
        "اےسی": "ac technician",
        "مکینک": "ac technician",
        "ٹیکنیشن": "ac technician",
        "کارپینٹر": "carpenter",
        "بڑھئی": "carpenter",
        "سویپر": "cleaner",
        "صفائی والا": "cleaner",
        
        # Common Roman Urdu Variants
        "palumber": "plumber",
        "bijli": "electrician",
        "ac mechanic": "ac technician",
        "technician": "ac technician"
    }
    
    mapped_service = translation_map.get(raw_service, raw_service)
    print(f"[LOCAL SEARCH] Mapped service type '{raw_service}' to '{mapped_service}' for database query.")
    
    providers = []
    with SyncSessionLocal() as db_session:
        try:
            results = db_session.query(Provider).filter_by(
                is_active=True,
                service_type=mapped_service
            ).all()
            
            for p in results:
                providers.append({
                    "id": p.id,
                    "name": p.name,
                    "service_type": p.service_type,
                    "area": p.area,
                    "address": p.address,
                    "phone": p.phone or "N/A",
                    "email": p.email or "N/A",
                    "lat": p.lat,
                    "lng": p.lng,
                    "rating": p.rating,
                    "price": p.price
                })
        except Exception as e:
            print(f"[LOCAL SEARCH] Database query failed: {e}")

    if not providers:
        print(f"[LOCAL SEARCH] No '{service_type}' found in database.")
        return json.dumps({"source": "local_db", "count": 0, "providers": []})

    # 2. Geocode synchronously
    user_lat, user_lng = None, None
    settings = get_settings()
    if settings.google_maps_api_key and "your_" not in settings.google_maps_api_key:
        full_address = f"{area}, {area}, {city}"
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"address": full_address, "key": settings.google_maps_api_key.strip()}
        try:
            resp = requests.get(url, params=params, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "OK" and data.get("results"):
                    loc = data["results"][0]["geometry"]["location"]
                    user_lat, user_lng = loc.get("lat"), loc.get("lng")
                    print(f"[LOCAL SEARCH] Resolved user location to {user_lat}, {user_lng}")
        except Exception as e:
            print(f"[LOCAL SEARCH] Geocoding failed: {e}")
    
    # 3. Calculate distances and format output
    provider_list = []
    for p in providers:
        dist = None
        if user_lat is not None and user_lng is not None and p.get("lat") is not None and p.get("lng") is not None:
            dist = haversine_km(user_lat, user_lng, p["lat"], p["lng"])
            
        provider_list.append({
            "id": p["id"],
            "name": p["name"],
            "service_type": p["service_type"],
            "area": p["area"],
            "address": p["address"],
            "phone": p.get("phone") or "N/A",
            "email": p.get("email") or "N/A",
            "rating": p["rating"],
            "price": p["price"],
            "distance_km": round(dist, 2) if dist is not None else None
        })

    # 4. Sort by distance (if available), then by rating
    provider_list.sort(key=lambda x: (x["distance_km"] if x["distance_km"] is not None else float('inf'), -x["rating"]))
    
    # Apply limit
    provider_list = provider_list[:limit]

    print(f"[LOCAL SEARCH] Found {len(provider_list)} local providers.")
    
    return json.dumps({
        "source": "local_db",
        "count": len(provider_list),
        "providers": provider_list
    }, indent=2)
