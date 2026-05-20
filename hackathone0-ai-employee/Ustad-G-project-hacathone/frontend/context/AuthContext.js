/**
 * AuthContext.js — Global authentication state for UstadG.
 *
 * Provides:
 *  • user       — current User object (or null)
 *  • token      — JWT string (or null)
 *  • isLoading  — true while reading from SecureStore on app start
 *  • login()    — authenticates and persists token
 *  • register() — creates account, then auto-logs in
 *  • logout()   — clears token + user, resets to Login
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister, registerDeviceToken as apiRegisterDeviceToken, updateMyProfile as apiUpdateMyProfile } from '../services/auth.service';
import { saveToken, saveUser, getToken, getUser, clearAll } from '../utils/tokenStorage';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // ── Restore session on app start ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([getToken(), getUser()]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          
          // Setup push notifications
          try {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
              await apiRegisterDeviceToken(pushToken);
            }
          } catch (pushErr) {
            console.warn('[AuthContext] Push token error on restore:', pushErr);
          }
        }
      } catch (e) {
        console.warn('[AuthContext] Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  /**
   * @param {string} phone
   * @param {string} password
   * @returns {Promise<void>}
   * @throws {Error} with message from API on failure
   */
  async function login(phone, password) {
    const data = await apiLogin({ phone, password });
    // data: { access_token, token_type, user }
    await Promise.all([
      saveToken(data.access_token),
      saveUser(data.user),
    ]);
    setToken(data.access_token);
    setUser(data.user);
    
    // Setup push notifications
    try {
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        // Because token is newly set, we might need to ensure api.js has it.
        // It will pick it up on the next request from SecureStore, but it's safe to call here.
        await apiRegisterDeviceToken(pushToken);
      }
    } catch (pushErr) {
      console.warn('[AuthContext] Push token error on login:', pushErr);
    }
  }

  // ── Register ──────────────────────────────────────────────────────────────
  /**
   * @param {{ name, phone, email, city, area, password }} formData
   * @returns {Promise<void>}
   * @throws {Error} on API failure
   */
  async function register(formData) {
    await apiRegister(formData);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    await clearAll();
    setToken(null);
    setUser(null);
  }

  // ── Update Profile ────────────────────────────────────────────────────────
  /**
   * Update name, email, city or area. Syncs to Neon DB + local storage.
   * @param {{ name?, email?, city?, area? }} data
   * @returns {Promise<void>}
   */
  async function updateUser(data) {
    const updatedUser = await apiUpdateMyProfile(data);
    // Persist refreshed user to AsyncStorage so it survives app restarts
    await saveUser(updatedUser);
    setUser(updatedUser);
    return updatedUser;
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const isAuthenticated = Boolean(token && user);
  const isAdmin         = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
