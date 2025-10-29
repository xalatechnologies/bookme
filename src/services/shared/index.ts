/**
 * Shared Services - Index
 *
 * Export all shared utilities for use across services.
 *
 * @module services/shared
 */

export { httpClient, ApiError, type ApiResponse } from './httpClient';
export {
  ErrorHandler,
  ErrorSeverity,
  handleError,
  getUserErrorMessage,
  logError,
  type ErrorInfo,
} from './error-handler';
