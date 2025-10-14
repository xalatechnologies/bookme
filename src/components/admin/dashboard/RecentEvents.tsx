"use client";

import React from "react";
import { Calendar, CheckCircle, User, Settings, Clock } from "lucide-react";
import { IRecentEvent } from "@/types/admin";

interface IRecentEventsProps {
  readonly events: readonly IRecentEvent[];
}

const RecentEvents = ({ events }: IRecentEventsProps): JSX.Element => {
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

  if (events.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Siste hendelser
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            Ingen hendelser registrert
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Siste hendelser
      </h3>
      
      <div className="space-y-3">
        {events.slice(0, 5).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
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

export default RecentEvents;
