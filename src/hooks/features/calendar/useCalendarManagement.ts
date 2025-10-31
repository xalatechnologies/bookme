/**
 * Calendar Management Hook
 *
 * Connects UI components to calendar business logic and data services.
 * Provides a clean interface for calendar operations including month/week/day views,
 * date navigation, slot availability, and booking grouping.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useCalendarUIStore } from '@/stores/calendarUIStore';
import {
  generateMonthCalendar,
  generateWeekCalendar,
  findAvailableSlots,
  detectSlotOverlaps,
  calculateSlotDuration,
  groupBookingsByDate,
  formatTimeSlot,
  getDefaultWeeklyBusinessHours,
  getBusinessHoursForDay,
  type CalendarMonth,
  type CalendarWeek,
  type AvailableSlotsResult,
  type BookingSlot,
  type BookingsByDate,
  type BusinessHours,
  type WeeklyBusinessHours,
  type SlotOverlapResult,
} from '@/services/business/calendar.business.service';
import type { TCalendarView, TSlotDuration } from '@/stores/calendarUIStore';

export interface IUseCalendarManagementReturn {
  // Calendar Data
  readonly monthCalendar: CalendarMonth | null;
  readonly weekCalendar: CalendarWeek | null;
  readonly currentDate: Date;
  readonly selectedDate: Date;
  readonly view: TCalendarView;

  // Time Settings
  readonly businessHoursStart: number;
  readonly businessHoursEnd: number;
  readonly slotDuration: TSlotDuration;
  readonly weeklyBusinessHours: WeeklyBusinessHours;

  // Filter State
  readonly facilityFilter: readonly string[];
  readonly statusFilter: readonly string[];
  readonly showWeekends: boolean;
  readonly showOnlyAvailable: boolean;

  // Display Options
  readonly showMiniCalendar: boolean;
  readonly showLegend: boolean;
  readonly highlightToday: boolean;

  // Navigation Actions
  readonly setView: (view: TCalendarView) => void;
  readonly setCurrentDate: (date: Date) => void;
  readonly setSelectedDate: (date: Date) => void;
  readonly nextMonth: () => void;
  readonly prevMonth: () => void;
  readonly nextWeek: () => void;
  readonly prevWeek: () => void;
  readonly nextDay: () => void;
  readonly prevDay: () => void;
  readonly goToToday: () => void;

  // Filter Actions
  readonly toggleFacilityFilter: (facilityId: string) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleShowWeekends: () => void;
  readonly toggleShowOnlyAvailable: () => void;
  readonly resetFilters: () => void;

  // Time Settings Actions
  readonly setBusinessHours: (start: number, end: number) => void;
  readonly setSlotDuration: (duration: TSlotDuration) => void;

  // Display Options Actions
  readonly toggleShowMiniCalendar: () => void;
  readonly toggleShowLegend: () => void;
  readonly toggleHighlightToday: () => void;

  // Business Logic Operations
  readonly findAvailableSlotsForDate: (
    date: Date,
    existingBookings: readonly BookingSlot[],
    slotDurationMinutes?: number
  ) => AvailableSlotsResult;
  readonly detectSlotOverlaps: (
    newSlot: BookingSlot,
    existingBookings: readonly BookingSlot[]
  ) => SlotOverlapResult;
  readonly calculateSlotDuration: (
    startTime: string | Date,
    endTime: string | Date,
    unit?: 'minutes' | 'hours'
  ) => number;
  readonly groupBookingsByDate: (
    bookings: readonly {
      readonly id: string;
      readonly title: string;
      readonly starts_at?: string;
      readonly start?: string;
      readonly ends_at?: string;
      readonly end?: string;
      readonly status: string;
    }[]
  ) => readonly BookingsByDate[];
  readonly formatTimeSlot: (
    startTime: string | Date,
    endTime: string | Date,
    includeDate?: boolean,
    date?: Date
  ) => string;
  readonly getBusinessHoursForDate: (date: Date) => BusinessHours;
}

/**
 * Hook for managing calendar views and time slot operations
 *
 * Provides comprehensive calendar management functionality including:
 * - Month, week, and day view generation
 * - Date navigation with keyboard and mouse support
 * - Available time slot calculations
 * - Booking overlap detection
 * - Business hours management
 * - Grouped bookings by date
 * - Time slot formatting
 *
 * @returns Complete calendar management interface
 *
 * @example
 * ```tsx
 * function CalendarPage() {
 *   const {
 *     monthCalendar,
 *     view,
 *     setView,
 *     nextMonth,
 *     prevMonth,
 *     findAvailableSlotsForDate,
 *     groupBookingsByDate,
 *   } = useCalendarManagement();
 *
 *   const handleDateClick = (date: Date) => {
 *     const availableSlots = findAvailableSlotsForDate(
 *       date,
 *       existingBookings,
 *       60
 *     );
 *     console.log(`${availableSlots.totalSlotsAvailable} slots available`);
 *   };
 *
 *   return (
 *     <div>
 *       <CalendarHeader
 *         view={view}
 *         onViewChange={setView}
 *         onNext={nextMonth}
 *         onPrev={prevMonth}
 *       />
 *       {monthCalendar && <MonthView calendar={monthCalendar} />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useCalendarManagement = (): IUseCalendarManagementReturn => {
  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    currentDate: currentDateString,
    selectedDate: selectedDateString,
    facilityFilter,
    statusFilter,
    showWeekends,
    showOnlyAvailable,
    businessHoursStart,
    businessHoursEnd,
    slotDuration,
    showMiniCalendar,
    showLegend,
    highlightToday,
    setView,
    setCurrentDate: setCurrentDateString,
    setSelectedDate: setSelectedDateString,
    toggleFacilityFilter,
    toggleStatusFilter,
    toggleShowWeekends,
    toggleShowOnlyAvailable,
    setBusinessHours,
    setSlotDuration,
    toggleShowMiniCalendar,
    toggleShowLegend,
    toggleHighlightToday,
    resetFilters,
  } = useCalendarUIStore();

  // Parse dates from ISO strings
  const currentDate = useMemo(() => new Date(currentDateString), [currentDateString]);
  const selectedDate = useMemo(() => new Date(selectedDateString), [selectedDateString]);

  // Get weekly business hours
  const weeklyBusinessHours = useMemo(
    () => getDefaultWeeklyBusinessHours(),
    []
  );

  // Generate calendar structures based on view
  const monthCalendar = useMemo(() => {
    if (view !== 'month') return null;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Calendar service uses 1-12

    return generateMonthCalendar(year, month);
  }, [view, currentDate]);

  const weekCalendar = useMemo(() => {
    if (view !== 'week') return null;

    return generateWeekCalendar(currentDate);
  }, [view, currentDate]);

  // Navigation actions
  const setCurrentDate = useCallback(
    (date: Date) => {
      setCurrentDateString(date.toISOString().split('T')[0]);
    },
    [setCurrentDateString]
  );

  const setSelectedDate = useCallback(
    (date: Date) => {
      setSelectedDateString(date.toISOString().split('T')[0]);
    },
    [setSelectedDateString]
  );

  const nextMonth = useCallback(() => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate);
  }, [currentDate, setCurrentDate]);

  const prevMonth = useCallback(() => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    setCurrentDate(prevDate);
  }, [currentDate, setCurrentDate]);

  const nextWeek = useCallback(() => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 7);
    setCurrentDate(nextDate);
  }, [currentDate, setCurrentDate]);

  const prevWeek = useCallback(() => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 7);
    setCurrentDate(prevDate);
  }, [currentDate, setCurrentDate]);

  const nextDay = useCallback(() => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  }, [currentDate, setCurrentDate]);

  const prevDay = useCallback(() => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  }, [currentDate, setCurrentDate]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  // Business logic operations - wrapped with useCallback for stability
  const findAvailableSlotsForDate = useCallback(
    (
      date: Date,
      existingBookings: readonly BookingSlot[],
      slotDurationMinutes: number = 60
    ): AvailableSlotsResult => {
      const businessHours = getBusinessHoursForDay(date, weeklyBusinessHours);
      return findAvailableSlots(date, existingBookings, businessHours, slotDurationMinutes);
    },
    [weeklyBusinessHours]
  );

  const getBusinessHoursForDate = useCallback(
    (date: Date): BusinessHours => {
      return getBusinessHoursForDay(date, weeklyBusinessHours);
    },
    [weeklyBusinessHours]
  );

  return {
    // Calendar Data
    monthCalendar,
    weekCalendar,
    currentDate,
    selectedDate,
    view,

    // Time Settings
    businessHoursStart,
    businessHoursEnd,
    slotDuration,
    weeklyBusinessHours,

    // Filter State
    facilityFilter,
    statusFilter: statusFilter as readonly string[],
    showWeekends,
    showOnlyAvailable,

    // Display Options
    showMiniCalendar,
    showLegend,
    highlightToday,

    // Navigation Actions
    setView,
    setCurrentDate,
    setSelectedDate,
    nextMonth,
    prevMonth,
    nextWeek,
    prevWeek,
    nextDay,
    prevDay,
    goToToday,

    // Filter Actions
    toggleFacilityFilter,
    toggleStatusFilter: toggleStatusFilter as (status: string) => void,
    toggleShowWeekends,
    toggleShowOnlyAvailable,
    resetFilters,

    // Time Settings Actions
    setBusinessHours,
    setSlotDuration,

    // Display Options Actions
    toggleShowMiniCalendar,
    toggleShowLegend,
    toggleHighlightToday,

    // Business Logic Operations
    findAvailableSlotsForDate,
    detectSlotOverlaps,
    calculateSlotDuration,
    groupBookingsByDate,
    formatTimeSlot,
    getBusinessHoursForDate,
  };
};
