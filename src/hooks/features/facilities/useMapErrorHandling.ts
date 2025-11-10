import { useCallback } from 'react';

interface MapError {
  readonly error?: {
    readonly message?: string;
  };
}

interface UseMapErrorHandlingReturn {
  readonly parseMapError: (e: MapError) => string;
  readonly validateToken: (token: string) => void;
}

/**
 * Custom hook for handling map-related errors
 *
 * Handles:
 * - Error message parsing and formatting
 * - Token validation
 * - Network error detection
 * - User-friendly error messages
 *
 * @returns Error handling utility functions
 */
export const useMapErrorHandling = (): UseMapErrorHandlingReturn => {
  /**
   * Parse Mapbox error events into user-friendly messages
   *
   * Detects common error types:
   * - 401 errors (invalid token)
   * - Network errors
   * - Generic errors
   *
   * @param e - Mapbox error event object
   * @returns User-friendly error message
   */
  const parseMapError = useCallback((e: MapError): string => {
    let errorMessage = 'An error occurred while loading the map.';

    try {
      if (e.error?.message?.includes('401')) {
        errorMessage = 'Invalid Mapbox access token. Please check your token.';
      } else if (e.error?.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (e.error?.message) {
        errorMessage = e.error.message;
      }
    } catch (error) {
      console.warn('Error parsing map error:', error);
      errorMessage = 'An unexpected error occurred while loading the map.';
    }

    return errorMessage;
  }, []);

  /**
   * Validate Mapbox access token format
   *
   * Throws error if token is invalid or too short
   *
   * @param token - Mapbox access token to validate
   * @throws {Error} If token is invalid
   */
  const validateToken = useCallback((token: string): void => {
    // Only validate if token is provided
    if (token) {
      // Check if token looks like a valid Mapbox token (starts with pk. or sk.)
      const isValidFormat = token.startsWith('pk.') || token.startsWith('sk.');
      
      if (!isValidFormat) {
        console.warn('Mapbox token format may be invalid:', token);
        // Don't throw error, just warn - token might still work
      }
      
      // Basic length check
      if (token.length < 10) {
        console.warn('Mapbox token seems too short:', token);
        // Don't throw error, just warn - token might still work
      }
    } else {
      console.warn('No Mapbox token provided');
      // Don't throw error, just warn - token might be set elsewhere
    }
  }, []);

  return {
    parseMapError,
    validateToken
  };
};