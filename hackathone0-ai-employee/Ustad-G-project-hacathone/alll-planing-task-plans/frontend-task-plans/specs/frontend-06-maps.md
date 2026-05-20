# SPEC: Frontend-06 — Maps & Provider Discovery

**Feature Area:** Frontend — Maps  
**Sprint Day:** Day 5-6  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the Map tab to show providers on an interactive map centered on Karachi with mock location pins. Users can tap a pin/card to see provider details. This fulfills the PRD's "Discovery Agent" visual layer and the `design.md` Map tab.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/MapScreen.js` | Map view + provider list. |
| `frontend/components/MapView.js` | Embedded Leaflet/OpenStreetMap component (web-compatible). |
| `frontend/components/ProviderMapCard.js` | Bottom sheet style card for a selected provider. |
| `frontend/data/mockProviders.js` | Centralized mock provider data with lat/lng coordinates in Karachi. |

---

## 3. Design Integration
- **Map Area:** Takes top 60% of the screen. Interactive Leaflet map centered on Clifton, Karachi (24.8607, 67.0011).
- **Provider Pins:** Lime green (`#C1FF72`) markers on the map for each mock provider.
- **Bottom Provider List:** Scrollable horizontal cards below the map showing provider name, distance, rating, and availability.
- **Selection:** Tapping a provider card highlights it and pans the map.

---

## 4. Mock Data (Karachi Providers)

| Name | Service | Lat | Lng | Rating | Distance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Ali Electrician | Electrician | 24.8560 | 67.0100 | 4.5 | 2.1 km |
| Usman Fixers | Plumber | 24.8700 | 66.9900 | 4.3 | 4.8 km |
| Karachi Wiring | Electrician | 24.8530 | 67.0050 | 3.5 | 1.2 km |
| Ahmed AC Repair | AC Repair | 24.8650 | 67.0200 | 4.8 | 3.5 km |
| Bilal Cleaning | Cleaning | 24.8480 | 66.9950 | 4.1 | 5.0 km |

---

## 5. Acceptance Criteria
- [ ] Map renders centered on Karachi with provider markers.
- [ ] Provider list scrolls horizontally below the map.
- [ ] Tapping a provider card highlights it.
- [ ] Works in the browser (web-compatible map solution).
- [ ] Uses theme colors and typography.
