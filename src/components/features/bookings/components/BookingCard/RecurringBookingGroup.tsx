/**
 * RecurringBookingGroup Component
 *
 * Displays a group of recurring bookings with summary information.
 * Shows frequency, count, and provides expansion to view all instances.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat, Eye, Calendar, Clock } from "lucide-react";
import type { RecurringBookingGroup as RecurringGroup } from "@/hooks/bookings";

export interface RecurringBookingGroupProps {
  readonly group: RecurringGroup;
  readonly onViewDetails?: (groupId: string) => void;
}

const getFrequencyColor = (frequency: string): string => {
  switch (frequency) {
    case "weekly":
      return "bg-purple-100 text-purple-800";
    case "biweekly":
      return "bg-blue-100 text-blue-800";
    case "monthly":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * RecurringBookingGroup component displays a group of recurring bookings
 *
 * @example
 * ```tsx
 * <RecurringBookingGroup
 *   group={recurringGroup}
 *   onViewDetails={handleViewGroupDetails}
 * />
 * ```
 */
export const RecurringBookingGroup = ({
  group,
  onViewDetails,
}: RecurringBookingGroupProps): JSX.Element => {
  const { t } = useTranslation(["booking", "common"]);
  
  // Get translated frequency labels
  const frequencyLabels = {
    weekly: t("booking:recurring.weekly", "Weekly"),
    biweekly: t("booking:recurring.biweekly", "Biweekly"),
    monthly: t("booking:recurring.monthly", "Monthly"),
    default: t("booking:recurring.title", "Recurring Booking")
  };
  
  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(group.recurringId);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(group.recurringId);
    }
  };

  // Get next booking info
  const nextBooking = group.nextBooking;
  const nextDate = nextBooking ? formatDate(nextBooking.starts_at) : null;
  const nextTime = nextBooking ? formatTime(nextBooking.starts_at) : null;

  // Get frequency label
  const getFrequencyLabel = (): string => {
    switch (group.frequency) {
      case "weekly":
        return frequencyLabels.weekly;
      case "biweekly":
        return frequencyLabels.biweekly;
      case "monthly":
        return frequencyLabels.monthly;
      default:
        return frequencyLabels.default;
    }
  };

  return (
    <Card
      className="relative cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-lg" />

      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 ml-2">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 text-lg">
                {group.facilityName}
              </h3>
              <Badge className={getFrequencyColor(group.frequency)}>
                {getFrequencyLabel()}
              </Badge>
            </div>

            {/* Zone info */}
            {group.zoneName && (
              <p className="text-sm text-gray-600 mb-2">{group.zoneName}</p>
            )}

            {/* Summary stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <span className="font-medium">
                {group.totalBookings} {t("booking:recurring.occurrences", "Occurrences")}
              </span>
              <span className="text-green-600">
                {group.upcomingCount} {t("booking:filters.upcoming", "Upcoming")}
              </span>
              <span className="text-blue-600">
                {group.completedCount} {t("booking:status.completed", "Completed")}
              </span>
            </div>

            {/* Next booking info */}
            {nextBooking && (
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{t("booking:recurring.next_label", "Next:")}</span>
                  {nextDate}
                </span>
                <span className="flex items-center gap-1 text-gray-700">
                  <Clock className="w-3 h-3" />
                  {nextTime}
                </span>
              </div>
            )}

            {!nextBooking && group.completedCount > 0 && (
              <p className="text-sm text-gray-500 italic">
                {t("common.all_bookings_completed", "All bookings completed")}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="default"
              size="sm"
              onClick={handleViewClick}
              className="h-9 w-9 p-0"
              aria-label={t("booking:recurring.view_all_occurrences", "View all occurrences")}
              title={t("booking:recurring.view_all_occurrences", "View all occurrences")}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};