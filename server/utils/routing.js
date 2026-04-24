const axios = require('axios');

// OSRM Public Demo Server (rate-limited — use self-hosted for production)
const OSRM_BASE_URL = process.env.OSRM_URL || 'https://router.project-osrm.org';

/**
 * Get route between two coordinate pairs using OSRM
 * @param {number} originLat - Origin latitude
 * @param {number} originLng - Origin longitude
 * @param {number} destLat - Destination latitude
 * @param {number} destLng - Destination longitude
 * @returns {Object|null} Route info { distance (km), duration (min), geometry }
 */
const getRoute = async (originLat, originLng, destLat, destLng) => {
  try {
    // OSRM expects coordinates as lng,lat (not lat,lng)
    const url = `${OSRM_BASE_URL}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const response = await axios.get(url, { timeout: 5000 });

    if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: (route.distance / 1000).toFixed(2), // Convert meters to km
        duration: (route.duration / 60).toFixed(1),    // Convert seconds to minutes
        geometry: route.geometry                        // GeoJSON LineString for map rendering
      };
    }

    return null;
  } catch (error) {
    console.error('OSRM routing error:', error.message);
    return null;
  }
};

module.exports = { getRoute };
