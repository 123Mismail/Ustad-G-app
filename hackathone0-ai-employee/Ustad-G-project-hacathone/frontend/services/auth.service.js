/**
 * auth.service.js — Authentication API calls.
 * Wraps POST /v1/auth/register and POST /v1/auth/login.
 */
import api from './api';

/**
 * Register a new user account.
 * @param {{ name, phone, email, city, area, password }} data
 * @returns {Promise<UserOut>} Created user object
 */
export async function register(data) {
  const response = await api.post('/v1/auth/register', data);
  return response.data; // UserOut: { id, name, phone, email, city, area, created_at }
}

/**
 * Login with phone and password.
 * @param {{ phone, password }} credentials
 * @returns {Promise<{ access_token, token_type, user }>}
 */
export async function login(credentials) {
  const response = await api.post('/v1/auth/login', credentials);
  return response.data; // TokenOut: { access_token, token_type, user: UserOut }
}

/**
 * Register the device FCM token for push notifications.
 * @param {string} token 
 */
export async function registerDeviceToken(token) {
  const response = await api.patch('/v1/users/me/token', { device_token: token });
  return response.data;
}

/**
 * Fetch the currently logged-in user's full profile.
 * @returns {Promise<UserOut>}
 */
export async function getMyProfile() {
  const response = await api.get('/v1/users/me');
  return response.data;
}

/**
 * Update the currently logged-in user's profile fields.
 * @param {{ name?, email?, city?, area? }} data
 * @returns {Promise<UserOut>} Updated user object
 */
export async function updateMyProfile(data) {
  const response = await api.patch('/v1/users/me', data);
  return response.data;
}
