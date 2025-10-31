/**
 * Services Index
 *
 * Central export point for all application services.
 * Import services from this file to maintain consistency.
 *
 * @module services
 */

// ============================================================================
// Supabase Services (Full Service Layer)
// ============================================================================

export * from './supabase';

// ============================================================================
// Top-Level Service Wrappers
// ============================================================================

export { bookingsService } from './bookings.service';
export { calendarService } from './calendar.service';
export { facilitiesService } from './facilities.service';

// ============================================================================
// Shared Utilities
// ============================================================================

export {
  httpClient,
  ApiError,
  ErrorHandler,
  ErrorSeverity,
  handleError,
  getUserErrorMessage,
  type ApiResponse,
  type ErrorInfo,
} from './shared';

// ============================================================================
// Legacy HTTP Service (for non-Supabase endpoints)
// ============================================================================

export { httpClient as legacyHttpClient } from './http';
