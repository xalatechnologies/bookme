/**
 * Type definitions for BookingsPage component
 * 
 * These types ensure type safety when working with booking data
 * from localStorage and Supabase sources.
 */

/**
 * Extended booking interface for admin bookings page
 * Combines data from localStorage and Supabase sources
 */
export interface AdminBooking {
  readonly id: string;
  readonly title: string;
  readonly facility: string;
  readonly facilityId: string;
  readonly facilityName?: string;
  readonly bookerName: string;
  readonly bookerEmail: string;
  readonly purpose: string;
  readonly description?: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly date?: string;
  readonly time?: string;
  readonly status: "pending" | "approved" | "rejected" | "cancelled";
  readonly requestedAt: string;
  readonly submittedAt?: string;
  readonly processedBy?: string;
  readonly processedAt?: string;
  readonly price: number | string;
  readonly duration: number | string;
  readonly isRecurring?: boolean;
  readonly parentBookingId?: string;
  readonly contactPerson?: string;
  readonly timeSlots?: readonly TimeSlot[];
}

/**
 * Time slot structure for bookings
 */
export interface TimeSlot {
  readonly timeSlot: string;
  readonly date?: string;
}

/**
 * Raw booking data from localStorage (before normalization)
 */
export interface RawBookingData {
  readonly id?: string;
  readonly facility?: string;
  readonly facilityName?: string;
  readonly facilityId?: string;
  readonly contactPerson?: string;
  readonly purpose?: string;
  readonly description?: string;
  readonly date?: string;
  readonly time?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly status?: string;
  readonly submittedAt?: string;
  readonly price?: string | number;
  readonly duration?: string | number;
  readonly isRecurring?: boolean;
  readonly parentBookingId?: string;
  readonly timeSlots?: readonly TimeSlot[];
  readonly [key: string]: unknown;
}

/**
 * Type guard to check if value is a valid booking
 */
export function isAdminBooking(value: unknown): value is AdminBooking {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  const booking = value as Record<string, unknown>;
  return (
    typeof booking.id === 'string' &&
    typeof booking.facility === 'string' &&
    typeof booking.status === 'string'
  );
}

/**
 * Type guard to check if value is raw booking data
 */
export function isRawBookingData(value: unknown): value is RawBookingData {
  return typeof value === 'object' && value !== null;
}

