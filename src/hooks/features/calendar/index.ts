/**
 * Calendar Feature Hooks
 *
 * Barrel export for all calendar-related hooks.
 */

export { useCalendarManagement } from './useCalendarManagement';
export type { IUseCalendarManagementReturn } from './useCalendarManagement';

export { useCalendarPageManagement } from './useCalendarPageManagement';

export { useHolidayCalculation } from "./useHolidayCalculation";
export type { HolidayInfo, UseHolidayCalculationReturn } from "./useHolidayCalculation";

export { useCalendarPricing } from "./useCalendarPricing";
export type { PricingBreakdown, UseCalendarPricingReturn } from "./useCalendarPricing";

export { useRecurrenceHandler } from "./useRecurrenceHandler";
export type { RecurringSlot, UseRecurrenceHandlerReturn } from "./useRecurrenceHandler";

export { useBookingCoordination } from "./useBookingCoordination";
export type {
  BookingFormData,
  CartItemData,
  UseBookingCoordinationProps,
  UseBookingCoordinationReturn,
} from "./useBookingCoordination";

export { useDragSlotSelection } from "./useDragSlotSelection";
export type {
  IUseDragSlotSelectionProps,
  IUseDragSlotSelectionReturn,
} from "./useDragSlotSelection";

export { useAvailabilityCalculation } from "./useAvailabilityCalculation";

export { useCalendarGridDragSelection } from "./useCalendarGridDragSelection";

export { useCalendarFilterState } from "./useCalendarFilterState";
export type {
  CalendarFilterState,
  CalendarFilterActions,
  UseCalendarFilterStateProps,
  UseCalendarFilterStateReturn,
} from "./useCalendarFilterState";

export { useCalendarGrid } from "./useCalendarGrid";
export type {
  CalendarDay,
  CalendarWeek,
  CalendarGridState,
  CalendarGridActions,
  UseCalendarGridProps,
  UseCalendarGridReturn,
} from "./useCalendarGrid";
