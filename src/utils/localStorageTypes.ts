/**
 * Type-safe localStorage utilities for Booknor application
 *
 * This module provides TypeScript interfaces and helper functions for
 * safely accessing localStorage data with proper type checking and error handling.
 */

// Booking-related interfaces
export interface IStoredBooking {
  readonly id: string;
  readonly facilityName?: string;
  readonly facility?: string;
  readonly facilityId?: string;
  readonly startDate: string;
  readonly date?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly time?: string;
  readonly duration?: string | number;
  readonly status?: "approved" | "rejected" | "pending" | "cancelled";
  readonly price?: string | number;
  readonly purpose?: string;
  readonly description?: string;
  readonly contactPerson?: string;
  readonly bookerName?: string;
  readonly bookerEmail?: string;
  readonly submittedAt?: string;
  readonly requestedAt?: string;
  readonly processedBy?: string;
  readonly processedAt?: string;
  readonly isRecurring?: boolean;
  readonly parentBookingId?: string;
  readonly timeSlots?: readonly ITimeSlot[];
}

export interface ITimeSlot {
  readonly timeSlot: string;
  readonly price?: string | number;
}

// Filters interfaces
export interface IBookingFilters {
  readonly status?: readonly string[];
  readonly dateRange?: {
    readonly start: string;
    readonly end: string;
  };
  readonly searchQuery?: string;
  readonly facilityType?: string;
  readonly handler?: string;
  readonly duration?: string;
}

// Type-safe localStorage helper functions
export const getStoredBookings = (
  key: "pendingBookings" | "processedBookings"
): readonly IStoredBooking[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    return JSON.parse(stored) as IStoredBooking[];
  } catch (error) {
    console.error(`Failed to parse ${key}:`, error);
    return [];
  }
};

export const setStoredBookings = (
  key: "pendingBookings" | "processedBookings",
  bookings: readonly IStoredBooking[]
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (error) {
    console.error(`Failed to store ${key}:`, error);
  }
};

export const getStoredFilters = <T extends Record<string, unknown>>(
  key: string,
  defaultValue: T = {} as T
): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to parse ${key} filters:`, error);
    return defaultValue;
  }
};

export const setStoredFilters = <T extends Record<string, unknown>>(
  key: string,
  filters: T
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(filters));
  } catch (error) {
    console.error(`Failed to store ${key} filters:`, error);
  }
};

// Utility to parse Norwegian currency format
export const parseNOK = (text: string | number | undefined | null): number => {
  if (typeof text === "number") return text;
  if (!text) return 0;
  const cleaned = String(text)
    .replace(/[^0-9,.\s]/g, "") // keep digits, comma, dot, spaces
    .replace(/\s+/g, "") // remove spaces (thousand separators)
    .replace(/\.(?=\d{3}(?:\D|$))/g, "") // remove dot thousand separators
    .replace(",", "."); // convert decimal comma to dot
  const val = parseFloat(cleaned);
  return Number.isFinite(val) ? val : 0;
};

// Utility to format Norwegian currency
export const formatNOK = (amount: number): string => {
  return `${amount.toLocaleString("nb-NO")} kr`;
};
