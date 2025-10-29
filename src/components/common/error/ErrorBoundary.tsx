/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Features:
 * - Catches rendering errors
 * - Provides fallback UI
 * - Logs errors to console (can be extended to error reporting service)
 * - Reset functionality to recover from errors
 * - Development mode shows error details
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly resetKeys?: readonly any[];
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary class component
 * (Must be a class component as error boundaries don't work with hooks yet)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Send error to error reporting service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Noe gikk galt
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              En uventet feil oppstod. Vi beklager uleiligheten. Du kan prøve å laste siden på nytt
              eller gå tilbake til forsiden.
            </p>

            {/* Development Mode: Show Error Details */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Error Details (Dev Mode):
                </h2>
                <p className="text-xs text-red-600 dark:text-red-400 font-mono mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs text-gray-600 dark:text-gray-400">
                    <summary className="cursor-pointer font-medium mb-2">
                      Component Stack
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-40 text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.resetErrorBoundary}
                className="flex-1 flex items-center justify-center gap-2"
                variant="default"
              >
                <RefreshCw className="w-4 h-4" />
                Prøv igjen
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                className="flex-1 flex items-center justify-center gap-2"
                variant="outline"
              >
                <Home className="w-4 h-4" />
                Gå til forsiden
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based Error Boundary wrapper for functional components
 * Uses react-error-boundary library internally
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ErrorBoundary>
 *       <Routes />
 *     </ErrorBoundary>
 *   );
 * }
 * ```
 */
export default ErrorBoundary;
