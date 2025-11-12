"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import { IRecentEvent } from "@/types/admin";
import { useEventHelpers } from "../hooks/useEventHelpers";

interface IRecentEventsProps {
  readonly events: readonly IRecentEvent[];
}

export const RecentEvents = ({ events }: IRecentEventsProps): JSX.Element => {
  const { t } = useTranslation("admin");
  const { getEventIcon, getEventColor } = useEventHelpers();

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("dashboard.events.title")}
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("dashboard.events.no_recent")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("dashboard.events.title")}
      </h3>

      <div className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            role="article"
            aria-label={t("dashboard.events.event_item", { message: event.message })}
          >
            <div className={`p-2 rounded-lg ${getEventColor(event.type)}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white mb-1">
                {event.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{event.user}</span>
                <span>•</span>
                <span>{event.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
