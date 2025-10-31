"use client";

import React from "react";
import { Calendar, CheckCircle, User, Settings, Clock } from "lucide-react";

interface IEventHelpers {
  readonly getEventIcon: (type: string) => React.ReactNode;
  readonly getEventColor: (type: string) => string;
}

/**
 * useEventHelpers Hook
 *
 * Provides utility functions for recent events component
 * Handles event type icons and color styling
 *
 * Returns:
 * - getEventIcon: Returns appropriate icon for event type
 * - getEventColor: Returns CSS classes for event type styling
 */
export const useEventHelpers = (): IEventHelpers => {
  const getEventIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case "approval":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "user":
        return <User className="w-4 h-4 text-purple-500" />;
      case "system":
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: string): string => {
    switch (type) {
      case "booking":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      case "approval":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "user":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      case "system":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return {
    getEventIcon,
    getEventColor,
  };
};
