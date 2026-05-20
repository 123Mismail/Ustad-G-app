# Plan: Frontend-12 — Admin Analytics Dashboard
**Spec Reference:** `specs/frontend-12-analytics.md`  
**Status:** 🟢 Completed  

---

## 1. File Modification Plan

### [NEW] `frontend/screens/AnalyticsScreen.js`
- Create screen layout for the Admin dashboard.
- Display "Orders Today", "Orders This Week", "Orders This Month".
- Use mocked data and a placeholder bar chart.

### [NEW] `frontend/components/StatCard.js`
- Create a reusable component for displaying metric values with trend indicators.

### [MODIFY] `frontend/navigation/BottomTabNavigator.js`
- Conditionally render the Analytics tab (icon: `bar-chart-2`) only if `userRole === 'admin'`.

### [MODIFY] `frontend/utils/i18n.js`
- Add keys for `analytics`, `orders_today`, `orders_week`, `orders_month` across `en`, `ur`, and `roman_ur`.

---

## 2. Execution Order
1. Update `i18n.js`.
2. Create `StatCard.js` component.
3. Create `AnalyticsScreen.js`.
4. Update `BottomTabNavigator.js`.
5. Verify conditionally rendered UI in the browser.
