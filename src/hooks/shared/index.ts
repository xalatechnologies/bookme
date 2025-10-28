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
