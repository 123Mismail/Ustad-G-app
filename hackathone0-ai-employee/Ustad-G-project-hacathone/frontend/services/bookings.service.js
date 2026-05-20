/**
 * bookings.service.js — Booking lifecycle API calls.
 *
 * Covers:
 *  • POST /v1/book           — create a booking (agent-triggered or direct)
 *  • GET  /v1/bookings       — list user's own bookings
 *  • GET  /v1/bookings/{id}  — single booking detail
 *  • PATCH /v1/bookings/{id}/cancel — cancel a booking
 *
 * All endpoints require a valid JWT (attached automatically by api.js interceptor).
 */
import api from './api';

/**
 * Create a new booking.
 * @param {{ provider_id: number|string, service: string, scheduled_at: string }} data
 *   - scheduled_at: ISO 8601 string e.g. "2026-05-20T10:00:00"
 * @returns {Promise<BookingOut>}
 */
export async function createBooking(data) {
  const response = await api.post('/v1/book', data);
  return response.data;
  // response.data: { confirmation_id: "UGK-2026-XXXX", status: "Confirmed", ... }
}

/**
 * Get all bookings for the authenticated user.
 * @param {{ skip?: number, limit?: number }} params
 * @returns {Promise<BookingOut[]>}
 */
export async function getMyBookings(params = {}) {
  const response = await api.get('/v1/bookings', { params });
  return response.data;
}

/**
 * Get a single booking by its UGK confirmation ID.
 * @param {string} confirmationId — e.g. "UGK-2026-1234"
 * @returns {Promise<BookingOut>}
 */
export async function getBookingById(confirmationId) {
  const response = await api.get(`/v1/bookings/${confirmationId}`);
  return response.data;
}

/**
 * Cancel an upcoming booking.
 * @param {string} confirmationId
 * @returns {Promise<BookingOut>} Updated booking with status "Cancelled"
 */
export async function cancelBooking(confirmationId) {
  const response = await api.patch(`/v1/bookings/${confirmationId}/cancel`);
  return response.data;
}

/**
 * Register the device FCM push token with the backend.
 * Call this after login so the user receives push notifications.
 * @param {string} deviceToken — Firebase FCM registration token
 * @returns {Promise<void>}
 */
export async function registerDeviceToken(deviceToken) {
  await api.patch('/v1/users/me/token', { device_token: deviceToken });
}
