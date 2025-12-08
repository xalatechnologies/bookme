"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ISystemAlert } from "@/types/admin";
import { useAlertHelpers } from "../hooks/useAlertHelpers";

interface ISystemAlertsProps {
  readonly alerts: readonly ISystemAlert[];
}

export const SystemAlerts = ({ alerts }: ISystemAlertsProps): JSX.Element => {
  const { t } = useTranslation("admin");
  const { getAlertIcon, getAlertColor } = useAlertHelpers();

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("pages.dashboard.alerts_section.title")}
        </h3>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("pages.dashboard.alerts_section.no_alerts")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("pages.dashboard.alerts_section.all_systems_normal")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("pages.dashboard.alerts_section.title")}
      </h3>

      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
            role="alert"
            aria-label={t("pages.dashboard.alerts_section.title")}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {alert.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.timestamp}
                  </span>
                  {alert.action && (
                    <Button
                      variant="link"
                      size="sm"
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium p-0 h-auto"
                      aria-label={alert.action}
                    >
                      {alert.action}
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};