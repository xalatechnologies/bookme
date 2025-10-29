"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface IDailyTasksHelpers {
  readonly getPriorityColor: (priority: "high" | "medium" | "low") => string;
  readonly getPriorityIcon: (priority: "high" | "medium" | "low") => React.ComponentType<{ className?: string }>;
  readonly getPriorityLabel: (priority: "high" | "medium" | "low") => string;
}

/**
 * useDailyTasksData Hook
 *
 * Provides utility functions for daily tasks component
 * Handles priority colors, icons, and i18n labels
 *
 * Returns:
 * - getPriorityColor: Returns CSS classes for priority badge styling
 * - getPriorityIcon: Returns appropriate icon component for priority level
 * - getPriorityLabel: Returns translated priority label
 */
export const useDailyTasksData = (): IDailyTasksHelpers => {
  const { t } = useTranslation("admin");

  const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
    const colors = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[priority];
  };

  const getPriorityIcon = (
    priority: "high" | "medium" | "low"
  ): React.ComponentType<{ className?: string }> => {
    const icons = {
      high: AlertTriangle,
      medium: Clock,
      low: CheckCircle,
    };
    return icons[priority];
  };

  const getPriorityLabel = (priority: "high" | "medium" | "low"): string => {
    const labels = {
      high: t("dashboard.approvals.priority_high"),
      medium: t("dashboard.approvals.priority_medium"),
      low: t("dashboard.approvals.priority_low"),
    };
    return labels[priority];
  };

  return {
    getPriorityColor,
    getPriorityIcon,
    getPriorityLabel,
  };
};
