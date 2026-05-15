# SPEC: Frontend-02 — Dashboard & AI Chat UI

**Feature Area:** Frontend — User Interface  
**Sprint Day:** Day 5  
**Status:** 🟡 Ready to Build  
**Depends On:** Frontend-01 (App Setup)

---

## 1. Goal

Build the main Home/Dashboard screen as specified in `design.md` and `PRD.md`. We will adapt the premium "Dashboard" aesthetic to serve as the entry point for the AI Service Orchestrator. This includes a fixed bottom navigation bar, a personalized header, and a prominent dark-themed AI Chat input card for users to make service requests in natural language.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/navigation/BottomTabNavigator.js` | 5-tab bottom navigation (Home, Map, Transfer, Settings, Profile). |
| `frontend/screens/ChatScreen.js` | The main Dashboard UI, containing the AI Chat Card, popular services slider, and recent bookings list. |
| `frontend/components/AIChatCard.js` | The dark (`#1A1A1A`) premium card with a text input and send button. |
| `frontend/components/ServiceSlider.js` | Horizontal scrolling list of popular service categories. |
| `frontend/components/RecentActivity.js` | Vertical list of recent service bookings. |

> **Note:** The `ChatScreen.js` acts as the Home screen for the app, seamlessly blending the dashboard aesthetic with the core chat functionality.

---

## 3. Design Integration

Bridging `PRD.md` (AI Service) and `design.md` (Visuals):

* **Bottom Tabs:** Fixed bottom bar with icons.
* **Header:** "Good morning, User" & "Welcome to UstadG" with a notification bell.
* **The "Balance Card" -> "AI Chat Card":** Uses the `#1A1A1A` dark background from the design doc, but instead of balance, it features the AI input field ("Muje bijli wala chahiye").
* **Card Slider:** Shows visually rich cards for "Electrician", "Plumber", etc. with the `#C1FF72` accent.
* **Recent Activity:** Shows past bookings (e.g., "AC Repair - Pending").

---

## 4. Component Details

### 4.1 Bottom Tab Navigator
- Use `@react-navigation/bottom-tabs`.
- Icons from `@expo/vector-icons/Lucide` or `Feather`.
- Active tint color: `#000000`. Inactive: `#666666`.

### 4.2 AIChatCard (The Core Interaction)
- Background: `Colors.cardBg` (`#1A1A1A`).
- Border Radius: `24px`.
- Input Field: White or dark gray input box that accepts multiline text.
- Send Button: `Colors.accent` (`#C1FF72`) circle with a send/arrow icon.
- Multilingual hint: Uses `t('chat_hint')` which translates to "How can I help you today?" or "آج میں آپ کی کیا مدد کر سکتا ہوں؟".

### 4.3 Service Slider (Horizontal)
- `FlatList` with `horizontal={true}`.
- Cards feature large rounded corners (`24px`), light grey backgrounds (`#F8F8F8`), and black typography.

---

## 5. Acceptance Criteria

- [ ] Bottom Tab Navigator is visible and allows switching tabs.
- [ ] ChatScreen renders the personalized header with user greeting.
- [ ] The dark AI Chat Card is prominent and allows text input.
- [ ] The send button is visually distinct using the lime green accent (`#C1FF72`).
- [ ] Horizontal slider allows smooth scrolling of mock services.
- [ ] The layout uses safe areas to prevent overlap with the device notch/status bar.
- [ ] No API calls are made yet (UI only).

---

## 6. Next Spec

➡️ **Frontend-03: Provider Discovery & Results UI** — Building the ranked list of providers (40/40/20 formula visual representation).
