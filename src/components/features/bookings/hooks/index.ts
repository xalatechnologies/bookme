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

// Form management (already in feature domain)
export { useBookingForm } from '../components/StepByStepBooking/hooks/useBookingForm';
