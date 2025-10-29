/**
 * Booking Feature Hooks
 *
 * Clean architecture hooks for comprehensive booking management.
 * These hooks follow the established pattern with clear separation of concerns:
 * - Data layer (Supabase services)
 * - UI state layer (Zustand stores)
 * - Business logic layer (business services)
 *
 * @module hooks/features/bookings
 */

export { useBookingManagement } from './useBookingManagement';
export type { IUseBookingManagementReturn } from './useBookingManagement';

export { useBookingEditor } from './useBookingEditor';
export type {
  IUseBookingEditorOptions,
  IUseBookingEditorReturn,
} from './useBookingEditor';

export { useBookingCalendar } from './useBookingCalendar';
export type {
  IUseBookingCalendarOptions,
  IUseBookingCalendarReturn,
} from './useBookingCalendar';

export { useBookingSteps } from './useBookingSteps';
export type {
  BookingStep,
  IStepDefinition,
  IUseBookingStepsOptions,
  IUseBookingStepsReturn,
} from './useBookingSteps';

export { useRecurringSlotGeneration } from './useRecurringSlotGeneration';
export type {
  IUseRecurringSlotGenerationOptions,
  IUseRecurringSlotGenerationReturn,
} from './useRecurringSlotGeneration';

export { useTimeSlotGrouping } from './useTimeSlotGrouping';
export type {
  ITimeSlotGroup,
  IDatePackage,
  IUseTimeSlotGroupingReturn,
} from './useTimeSlotGrouping';
