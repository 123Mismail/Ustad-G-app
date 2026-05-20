# SPEC: Frontend-01 — App Setup & Navigation Shell

**Feature Area:** Frontend — Foundation  
**Sprint Day:** Day 5 (per PRD Build Plan)  
**Status:** 🟡 Ready to Build  
**Depends On:** Nothing (first piece)

---

## 1. Goal

Initialize the React Native (Expo) project and wire up the navigation shell with the global theme and multilingual (i18n) support. This spec does **not** build any screen content — it only creates the skeleton that all future screens will plug into.

---

## 2. Scope (What to Build)

| File | Purpose |
| :--- | :--- |
| `frontend/App.js` | Entry point. Loads theme, i18n, and renders the `AppNavigator`. |
| `frontend/navigation/AppNavigator.js` | Stack navigator with placeholder screens registered by name. |
| `frontend/theme/colors.js` | Central color palette constants from `design.md`. |
| `frontend/theme/typography.js` | Font size and weight constants. |
| `frontend/utils/i18n.js` | String dictionary for `en`, `ur`, and `roman_ur` with a `t()` helper. |

> **Out of Scope:** No actual screen UI, no API calls, no state management beyond theme context.

---

## 3. Design Reference

From `design.md` — Visual Identity & Theme:

| Token | Value |
| :--- | :--- |
| `COLOR_ACCENT` | `#C1FF72` (Lime Green) |
| `COLOR_BG_PRIMARY` | `#FFFFFF` |
| `COLOR_BG_SECONDARY` | `#F8F8F8` |
| `COLOR_TEXT_DARK` | `#000000` |
| `COLOR_TEXT_MUTED` | `#666666` |
| `COLOR_CARD_BG` | `#1A1A1A` |
| `BORDER_RADIUS_CARD` | `24` |
| `BORDER_RADIUS_BTN` | `16` |

**Typography:** Inter (or system sans-serif), heavy weights for headers.

---

## 4. Detailed Specifications

### 4.1 `frontend/theme/colors.js`
Export a plain JS object `Colors` with the tokens from the table above. No logic, just constants.

```js
// Example shape
export const Colors = {
  accent: '#C1FF72',
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F8F8F8',
  textDark: '#000000',
  textMuted: '#666666',
  cardBg: '#1A1A1A',
};
```

---

### 4.2 `frontend/theme/typography.js`
Export a `Typography` object with font sizes and weights used throughout the app.

```js
export const Typography = {
  header: { fontSize: 28, fontWeight: '800' },
  subheader: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
```

---

### 4.3 `frontend/utils/i18n.js`
- Define a `strings` dictionary with three language keys: `en`, `ur`, `roman_ur`.
- Export a `t(key, lang = 'en')` function that returns the correct string.
- Start with only the strings needed for navigation and app-level labels (e.g., `"app_name"`, `"loading"`, `"chat"`, `"results"`, `"confirm"`).

```js
// Example shape
const strings = {
  en:        { app_name: 'UstadG', chat: 'Chat', results: 'Results' },
  ur:        { app_name: 'استاد جی', chat: 'چیٹ', results: 'نتائج' },
  roman_ur:  { app_name: 'UstadG', chat: 'Baat Karein', results: 'Nataij' },
};

export const t = (key, lang = 'en') => strings[lang]?.[key] ?? strings['en'][key];
```

---

### 4.4 `frontend/navigation/AppNavigator.js`
- Use `@react-navigation/native` + `@react-navigation/stack`.
- Register 4 screens by name: `Chat`, `Results`, `Confirmation`, `AgentTrace`.
- Each screen initially renders a simple `<View><Text>Coming Soon</Text></View>` placeholder.
- Apply the theme header style: background `#FFFFFF`, title color `#000000`, shadow removed.

```
Screens registered:
  Chat          -> ChatScreen (placeholder)
  Results       -> ResultsScreen (placeholder)
  Confirmation  -> ConfirmationScreen (placeholder)
  AgentTrace    -> AgentTraceScreen (placeholder)
```

---

### 4.5 `frontend/App.js`
- Wrap everything in `<SafeAreaProvider>` (from `react-native-safe-area-context`).
- Set `StatusBar` style to `dark`.
- Render `<NavigationContainer>` containing `<AppNavigator />`.
- No global state yet — theme values will be passed via props or inline until a Context is added in a later spec.

---

## 5. Dependencies to Install

```bash
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-status-bar
```

---

## 6. Acceptance Criteria

- [ ] `npx expo start` launches without errors.
- [ ] The app renders on Android/iOS emulator with a white screen (placeholder).
- [ ] Navigating to each screen name via `navigation.navigate('Results')` etc. works without crashing.
- [ ] `t('app_name', 'ur')` returns `'استاد جی'` correctly.
- [ ] No hardcoded color or font values outside of `theme/` files.

---

## 7. Next Spec

➡️ **Frontend-02: Chat Screen UI** — Builds the actual `ChatScreen` with the multilingual text input and send button.
