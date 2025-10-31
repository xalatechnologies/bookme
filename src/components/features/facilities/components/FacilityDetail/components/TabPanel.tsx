/**
 * TabPanel Component
 *
 * Reusable wrapper component for tab content with consistent styling.
 * Provides loading, error, and empty state handling.
 */

import React from 'react';

interface TabPanelProps {
  readonly children: React.ReactNode;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly emptyMessage?: string;
  readonly isEmpty?: boolean;
}

/**
 * Wrapper component for tab content with consistent styling and state handling
 */
export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  isLoading = false,
  error = null,
  emptyMessage,
  isEmpty = false
}): JSX.Element => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (isEmpty && emptyMessage) {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600 text-center">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render children with consistent styling
  return (
    <div className="space-y-6 mt-6">
      {children}
    </div>
  );
};
