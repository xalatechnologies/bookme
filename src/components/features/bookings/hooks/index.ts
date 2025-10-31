/**
 * Bookings Feature Hooks
 *
 * Centralized exports for all booking-related custom hooks
 */

// Booking filters
export { useBookingFilters } from './useBookingFilters';
export type { BookingFilters } from './useBookingFilters';

// Multi-step wizard
export { useBookingSteps } from './useBookingSteps';

// Statistics and analytics
export { useBookingStats } from './useBookingStats';

// Availability checking
export { useAvailabilityStatus } from './useAvailabilityStatus';

// Slot selection
export { useSlotSelection } from './useSlotSelection';

// Form management (already in feature domain)
export { useBookingForm } from '../components/StepByStepBooking/hooks/useBookingForm';

// Pricing utilities
export { usePricingDisplay, getActorMultiplier, getActivityAdjustment } from './usePricingDisplay';
