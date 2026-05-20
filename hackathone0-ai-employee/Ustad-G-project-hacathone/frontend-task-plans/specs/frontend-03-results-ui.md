# SPEC: Frontend-03 — Provider Discovery & Results UI

**Feature Area:** Frontend — User Interface  
**Sprint Day:** Day 5  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Build the `ResultsScreen` which displays the service providers found by the Discovery Agent and sorted by the Ranking Agent. We will adapt the "Action Center" from `design.md` to show a horizontal selection of providers and a detailed breakdown of their 40/40/20 score.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/ResultsScreen.js` | The main results layout with a back button, provider selector, and "Book Now" button. |
| `frontend/components/ProviderCard.js` | A selectable rounded square card representing a provider (from design.md Selection Area). |
| `frontend/components/ScoreBreakdown.js` | A vertical list showing the selected provider's Distance (40%), Rating (40%), and Availability (20%). |

---

## 3. Design Integration

* **Top Bar:** Back arrow on the left, center-aligned title "Select Provider" (or translated equivalent).
* **Selection Area:** Horizontal `FlatList` of `ProviderCard`s. Active selection has a distinct border (`#000000`).
* **Action List (Score Breakdown):** Titled section showing why this provider was recommended (transparency for the Agent's reasoning).
* **Submit Button:** Large full-width button at the bottom: "Book [Provider Name]" (`Colors.accent`).

---

## 4. Acceptance Criteria
- [ ] ResultsScreen is accessible via navigation (we'll wire the "Send" button in ChatScreen to test it).
- [ ] Top bar has a functional back button.
- [ ] Horizontal selection correctly highlights the active provider.
- [ ] Score breakdown updates when a different provider is selected.
- [ ] "Book Now" button navigates to the ConfirmationScreen.
- [ ] Uses the typography and colors from the theme.
