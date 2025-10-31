/**
 * Booking Calendar Hook
 *
 * Calendar integration hook for booking management.
 * Provides calendar-specific operations and date-based grouping.
 * Integrates with calendar business service for date calculations.
 */

import { useMemo, useCallback, useState } from 'react';
import {
  groupBookingsByDate,
  generateMonthCalendar,
  generateWeekCalendar,
  findAvailableSlots,
  detectSlotOverlaps,
  formatTimeSlot,
  getBusinessHoursForDay,
  getDefaultWeeklyBusinessHours,
  type BookingsByDate,
  type CalendarMonth,
  type CalendarWeek,
  type AvailableSlotsResult,
  type BusinessHours,
  type WeeklyBusinessHours,
  type BookingSlot,
  type SlotOverlapResult,
} from '@/services/business/calendar.business.service';
import type { Database } from '@/types/database';

type Booking = Database['public']['Tables']['bookings']['Row'];

export interface IUseBookingCalendarOptions {
  readonly bookings: readonly Booking[];
  readonly facilityId?: string;
  readonly weeklyBusinessHours?: WeeklyBusinessHours;
}

export interface IUseBookingCalendarReturn {
  // Calendar structures
  readonly monthCalendar: CalendarMonth;
  readonly weekCalendar: CalendarWeek;
  readonly bookingsByDate: readonly BookingsByDate[];

  // Current view state
  readonly currentDate: Date;
  readonly currentMonth: number;
  readonly currentYear: number;

  // Navigation
  readonly goToToday: () => void;
  readonly goToDate: (date: Date) => void;
  readonly goToPreviousMonth: () => void;
  readonly goToNextMonth: () => void;
  readonly goToPreviousWeek: () => void;
  readonly goToNextWeek: () => void;

  // Availability operations
  readonly findAvailableSlots: (
    date: Date,
    slotDurationMinutes?: number
  ) => AvailableSlotsResult;
  readonly checkSlotOverlap: (
    startTime: string,
    endTime: string,
    facilityId: string
  ) => SlotOverlapResult;
  readonly getBusinessHoursForDate: (date: Date) => BusinessHours;

  // Calendar data queries
  readonly getBookingsForDate: (date: Date) => readonly Booking[];
  readonly getBookingsForWeek: (date: Date) => readonly Booking[];
  readonly getBookingsForMonth: (year: number, month: number) => readonly Booking[];

  // Formatting utilities
  readonly formatTimeSlot: (
    startTime: string | Date,
    endTime: string | Date,
    includeDate?: boolean,
    date?: Date
  ) => string;
}

/**
 * Hook for calendar-specific booking operations
 *
 * Provides comprehensive calendar functionality including:
 * - Month and week calendar generation
 * - Booking grouping by date
 * - Available slot detection
 * - Conflict detection
 * - Business hours integration
 * - Calendar navigation
 * - Date-based filtering
 *
 * @param options - Configuration options including bookings and business hours
 * @returns Complete calendar interface for booking management
 *
 * @example
 * ```tsx
 * function BookingCalendarView() {
 *   const { bookings } = useBookingManagement();
 *   const {
 *     monthCalendar,
 *     bookingsByDate,
 *     currentDate,
 *     goToToday,
 *     goToPreviousMonth,
 *     goToNextMonth,
 *     findAvailableSlots,
 *     getBookingsForDate,
 *   } = useBookingCalendar({
 *     bookings,
 *     facilityId: selectedFacilityId,
 *   });
 *
 *   return (
 *     <div>
 *       <CalendarHeader
 *         currentDate={currentDate}
 *         onPrevious={goToPreviousMonth}
 *         onNext={goToNextMonth}
 *         onToday={goToToday}
 *       />
 *       <CalendarGrid calendar={monthCalendar}>
 *         {monthCalendar.allDays.map(day => {
 *           const dayBookings = getBookingsForDate(day.date);
 *           const slots = findAvailableSlots(day.date);
 *           return (
 *             <CalendarDay
 *               key={day.date.toISOString()}
 *               day={day}
 *               bookings={dayBookings}
 *               availableSlots={slots.totalSlotsAvailable}
 *             />
 *           );
 *         })}
 *       </CalendarGrid>
 *     </div>
 *   );
 * }
 * ```
 */
export const useBookingCalendar = (
  options: IUseBookingCalendarOptions
): IUseBookingCalendarReturn => {
  const {
    bookings,
    facilityId,
    weeklyBusinessHours = getDefaultWeeklyBusinessHours(),
  } = options;

  // Current date state for calendar navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Generate calendar structures
  const monthCalendar = useMemo(() => {
    return generateMonthCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }, [currentDate]);

  const weekCalendar = useMemo(() => {
    return generateWeekCalendar(currentDate);
  }, [currentDate]);

  // Group bookings by date for calendar display
  const bookingsByDate = useMemo(() => {
    // Transform bookings to match the expected format
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      title: booking.notes || 'Booking',
      starts_at: booking.starts_at,
      ends_at: booking.ends_at,
      status: booking.status,
    }));

    return groupBookingsByDate(transformedBookings);
  }, [bookings]);

  // Navigation actions
  const goToToday = useCallback((): void => {
    setCurrentDate(new Date());
  }, []);

  const goToDate = useCallback((date: Date): void => {
    setCurrentDate(new Date(date));
  }, []);

  const goToPreviousMonth = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  }, []);

  const goToPreviousWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  }, []);

  const goToNextWeek = useCallback((): void => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + 7);
      return newDate;
    });
  }, []);

  // Availability operations
  const findAvailableSlotsForDate = useCallback(
    (date: Date, slotDurationMinutes: number = 60): AvailableSlotsResult => {
      // Get business hours for the day
      const businessHours = getBusinessHoursForDay(date, weeklyBusinessHours);

      // Filter bookings for the facility and date
      const existingBookings: BookingSlot[] = bookings
        .filter((booking) => {
          if (facilityId && booking.facility_id !== facilityId) {
            return false;
          }
          const bookingDate = new Date(booking.starts_at);
          return (
            bookingDate.getFullYear() === date.getFullYear() &&
            bookingDate.getMonth() === date.getMonth() &&
            bookingDate.getDate() === date.getDate()
          );
        })
        .map((booking) => ({
          startTime: booking.starts_at,
          endTime: booking.ends_at,
          facilityId: booking.facility_id,
        }));

      return findAvailableSlots(date, existingBookings, businessHours, slotDurationMinutes);
    },
    [bookings, facilityId, weeklyBusinessHours]
  );

  const checkSlotOverlap = useCallback(
    (startTime: string, endTime: string, slotFacilityId: string): SlotOverlapResult => {
      const newSlot: BookingSlot = {
        startTime,
        endTime,
        facilityId: slotFacilityId,
      };

      // Filter existing bookings for the same facility
      const existingBookings: BookingSlot[] = bookings
        .filter((booking) => booking.facility_id === slotFacilityId)
        .filter((booking) => !['cancelled', 'expired', 'refunded'].includes(booking.status))
        .map((booking) => ({
          startTime: booking.starts_at,
          endTime: booking.ends_at,
          facilityId: booking.facility_id,
        }));

      return detectSlotOverlaps(newSlot, existingBookings);
    },
    [bookings]
  );

  const getBusinessHoursForDate = useCallback(
    (date: Date): BusinessHours => {
      return getBusinessHoursForDay(date, weeklyBusinessHours);
    },
    [weeklyBusinessHours]
  );

  // Calendar data queries
  const getBookingsForDate = useCallback(
    (date: Date): readonly Booking[] => {
      return bookings.filter((booking) => {
        const bookingDate = new Date(booking.starts_at);
        return (
          bookingDate.getFullYear() === date.getFullYear() &&
          bookingDate.getMonth() === date.getMonth() &&
          bookingDate.getDate() === date.getDate()
        );
      });
    },
    [bookings]
  );

  const getBookingsForWeek = useCallback(
    (date: Date): readonly Booking[] => {
      const week = generateWeekCalendar(date);
      const weekStart = week.startDate;
      const weekEnd = week.endDate;

      return bookings.filter((booking) => {
        const bookingDate = new Date(booking.starts_at);
        return bookingDate >= weekStart && bookingDate <= weekEnd;
      });
    },
    [bookings]
  );

  const getBookingsForMonth = useCallback(
    (year: number, month: number): readonly Booking[] => {
      return bookings.filter((booking) => {
        const bookingDate = new Date(booking.starts_at);
        return (
          bookingDate.getFullYear() === year && bookingDate.getMonth() === month - 1
        );
      });
    },
    [bookings]
  );

  return {
    // Calendar structures
    monthCalendar,
    weekCalendar,
    bookingsByDate,

    // Current view state
    currentDate,
    currentMonth: currentDate.getMonth() + 1,
    currentYear: currentDate.getFullYear(),

    // Navigation
    goToToday,
    goToDate,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousWeek,
    goToNextWeek,

    // Availability operations
    findAvailableSlots: findAvailableSlotsForDate,
    checkSlotOverlap,
    getBusinessHoursForDate,

    // Calendar data queries
    getBookingsForDate,
    getBookingsForWeek,
    getBookingsForMonth,

    // Formatting utilities
    formatTimeSlot,
  };
};
