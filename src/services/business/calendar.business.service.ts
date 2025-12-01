/**
 * Calendar Business Logic Service
 *
 * Contains all business logic related to calendar operations and time slot management.
 * NO UI logic, NO component dependencies, NO API calls.
 * Pure business rules and data transformations using date-fns for date manipulation.
 *
 * Pure Functions:
 * - No side effects
 * - No external state mutations
 * - Deterministic outputs for given inputs
 * - No React or UI dependencies
 */

import {
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  differenceInMinutes,
  differenceInHours,
  getDay,
  getWeek,

  addMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import { nb } from 'date-fns/locale';

/**
 * Business hours configuration
 */
export interface BusinessHours {
  readonly startTime: string; // HH:MM format
  readonly endTime: string;   // HH:MM format
  readonly isOpenOnDay: boolean;
}

/**
 * Weekly business hours (one entry per day of week)
 */
export interface WeeklyBusinessHours {
  readonly monday: BusinessHours;
  readonly tuesday: BusinessHours;
  readonly wednesday: BusinessHours;
  readonly thursday: BusinessHours;
  readonly friday: BusinessHours;
  readonly saturday: BusinessHours;
  readonly sunday: BusinessHours;
}

/**
 * Calendar day structure for month view
 */
export interface CalendarDay {
  readonly date: Date;
  readonly dayOfMonth: number;
  readonly dayOfWeek: number; // 0-6
  readonly isCurrentMonth: boolean;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly weekNumber: number;
}

/**
 * Calendar week structure
 */
export interface CalendarWeek {
  readonly weekNumber: number;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly days: readonly CalendarDay[];
}

/**
 * Calendar month structure with grid layout
 */
export interface CalendarMonth {
  readonly year: number;
  readonly month: number; // 1-12
  readonly monthName: string;
  readonly weeks: readonly CalendarWeek[];
  readonly allDays: readonly CalendarDay[];
  readonly firstDay: Date;
  readonly lastDay: Date;
}

/**
 * Time slot for availability
 */
export interface TimeSlot {
  readonly startTime: string; // HH:MM format
  readonly endTime: string;   // HH:MM format
  readonly isAvailable: boolean;
  readonly durationMinutes: number;
  readonly durationHours: number;
}

/**
 * Available slots result
 */
export interface AvailableSlotsResult {
  readonly date: Date;
  readonly slots: readonly TimeSlot[];
  readonly totalSlotsAvailable: number;
  readonly totalSlotsDuration: number; // in hours
}

/**
 * Booking time slot structure
 */
export interface BookingSlot {
  readonly startTime: string; // ISO string
  readonly endTime: string;   // ISO string
  readonly facilityId: string;
}

/**
 * Slot overlap detection result
 */
export interface SlotOverlapResult {
  readonly hasOverlap: boolean;
  readonly overlappingSlot?: {
    readonly startTime: string;
    readonly endTime: string;
  };
  readonly overlapDurationMinutes?: number;
}

/**
 * Grouped bookings by date
 */
export interface BookingsByDate {
  readonly date: Date;
  readonly dateString: string; // YYYY-MM-DD format
  readonly bookings: readonly {
    readonly id: string;
    readonly title: string;
    readonly startTime: string;
    readonly endTime: string;
    readonly status: string;
    readonly durationMinutes: number;
  }[];
  readonly totalBookingsCount: number;
  readonly totalDurationHours: number;
}

/**
 * Generate a complete calendar structure for a given month
 *
 * Creates a full calendar grid with proper week organization.
 * Includes days from previous/next months needed to fill the grid.
 *
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @returns Complete calendar month structure with weeks and days
 *
 * @example
 * const calendar = generateMonthCalendar(2024, 10);
 * console.log(calendar.weeks.length); // 5 or 6 weeks depending on layout
 */
export const generateMonthCalendar = (
  year: number,
  month: number
): CalendarMonth => {
  // Validate inputs
  if (month < 1 || month > 12) {
    throw new Error('Month must be between 1 and 12');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = endOfMonth(startDate);
  const firstDay = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday = 1
  const lastDay = endOfWeek(endDate, { weekStartsOn: 1 });

  const allDates = eachDayOfInterval({
    start: firstDay,
    end: lastDay,
  });

  // Create calendar day objects
  const calendarDays: CalendarDay[] = allDates.map(date => {
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    return {
      date,
      dayOfMonth: date.getDate(),
      dayOfWeek: getDay(date), // 0-6, Sunday = 0
      isCurrentMonth: date.getMonth() === startDate.getMonth(),
      isToday,
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
      weekNumber: getWeek(date, { weekStartsOn: 1 }),
    };
  });

  // Group days into weeks
  const weekMap = new Map<number, CalendarDay[]>();
  calendarDays.forEach(day => {
    const weekNum = day.weekNumber;
    if (!weekMap.has(weekNum)) {
      weekMap.set(weekNum, []);
    }
    weekMap.get(weekNum)!.push(day);
  });

  const weeks: CalendarWeek[] = Array.from(weekMap.entries()).map(
    ([weekNumber, days]) => {
      const sortedDays = days.sort((a, b) => a.date.getTime() - b.date.getTime());
      return {
        weekNumber,
        startDate: sortedDays[0].date,
        endDate: sortedDays[sortedDays.length - 1].date,
        days: sortedDays,
      };
    }
  );

  // Sort weeks by start date
  weeks.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return {
    year,
    month,
    monthName: format(startDate, 'MMMM', { locale: nb }),
    weeks,
    allDays: calendarDays,
    firstDay: startDate,
    lastDay: endDate,
  };
};

/**
 * Generate a calendar structure for a specific week
 *
 * Creates a week view with all 7 days clearly structured.
 *
 * @param date - Any date within the target week
 * @returns Calendar week structure with all 7 days
 *
 * @example
 * const week = generateWeekCalendar(new Date(2024, 9, 15));
 * console.log(week.days.length); // 7
 */
export const generateWeekCalendar = (date: Date): CalendarWeek => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  const allDates = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  const today = new Date();
  const calendarDays: CalendarDay[] = allDates.map(dayDate => {
    const isToday =
      dayDate.getFullYear() === today.getFullYear() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getDate() === today.getDate();

    return {
      date: dayDate,
      dayOfMonth: dayDate.getDate(),
      dayOfWeek: getDay(dayDate),
      isCurrentMonth: true,
      isToday,
      isWeekend: getDay(dayDate) === 0 || getDay(dayDate) === 6,
      weekNumber: getWeek(dayDate, { weekStartsOn: 1 }),
    };
  });

  return {
    weekNumber: getWeek(date, { weekStartsOn: 1 }),
    startDate: weekStart,
    endDate: weekEnd,
    days: calendarDays,
  };
};

/**
 * Find available time slots within a date range
 *
 * Finds all available slots in 30-minute or custom interval increments,
 * excluding existing bookings and outside business hours.
 *
 * @param date - Target date for slot availability
 * @param existingBookings - Array of existing bookings to exclude
 * @param businessHours - Business hours for the day
 * @param slotDurationMinutes - Duration of each slot in minutes (default: 60)
 * @returns Available slots result with all open time windows
 *
 * @example
 * const slots = findAvailableSlots(
 *   new Date(2024, 9, 15),
 *   existingBookings,
 *   { startTime: '09:00', endTime: '17:00', isOpenOnDay: true },
 *   60
 * );
 */
export const findAvailableSlots = (
  date: Date,
  existingBookings: readonly BookingSlot[],
  businessHours: BusinessHours,
  slotDurationMinutes: number = 60
): AvailableSlotsResult => {
  const slots: TimeSlot[] = [];

  // Check if business is open on this day
  if (!businessHours.isOpenOnDay) {
    return {
      date,
      slots,
      totalSlotsAvailable: 0,
      totalSlotsDuration: 0,
    };
  }

  // Parse business hours
  const [startHour, startMinute] = businessHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = businessHours.endTime.split(':').map(Number);

  const dayStart = setMilliseconds(setSeconds(setMinutes(setHours(date, startHour), startMinute), 0), 0);
  const dayEnd = setMilliseconds(setSeconds(setMinutes(setHours(date, endHour), endMinute), 0), 0);

  // Generate all potential slots
  let currentSlotStart = new Date(dayStart);

  while (currentSlotStart.getTime() < dayEnd.getTime()) {
    const currentSlotEnd = addMinutes(currentSlotStart, slotDurationMinutes);

    // Ensure slot doesn't exceed business hours
    if (currentSlotEnd.getTime() > dayEnd.getTime()) {
      break;
    }

    // Check for overlaps with existing bookings
    const hasOverlap = existingBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        currentSlotStart.getTime() < bookingEnd.getTime() &&
        currentSlotEnd.getTime() > bookingStart.getTime()
      );
    });

    if (!hasOverlap) {
      slots.push({
        startTime: format(currentSlotStart, 'HH:mm'),
        endTime: format(currentSlotEnd, 'HH:mm'),
        isAvailable: true,
        durationMinutes: slotDurationMinutes,
        durationHours: slotDurationMinutes / 60,
      });
    }

    currentSlotStart = currentSlotEnd;
  }

  // Calculate total duration
  const totalDuration = slots.reduce((sum, slot) => sum + slot.durationHours, 0);

  return {
    date,
    slots,
    totalSlotsAvailable: slots.length,
    totalSlotsDuration: totalDuration,
  };
};

/**
 * Detect overlapping time slots
 *
 * Checks if a new booking slot overlaps with any existing bookings.
 *
 * @param newSlot - New booking slot to check
 * @param existingBookings - Array of existing booking slots
 * @returns Overlap detection result with details
 *
 * @example
 * const overlap = detectSlotOverlaps(newSlot, existingBookings);
 * if (overlap.hasOverlap) {
 *   console.log('Overlapping slot:', overlap.overlappingSlot);
 * }
 */
export const detectSlotOverlaps = (
  newSlot: BookingSlot,
  existingBookings: readonly BookingSlot[]
): SlotOverlapResult => {
  const newStart = new Date(newSlot.startTime);
  const newEnd = new Date(newSlot.endTime);

  for (const booking of existingBookings) {
    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);

    // Check for overlap: new slot starts before existing ends AND new slot ends after existing starts
    const hasOverlap = newStart.getTime() < existingEnd.getTime() && newEnd.getTime() > existingStart.getTime();

    if (hasOverlap) {
      // Calculate overlap duration
      const overlapStart = new Date(Math.max(newStart.getTime(), existingStart.getTime()));
      const overlapEnd = new Date(Math.min(newEnd.getTime(), existingEnd.getTime()));
      const overlapDurationMinutes = differenceInMinutes(overlapEnd, overlapStart);

      return {
        hasOverlap: true,
        overlappingSlot: {
          startTime: booking.startTime,
          endTime: booking.endTime,
        },
        overlapDurationMinutes,
      };
    }
  }

  return {
    hasOverlap: false,
  };
};

/**
 * Calculate duration between two time points
 *
 * Returns both minute and hour representations of the duration.
 *
 * @param startTime - Start time (ISO string or Date)
 * @param endTime - End time (ISO string or Date)
 * @param unit - Unit for return value ('minutes' or 'hours')
 * @returns Duration in specified unit
 *
 * @example
 * const minutes = calculateSlotDuration('2024-10-15T09:00:00Z', '2024-10-15T10:30:00Z', 'minutes');
 * const hours = calculateSlotDuration('2024-10-15T09:00:00Z', '2024-10-15T10:30:00Z', 'hours');
 */
export const calculateSlotDuration = (
  startTime: string | Date,
  endTime: string | Date,
  unit: 'minutes' | 'hours' = 'minutes'
): number => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  if (unit === 'hours') {
    return differenceInHours(end, start);
  }

  return differenceInMinutes(end, start);
};

/**
 * Check if a time falls within business hours
 *
 * Determines if a given time is within the configured business hours.
 *
 * @param time - Time to check (HH:MM format)
 * @param businessHours - Business hours configuration
 * @returns True if time is within business hours
 *
 * @example
 * const isValid = isBusinessHours('14:30', { startTime: '09:00', endTime: '17:00', isOpenOnDay: true });
 */
export const isBusinessHours = (
  time: string,
  businessHours: BusinessHours
): boolean => {
  if (!businessHours.isOpenOnDay) {
    return false;
  }

  // Parse time strings
  const [timeHour, timeMinute] = time.split(':').map(Number);
  const [startHour, startMinute] = businessHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = businessHours.endTime.split(':').map(Number);

  // Convert to minutes since midnight for comparison
  const timeInMinutes = timeHour * 60 + timeMinute;
  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;

  return timeInMinutes >= startInMinutes && timeInMinutes < endInMinutes;
};

/**
 * Format a time slot for display in Norwegian locale
 *
 * Formats a time slot as a human-readable string in Norwegian format.
 *
 * @param startTime - Start time (HH:MM format or Date)
 * @param endTime - End time (HH:MM format or Date)
 * @param includeDate - Whether to include the date (default: false)
 * @param date - Date object if including date in format
 * @returns Formatted time slot string (e.g., "09:00 - 10:30")
 *
 * @example
 * const formatted = formatTimeSlot('09:00', '10:30');
 * console.log(formatted); // "09:00 - 10:30"
 *
 * const withDate = formatTimeSlot('09:00', '10:30', true, new Date(2024, 9, 15));
 * console.log(withDate); // "15.10.2024 - 09:00 - 10:30"
 */
export const formatTimeSlot = (
  startTime: string | Date,
  endTime: string | Date,
  includeDate: boolean = false,
  date?: Date
): string => {
  // Handle Date objects
  let startStr: string;
  let endStr: string;

  if (typeof startTime === 'string') {
    startStr = startTime;
  } else {
    startStr = format(startTime, 'HH:mm');
  }

  if (typeof endTime === 'string') {
    endStr = endTime;
  } else {
    endStr = format(endTime, 'HH:mm');
  }

  const timeSlot = `${startStr} - ${endStr}`;

  if (!includeDate || !date) {
    return timeSlot;
  }

  const dateStr = format(date, 'dd.MM.yyyy', { locale: nb });
  return `${dateStr} - ${timeSlot}`;
};

/**
 * Group bookings by date for calendar display
 *
 * Organizes bookings into groups by date for easier calendar rendering.
 * Includes calculated statistics per date.
 *
 * @param bookings - Array of bookings to group
 * @returns Array of grouped bookings with statistics
 *
 * @example
 * const grouped = groupBookingsByDate(bookings);
 * grouped.forEach(group => {
 *   console.log(`${group.dateString}: ${group.totalBookingsCount} bookings`);
 * });
 */
export const groupBookingsByDate = (
  bookings: readonly {
    readonly id: string;
    readonly title: string;
    readonly starts_at?: string;
    readonly start?: string;
    readonly ends_at?: string;
    readonly end?: string;
    readonly status: string;
  }[]
): readonly BookingsByDate[] => {
  const dateMap = new Map<string, BookingsByDate>();

  bookings.forEach(booking => {
    // Handle both starts_at/ends_at and start/end field names
    const startTimeStr = booking.starts_at || booking.start;
    const endTimeStr = booking.ends_at || booking.end;

    if (!startTimeStr || !endTimeStr) {
      return;
    }

    const startDate = new Date(startTimeStr);
    const endDate = new Date(endTimeStr);
    const dateString = format(startDate, 'yyyy-MM-dd');

    const durationMinutes = differenceInMinutes(endDate, startDate);

    if (!dateMap.has(dateString)) {
      dateMap.set(dateString, {
        date: startDate,
        dateString,
        bookings: [],
        totalBookingsCount: 0,
        totalDurationHours: 0,
      });
    }

    const group = dateMap.get(dateString)!;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group.bookings as unknown as any[]).push({
      id: booking.id,
      title: booking.title,
      startTime: format(startDate, 'HH:mm'),
      endTime: format(endDate, 'HH:mm'),
      status: booking.status,
      durationMinutes,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group as any).totalBookingsCount += 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (group as any).totalDurationHours += durationMinutes / 60;
  });

  // Convert map to array and sort by date
  const result = Array.from(dateMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

  return result;
};

/**
 * Check if a booking slot is entirely within business hours
 *
 * Validates that both start and end times of a slot are within business hours.
 *
 * @param startTime - Start time (HH:MM format)
 * @param endTime - End time (HH:MM format)
 * @param businessHours - Business hours configuration
 * @returns True if entire slot is within business hours
 *
 * @example
 * const isValid = isSlotWithinBusinessHours('09:00', '10:30', businessHours);
 */
export const isSlotWithinBusinessHours = (
  startTime: string,
  endTime: string,
  businessHours: BusinessHours
): boolean => {
  return (
    isBusinessHours(startTime, businessHours) &&
    isBusinessHours(endTime, businessHours)
  );
};

/**
 * Calculate available hours per day for a facility
 *
 * Returns the total number of business hours available per day.
 *
 * @param businessHours - Business hours configuration
 * @returns Total available hours for the day
 *
 * @example
 * const hours = calculateDailyAvailableHours({ startTime: '09:00', endTime: '17:00', isOpenOnDay: true });
 * console.log(hours); // 8
 */
export const calculateDailyAvailableHours = (
  businessHours: BusinessHours
): number => {
  if (!businessHours.isOpenOnDay) {
    return 0;
  }

  const [startHour, startMinute] = businessHours.startTime.split(':').map(Number);
  const [endHour, endMinute] = businessHours.endTime.split(':').map(Number);

  const startInMinutes = startHour * 60 + startMinute;
  const endInMinutes = endHour * 60 + endMinute;

  return (endInMinutes - startInMinutes) / 60;
};

/**
 * Get day name in Norwegian locale
 *
 * Returns the full or abbreviated day name in Norwegian.
 *
 * @param date - Date to get day name for
 * @param abbreviated - Whether to return abbreviated name (default: false)
 * @returns Day name in Norwegian
 *
 * @example
 * const dayName = getDayNameNorwegian(new Date(2024, 9, 14)); // Monday
 * console.log(dayName); // "Mandag"
 */
export const getDayNameNorwegian = (
  date: Date,
  abbreviated: boolean = false
): string => {
  const formatStr = abbreviated ? 'EEE' : 'EEEE';
  return format(date, formatStr, { locale: nb });
};

/**
 * Get month name in Norwegian locale
 *
 * Returns the full month name in Norwegian.
 *
 * @param monthNumber - Month number (1-12)
 * @returns Month name in Norwegian
 *
 * @example
 * const monthName = getMonthNameNorwegian(10);
 * console.log(monthName); // "Oktober"
 */
export const getMonthNameNorwegian = (monthNumber: number): string => {
  const date = new Date(2024, monthNumber - 1, 1);
  return format(date, 'MMMM', { locale: nb });
};

/**
 * Check if a date is a weekend
 *
 * Determines if a date falls on a Saturday or Sunday.
 *
 * @param date - Date to check
 * @returns True if date is Saturday or Sunday
 *
 * @example
 * const isWeekend = isWeekendDay(new Date(2024, 9, 12)); // Saturday
 * console.log(isWeekend); // true
 */
export const isWeekendDay = (date: Date): boolean => {
  const day = getDay(date);
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Get default weekly business hours (9 AM to 5 PM, closed Sundays)
 *
 * Returns a standard business hours configuration for a week.
 *
 * @returns Default weekly business hours
 *
 * @example
 * const hours = getDefaultWeeklyBusinessHours();
 * console.log(hours.monday.startTime); // "09:00"
 */
export const getDefaultWeeklyBusinessHours = (): WeeklyBusinessHours => {
  const workdayHours: BusinessHours = {
    startTime: '09:00',
    endTime: '17:00',
    isOpenOnDay: true,
  };

  const saturdayHours: BusinessHours = {
    startTime: '10:00',
    endTime: '16:00',
    isOpenOnDay: true,
  };

  const closedHours: BusinessHours = {
    startTime: '00:00',
    endTime: '00:00',
    isOpenOnDay: false,
  };

  return {
    monday: workdayHours,
    tuesday: workdayHours,
    wednesday: workdayHours,
    thursday: workdayHours,
    friday: workdayHours,
    saturday: saturdayHours,
    sunday: closedHours,
  };
};

/**
 * Get business hours for a specific day of week
 *
 * Retrieves the business hours configuration for a given day.
 *
 * @param date - Date to get business hours for
 * @param weeklyHours - Weekly business hours configuration
 * @returns Business hours for that day
 *
 * @example
 * const hours = getBusinessHoursForDay(new Date(2024, 9, 14), weeklyHours);
 */
export const getBusinessHoursForDay = (
  date: Date,
  weeklyHours: WeeklyBusinessHours
): BusinessHours => {
  const dayOfWeek = getDay(date);

  const dayMap: Record<number, keyof WeeklyBusinessHours> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };

  const dayKey = dayMap[dayOfWeek];
  return weeklyHours[dayKey];
};
