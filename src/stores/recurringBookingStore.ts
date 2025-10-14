"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { RecurringBooking, CreateRecurringBookingData, UpdateRecurringBookingData } from "@/types/recurringBooking";

/**
 * Recurring booking store interface for managing recurring bookings state
 * 
 * Provides CRUD operations for recurring bookings with localStorage persistence
 * and full state management including occurrence tracking and status updates.
 */
interface RecurringBookingState {
  readonly bookings: readonly RecurringBooking[];
  readonly addBooking: (booking: CreateRecurringBookingData) => string;
  readonly updateBooking: (id: string, updates: UpdateRecurringBookingData) => void;
  readonly cancelBooking: (id: string) => void;
  readonly pauseBooking: (id: string) => void;
  readonly resumeBooking: (id: string) => void;
  readonly cancelOccurrence: (bookingId: string, occurrenceId: string) => void;
  readonly confirmOccurrence: (bookingId: string, occurrenceId: string) => void;
  readonly getBookingById: (id: string) => RecurringBooking | undefined;
  readonly getUserBookings: (userId: string) => readonly RecurringBooking[];
  readonly getActiveBookings: () => readonly RecurringBooking[];
  readonly getPausedBookings: () => readonly RecurringBooking[];
  readonly getCancelledBookings: () => readonly RecurringBooking[];
  readonly getBookingsByFacility: (facilityId: string) => readonly RecurringBooking[];
  readonly getBookingsByDateRange: (startDate: Date, endDate: Date) => readonly RecurringBooking[];
  readonly clearAllBookings: () => void;
}

/**
 * Generate unique ID for recurring bookings
 * 
 * @returns Unique string ID
 */
const generateRecurringBookingId = (): string => {
  return `recurring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique ID for booking occurrences
 * 
 * @returns Unique string ID
 */
const generateOccurrenceId = (): string => {
  return `occurrence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create recurring booking occurrences based on pattern
 * 
 * @param pattern - Recurrence pattern
 * @param startDate - Start date for occurrences
 * @param endDate - End date for occurrences
 * @param timeSlots - Time slots for each occurrence
 * @returns Array of occurrence objects
 */
const createOccurrences = (
  pattern: RecurringBooking['recurrencePattern'],
  startDate: Date,
  endDate: Date | undefined,
  timeSlots: readonly string[]
): RecurringBooking['occurrences'] => {
  const occurrences: RecurringBooking['occurrences'] = [];
  const maxOccurrences = 52; // Maximum 1 year of weekly bookings
  let currentDate = new Date(startDate);
  let count = 0;

  while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
    // Check if current date matches pattern
    if (dateMatchesPattern(currentDate, pattern)) {
      timeSlots.forEach(timeSlot => {
        occurrences.push({
          id: generateOccurrenceId(),
          date: new Date(currentDate),
          status: 'pending'
        });
      });
      count++;
    }

    // Move to next date
    currentDate = getNextDate(currentDate, pattern);
  }

  return occurrences;
};

/**
 * Check if date matches recurrence pattern
 * 
 * @param date - Date to check
 * @param pattern - Recurrence pattern
 * @returns True if date matches pattern
 */
const dateMatchesPattern = (date: Date, pattern: RecurringBooking['recurrencePattern']): boolean => {
  const dayOfWeek = date.getDay();

  switch (pattern.type) {
    case 'single':
      return true;
    case 'weekly':
    case 'biweekly':
      return pattern.weekdays.includes(dayOfWeek);
    case 'monthly':
      return matchesMonthlyPattern(date, pattern);
    case 'custom':
      return pattern.weekdays.includes(dayOfWeek);
    default:
      return false;
  }
};

/**
 * Check if date matches monthly pattern
 * 
 * @param date - Date to check
 * @param pattern - Monthly recurrence pattern
 * @returns True if date matches monthly pattern
 */
const matchesMonthlyPattern = (date: Date, pattern: RecurringBooking['recurrencePattern']): boolean => {
  if (!pattern.monthlyPattern || pattern.monthlyWeekday === undefined) return false;

  const dayOfWeek = date.getDay();
  if (dayOfWeek !== pattern.monthlyWeekday) return false;

  // Calculate which occurrence of this weekday in the month
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstOccurrence = new Date(firstOfMonth);
  firstOccurrence.setDate(firstOfMonth.getDate() + (7 + pattern.monthlyWeekday - firstOfMonth.getDay()) % 7);
  
  const weekNumber = Math.floor((date.getDate() - firstOccurrence.getDate()) / 7) + 1;

  switch (pattern.monthlyPattern) {
    case 'first': return weekNumber === 1;
    case 'second': return weekNumber === 2;
    case 'third': return weekNumber === 3;
    case 'fourth': return weekNumber === 4;
    case 'last':
      // Check if this is the last occurrence of this weekday in the month
      const nextWeek = new Date(date);
      nextWeek.setDate(date.getDate() + 7);
      return nextWeek.getMonth() !== date.getMonth();
    default: return false;
  }
};

/**
 * Get next date based on recurrence pattern
 * 
 * @param currentDate - Current date
 * @param pattern - Recurrence pattern
 * @returns Next date in the sequence
 */
const getNextDate = (currentDate: Date, pattern: RecurringBooking['recurrencePattern']): Date => {
  const nextDate = new Date(currentDate);
  
  switch (pattern.type) {
    case 'single':
      nextDate.setDate(currentDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(currentDate.getDate() + 1);
      break;
    case 'biweekly':
      nextDate.setDate(currentDate.getDate() + 1);
      break;
    case 'monthly':
      nextDate.setDate(currentDate.getDate() + 1);
      break;
    case 'custom':
      nextDate.setDate(currentDate.getDate() + (pattern.interval || 1));
      break;
    default:
      nextDate.setDate(currentDate.getDate() + 1);
  }
  
  return nextDate;
};

/**
 * Recurring booking store implementation
 * 
 * Manages recurring bookings state with localStorage persistence and full CRUD operations
 */
export const useRecurringBookingStore = create<RecurringBookingState>()(
  devtools(
    persist(
      (set, get) => ({
        bookings: [],

        addBooking: (bookingData: CreateRecurringBookingData): string => {
          const id = generateRecurringBookingId();
          const now = new Date().toISOString();
          
          const occurrences = createOccurrences(
            bookingData.recurrencePattern,
            bookingData.startDate,
            bookingData.endDate,
            bookingData.timeSlots
          );

          const newBooking: RecurringBooking = {
            id,
            ...bookingData,
            status: 'active',
            occurrences,
            createdAt: now,
            updatedAt: now
          };

          set((state) => ({
            bookings: [...state.bookings, newBooking]
          }));

          return id;
        },

        updateBooking: (id: string, updates: UpdateRecurringBookingData): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    ...updates,
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        cancelBooking: (id: string): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: 'cancelled',
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        pauseBooking: (id: string): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: 'paused',
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        resumeBooking: (id: string): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === id
                ? {
                    ...booking,
                    status: 'active',
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        cancelOccurrence: (bookingId: string, occurrenceId: string): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === bookingId
                ? {
                    ...booking,
                    occurrences: booking.occurrences.map((occurrence) =>
                      occurrence.id === occurrenceId
                        ? { ...occurrence, status: 'cancelled' }
                        : occurrence
                    ),
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        confirmOccurrence: (bookingId: string, occurrenceId: string): void => {
          set((state) => ({
            bookings: state.bookings.map((booking) =>
              booking.id === bookingId
                ? {
                    ...booking,
                    occurrences: booking.occurrences.map((occurrence) =>
                      occurrence.id === occurrenceId
                        ? { ...occurrence, status: 'confirmed' }
                        : occurrence
                    ),
                    updatedAt: new Date().toISOString()
                  }
                : booking
            )
          }));
        },

        getBookingById: (id: string): RecurringBooking | undefined => {
          return get().bookings.find((booking) => booking.id === id);
        },

        getUserBookings: (userId: string): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => booking.userId === userId);
        },

        getActiveBookings: (): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => booking.status === 'active');
        },

        getPausedBookings: (): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => booking.status === 'paused');
        },

        getCancelledBookings: (): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => booking.status === 'cancelled');
        },

        getBookingsByFacility: (facilityId: string): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => booking.facilityId === facilityId);
        },

        getBookingsByDateRange: (startDate: Date, endDate: Date): readonly RecurringBooking[] => {
          return get().bookings.filter((booking) => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = booking.endDate ? new Date(booking.endDate) : new Date(bookingStart.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year default
            
            return bookingStart <= endDate && bookingEnd >= startDate;
          });
        },

        clearAllBookings: (): void => {
          set({ bookings: [] });
        }
      }),
      {
        name: "recurring-booking-store",
        version: 1
      }
    ),
    {
      name: "recurring-booking-store"
    }
  )
);

