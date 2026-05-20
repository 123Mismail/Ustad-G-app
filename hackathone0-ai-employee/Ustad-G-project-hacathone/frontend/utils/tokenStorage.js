/**
 * tokenStorage.js — Secure JWT token persistence using expo-secure-store.
 *
 * expo-secure-store encrypts data using the device's secure enclave (Keychain on
 * iOS, Keystore on Android). Never store JWTs in AsyncStorage — it is unencrypted.
 */
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'ustadg_access_token';
const USER_KEY  = 'ustadg_user';

const isWeb = Platform.OS === 'web';

// ── Token ────────────────────────────────────────────────────────────────────
export async function saveToken(token) {
  if (isWeb) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken() {
  if (isWeb) {
    return localStorage.getItem(TOKEN_KEY);
  } else {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
}

export async function clearToken() {
  if (isWeb) {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ── User object ──────────────────────────────────────────────────────────────
export async function saveUser(user) {
  const serialized = JSON.stringify(user);
  if (isWeb) {
    localStorage.setItem(USER_KEY, serialized);
  } else {
    await SecureStore.setItemAsync(USER_KEY, serialized);
  }
}

export async function getUser() {
  const raw = isWeb ? localStorage.getItem(USER_KEY) : await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearUser() {
  if (isWeb) {
    localStorage.removeItem(USER_KEY);
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

// ── Clear everything (logout) ─────────────────────────────────────────────────
export async function clearAll() {
  await Promise.all([clearToken(), clearUser()]);
}
