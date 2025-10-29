/**
 * Error Handler - Shared error handling utilities
 *
 * Provides centralized error handling for all services.
 * Maps various error types to user-friendly messages.
 *
 * @module services/shared/error-handler
 */

import { ApiError } from './httpClient';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  readonly message: string;
  readonly code?: string;
  readonly severity: ErrorSeverity;
  readonly details?: unknown;
  readonly timestamp: string;
}

/**
 * Error handler class
 */
export class ErrorHandler {
  /**
   * Handle Supabase/Postgrest errors
   */
  static handleSupabaseError(error: PostgrestError, context?: string): ErrorInfo {
    const message = context 
      ? `${context}: ${error.message}`
      : error.message;

    return {
      message,
      code: error.code,
      severity: this.getSeverityFromCode(error.code),
      details: error.details,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle API errors
   */
  static handleApiError(error: ApiError, context?: string): ErrorInfo {
    const message = context
      ? `${context}: ${error.message}`
      : error.message;

    return {
      message,
      code: error.status.toString(),
      severity: this.getSeverityFromStatus(error.status),
      details: error.response,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(error: Error, context?: string): ErrorInfo {
    const message = context
      ? `${context}: ${error.message}`
      : error.message;

    return {
      message,
      severity: ErrorSeverity.ERROR,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError(error: unknown, context?: string): ErrorInfo {
    const message = context
      ? `${context}: Unknown error occurred`
      : 'Unknown error occurred';

    return {
      message,
      severity: ErrorSeverity.ERROR,
      details: error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ErrorInfo): string {
    // Map common error codes to user-friendly messages
    const messageMap: Record<string, string> = {
      '23505': 'This record already exists.',
      '23503': 'Cannot delete this record as it is referenced by other data.',
      '23502': 'Required field is missing.',
      '42501': 'You do not have permission to perform this action.',
      '401': 'You must be logged in to perform this action.',
      '403': 'You do not have permission to perform this action.',
      '404': 'The requested resource was not found.',
      '409': 'This record conflicts with existing data.',
      '429': 'Too many requests. Please try again later.',
      '500': 'An internal server error occurred.',
      '503': 'Service is temporarily unavailable.',
    };

    if (error.code && messageMap[error.code]) {
      return messageMap[error.code];
    }

    return error.message;
  }

  /**
   * Log error to console (in development) or error reporting service (in production)
   */
  static logError(error: ErrorInfo): void {
    // Always log to console for now
    console.error('[Error]', error);
    
    // In production, send to error reporting service (e.g., Sentry)
    // if (process.env.NODE_ENV === 'production') {
    //   sentry.captureException(error);
    // }
  }

  /**
   * Get severity from Supabase error code
   */
  private static getSeverityFromCode(code: string): ErrorSeverity {
    // PostgreSQL error codes
    if (code.startsWith('23')) return ErrorSeverity.WARNING; // Integrity constraint violation
    if (code.startsWith('42')) return ErrorSeverity.ERROR; // Syntax or access rule violation
    if (code.startsWith('53')) return ErrorSeverity.CRITICAL; // Insufficient resources
    if (code.startsWith('58')) return ErrorSeverity.CRITICAL; // System error

    return ErrorSeverity.ERROR;
  }

  /**
   * Get severity from HTTP status code
   */
  private static getSeverityFromStatus(status: number): ErrorSeverity {
    if (status >= 500) return ErrorSeverity.CRITICAL;
    if (status >= 400) return ErrorSeverity.ERROR;
    if (status >= 300) return ErrorSeverity.WARNING;

    return ErrorSeverity.INFO;
  }
}

/**
 * Convenience functions
 */
export const handleError = (error: unknown, context?: string): ErrorInfo => {
  if (error && typeof error === 'object') {
    if ('code' in error && 'message' in error) {
      // Supabase/Postgrest error
      return ErrorHandler.handleSupabaseError(error as PostgrestError, context);
    }
    if (error instanceof ApiError) {
      return ErrorHandler.handleApiError(error, context);
    }
    if (error instanceof Error) {
      return ErrorHandler.handleGenericError(error, context);
    }
  }

  return ErrorHandler.handleUnknownError(error, context);
};

export const getUserErrorMessage = (error: unknown): string => {
  const errorInfo = handleError(error);
  return ErrorHandler.getUserMessage(errorInfo);
};

export const logError = (error: unknown, context?: string): void => {
  const errorInfo = handleError(error, context);
  ErrorHandler.logError(errorInfo);
};
