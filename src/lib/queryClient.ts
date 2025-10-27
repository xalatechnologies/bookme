/**
 * React Query Configuration
 *
 * Configures the QueryClient for optimal caching, error handling, and performance.
 * Used throughout the application for server state management.
 *
 * Key Features:
 * - 5-minute stale time for most queries
 * - 10-minute garbage collection time
 * - Smart retry logic (don't retry 4xx errors)
 * - Global error handling
 * - Automatic refetch on window focus disabled (can be enabled per-query)
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Check if an error is a Supabase PostgrestError
 */
const isPostgrestError = (error: unknown): error is PostgrestError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
};

/**
 * Determine if an error should be retried
 * Don't retry client errors (4xx), but do retry server errors (5xx)
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Max 2 retries
  if (failureCount >= 2) {
    return false;
  }

  // Check if it's a Supabase error
  if (isPostgrestError(error)) {
    const code = error.code;
    // Don't retry 4xx errors (client errors)
    if (code && parseInt(code) >= 400 && parseInt(code) < 500) {
      return false;
    }
  }

  // Check for network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true; // Retry network errors
  }

  return true; // Retry other errors
};

/**
 * Global query error handler
 * Override this with your toast notification system
 */
const onQueryError = (error: unknown): void => {
  console.error('Query error:', error);

  if (isPostgrestError(error)) {
    console.error('Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  // TODO: Add toast notification
  // toast.error(getErrorMessage(error));
};

/**
 * Global mutation error handler
 */
const onMutationError = (error: unknown): void => {
  console.error('Mutation error:', error);

  if (isPostgrestError(error)) {
    console.error('Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  // TODO: Add toast notification
  // toast.error(getErrorMessage(error));
};

/**
 * Query Client instance
 *
 * Use this client with QueryClientProvider in your app root:
 *
 * @example
 * ```tsx
 * import { QueryClientProvider } from '@tanstack/react-query';
 * import { queryClient } from '@/lib/queryClient';
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long until data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,

      // How long unused data stays in cache (10 minutes)
      gcTime: 10 * 60 * 1000, // Formerly cacheTime in React Query v4

      // Retry logic
      retry: shouldRetry,

      // Don't refetch on window focus by default (can override per-query)
      refetchOnWindowFocus: false,

      // Refetch on reconnect (when user comes back online)
      refetchOnReconnect: true,

      // Refetch on mount if data is stale
      refetchOnMount: true,

      // Show fresh data while fetching in background
      staleWhileRevalidate: true,
    },

    mutations: {
      // Retry mutations once on failure
      retry: 1,

      // No automatic retry on error for mutations
      retryDelay: 1000,
    },
  },

  // Global query cache with error handling
  queryCache: new QueryCache({
    onError: onQueryError,
  }),

  // Global mutation cache with error handling
  mutationCache: new MutationCache({
    onError: onMutationError,
  }),
});

/**
 * Helper function to extract error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (isPostgrestError(error)) {
    return error.message || 'An error occurred';
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
 * React Query DevTools configuration
 * Only import and use in development mode
 *
 * @example
 * ```tsx
 * import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
 *
 * function App() {
 *   return (
 *     <QueryClientProvider client={queryClient}>
 *       <YourApp />
 *       {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
 *     </QueryClientProvider>
 *   );
 * }
 * ```
 */
export const reactQueryDevTools = {
  initialIsOpen: false,
  position: 'bottom-right' as const,
  buttonPosition: 'bottom-right' as const,
};
