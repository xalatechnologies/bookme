/**
 * Service Error Classes
 *
 * Custom error types for consistent error handling across all services.
 * Provides semantic error types for different failure scenarios.
 *
 * @module services/supabase/errors
 */

/**
 * Base service error class
 * All service errors extend this class for consistent error handling
 */
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly originalError?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }

  /**
   * Convert error to JSON for logging/API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends ServiceError {
  constructor(resource: string, identifier?: string | Record<string, unknown>) {
    const message = identifier
      ? `${resource} with ${typeof identifier === 'string' ? `id "${identifier}"` : `criteria ${JSON.stringify(identifier)}`} not found`
      : `${resource} not found`;

    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized access error (401)
 */
export class UnauthorizedError extends ServiceError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden access error (403)
 */
export class ForbiddenError extends ServiceError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ServiceError {
  public readonly fields?: Record<string, string[]>;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.fields = fields;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * Conflict error (409)
 * Used for duplicate resources or conflicting state
 */
export class ConflictError extends ServiceError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'CONFLICT', 409, originalError);
    this.name = 'ConflictError';
  }
}

/**
 * Database query error (500)
 */
export class DatabaseError extends ServiceError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'DATABASE_ERROR', 500, originalError);
    this.name = 'DatabaseError';
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class RateLimitError extends ServiceError {
  public readonly retryAfter?: number;

  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Network/connection error
 */
export class NetworkError extends ServiceError {
  constructor(message = 'Network connection failed', originalError?: unknown) {
    super(message, 'NETWORK_ERROR', 503, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Transaction error for database transactions
 */
export class TransactionError extends ServiceError {
  constructor(message: string, originalError?: unknown) {
    super(message, 'TRANSACTION_ERROR', 500, originalError);
    this.name = 'TransactionError';
  }
}

/**
 * Timeout error for long-running operations
 */
export class TimeoutError extends ServiceError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation "${operation}" timed out after ${timeoutMs}ms`,
      'TIMEOUT',
      408
    );
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// Error Handler Utilities
// ============================================================================

/**
 * Convert Supabase error to ServiceError
 */
export const handleSupabaseError = (error: unknown, context?: string): ServiceError => {
  // Already a ServiceError
  if (error instanceof ServiceError) {
    return error;
  }

  // Supabase PostgrestError
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as { code: string; message: string; details?: string };

    // Handle specific PostgreSQL error codes
    switch (pgError.code) {
      case '23505': // unique_violation
        return new ConflictError(
          `Duplicate entry: ${pgError.details ?? pgError.message}`,
          error
        );
      case '23503': // foreign_key_violation
        return new ValidationError(
          `Referenced resource does not exist: ${pgError.details ?? pgError.message}`
        );
      case '23502': // not_null_violation
        return new ValidationError(
          `Required field missing: ${pgError.details ?? pgError.message}`
        );
      case 'PGRST116': // No rows found
        return new NotFoundError(context ?? 'Resource');
      default:
        return new DatabaseError(
          context ? `Database error in ${context}: ${pgError.message}` : pgError.message,
          error
        );
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return new ServiceError(
      context ? `${context}: ${error.message}` : error.message,
      'UNKNOWN_ERROR',
      500,
      error
    );
  }

  // Unknown error type
  return new ServiceError(
    context ? `${context}: Unknown error` : 'An unknown error occurred',
    'UNKNOWN_ERROR',
    500,
    error
  );
};

/**
 * Type guard to check if error is ServiceError
 */
export const isServiceError = (error: unknown): error is ServiceError => {
  return error instanceof ServiceError;
};

/**
 * Extract error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (isServiceError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unknown error occurred';
};

/**
 * Log error with context
 */
export const logError = (error: unknown, context?: string): void => {
  const serviceError = isServiceError(error) ? error : handleSupabaseError(error, context);

  console.error(`[${serviceError.code}] ${serviceError.message}`, {
    code: serviceError.code,
    statusCode: serviceError.statusCode,
    timestamp: serviceError.timestamp,
    context,
    originalError: serviceError.originalError,
    stack: serviceError.stack,
  });
};
