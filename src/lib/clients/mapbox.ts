import mapboxgl from 'mapbox-gl';

/**
 * Mapbox GL JS client configuration
 * Centralized configuration to ensure consistent token usage across the application
 */

// Set Mapbox access token from environment variables
// Note: VITE_ prefix is required for Vite to expose env variables to client-side code
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Validate that Mapbox token is configured
if (!mapboxgl.accessToken) {
  console.warn('⚠️  Mapbox token not configured. Map features will be disabled.');
}

export { mapboxgl };

// Export token for use in services that need direct API access
// Provide empty string as fallback to match expected type
export const MAPBOX_TOKEN = mapboxgl.accessToken || '';