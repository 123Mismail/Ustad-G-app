# Plan: Frontend-01 — App Setup & Navigation Shell
**Spec Reference:** `specs/frontend-01-app-setup.md`  
**Status:** 🟡 Ready to Execute  
**Sprint Day:** Day 5

---

## 1. Full Frontend Picture (from `design.md`)

This spec is the **foundation layer** for all 3 screens and the bottom navigation defined in the design. Every later frontend spec will build on top of this skeleton.

```
┌─────────────────────────────────────────┐
│              App.js (Entry)             │
│   SafeAreaProvider + NavigationContainer│
├─────────────────────────────────────────┤
│        AppNavigator (Stack)             │
│  ┌──────────┬──────────┬─────────────┐  │
│  │ Chat     │ Results  │ Confirm     │  │
│  │ Screen   │ Screen   │ Screen      │  │
│  └──────────┴──────────┴─────────────┘  │
│           AgentTrace Screen             │
├─────────────────────────────────────────┤
│         theme/ + utils/                 │
│   colors.js  typography.js  i18n.js     │
└─────────────────────────────────────────┘
```

### 1.1 Screens Defined in `design.md`

| Screen | design.md Reference | Spec Phase |
| :--- | :--- | :--- |
| Dashboard (Home / Chat) | Section 2 | Frontend-01 (placeholder) → Frontend-02 (full build) |
| Action Center (Results/Services) | Section 3 | Frontend-01 (placeholder) → Frontend-03 |
| User Profile | Section 4 | Later spec |
| Agent Trace | PRD Section 3 | Frontend-01 (placeholder) → Frontend-06 |

### 1.2 Bottom Navigation Bar (from `design.md` Section 2)
Fixed bottom bar with 5 tabs: **Home, Map, Transfer, Settings, Profile**.  
> This spec registers the tab slots — the full tab bar UI is built in **Frontend-02**.

---

## 2. Tech Stack

| Layer | Technology | Source |
| :--- | :--- | :--- |
| Framework | **React Native + Expo** (Managed Workflow) | `rules.md`, `design.md` |
| Navigation | **`@react-navigation/native`** + **`@react-navigation/stack`** | `design.md` Section 5 |
| Icons | **`@expo/vector-icons`** or **`lucide-react-native`** | `design.md` Section 5 |
| Layout | **Flexbox** + SafeArea Insets | `design.md` Section 5 |
| Scroll | `ScrollView` (main), `FlatList` (horizontal sliders) | `design.md` Section 5 |
| Status Bar | `expo-status-bar` → `dark-content` | `design.md` Section 5 |
| Fonts | **Inter** (via `expo-font` / `@expo-google-fonts/inter`) | `design.md` Section 1 |
| Language | EN, Urdu (Jameel Noori Nastaliq), Roman Urdu | `rules.md` Section 2 |
| Safe Areas | `react-native-safe-area-context` | Standard Expo |

---

## 3. Color Palette (from `design.md`)

| Constant Name | Hex Value | Usage |
| :--- | :--- | :--- |
| `accent` | `#C1FF72` | Buttons, active states, highlights |
| `bgPrimary` | `#FFFFFF` | Main screen backgrounds |
| `bgSecondary` | `#F8F8F8` | Cards, section backgrounds |
| `textDark` | `#000000` | Headings, primary text |
| `textMuted` | `#666666` | Subtitles, labels |
| `cardBg` | `#1A1A1A` | Balance card, dark components |

---

## 4. Typography Scale (from `design.md`)

| Token | Font Size | Font Weight | Usage |
| :--- | :--- | :--- | :--- |
| `header` | `28px` | `800` | Screen titles (e.g., "Welcome to UstadG") |
| `subheader` | `18px` | `600` | Section headings |
| `body` | `14px` | `400` | Main readable text |
| `caption` | `12px` | `400` | Labels, timestamps, fine print |

**Border Radii:**
- Cards: `24px`
- Buttons: `16px`

---

## 5. File-by-File Build Steps

### Step 1 — Bootstrap Expo Project
```bash
# Initialize in frontend/ directory
npx create-expo-app@latest frontend --template blank
cd frontend

# Install navigation stack
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Install status bar + fonts
npx expo install expo-status-bar
npx expo install expo-font @expo-google-fonts/inter

# Install icons
npx expo install @expo/vector-icons
```

---

### Step 2 — `frontend/theme/colors.js`
- Export a frozen `Colors` object.
- All values sourced directly from `design.md` Section 1.
- No logic — pure constants.

**Output shape:**
```js
export const Colors = {
  accent:       '#C1FF72',
  bgPrimary:    '#FFFFFF',
  bgSecondary:  '#F8F8F8',
  textDark:     '#000000',
  textMuted:    '#666666',
  cardBg:       '#1A1A1A',
};
```

---

### Step 3 — `frontend/theme/typography.js`
- Export a `Typography` object with predefined text styles.
- Includes font family reference (`Inter_400Regular`, `Inter_800ExtraBold`).
- Also export `BorderRadius` constants here.

**Output shape:**
```js
export const Typography = {
  header:    { fontSize: 28, fontWeight: '800', fontFamily: 'Inter_800ExtraBold' },
  subheader: { fontSize: 18, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  body:      { fontSize: 14, fontWeight: '400', fontFamily: 'Inter_400Regular' },
  caption:   { fontSize: 12, fontWeight: '400', fontFamily: 'Inter_400Regular' },
};

export const BorderRadius = { card: 24, button: 16, input: 12 };
```

---

### Step 4 — `frontend/utils/i18n.js`
- Define `strings` with keys for `en`, `ur`, `roman_ur`.
- `ur` strings use standard Unicode Urdu (Jameel Noori Nastaliq is applied at the component level via `fontFamily`).
- Export `t(key, lang = 'en')` helper.
- Seed with app-level strings only (screen names, loading, app title).

**Strings to include in this spec:**
```
app_name, tagline, loading, chat, results, confirmation, agent_trace,
home, map, transfer, settings, profile
```

---

### Step 5 — `frontend/navigation/AppNavigator.js`
- Use `createStackNavigator` from `@react-navigation/stack`.
- Register screens: `Chat`, `Results`, `Confirmation`, `AgentTrace`.
- Apply a **custom header style** per `design.md`:
  - Background: `#FFFFFF`
  - Title color: `#000000`
  - No shadow / elevation: `0`
  - Back button tint: `#000000`
- Each screen maps to a thin placeholder component for now.

---

### Step 6 — `frontend/App.js`
- Load Inter fonts using `useFonts` hook from `expo-font`.
- Show a `null` (or SplashScreen) while fonts load.
- Wrap with `<SafeAreaProvider>`.
- Set `<StatusBar style="dark" />`.
- Render `<NavigationContainer><AppNavigator /></NavigationContainer>`.

---

## 6. Execution Order

```
[1] Bootstrap Expo project
[2] Create theme/colors.js
[3] Create theme/typography.js
[4] Create utils/i18n.js
[5] Create navigation/AppNavigator.js  (with placeholder screens)
[6] Update App.js
[7] Run npx expo start → verify on emulator
[8] Check all acceptance criteria ✓
```

---

## 7. Acceptance Criteria

- [ ] `npx expo start` runs without errors or warnings.
- [ ] App renders on emulator — white screen, dark status bar, no crashes.
- [ ] `navigation.navigate('Results')` works from Chat placeholder.
- [ ] `t('app_name', 'ur')` → `'استاد جی'`
- [ ] `t('chat', 'roman_ur')` → `'Baat Karein'`
- [ ] No hardcoded `#FFFFFF`, `#000000`, or font sizes outside `theme/` files.
- [ ] Inter font loads correctly — header text visibly bold vs body text.

---

## 8. What's NOT in this Spec

| Item | Where it's built |
| :--- | :--- |
| Bottom Tab Bar (5-tab nav) | Frontend-02 |
| Chat input UI | Frontend-02 |
| Provider cards & results list | Frontend-03 |
| Booking confirmation details | Frontend-04 |
| Agent Trace log viewer | Frontend-06 |
| API integration | Backend specs |

---

## 9. Next Plan

➡️ **Frontend-02-plan.md** — Chat Screen (Dashboard) full UI build using the theme and navigation shell created here.
