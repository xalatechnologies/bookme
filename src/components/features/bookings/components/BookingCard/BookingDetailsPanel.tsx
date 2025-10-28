/**
 * BookingDetailsPanel Component
 *
 * Modal panel that displays detailed information about a booking.
 * Includes actions like edit, cancel, share, and add to calendar.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Clock, MapPin, Edit, Trash2, Share2, CalendarPlus } from 'lucide-react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';
import { useLocalizedDbValue } from '@/hooks/useLocalizedDbValues';

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

// Helper component to get translated status label
const StatusLabel = ({ status }: { status: BookingStatus }): JSX.Element => {
  const dbLabel = useLocalizedDbValue('booking_status', status);
  const { t } = useTranslation('booking');
  
  // Use database translation if available, otherwise use JSON translation
  const label = dbLabel !== status ? dbLabel : t(`status.${status}`, { defaultValue: status });
  return <>{label}</>;
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

/**
 * Format duration using translations
 */
const DurationLabel = ({ startsAt, endsAt }: { startsAt: string; endsAt: string }): JSX.Element => {
  const { t } = useTranslation('bookings');
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const label = hours === 1 ? `1 ${t('time.hour')}` : `${hours} ${t('time.hours')}`;
  return <>{label}</>;
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
  const { t } = useTranslation('bookings');
  
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
              {t('details.title')}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
              aria-label={t('details.close')}
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
                {booking.facility?.name || t('details.unknownVenue')}
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
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('details.statusLabel')}</span>
              <Badge className={getStatusBadgeColor(booking.status)}>
                <StatusLabel status={booking.status} />
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('details.dateLabel')}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatDate(booking.starts_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t('details.timeLabel')}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('details.durationLabel')}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right">
                  <DurationLabel startsAt={booking.starts_at} endsAt={booking.ends_at} />
                </span>
              </div>

              <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('details.totalPriceLabel')}
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-white text-right">
                  {formatPrice(booking.total_cents)}
                </span>
              </div>

              {booking.notes && (
                <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    {t('details.notesLabel')}
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
              {t('details.actionsLabel')}
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
                  {t('details.editBooking')}
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
                  {t('details.cancelBooking')}
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
                  {t('details.shareBooking')}
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
                  {t('details.addToCalendar')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
