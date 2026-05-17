# SPEC: Frontend-13 — Revenue Chart Component

**Feature Area:** Frontend — Admin Analytics  
**Sprint Day:** Day 7  
**Status:** 🟡 Ready to Build  

---

## 1. Goal
Replace the basic placeholder in the Analytics Dashboard with a highly visual, functional-looking **Revenue Chart**. This chart will display daily revenue over the past 7 days to give admins a clear view of platform earnings.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/components/RevenueChart.js` | [NEW] A custom bar chart component built natively without external heavy libraries. |
| `frontend/screens/AnalyticsScreen.js` | Import and render the new `RevenueChart` component, removing the placeholder. |
| `frontend/utils/i18n.js` | Add translation keys for the chart title. |

---

## 3. Design Integration

- **Custom Component:** Instead of importing `react-native-chart-kit` (which can have web compatibility issues and heavy bundle sizes), build a sleek bar chart using flexbox `View` elements.
- **Data Structure:** Mock data containing an array of 7 objects: `{ day: 'Mon', value: 12000 }`.
- **Y-Axis:** Display scale markers on the left (e.g., 0, 10k, 20k).
- **X-Axis:** Display the day labels at the bottom.
- **Visuals:** 
  - Standard bars will be muted (`Colors.bgSecondary` or `textMuted` with low opacity).
  - The bar representing the highest revenue day will be highlighted using the primary `Colors.accent` (`#C1FF72`).
- **Responsive Heights:** The height of each bar will be calculated dynamically as a percentage relative to the maximum value in the dataset.

---

## 4. Acceptance Criteria
- [ ] `RevenueChart` component is created and integrated into `AnalyticsScreen`.
- [ ] Chart displays 7 bars representing days of the week.
- [ ] The highest value bar is visually distinct (highlighted with the accent color).
- [ ] Y-axis scale and X-axis labels are clearly legible.
- [ ] The chart title ("Revenue This Week") supports multiple languages via `i18n.js`.
