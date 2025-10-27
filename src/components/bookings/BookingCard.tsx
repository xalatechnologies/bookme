/**
 * BookingCard Component
 *
 * Displays a single booking with all relevant information.
 * Supports selection, actions, and click handlers.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Eye, Trash2 } from 'lucide-react';
import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

export interface BookingCardProps {
  readonly booking: BookingWithDetails;
  readonly selected?: boolean;
  readonly onSelect?: (bookingId: string) => void;
  readonly onViewDetails?: (booking: BookingWithDetails) => void;
  readonly onDelete?: (bookingId: string) => void;
  readonly showCheckbox?: boolean;
}

const getStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case "paid": return "bg-green-500";
    case "completed": return "bg-blue-500";
    case "pending": return "bg-yellow-500";
    case "awaiting_payment": return "bg-orange-500";
    case "cancelled": return "bg-red-500";
    case "expired": return "bg-gray-500";
    case "refunded": return "bg-purple-500";
    default: return "bg-gray-500";
  }
};

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
    day: '2-digit',
    month: 'short',
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
            aria-label={`Velg booking for ${booking.facility?.name}`}
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
                  {booking.facility?.name || 'Ukjent lokale'}
                </h3>
                <Badge className={getStatusBadgeColor(booking.status)}>
                  {getStatusLabel(booking.status)}
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
                    ({formatDuration(booking.starts_at, booking.ends_at)})
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
                      Har notater
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
                aria-label="Se detaljer"
                title="Se detaljer"
              >
                <Eye className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Avlys booking"
                  title="Avlys booking"
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
