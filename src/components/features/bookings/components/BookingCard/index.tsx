/**
 * BookingCard Component
 *
 * Displays a single booking with all relevant information.
 * Supports selection, actions, and click handlers.
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Displays booking information only
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Uses i18n translations and utility functions
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Eye, Trash2 } from 'lucide-react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';
import {
  formatDate,
  formatTime,
  formatDuration,
  formatPrice,
  getStatusColor,
  getStatusBadgeColor
} from '@/utils/card-formatters';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingCardProps {
  readonly booking: BookingWithDetails;
  readonly selected?: boolean;
  readonly onSelect?: (bookingId: string) => void;
  readonly onViewDetails?: (booking: BookingWithDetails) => void;
  readonly onDelete?: (bookingId: string) => void;
  readonly showCheckbox?: boolean;
}

/**
 * Get translated status label
 */
const useStatusLabel = (status: BookingStatus): string => {
  const { t } = useTranslation('booking');

  const statusMap: Record<BookingStatus, string> = {
    paid: t('status.paid'),
    completed: t('status.completed'),
    pending: t('status.pending'),
    awaiting_payment: t('status.awaiting_payment'),
    cancelled: t('status.cancelled'),
    expired: t('status.expired'),
    refunded: t('status.refunded')
  };

  return statusMap[status] || status;
};

/**
 * BookingCard component displays a single booking
 *
 * @example
 * ```tsx
 * <BookingCard
 *   booking={booking}
 *   selected={selectedIds.includes(booking.id)}
 *   onSelect={handleSelect}
 *   onViewDetails={handleViewDetails}
 *   onDelete={handleDelete}
 *   showCheckbox
 * />
 * ```
 */
export const BookingCard = ({
  booking,
  selected = false,
  onSelect,
  onViewDetails,
  onDelete,
  showCheckbox = true,
}: BookingCardProps): JSX.Element => {
  const { t } = useTranslation('booking');
  const statusLabel = useStatusLabel(booking.status);

  const durationTranslations = {
    hour: t('card.hour'),
    hours: t('card.hours')
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(booking.id);
    }
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(booking);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(booking.id);
    }
  };

  return (
    <div className="flex items-start gap-4">
      {showCheckbox && (
        <div onClick={handleSelectClick}>
          <Checkbox
            checked={selected}
            onCheckedChange={() => onSelect?.(booking.id)}
            className="mt-1"
            aria-label={t('card.selectBooking', { facility: booking.facility?.name })}
          />
        </div>
      )}

      <Card
        className="relative cursor-pointer flex-1 hover:shadow-md transition-shadow"
        onClick={handleCardClick}
      >
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getStatusColor(booking.status)}`} />

        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 ml-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {booking.facility?.name || t('card.unknownFacility')}
                </h3>
                <Badge className={getStatusBadgeColor(booking.status)}>
                  {statusLabel}
                </Badge>
              </div>

              {/* Details */}
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(booking.starts_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(booking.starts_at)} - {formatTime(booking.ends_at)}
                  </span>
                  <span className="text-gray-500">
                    ({formatDuration(booking.starts_at, booking.ends_at, durationTranslations)})
                  </span>
                </div>

                {booking.zone?.name && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{booking.zone.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="font-medium text-gray-900 text-base">
                    {formatPrice(booking.total_cents)}
                  </span>
                  {booking.notes && (
                    <span className="text-xs text-gray-500 italic">
                      {t('card.hasNotes')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="default"
                size="sm"
                onClick={handleViewClick}
                className="h-9 w-9 p-0"
                aria-label={t('card.viewDetails')}
                title={t('card.viewDetails')}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={t('card.cancelBooking')}
                  title={t('card.cancelBooking')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
