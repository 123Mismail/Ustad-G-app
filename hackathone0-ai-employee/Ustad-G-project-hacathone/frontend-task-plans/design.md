# UI/UX Design Specification: UstadG Mobile Application

This document provides a structural and visual breakdown of the target mobile application design for the Google Antigravity Agent Manager. Use these specifications to generate React Native components and styling.

---

## 1. Visual Identity & Theme
* **Primary Palette:** * Main Accent: `#C1FF72` (Vibrant Lime Green)
    * Primary Background: `#FFFFFF` (Pure White)
    * Secondary Background: `#F8F8F8` (Light Grey for cards/sections)
    * Text: `#000000` (Deep Black for headings), `#666666` (Medium Grey for subtext)
* **Typography:** Sans-serif (Inter or system default). Heavy weights for headers, regular for body.
* **Border Radius:** Large rounded corners (approx. `24px` for cards, `16px` for buttons).

---

## 2. Screen 1: Dashboard (Home)
* **Header:** * Greeting: "Good morning, [User]"
    * Welcome text: "Welcome to UstadG"
    * Action: Notification bell icon on the top right.
* **Balance Card:**
    * Background: `#1A1A1A` (Black)
    * Elements: "Your balance" label, Currency amount with eye-toggle icon, "Add money" button.
* **Horizontal Card Slider:**
    * Title: "Your services/cards" with "+ New" action.
    * Cards: Large rounded rectangles with pattern overlays and branding logo (Top right).
* **Recent Activity (Transactions):**
    * List style: Icon on left, Title/Subtitle in middle, Amount/Status on right.
* **Navigation Bar:** Fixed bottom bar with icons for: Home, Map, Transfer, Settings, Profile.

---

## 3. Screen 2: Action Center (Add Money/Service)
* **Top Bar:** Back arrow and center-aligned screen title.
* **Selection Area:** Horizontal scrolling selection of rounded squares representing cards/providers. Active selection has a black border.
* **Action List:**
    * Grouped list of options (e.g., "Move your direct deposit", "Apple Pay").
    * Styling: White background card with a right-facing chevron icon (`>`).
* **Submit Button:** Large full-width button at the bottom of the list.

---

## 4. Screen 3: User Profile
* **Profile Header:** * Centrally aligned profile picture in a circle.
    * Floating "Edit" icon (pencil) attached to the photo.
* **Information Blocks:**
    * **Personal Info:** Titled section with icons for Name, Email, Phone, and Home Address.
    * **Account Info:** Collapsed or summary section at the bottom.
* **Style:** Clean, white-space heavy layout with subtle dividers.

---

## 5. Implementation Instructions for Antigravity Agent
1.  **Framework:** React Native with Expo.
2.  **Icons:** Use `lucide-react-native` or `@expo/vector-icons`.
3.  **Layout:** Use `Flexbox`. Ensure safe-area insets are applied for the notch (iPhone/Modern Android).
4.  **Components:** Use `ScrollView` for the main content and `FlatList` (horizontal) for the card sliders.
5.  **Status Bar:** Set to `dark-content`.
