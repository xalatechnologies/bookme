/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a fallback UI.
 * Prevents entire app from crashing due to errors in child components.
 */

import React, { Component, ReactNode, ErrorInfo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onReset?: () => void;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Wraps components to catch and handle errors gracefully.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error Boundary caught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (e.g., Sentry)
      // logErrorToService(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <CardTitle className="text-2xl">Noe gikk galt</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Vi beklager, men det oppstod en uventet feil. Dette kan skyldes en midlertidig
                teknisk utfordring.
              </p>

              {import.meta.env.DEV && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="font-mono text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-300">
                        Stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Prøv igjen
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Gå til forsiden
                </Button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hvis problemet vedvarer, vennligst kontakt support.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional Error Boundary Wrapper
 * 
 * For use in function components that need error boundary functionality.
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   return (
 *     <withErrorBoundary>
 *       <MyComponent />
 *     </withErrorBoundary>
 *   );
 * }
 * ```
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};
