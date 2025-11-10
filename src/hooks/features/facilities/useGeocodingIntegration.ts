import { useCallback, useState } from "react";
import { MAPBOX_TOKEN } from '@/lib/clients/mapbox';

/**
 * Coordinate structure
 */
export interface Coordinates {
  readonly lat: number;
  readonly lng: number;
}

/**
 * Geocoding status types
 */
export type GeocodingStatusType = "success" | "error" | "idle";

/**
 * Geocoding status
 */
export interface GeocodingStatus {
  readonly type: GeocodingStatusType;
  readonly message: string;
}

/**
 * Geocoding result
 */
export interface GeocodingResult {
  readonly coordinates: Coordinates;
  readonly formattedAddress: string;
  readonly confidence: number;
}

/**
 * Geocoding hook return type
 */
export interface UseGeocodingIntegrationReturn {
  readonly coordinates: Coordinates | null;
  readonly status: GeocodingStatus;
  readonly isLoading: boolean;
  readonly geocodeAddress: (address: string) => Promise<GeocodingResult | null>;
  readonly setCoordinates: (coordinates: Coordinates | null) => void;
  readonly clearStatus: () => void;
  readonly validateCoordinates: (coords: Coordinates) => boolean;
}

/**
 * Geocoding configuration
 */
export interface GeocodingConfig {
  readonly mapboxToken: string;
  readonly geocodingTypes?: string[]; // default ['address', 'place']
  readonly limit?: number; // default 1
  readonly countryCode?: string; // e.g., 'no' for Norway
}

/**
 * Custom hook for geocoding integration with Mapbox
 *
 * Features:
 * - Address to coordinates geocoding via Mapbox API
 * - Coordinate validation (lat/lng ranges)
 * - Loading state management
 * - Status feedback (success/error/idle)
 * - Configurable geocoding types and limits
 * - Country-specific geocoding
 *
 * @param config - Geocoding configuration
 * * @returns Geocoding functions and state
 *
 * @example
 * ```tsx
 * const {
 *   coordinates,
 *   isLoading,
 *   status,
 *   geocodeAddress,
 *   validateCoordinates,
 * } = useGeocodingIntegration({
 *   mapboxToken: process.env.VITE_MAPBOX_TOKEN, // Now using the centralized token
 *   countryCode: 'no',
 * });
 *
 * // Geocode an address
 * const result = await geocodeAddress("Oslo, Norway");
 * ```
 */
export const useGeocodingIntegration = (
  config?: Partial<GeocodingConfig>
): UseGeocodingIntegrationReturn => {
  const {
    mapboxToken = MAPBOX_TOKEN, // Use the centralized token as default
    geocodingTypes = ["address", "place"],
    limit = 1,
    countryCode,
  } = config || {};

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<GeocodingStatus>({
    type: "idle",
    message: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Validate coordinates are within valid ranges
   */
  const validateCoordinates = useCallback((coords: Coordinates): boolean => {
    const { lat, lng } = coords;

    // Validate latitude range: -90 to 90
    if (lat < -90 || lat > 90) {
      return false;
    }

    // Validate longitude range: -180 to 180
    if (lng < -180 || lng > 180) {
      return false;
    }

    return true;
  }, []);

  /**
   * Build Mapbox geocoding URL
   */
  const buildGeocodingUrl = useCallback(
    (address: string): string => {
      const encodedAddress = encodeURIComponent(address);
      const types = geocodingTypes.join(",");

      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&types=${types}&limit=${limit}`;

      // Add country code if specified
      if (countryCode) {
        url += `&country=${countryCode}`;
      }

      return url;
    },
    [mapboxToken, geocodingTypes, limit, countryCode]
  );

  /**
   * Geocode an address to coordinates
   */
  const geocodeAddress = useCallback(
    async (address: string): Promise<GeocodingResult | null> => {
      if (!address || !address.trim()) {
        setStatus({
          type: "error",
          message: "Address is required for geocoding",
        });
        return null;
      }

      setIsLoading(true);
      setStatus({ type: "idle", message: "" });

      try {
        const geocodingUrl = buildGeocodingUrl(address.trim());
        const response = await fetch(geocodingUrl);

        if (!response.ok) {
          throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        // Check if results found
        if (!data.features || data.features.length === 0) {
          setStatus({
            type: "error",
            message: "Address not found. Please check the address and try again.",
          });
          setIsLoading(false);
          return null;
        }

        const feature = data.features[0];
        const [lng, lat] = feature.center; // Mapbox returns [longitude, latitude]

        const coords: Coordinates = { lat, lng };

        // Validate coordinates
        if (!validateCoordinates(coords)) {
          setStatus({
            type: "error",
            message: "Invalid coordinates received from geocoding service",
          });
          setIsLoading(false);
          return null;
        }

        // Update state
        setCoordinates(coords);
        setStatus({
          type: "success",
          message: "Coordinates fetched successfully from address",
        });

        const result: GeocodingResult = {
          coordinates: coords,
          formattedAddress: feature.place_name || address,
          confidence: feature.relevance || 1,
        };

        setIsLoading(false);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred during geocoding";

        setStatus({
          type: "error",
          message: `Geocoding failed: ${errorMessage}`,
        });

        setIsLoading(false);
        return null;
      }
    },
    [buildGeocodingUrl, validateCoordinates]
  );

  /**
   * Clear status message
   */
  const clearStatus = useCallback((): void => {
    setStatus({ type: "idle", message: "" });
  }, []);

  return {
    coordinates,
    status,
    isLoading,
    geocodeAddress,
    setCoordinates,
    clearStatus,
    validateCoordinates,
  };
};
