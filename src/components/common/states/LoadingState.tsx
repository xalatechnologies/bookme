/**
 * LoadingState - Reusable Loading Indicator Component
 *
 * A consistent, accessible component for displaying loading states
 * across the application with multiple variants.
 *
 * @example
 * ```tsx
 * // Spinner variant
 * <LoadingState type="spinner" message={t('loading.data')} />
 *
 * // Skeleton variant
 * <LoadingState type="skeleton" />
 *
 * // Pulse variant
 * <LoadingState type="pulse" size="lg" />
 * ```
 */

import React from "react";

/**
 * Loading state variant types
 */
export type LoadingType = "spinner" | "skeleton" | "pulse" | "dots";

/**
 * Loading state size options
 */
export type LoadingSize = "sm" | "md" | "lg" | "xl";

/**
 * LoadingState Props
 */
export interface LoadingStateProps {
  /** Loading indicator type */
  type?: LoadingType;
  /** Optional loading message */
  message?: string;
  /** Size variant */
  size?: LoadingSize;
  /** Additional className for container */
  className?: string;
  /** Full screen mode */
  fullScreen?: boolean;
  /** Show background overlay */
  overlay?: boolean;
}

/**
 * Size configurations for different loading types
 */
const sizeConfigs = {
  spinner: {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  },
  skeleton: {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
    xl: "h-80",
  },
  pulse: {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  },
  dots: {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  },
};

/**
 * Spinner Loading Component
 */
const SpinnerLoading: React.FC<{ size: LoadingSize }> = ({ size }) => (
  <div
    className={`${sizeConfigs.spinner[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
    role="status"
    aria-label="Loading"
  />
);

/**
 * Skeleton Loading Component
 */
const SkeletonLoading: React.FC<{ size: LoadingSize }> = ({ size }) => (
  <div className="space-y-3 w-full max-w-md">
    <div
      className={`${sizeConfigs.skeleton[size]} bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse`}
    />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
  </div>
);

/**
 * Pulse Loading Component
 */
const PulseLoading: React.FC<{ size: LoadingSize }> = ({ size }) => (
  <div
    className={`${sizeConfigs.pulse[size]} bg-blue-600 rounded-full animate-pulse`}
    role="status"
    aria-label="Loading"
  />
);

/**
 * Dots Loading Component
 */
const DotsLoading: React.FC<{ size: LoadingSize }> = ({ size }) => {
  const dotClass = sizeConfigs.dots[size];
  return (
    <div
      className="flex items-center space-x-2"
      role="status"
      aria-label="Loading"
    >
      <div
        className={`${dotClass} bg-blue-600 rounded-full animate-bounce`}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={`${dotClass} bg-blue-600 rounded-full animate-bounce`}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={`${dotClass} bg-blue-600 rounded-full animate-bounce`}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
};

/**
 * LoadingState Component
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  type = "spinner",
  message,
  size = "md",
  className = "",
  fullScreen = false,
  overlay = false,
}) => {
  // Render appropriate loading component
  const renderLoader = () => {
    switch (type) {
      case "spinner":
        return <SpinnerLoading size={size} />;
      case "skeleton":
        return <SkeletonLoading size={size} />;
      case "pulse":
        return <PulseLoading size={size} />;
      case "dots":
        return <DotsLoading size={size} />;
      default:
        return <SpinnerLoading size={size} />;
    }
  };

  // Container classes
  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center py-12";

  const overlayClass = overlay
    ? "fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50"
    : "";

  return (
    <div className={`${containerClass} ${overlayClass} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {renderLoader()}
        {message && (
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Inline Loading Component (for buttons, etc.)
 */
export const InlineLoading: React.FC<{ size?: "sm" | "md" }> = ({
  size = "sm",
}) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div
      className={`${sizeClass} border-2 border-white border-t-transparent rounded-full animate-spin inline-block`}
      role="status"
      aria-label="Loading"
    />
  );
};
