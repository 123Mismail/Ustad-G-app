# SPEC: Frontend-04 — Booking Confirmation UI

**Feature Area:** Frontend — User Interface  
**Sprint Day:** Day 5  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the `ConfirmationScreen` which confirms the user's booking with the selected provider, displays the unique Booking ID, and summarizes the service details. This acts as the final step in the user's booking flow before returning to the Dashboard.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/ConfirmationScreen.js` | The main success layout showing the Booking ID and service summary. |

---

## 3. Design Integration

* **Success Header:** A large centered icon (e.g., green checkmark circle) with the title "Booking Confirmed!".
* **Booking ID:** Prominently displayed unique ID (`UGK-2026-1234`) inside a dark card background (`Colors.cardBg`) to make it easily copyable or readable.
* **Service Summary:** A clean list detailing:
  * Provider Name
  * Service Type
  * Date & Time
  * Location
* **Actions:** A primary full-width button to "Return to Home" that resets the navigation stack back to the Dashboard.

---

## 4. Acceptance Criteria
- [ ] ConfirmationScreen is accessible by clicking "Book Now" on the ResultsScreen.
- [ ] Displays a success indicator and a mock Booking ID (e.g., UGK-YYYY-XXXX).
- [ ] Displays mock service details.
- [ ] The "Return to Home" button correctly navigates back to the Dashboard.
- [ ] Uses the typography and colors from the theme.
