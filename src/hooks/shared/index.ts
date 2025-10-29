/**
 * Shared Utility Hooks
 *
 * Cross-cutting hooks used across multiple features
 */

// UI utilities
export { useModal } from './useModal';
export type { UseModalReturn } from './useModal';

// Data utilities
export { useHistory } from './useHistory';

// Network utilities
export { useOfflineStatus } from './useOfflineStatus';

// Form utilities
export { useFormValidation } from './useFormValidation';

// Internationalization utilities
export { useLocalizedDbValue } from './useLocalizedDbValue';
export { useLocalizedDbValues } from './useLocalizedDbValues';
export { useAmenityTranslation } from './useAmenityTranslation';

// Storage migration utilities
export { useStorageMigration } from './useStorageMigration';
export type { UseStorageMigrationReturn, MigrationHealth, MigrationResult } from './useStorageMigration';

export { useBookings } from './useBookings';
export type { UseBookingsReturn } from './useBookings';

export { useUserPreferences } from './useUserPreferences';
export type { UseUserPreferencesReturn, UserPreferences } from './useUserPreferences';

export { useDraftBooking } from './useDraftBooking';
export type { UseDraftBookingReturn } from './useDraftBooking';
