/**
 * BookingDetailsPanel Component
 *
 * Modal panel that displays detailed information about a booking.
 * Includes actions like edit, cancel, share, and add to calendar.
 */

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Trash2,
  Share2,
  CalendarPlus,
} from "lucide-react";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";
import type { Database } from "@/types/database";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

export interface BookingDetailsPanelProps {
  readonly booking: BookingWithDetails;
  readonly onClose: () => void;
  readonly onEdit?: (booking: BookingWithDetails) => void;
  readonly onCancel?: (booking: BookingWithDetails) => void;
  readonly onShare?: (booking: BookingWithDetails) => void;
  readonly onAddToCalendar?: (booking: BookingWithDetails) => void;
}

// Mapping for StatusBadge variant
const getStatusVariant = (
  status: BookingStatus
): "success" | "warning" | "error" | "info" | "pending" => {
  switch (status) {
    case "paid":
      return "success";
    case "completed":
      return "success";
    case "pending":
      return "pending";
    case "awaiting_payment":
      return "warning";
    case "cancelled":
      return "error";
    case "expired":
      return "error";
    case "refunded":
      return "info";
    default:
      return "info";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
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
 * Format duration using translations
 */
const DurationLabel = ({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt: string;
}): JSX.Element => {
  const { i18n } = useTranslation("booking");
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  
  // Use proper language-specific formatting
  if (i18n.language === 'no') {
    return <>{hours === 1 ? `1 time` : `${hours} timer`}</>;
  } else {
    return <>{hours === 1 ? `1 hour` : `${hours} hours`}</>;
  }
};

const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(cents / 100);
};

/**
 * BookingDetailsPanel component displays detailed booking information in a modal
 *
 * @example
 * ```tsx
 * {showDetails && selectedBooking && (
 *   <BookingDetailsPanel
 *     booking={selectedBooking}
 *     onClose={handleClose}
 *     onEdit={handleEdit}
 *     onCancel={handleCancel}
 *     onShare={handleShare}
 *     onAddToCalendar={handleAddToCalendar}
 *   />
 * )}
 * ```
 */
export const BookingDetailsPanel = ({
  booking,
  onClose,
  onEdit,
  onCancel,
  onShare,
  onAddToCalendar,
}: BookingDetailsPanelProps): JSX.Element => {
  const { t } = useTranslation("booking");

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
    },
    []
  );

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(booking);
    }
  }, [onEdit, booking]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel(booking);
    }
  }, [onCancel, booking]);

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(booking);
    }
  }, [onShare, booking]);

  const handleAddToCalendar = useCallback(() => {
    if (onAddToCalendar) {
      onAddToCalendar(booking);
    }
  }, [onAddToCalendar, booking]);

  // Determine available actions based on booking status
  const canEdit =
    booking.status === "pending" || booking.status === "awaiting_payment";
  const canCancel =
    booking.status === "pending" ||
    booking.status === "awaiting_payment" ||
    booking.status === "paid";
  const canDelete = booking.status === "cancelled";
  const canShare = booking.status === "paid" || booking.status === "completed";
  const canAddToCalendar =
    booking.status === "paid" || booking.status === "completed";

  // Determine the appropriate cancel/delete action based on booking status
  const getCancelDeleteButtonProps = () => {
    if (booking.status === 'cancelled') {
      // If already cancelled, the action is to permanently delete
      return {
        label: t("actions.delete_permanently" as any),
        iconColor: "text-red-600 border-red-600 hover:text-red-700 hover:border-red-700 hover:bg-red-50"
      };
    } else if (canCancel) {
      // If not cancelled but can be cancelled, the action is to cancel the booking
      return {
        label: t("details.cancelBooking"),
        iconColor: "text-red-600 hover:text-red-700 hover:bg-red-50"
      };
    } else {
      // If neither can cancel nor delete
      return null;
    }
  };

  const cancelDeleteButtonProps = getCancelDeleteButtonProps();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2
              id="booking-details-title"
              className="text-2xl font-semibold text-gray-900 dark:text-white"
            >
              {t("details.title")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
              aria-label={t("details.close")}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Facility Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                {booking.facility?.name || t("details.unknownVenue")}
              </h3>
              {booking.zone?.name && (
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {booking.zone.name}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("details.statusLabel")}
              </span>
              <StatusBadge
                status={booking.status}
                variant={getStatusVariant(booking.status)}
                showIcon={true}
              />
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("details.dateLabel")}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatDate(booking.starts_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t("details.timeLabel")}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatTime(booking.starts_at)} -{" "}
                  {formatTime(booking.ends_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("details.durationLabel")}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  <DurationLabel
                    startsAt={booking.starts_at}
                    endsAt={booking.ends_at}
                  />
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t("details.totalPriceLabel")}
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-white text-right">
                  {formatPrice(booking.total_cents)}
                </span>
              </div>

              {booking.notes && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    {t("details.notesLabel")}
                  </span>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                    {booking.notes}
                  </p>
                </div>
              )}

              <div className="flex items-start justify-between py-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Booking ID
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 font-mono text-right">
                  {booking.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t("details.actionsLabel")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  {t("details.editBooking")}
                </Button>
              )}

              {cancelDeleteButtonProps && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className={`flex items-center justify-center gap-2 ${cancelDeleteButtonProps.iconColor}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {cancelDeleteButtonProps.label}
                </Button>
              )}

              {canShare && onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {t("details.shareBooking")}
                </Button>
              )}

              {canAddToCalendar && onAddToCalendar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                  className="flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  {t("details.addToCalendar")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
