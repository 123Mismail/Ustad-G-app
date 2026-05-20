/**
 * providers.service.js — Provider discovery and CRUD API calls.
 * Wraps GET /v1/providers and GET /v1/providers/{id}.
 */
import api from './api';

/**
 * Search providers by service type, city, and optional area.
 * @param {{ service_type?, city?, area? }} filters
 * @returns {Promise<ProviderOut[]>}
 */
export async function getProviders(filters = {}) {
  const response = await api.get('/v1/providers', { params: filters });
  return response.data;
}

/**
 * Get a single provider by their ID.
 * @param {number} id
 * @returns {Promise<ProviderOut>}
 */
export async function getProvider(id) {
  const response = await api.get(`/v1/providers/${id}`);
  return response.data;
}

/**
 * Map a backend ProviderOut to the shape expected by ProviderCard.
 * Calculates a composite score (rating + inverse distance).
 *
 * @param {ProviderOut} provider - Backend provider object
 * @param {{ lat: number, lng: number } | null} userLocation - User's GPS coords
 * @returns {ProviderCardProps}
 */
export function mapProviderToCard(provider, userLocation = null) {
  let distanceVal = null;

  if (userLocation && provider.lat && provider.lng) {
    distanceVal = haversineKm(
      userLocation.lat, userLocation.lng,
      provider.lat, provider.lng
    );
  }

  // Composite score: rating (max 50 pts) + distance bonus (max 50 pts)
  const ratingScore = Math.round((provider.rating / 5) * 50);
  const distScore   = distanceVal != null ? Math.round(50 / (1 + distanceVal)) : 25;
  const totalScore  = ratingScore + distScore;

  return {
    id:          provider.id,
    name:        provider.name,
    serviceKey:  provider.service_type,
    rating:      provider.rating,
    distanceVal: distanceVal != null ? parseFloat(distanceVal.toFixed(1)) : null,
    area:        provider.area,
    city:        provider.city,
    price:       provider.price,
    phone:       provider.phone,
    totalScore,
    scores: {
      rating:   ratingScore,
      distance: distScore,
    },
  };
}

/**
 * Haversine formula — distance in km between two lat/lng coordinates.
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
