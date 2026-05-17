# Spec: Frontend-14 — Gradient Hero Banner

**Feature:** Home Screen — Gradient Hero Banner  
**Replaces:** Plain `<View style={styles.header}>` in `ChatScreen.js`  
**New Component:** `HeroBanner.js`  
**Spec Author:** UstadG Dev  
**Date:** May 15, 2026

---

## 1. Goal

Replace the minimal two-line text header on `ChatScreen` with a rich, full-width **Gradient Hero Banner** component that:
- Creates a strong first impression aligned with the dark/neon brand palette
- Communicates contextual info (time-based greeting, city, live provider count)
- Feels like a premium app from the first glance

---

## 2. Dependency

Install one new package:

```bash
npx expo install expo-linear-gradient
```

No other new dependencies needed.

---

## 3. New Component: `HeroBanner.js`

**Location:** `frontend/components/HeroBanner.js`

### 3.1 Visual Layout

```
┌─────────────────────────────────────────────────┐
│  ☀️  Good morning,            [🔔 Bell Icon]    │  ← Top Row
│      Welcome to UstadG                          │
│                                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  ← Divider
│                                                 │
│  [ 📍 Karachi ]   [ ⚡ 6 Services Available ]  │  ← Stats Row
└─────────────────────────────────────────────────┘
```

### 3.2 Gradient Specification

| Property      | Value                                      |
| :------------ | :----------------------------------------- |
| Type          | `LinearGradient` (from `expo-linear-gradient`) |
| Colors        | `['#1A1A1A', '#2A2A2A']` (dark, dark-mid) |
| Start         | `{ x: 0, y: 0 }`                          |
| End           | `{ x: 1, y: 1 }`                          |
| Border Radius | `24` (matches `BorderRadius.card`)         |
| Padding       | `20` horizontal, `22` vertical             |
| Margin Bottom | `16`                                       |

A subtle **accent glow** is achieved via a `shadowColor: '#C1FF72'` shadow on the outer container (iOS) and a thin `borderColor: '#C1FF7220'` border (both platforms).

### 3.3 Top Row

| Element        | Detail                                                                                   |
| :------------- | :--------------------------------------------------------------------------------------- |
| Greeting       | Dynamically derived from device time: `Good morning`, `Good afternoon`, `Good evening` |
| Name           | Hardcoded as `"User"` for now (to be replaced by real auth in later sprint)             |
| App Name       | `t('app_name', language)` — supports all 3 languages                                   |
| Bell Icon      | `Feather 'bell'` size `22`, color `#C1FF72` (accent), navigates to `Notifications`     |
| Bell Color     | Always `Colors.accent` (#C1FF72) so it pops against the dark background                 |

### 3.4 Divider

A 1px horizontal rule with `backgroundColor: '#FFFFFF15'` (subtle white translucent line).

### 3.5 Stats Row

Two pill-shaped stat badges side by side:

| Badge | Icon | Label | Value (hardcoded mock) |
| :---- | :--- | :---- | :--------------------- |
| City  | `map-pin` | — | `Karachi` |
| Providers | `zap` | — | `6 Available` |

**Pill Style:**
- Background: `#FFFFFF12` (glass-morphism feel)
- Border: `1px solid #FFFFFF20`
- Border Radius: `20`
- Padding: `6px 12px`
- Icon color: `#C1FF72`
- Text color: `#FFFFFF`
- Font: `Inter_400Regular`, size `12`

---

## 4. Props Interface

```js
// HeroBanner.js
// Props:
// - onBellPress: () => void  — navigates to NotificationScreen
// No other props; language is read from LanguageContext internally
```

---

## 5. Changes to `ChatScreen.js`

1. **Remove** the current `<View style={styles.header}>` block (lines 22–33)
2. **Remove** `styles.header`, `styles.greeting`, `styles.appName`, `styles.bellIcon` from `StyleSheet`
3. **Import** and **render** `<HeroBanner onBellPress={() => navigation.navigate('Notifications')} />` as the first child inside the `<ScrollView>`

---

## 6. Helper: `getGreeting()`

A small utility function defined inside `HeroBanner.js`:

```js
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
```

**Multilingual note:** For `ur` and `roman_ur` locales, this will be extended later. For now, English is used regardless of language for this greeting string (it's not in `i18n.js` yet).

> **Future task:** Add `good_morning`, `good_afternoon`, `good_evening` keys to all three locale dictionaries in `i18n.js`.

---

## 7. i18n Updates

Add the following keys to **all three** locale dictionaries in `utils/i18n.js`:

| Key | `en` | `ur` | `roman_ur` |
| :-- | :--- | :--- | :--------- |
| `good_morning` | `Good morning` | `صبح بخیر` | `Subah Bakhair` |
| `good_afternoon` | `Good afternoon` | `دوپہر بخیر` | `Dopeher Bakhair` |
| `good_evening` | `Good evening` | `شام بخیر` | `Sham Bakhair` |
| `city` | `Karachi` | `کراچی` | `Karachi` |
| `providers_available` | `Available` | `دستیاب` | `Dastyab` |

---

## 8. Acceptance Criteria

- [ ] `expo-linear-gradient` is installed and imported correctly
- [ ] Dark gradient renders without crashing on Android & iOS (web fallback acceptable)
- [ ] Greeting changes based on device time (morning / afternoon / evening)
- [ ] Bell icon is accent-colored and navigates to `NotificationScreen`
- [ ] Karachi city pill and provider count pill render in the stats row
- [ ] All text respects the active language from `LanguageContext`
- [ ] No visual regression on `AIChatCard`, `ServiceSlider`, or `RecentActivity` below it
- [ ] Shadow/glow visible on iOS; border glow fallback visible on Android

---

## 9. File Summary

| File | Action |
| :--- | :----- |
| `frontend/components/HeroBanner.js` | **CREATE** — new component |
| `frontend/screens/ChatScreen.js` | **MODIFY** — swap header block |
| `frontend/utils/i18n.js` | **MODIFY** — add greeting + city keys |
| `package.json` / `package-lock.json` | **MODIFY** — `expo-linear-gradient` added |
