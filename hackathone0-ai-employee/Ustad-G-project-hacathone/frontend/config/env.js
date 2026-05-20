/**
 * env.js — API Base URL Configuration
 *
 * LOCAL DEVELOPMENT:
 *   • Android Emulator  → 10.0.2.2  (maps to your machine's localhost)
 *   • iOS Simulator     → localhost
 *   • Physical Device   → your machine's local WiFi IP (e.g. 192.168.1.5)
 *
 * PRODUCTION:
 *   • Google Cloud Run URL set below
 */

import { Platform } from 'react-native';

// ── Change this to match your dev device ──────────────────────────────────────
const LOCAL_ANDROID_EMULATOR = 'http://10.0.2.2:8000';
const LOCAL_IOS_SIMULATOR = 'http://localhost:8000';

// If testing on a physical device, find your machine IP with:
//   Windows: ipconfig | findstr IPv4
//   Mac/Linux: ifconfig | grep "inet "
// Then set it here:
const LOCAL_PHYSICAL_DEVICE = 'http://192.168.0.103:8000'; // ← UPDATED WITH YOUR IP

// ── Production ─────────────────────────────────────────────────────────────────
// Set this once you deploy the backend to Cloud Run:
const PRODUCTION_URL = 'https://ustadg-backend-603056402651.us-central1.run.app';

// ── Active URL selection ────────────────────────────────────────────────────────
// Use the production URL for testing the cloud deployment
const LOCAL_URL = PRODUCTION_URL;

export const API_BASE_URL = __DEV__ ? LOCAL_URL : PRODUCTION_URL;

// Admin key (for admin analytics screens) — must match backend ADMIN_KEY env var
export const ADMIN_KEY = __DEV__ ? 'ustadg-admin-2026' : 'ustadg-admin-2026';
