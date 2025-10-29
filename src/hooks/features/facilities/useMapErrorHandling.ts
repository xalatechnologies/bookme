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

    if (e.error?.message?.includes('401')) {
      errorMessage = 'Invalid Mapbox access token. Please check your token.';
    } else if (e.error?.message?.includes('network')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (e.error?.message) {
      errorMessage = e.error.message;
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
    if (!token || token.length < 10) {
      throw new Error('Invalid Mapbox access token. Please check your token.');
    }
  }, []);

  return {
    parseMapError,
    validateToken
  };
};
