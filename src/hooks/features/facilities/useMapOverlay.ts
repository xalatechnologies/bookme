import { useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

interface UseMapOverlayReturn {
  readonly map: mapboxgl.Map | null;
  readonly error: string;
  readonly isInitialized: boolean;
  readonly setMap: (map: mapboxgl.Map | null) => void;
  readonly setError: (error: string) => void;
  readonly setIsInitialized: (initialized: boolean) => void;
  readonly handleMapLoad: (mapInstance: mapboxgl.Map) => void;
  readonly handleMapError: (errorMessage: string) => void;
  readonly handleRetry: () => void;
  readonly handleMarkerClick: (facility: Facility, onMarkerClick?: (facility: Facility) => void) => void;
}

/**
 * Custom hook for managing map overlay state and interactions
 *
 * Handles:
 * - Map instance state management
 * - Error state and messaging
 * - Initialization tracking
 * - Map load/error callbacks
 * - Retry functionality
 * - Marker click handling
 *
 * @returns Map overlay state and handler functions
 */
export const useMapOverlay = (): UseMapOverlayReturn => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  /**
   * Handle successful map load
   * Sets the map instance and marks as initialized
   *
   * @param mapInstance - The loaded Mapbox map instance
   */
  const handleMapLoad = useCallback((mapInstance: mapboxgl.Map): void => {
    setMap(mapInstance);
    setIsInitialized(true);
  }, []);

  /**
   * Handle map loading errors
   * Logs error for debugging and updates error state
   *
   * @param errorMessage - The error message to display
   */
  const handleMapError = useCallback((errorMessage: string): void => {
    console.error('Map error:', errorMessage);
    setError(errorMessage);
    setIsInitialized(false);
  }, []);

  /**
   * Handle retry action
   * Clears error state and reloads the page
   */
  const handleRetry = useCallback((): void => {
    setError('');
    setIsInitialized(false);
    window.location.reload();
  }, []);

  /**
   * Handle marker click events
   *
   * Delegates to custom handler if provided,
   * otherwise does nothing (popup handles navigation)
   *
   * @param facility - The facility that was clicked
   * @param onMarkerClick - Optional custom click handler
   */
  const handleMarkerClick = useCallback((
    facility: Facility,
    onMarkerClick?: (facility: Facility) => void
  ): void => {
    if (onMarkerClick) {
      onMarkerClick(facility);
    }
    // Don't automatically navigate - let the popup handle navigation
  }, []);

  return {
    map,
    error,
    isInitialized,
    setMap,
    setError,
    setIsInitialized,
    handleMapLoad,
    handleMapError,
    handleRetry,
    handleMarkerClick
  };
};
