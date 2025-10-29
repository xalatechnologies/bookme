/**
 * BookingFormPanel Component
 *
 * Container component for the booking form including:
 * - Booking form display
 * - Recurrence pattern selector
 * - Form validation
 * - Submission handling
 *
 * Wraps BookingForm and manages recurrence UI.
 */

import React from "react";
import { BookingForm } from "@/components/features/bookings/components/BookingForm";
import { BookingTypeSelector } from "@/components/features/bookings/components/BookingForm/BookingTypeSelector";
import { RecurrencePatternSelector } from "@/components/features/bookings/components/RecurringBookingModal/RecurrencePatternSelector";
import type {
  ISelectedTimeSlot,
  BookingType,
} from "@/components/features/bookings/types";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";

export interface BookingFormPanelProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly onAddToCart: (bookingData: {
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern?: RecurrencePattern | null;
    readonly recurringSlots?: readonly ISelectedTimeSlot[];
  }) => void;
  readonly onCompleteBooking: (bookingData: {
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern?: RecurrencePattern | null;
    readonly recurringSlots?: readonly ISelectedTimeSlot[];
  }) => void;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly bookingType?: BookingType;
  readonly onBookingTypeChange?: (type: BookingType) => void;
  readonly recurrencePattern?: RecurrencePattern | null;
  readonly onRecurrencePatternChange?: (pattern: RecurrencePattern | null) => void;
  readonly showRecurrenceSelector?: boolean;
}

/**
 * BookingFormPanel Component
 *
 * Renders booking form with optional recurrence controls
 */
export const BookingFormPanel: React.FC<BookingFormPanelProps> = ({
  facilityId,
  facilityName,
  zoneId,
  selectedSlots,
  onSlotsChange,
  onAddToCart,
  onCompleteBooking,
  isLoading = false,
  error,
  bookingType = "one-time",
  onBookingTypeChange,
  recurrencePattern = null,
  onRecurrencePatternChange,
  showRecurrenceSelector = false,
}): JSX.Element => {
  return (
    <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
      {/* Booking Type Selector (if handler provided) */}
      {onBookingTypeChange && (
        <BookingTypeSelector
          selectedType={bookingType}
          onTypeChange={onBookingTypeChange}
        />
      )}

      {/* Recurrence Pattern Selector (for recurring bookings) */}
      {showRecurrenceSelector && onRecurrencePatternChange && (
        <RecurrencePatternSelector
          pattern={recurrencePattern}
          onPatternChange={onRecurrencePatternChange}
        />
      )}

      {/* Booking Form */}
      <BookingForm
        facilityId={facilityId}
        facilityName={facilityName}
        zoneId={zoneId}
        selectedSlots={selectedSlots}
        onSlotsChange={onSlotsChange}
        onAddToCart={onAddToCart}
        onCompleteBooking={onCompleteBooking}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};
