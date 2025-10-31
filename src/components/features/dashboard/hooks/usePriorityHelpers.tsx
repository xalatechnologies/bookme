"use client";

import React from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface IPriorityHelpers {
  readonly getPriorityIcon: (priority: string) => React.ReactNode;
  readonly getPriorityColor: (priority: string) => string;
}

/**
 * usePriorityHelpers Hook
 *
 * Provides utility functions for rendering priority indicators
 * Used across dashboard components for consistent priority visualization
 *
 * Returns:
 * - getPriorityIcon: Returns appropriate icon for priority level
 * - getPriorityColor: Returns CSS classes for priority-based styling
 */
export const usePriorityHelpers = (): IPriorityHelpers => {
  const getPriorityIcon = (priority: string): React.ReactNode => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/10";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10";
      default:
        return "border-l-green-500 bg-green-50 dark:bg-green-900/10";
    }
  };

  return {
    getPriorityIcon,
    getPriorityColor,
  };
};
