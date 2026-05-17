# Plan: Frontend-13 — Revenue Chart Component
**Spec Reference:** `specs/frontend-13-revenue-chart.md`  
**Status:** 🟡 Ready to Execute  

---

## 1. File Modification Plan

### [NEW] `frontend/components/RevenueChart.js`
- Create a reusable functional component that accepts `data` as a prop.
- Example data structure: `[{ label: 'Mon', value: 12000 }, ...]`.
- Calculate the `maxValue` dynamically to scale bar heights.
- Render:
  - **Header**: Title text (`revenue_this_week`).
  - **Chart Area**: Flex-row container.
  - **Y-Axis**: Flex-column with 3 labels (max, mid, 0) aligned to the left.
  - **Bars**: Map over the data. Each bar will have a `height` percentage = `(value / maxValue) * 100%`.
  - **Highlight**: If `value === maxValue`, set background color to `Colors.accent`, otherwise use `rgba(255,255,255,0.1)`.

### [MODIFY] `frontend/screens/AnalyticsScreen.js`
- Import `RevenueChart`.
- Replace the current `<View style={styles.chartPlaceholder}>` with `<RevenueChart />`.
- Pass mock data into the component.

### [MODIFY] `frontend/utils/i18n.js`
- Add `revenue_this_week` string:
  - `en`: "Revenue This Week"
  - `ur`: "اس ہفتے کی آمدنی"
  - `roman_ur`: "Is Hafte ki Amadni"

---

## 2. Execution Order
1. Update `i18n.js` with new translations.
2. Build the `RevenueChart.js` component with flexbox styling.
3. Update `AnalyticsScreen.js` to render the chart.
4. Verify layout and responsiveness via browser testing.
