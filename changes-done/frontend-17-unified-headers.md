# Unified Premium Page Headers (Frontend-17)

**Goal:** Create a consistent brand experience by applying the "Dark Glass" header theme across all primary and secondary screens.

---

## 1. New Component: `PageHeader.js`

**Location:** `frontend/components/PageHeader.js`

### Design Specifications:
- **Background:** `LinearGradient` from `#1A1A1A` to `#2A2A2A`.
- **Bottom Border:** 1px width, color `#C1FF7220`.
- **Shadow:** Subtle neon glow (`#C1FF72`) on iOS, elevation on Android.
- **Typography:** Bold white text for titles (`#FFFFFF`).
- **Interactive Elements:**
    - Optional **Back Button** with neon arrow.
    - Optional **Right Widget** (e.g., badges, icons).

---

## 2. Screens to be Updated

| Screen | Header Change |
| :--- | :--- |
| **Bookings (`TransferScreen.js`)** | Replace white header with `PageHeader`. Move the count badge into the header as a right element. |
| **Analytics (`AnalyticsScreen.js`)** | Replace white header with `PageHeader`. Use a neon activity icon on the right. |
| **Profile (`ProfileScreen.js`)** | Replace the `screenTitle` text with a `PageHeader`. |
| **Notifications (`NotificationScreen.js`)** | Replace the custom white header with `PageHeader`. Ensure the "Clear All" link is styled as a right element. |

---

## 3. Benefits
- **Brand Cohesion:** The app no longer feels like separate screens; it feels like one premium "UstadG" experience.
- **Improved Hierarchy:** The dark header anchors the page and provides better contrast for the white titles.
- **Code Reuse:** Centralizes header logic into one component.

---

## 4. Implementation Steps
1. Create `frontend/components/PageHeader.js`.
2. Update `TransferScreen.js` to use `PageHeader`.
3. Update `AnalyticsScreen.js` to use `PageHeader`.
4. Update `ProfileScreen.js` to use `PageHeader`.
5. Update `NotificationScreen.js` to use `PageHeader`.
6. Verify layout and navigation (back buttons) across all screens.
