/**
 * Booking hooks
 *
 * Barrel export for all booking-related hooks
 */

export { useBookingForm } from './useBookingForm';
export type { IFormErrors } from './useBookingForm';

export { usePriceCalculation } from './usePriceCalculation';
export type { IPriceBreakdown, IPriceCalculationResult } from './usePriceCalculation';

export { useRecurringSlots } from './useRecurringSlots';

export { useWeekNavigation } from './useWeekNavigation';
export type { WeekDay, WeekRange, UseWeekNavigationReturn, UseWeekNavigationOptions } from './useWeekNavigation';

export { useBookingDetailsForm } from './useBookingDetailsForm';
export type { FormField, FieldOption, FormFieldsConfig, UseBookingDetailsFormReturn } from './useBookingDetailsForm';
