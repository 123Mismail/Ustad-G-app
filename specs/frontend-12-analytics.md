# SPEC: Frontend-12 — Admin Analytics Dashboard

**Feature Area:** Frontend — Admin Tools  
**Sprint Day:** Day 7  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Provide an Analytics Dashboard for users with the `admin` role. This dashboard will display high-level metrics about orders (bookings) grouped by Day, Week, and Month to help the system administrator monitor platform health and usage.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/screens/AnalyticsScreen.js` | [NEW] Main screen for admin statistics. |
| `frontend/components/StatCard.js` | [NEW] Reusable card for displaying a metric (e.g., "Orders Today: 12"). |
| `frontend/navigation/BottomTabNavigator.js` | Conditionally render the Analytics tab for admins. |
| `frontend/utils/i18n.js` | Add translation keys for analytics. |

---

## 3. Design Integration

- **Tab Navigation:** Add a new tab called "Analytics" (with a `bar-chart-2` icon) that is ONLY visible when `userRole === 'admin'`.
- **Layout:**
  - Header: "System Analytics"
  - A segmented control or a clean list grouping stats by:
    - **Today:** e.g., 14 Orders
    - **This Week:** e.g., 85 Orders
    - **This Month:** e.g., 342 Orders
  - **Visuals:** Use large Typography, `Colors.accent` for numbers, and a clean card layout `(BorderRadius.card)`. We can also mock a simple visual bar chart using colored `View` elements.

---

## 4. Acceptance Criteria
- [ ] Admin user sees a new "Analytics" tab.
- [ ] Regular user does NOT see the "Analytics" tab.
- [ ] AnalyticsScreen displays mock metrics for Day, Week, and Month.
- [ ] UI is polished and consistent with the dark theme.
- [ ] Multilingual support for the new screen strings.
