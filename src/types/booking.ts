"use client";

import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

export interface Zone {
  readonly id: string;
  readonly name: string;
  readonly facilityId: string;
  readonly capacity: number;
  readonly pricePerHour: number;
  readonly area?: number; // Area in square meters
  readonly description?: string; // Zone information/description
  readonly amenities: readonly string[];
  readonly availability: {
    readonly monday: { readonly start: string; readonly end: string; };
    readonly tuesday: { readonly start: string; readonly end: string; };
    readonly wednesday: { readonly start: string; readonly end: string; };
    readonly thursday: { readonly start: string; readonly end: string; };
    readonly friday: { readonly start: string; readonly end: string; };
    readonly saturday: { readonly start: string; readonly end: string; };
    readonly sunday: { readonly start: string; readonly end: string; };
  };
}

export interface SelectedTimeSlot {
  readonly id: string;
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneName: string;
  readonly pricePerHour: number;
  readonly duration: number; // Duration in hours
  readonly isRecurring?: boolean; // Whether this is part of a recurring booking
  readonly recurrencePattern?: RecurrencePattern; // Recurrence pattern if applicable
  readonly parentBookingId?: string; // ID of the parent recurring booking
}

export interface BookingConflict {
  readonly id: string;
  readonly type: 'booking' | 'maintenance' | 'event';
  readonly title: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly description?: string;
}

export interface AvailabilityStatus {
  readonly status: 'available' | 'busy' | 'unavailable';
  readonly conflict?: BookingConflict;
}

export interface DragState {
  readonly isDragging: boolean;
  readonly startSlot?: {
    readonly zoneId: string;
    readonly date: Date;
    readonly timeSlot: string;
  };
  readonly previewSlots: readonly SelectedTimeSlot[];
}

/**
 * Booking type enumeration
 */
export type BookingType = 'one-time' | 'recurring';

/**
 * Recurring booking configuration
 */
export interface RecurringBookingConfig {
  readonly type: BookingType;
  readonly pattern: RecurrencePattern;
  readonly maxOccurrences?: number;
  readonly endDate?: Date;
}

/**
 * Booking form data for recurring bookings
 */
export interface RecurringBookingFormData {
  readonly bookingType: BookingType;
  readonly recurrenceConfig?: RecurringBookingConfig;
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly additionalInfo?: string;
  readonly actorType: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly termsAccepted: boolean;
}
