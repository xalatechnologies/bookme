/**
 * Type definitions for localStorage data structures
 * These types handle the various formats that booking data
 * can be stored in localStorage across different parts of the application.
 */

// Time slot structure used in multi-slot bookings
export interface TimeSlot {
  readonly timeSlot: string; // Format: "HH:MM-HH:MM"
}

// Base type for bookings stored in localStorage
// This handles all the various optional fields that can appear
export interface LocalStorageBooking {
  readonly id: string;
  
  // Facility information
  readonly facility?: string;
  readonly facilityName?: string;
  readonly facilityId?: string;
  
  // Contact/user information
  readonly contactPerson?: string;
  
  // Purpose/description
  readonly purpose?: string;
  readonly description?: string;
  
  // Date information
  readonly date?: string; // YYYY-MM-DD format
  readonly startDate?: string;
  readonly endDate?: string;
  
  // Time information (can be in different formats)
  readonly time?: string; // "HH:MM-HH:MM" format
  readonly startTime?: string; // "HH:MM" format
  readonly endTime?: string; // "HH:MM" format
  readonly timeSlots?: readonly TimeSlot[];
  
  // Duration (can be string like "1 timer" or number in minutes)
  readonly duration?: string | number;
  
  // Price (can be string like "1 000 kr" or number)
  readonly price?: string | number;
  
  // Status
  readonly status?: "pending" | "approved" | "rejected" | "cancelled";
  
  // Metadata
  readonly submittedAt?: string;
  readonly processedBy?: string;
  readonly processedAt?: string;
  
  // Recurring booking information
  readonly isRecurring?: boolean;
  readonly parentBookingId?: string;
}

// Occurrence data structure for recurring bookings display
export interface BookingOccurrence {
  readonly date: string;
  readonly time: string;
  readonly durationHours: number;
  readonly priceText: string;
}

/**
 * Helper function to safely parse localStorage bookings
 */
export const parseLocalStorageBookings = (key: "pendingBookings" | "processedBookings"): readonly LocalStorageBooking[] => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Failed to parse ${key}:`, error);
    return [];
  }
};

/**
 * Helper function to safely save localStorage bookings
 */
export const saveLocalStorageBookings = (
  key: "pendingBookings" | "processedBookings",
  bookings: readonly LocalStorageBooking[]
): void => {
  try {
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
};
