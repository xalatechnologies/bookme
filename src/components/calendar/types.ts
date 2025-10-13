/**
 * Calendar component types
 * 
 * Defines types and interfaces used by calendar components
 * for facility booking and availability display.
 */

import { ISelectedTimeSlot } from "@/components/booking/types";

/**
 * Time slot availability status
 * Used to determine how time slots are displayed and behave
 */
export type TimeSlotStatus = 
  | "available"     // Green - can be selected
  | "booked"        // Red - already booked
  | "busy"          // Red - already booked (alias for booked)
  | "unavailable"   // Gray - not available (past, weekend, holiday)
  | "selected"      // Blue - currently selected
  | "conflict";     // Orange - has conflicts

/**
 * Time slot data structure
 * Represents a single time slot in the calendar
 */
export interface ITimeSlot {
  readonly id: string;
  readonly time: string; // Format: "08:00-09:00"
  readonly status: TimeSlotStatus;
  readonly isSelected: boolean;
  readonly hasConflict: boolean;
  readonly conflictReason?: string;
}

/**
 * Day data structure
 * Represents a single day in the calendar week
 */
export interface ICalendarDay {
  readonly date: Date;
  readonly isToday: boolean;
  readonly isWeekend: boolean;
  readonly isHoliday: boolean;
  readonly holidayName?: string;
  readonly isPast: boolean;
  readonly timeSlots: readonly ITimeSlot[];
}

/**
 * Week data structure
 * Represents a full week of calendar days
 */
export interface ICalendarWeek {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly days: readonly ICalendarDay[];
}

/**
 * Calendar grid props
 * Props for the main calendar grid component
 */
export interface ICalendarGridProps {
  readonly facilityId: string;
  readonly zoneId: string;
  readonly week: ICalendarWeek;
  readonly selectedSlots: readonly ISelectedTimeSlot[]; // Array of selected time slot objects
  readonly onSlotClick: (zoneId: string, date: Date, timeSlot: string, status: TimeSlotStatus) => void;
  readonly onBulkSelect: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly pricePerHour?: number;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly getAvailabilityStatus?: (zoneId: string, date: Date, timeSlot: string) => { status: string; conflict?: any };
  readonly isSlotSelected?: (zoneId: string, date: Date, timeSlot: string) => boolean;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
}

/**
 * Week navigation props
 * Props for the week navigation component
 */
export interface IWeekNavigationProps {
  readonly currentWeek: ICalendarWeek;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
  readonly isLoading?: boolean;
}

/**
 * Availability legend props
 * Props for the availability legend component
 */
export interface IAvailabilityLegendProps {
  readonly showConflictInfo?: boolean;
  readonly showHolidayInfo?: boolean;
}

/**
 * Time slot click handler
 * Function type for handling time slot clicks
 * 
 * @param slotId - ID of the clicked slot
 * @param status - Current status of the slot
 */
export type TimeSlotClickHandler = (slotId: string, status: TimeSlotStatus) => void;

/**
 * Bulk selection handler
 * Function type for handling bulk slot selection
 * 
 * @param slots - Array of selected time slots
 */
export type BulkSelectionHandler = (slots: readonly ISelectedTimeSlot[]) => void;
