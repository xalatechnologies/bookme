/**
 * RecurringBookingGroupDetails Component
 *
 * Displays detailed information about a recurring booking group.
 * Shows all occurrences with their status and provides actions.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import type { RecurringBookingGroup } from "@/hooks/bookings";

// Helper functions for formatting dates and times
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

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
    case "awaiting_payment":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "expired":
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    case "refunded":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "paid":
    case "completed":
      return "border-l-green-500";
    case "pending":
    case "awaiting_payment":
      return "border-l-yellow-500";
    case "cancelled":
    case "expired":
    case "refunded":
      return "border-l-red-500";
    default:
      return "border-l-gray-500";
  }
};

export interface RecurringBookingGroupDetailsProps {
  readonly group: RecurringBookingGroup;
  readonly onClose: () => void;
  readonly onCancelGroup?: (groupId: string) => void;
}

const getStatusIcon = (status: string): JSX.Element => {
  switch (status) {
    case "paid":
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "pending":
    case "awaiting_payment":
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    case "cancelled":
    case "expired":
    case "refunded":
      return <XCircle className="w-4 h-4 text-red-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

/**
 * RecurringBookingGroupDetails component displays detailed information about a recurring booking group
 *
 * @example
 * ```tsx
 * <RecurringBookingGroupDetails
 *   group={recurringGroup}
 *   onClose={handleCloseDetails}
 *   onCancelGroup={handleCancelGroup}
 * />
 * ```
 */
export const RecurringBookingGroupDetails = ({
  group,
  onClose,
  onCancelGroup,
}: RecurringBookingGroupDetailsProps): JSX.Element => {
  const { t } = useTranslation(["booking", "common"]);
  const [showAllOccurrences, setShowAllOccurrences] = useState(false);

  // Get translated labels
  const translatedLabels = {
    title: t("booking:recurring.title", "Recurring Booking"),
    close: t("booking:details.close", "Close"),
    weekly: t("booking:recurring.weekly", "Weekly"),
    biweekly: t("booking:recurring.biweekly", "Biweekly"),
    monthly: t("booking:recurring.monthly", "Monthly"),
    default: t("booking:recurring.title", "Recurring Booking"),
    occurrences: t("booking:recurring.occurrences", "Occurrences"),
    upcoming: t("booking:filters.upcoming", "Upcoming"),
    completed: t("booking:status.completed", "Completed"),
    nextOccurrence: t("booking:recurring.next_occurrence", "Next Occurrence"),
    purpose: t("booking:fields.purpose", "Purpose"),
    showLess: t("common:actions.show_less", "Show Less"),
    showAll: t("common:actions.show_all", "Show All"),
    paid: t("booking:status.paid", "Paid"),
    completedStatus: t("booking:status.completed", "Completed"),
    pending: t("booking:status.pending", "Pending"),
    pendingPayment: t("booking:status.pending_payment", "Pending Payment"),
    cancelled: t("booking:status.cancelled", "Cancelled"),
    expired: t("booking:status.expired", "Expired"),
    refunded: t("booking:status.refunded", "Refunded"),
    cancelSeries: t("booking:recurring.cancel_series", "Cancel Series")
  };

  // Show only upcoming occurrences by default, or all if requested
  const occurrencesToShow = showAllOccurrences 
    ? group.bookings 
    : group.bookings.filter(booking => new Date(booking.starts_at) >= new Date());

  const handleCancelGroup = () => {
    if (onCancelGroup) {
      onCancelGroup(group.recurringId);
    }
  };

  // Get frequency label
  const getFrequencyLabel = (): string => {
    switch (group.frequency) {
      case "weekly":
        return translatedLabels.weekly;
      case "biweekly":
        return translatedLabels.biweekly;
      case "monthly":
        return translatedLabels.monthly;
      default:
        return translatedLabels.default;
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "paid":
        return translatedLabels.paid;
      case "completed":
        return translatedLabels.completedStatus;
      case "pending":
        return translatedLabels.pending;
      case "awaiting_payment":
        return translatedLabels.pendingPayment;
      case "cancelled":
        return translatedLabels.cancelled;
      case "expired":
        return translatedLabels.expired;
      case "refunded":
        return translatedLabels.refunded;
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {translatedLabels.title}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4"
              aria-label={translatedLabels.close}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {group.facilityName}
            </h3>
            <Badge variant="secondary">
              {getFrequencyLabel()}
            </Badge>
          </div>
          
          {group.zoneName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{group.zoneName}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{group.totalBookings}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{translatedLabels.occurrences}</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{group.upcomingCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{translatedLabels.upcoming}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{group.completedCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{translatedLabels.completed}</p>
            </div>
          </div>
          
          {/* Next Booking */}
          {group.nextBooking && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{translatedLabels.nextOccurrence}</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-gray-900 dark:text-white">{formatDate(group.nextBooking.starts_at)}</span>
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 ml-2" />
                <span className="text-gray-900 dark:text-white">
                  {formatTime(group.nextBooking.starts_at)} - {formatTime(group.nextBooking.ends_at)}
                </span>
              </div>
            </div>
          )}
          
          {/* Purpose */}
          {group.bookings[0]?.notes && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{translatedLabels.purpose}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{group.bookings[0].notes}</p>
            </div>
          )}
          
          {/* Occurrences List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {translatedLabels.occurrences}
              </h4>
              {group.bookings.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllOccurrences(!showAllOccurrences)}
                  className="dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {showAllOccurrences 
                    ? translatedLabels.showLess 
                    : translatedLabels.showAll}
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {occurrencesToShow.map((booking) => {
                const isPast = new Date(booking.starts_at) < new Date();
                return (
                  <div 
                    key={booking.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isPast ? "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600" : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(booking.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatDate(booking.starts_at)}
                          </span>
                          <Badge className={getStatusBadgeColor(booking.status)} variant="secondary">
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {booking.total_cents > 0 && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(booking.total_cents / 100)} kr
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Actions */}
          <Separator className="dark:bg-gray-700" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              {translatedLabels.close}
            </Button>
            {onCancelGroup && (
              <Button variant="destructive" onClick={handleCancelGroup}>
                {translatedLabels.cancelSeries}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};