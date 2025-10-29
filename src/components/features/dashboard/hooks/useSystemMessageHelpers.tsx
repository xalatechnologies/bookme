"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface ISystemMessageHelpers {
  readonly getMessageIcon: (type: "info" | "warning" | "maintenance" | "success") => JSX.Element;
  readonly getCategoryLabel: (category: "system" | "booking" | "news") => string;
}

/**
 * useSystemMessageHelpers Hook
 *
 * Provides utility functions for system messages component
 * Handles message type icons and category label translations
 *
 * Returns:
 * - getMessageIcon: Returns appropriate icon for message type
 * - getCategoryLabel: Returns translated category label
 */
export const useSystemMessageHelpers = (): ISystemMessageHelpers => {
  const { t } = useTranslation("user");

  const getMessageIcon = (type: "info" | "warning" | "maintenance" | "success"): JSX.Element => {
    const icons = {
      info: Bell,
      warning: AlertTriangle,
      maintenance: Clock,
      success: CheckCircle,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryLabel = (category: "system" | "booking" | "news"): string => {
    const labels = {
      system: t("dashboard.system_messages.categories.system"),
      booking: t("dashboard.system_messages.categories.booking"),
      news: t("dashboard.system_messages.categories.news"),
    };
    return labels[category];
  };

  return {
    getMessageIcon,
    getCategoryLabel,
  };
};
