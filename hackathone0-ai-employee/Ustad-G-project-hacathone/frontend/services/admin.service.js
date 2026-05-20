/**
 * admin.service.js — Admin analytics API calls.
 *
 * Uses X-Admin-Key header (not JWT) as the backend uses a shared admin key.
 * These endpoints are only called when userRole === 'admin' in AuthContext.
 *
 * Endpoints:
 *  • GET /v1/admin/stats           — total bookings, revenue, active providers
 *  • GET /v1/admin/bookings        — full paginated booking log
 *  • GET /v1/admin/providers/top   — top providers by booking count
 */
import api from './api';
import { ADMIN_KEY } from '../config/env';

const adminHeaders = { 'X-Admin-Key': ADMIN_KEY };

/**
 * Fetch admin dashboard statistics.
 * @returns {Promise<AdminStats>}
 * Shape: {
 *   total_bookings, confirmed_bookings, cancelled_bookings,
 *   active_providers, estimated_revenue_pkr,
 *   top_services: [{ service, count }]
 * }
 */
export async function getAdminStats() {
  const response = await api.get('/v1/admin/stats', { headers: adminHeaders });
  return response.data;
}

/**
 * Fetch paginated admin booking log.
 * @param {{ page?: number, size?: number, service?: string, status?: string }} params
 * @returns {Promise<AdminBookingItem[]>}
 */
export async function getAdminBookings(params = {}) {
  const response = await api.get('/v1/admin/bookings', {
    headers: adminHeaders,
    params,
  });
  return response.data;
}

/**
 * Fetch top providers sorted by booking count, then rating.
 * @returns {Promise<ProviderBookingStats[]>}
 * Shape: [{ id, name, service_type, rating, booking_count }]
 */
export async function getTopProviders() {
  const response = await api.get('/v1/admin/providers/top', { headers: adminHeaders });
  return response.data;
}

/**
 * Register a new provider (Admin only).
 * @param {{ name, phone, email, service_type, city, area, address, price }} data
 * @returns {Promise<ProviderOut>}
 */
export async function createProvider(data) {
  const response = await api.post('/v1/providers', data, { headers: adminHeaders });
  return response.data;
}
