/**
 * BookingDetailsPanel Component
 *
 * Modal panel that displays detailed information about a booking.
 * Includes actions like edit, cancel, share, and add to calendar.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Clock, MapPin, Edit, Trash2, Share2, CalendarPlus } from 'lucide-react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingDetailsPanelProps {
  readonly booking: BookingWithDetails;
  readonly onClose: () => void;
  readonly onEdit?: (booking: BookingWithDetails) => void;
  readonly onCancel?: (booking: BookingWithDetails) => void;
  readonly onShare?: (booking: BookingWithDetails) => void;
  readonly onAddToCalendar?: (booking: BookingWithDetails) => void;
}

const getStatusBadgeColor = (status: BookingStatus): string => {
  switch (status) {
    case "paid": return "bg-green-100 text-green-800";
    case "completed": return "bg-blue-100 text-blue-800";
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "awaiting_payment": return "bg-orange-100 text-orange-800";
    case "cancelled": return "bg-red-100 text-red-800";
    case "expired": return "bg-gray-100 text-gray-800";
    case "refunded": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case "paid": return "Bekreftet";
    case "completed": return "Fullført";
    case "pending": return "Ventende";
    case "awaiting_payment": return "Venter betaling";
    case "cancelled": return "Avlyst";
    case "expired": return "Utløpt";
    case "refunded": return "Refundert";
    default: return status;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDuration = (startsAt: string, endsAt: string): string => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours === 1 ? '1 time' : `${hours} timer`;
};

const formatPrice = (cents: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK'
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
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Determine available actions based on booking status
  const canEdit = booking.status === 'pending' || booking.status === 'awaiting_payment';
  const canCancel = booking.status === 'pending' || booking.status === 'awaiting_payment' || booking.status === 'paid';
  const canShare = booking.status === 'paid' || booking.status === 'completed';
  const canAddToCalendar = booking.status === 'paid' || booking.status === 'completed';

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 id="booking-details-title" className="text-2xl font-semibold text-gray-900 dark:text-white">
              Bookingdetaljer
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
              aria-label="Lukk"
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
                {booking.facility?.name || 'Ukjent lokale'}
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
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <Badge className={getStatusBadgeColor(booking.status)}>
                {getStatusLabel(booking.status)}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dato
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatDate(booking.starts_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Tid
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Varighet
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatDuration(booking.starts_at, booking.ends_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pris
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-white text-right">
                  {formatPrice(booking.total_cents)}
                </span>
              </div>

              {booking.notes && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Notater
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
              Handlinger
            </p>

            <div className="grid grid-cols-2 gap-2">
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(booking)}
                  className="flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Rediger
                </Button>
              )}

              {canCancel && onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(booking)}
                  className="flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Avlys
                </Button>
              )}

              {canShare && onShare && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShare(booking)}
                  className="flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Del
                </Button>
              )}

              {canAddToCalendar && onAddToCalendar && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddToCalendar(booking)}
                  className="flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Legg til kalender
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
