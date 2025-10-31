"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Heart,
  User,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export interface IActivityItem {
  readonly id: string;
  readonly type:
    | "booking_created"
    | "booking_confirmed"
    | "booking_cancelled"
    | "facility_favorited"
    | "facility_unfavorited"
    | "profile_updated";
  readonly title: string;
  readonly description: string;
  readonly timestamp: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
}

interface IActivityFeedProps {
  readonly activities: readonly IActivityItem[];
  readonly maxItems?: number;
}

/**
 * ActivityFeed Component
 *
 * Displays a chronological feed of user activities
 *
 * Features:
 * - Fully internationalized activity labels
 * - Icon-based activity type visualization
 * - Relative timestamp formatting
 * - Empty state handling
 * - Responsive card layout
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only renders activity feed UI
 * - Open/Closed: Extensible through activity types without modification
 * - Interface Segregation: Focused props interface
 */
const ActivityFeed = ({
  activities,
  maxItems = 10,
}: IActivityFeedProps): JSX.Element => {
  const { t } = useTranslation("common");

  const getActivityIcon = (type: IActivityItem["type"]): React.ReactNode => {
    const icons = {
      booking_created: (
        <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      ),
      booking_confirmed: (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      ),
      booking_cancelled: (
        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      ),
      facility_favorited: (
        <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
      ),
      facility_unfavorited: (
        <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      ),
      profile_updated: (
        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      ),
    };

    return (
      icons[type] || (
        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      )
    );
  };

  const getActivityTypeLabel = (type: IActivityItem["type"]): string => {
    return t(`user:activity.${type}`);
  };

  const getActivityBadgeColor = (type: IActivityItem["type"]): string => {
    const colors = {
      booking_created:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      booking_confirmed:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      booking_cancelled:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      facility_favorited:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      facility_unfavorited:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      profile_updated:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    };

    return (
      colors[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    );
  };

  const formatRelativeTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t("common:time.ago", {
        time: `${diffInSeconds} ${t("common:time.seconds")}`,
      });
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return t("common:time.ago", {
        time: `${diffInMinutes} ${
          diffInMinutes === 1
            ? t("common:time.minute")
            : t("common:time.minutes")
        }`,
      });
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return t("common:time.ago", {
        time: `${diffInHours} ${
          diffInHours === 1 ? t("common:time.hour") : t("common:time.hours")
        }`,
      });
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return t("common:time.ago", {
      time: `${diffInDays} ${
        diffInDays === 1 ? t("common:time.day") : t("common:time.days")
      }`,
    });
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" aria-hidden="true" />
          {t("user:activity.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("user:activity.no_activity")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </h4>
                    <Badge
                      className={`flex-shrink-0 text-xs ${getActivityBadgeColor(
                        activity.type
                      )}`}
                    >
                      {getActivityTypeLabel(activity.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
