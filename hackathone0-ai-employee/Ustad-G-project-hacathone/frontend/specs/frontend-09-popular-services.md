# SPEC: Frontend-09 — Popular Services Section Enhancement

**Feature Area:** Frontend — Dashboard  
**Sprint Day:** Day 6  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Enhance the "Popular Services" section on the Dashboard (`ChatScreen`) to be more visually engaging and interactive. When a user taps a service, it should automatically populate the AI Chat card with a relevant prompt (e.g., "I need an electrician near me").

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/components/ServiceSlider.js` | Update to support interactivity and richer visual data. |
| `frontend/data/popularServices.js` | [NEW] Externalize the service data for better management. |
| `frontend/screens/ChatScreen.js` | Handle callback from ServiceSlider to update the chat state. |

---

## 3. Design Integration

- **Visuals:** 
  - Each card will have a subtle gradient background or a unique accent color for its icon container.
  - Added a "Starting from" price tag to make it feel like a real marketplace.
- **Interactivity:**
  - Tapping a service card triggers a `onServiceSelect` callback.
  - This callback will pass a pre-defined prompt string to the `AIChatCard`'s input field.
- **Content:**
  - Expanded list: Electrician, Plumber, AC Repair, Cleaning, Painter, Carpenter.

---

## 4. Enhanced Data Structure

| Service | Icon | Prompt Template | Starting Price |
| :--- | :--- | :--- | :--- |
| Electrician | zap | "I need an electrician for wiring repair" | Rs. 500 |
| Plumber | droplet | "I need a plumber to fix a leak" | Rs. 400 |
| AC Repair | wind | "My AC needs servicing/repair" | Rs. 1200 |
| Cleaning | home | "I want to book a deep cleaning service" | Rs. 1500 |
| Painter | brush | "I need a quote for house painting" | Rs. 2000 |

---

## 5. Acceptance Criteria
- [ ] Service list expanded to at least 5 items.
- [ ] Tapping a service card correctly triggers a prompt update in the Chat input.
- [ ] UI reflects "Starting from" prices for each service.
- [ ] Icons have unique color treatments based on the service type.
- [ ] Uses theme colors and typography consistently.
