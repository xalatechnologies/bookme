"use client";

import React from "react";
import { Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";

interface IAlertHelpers {
  readonly getAlertIcon: (type: string) => React.ReactNode;
  readonly getAlertColor: (type: string) => string;
}

/**
 * useAlertHelpers Hook
 *
 * Provides utility functions for system alerts component
 * Handles alert type icons and color styling
 *
 * Returns:
 * - getAlertIcon: Returns appropriate icon for alert type
 * - getAlertColor: Returns CSS classes for alert type styling
 */
export const useAlertHelpers = (): IAlertHelpers => {
  const getAlertIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string): string => {
    switch (type) {
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    }
  };

  return {
    getAlertIcon,
    getAlertColor,
  };
};
