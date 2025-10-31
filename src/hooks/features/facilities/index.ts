/**
 * Facilities Feature Hooks
 *
 * Centralized exports for all facilities-related hooks
 */

export { useUserFacilitiesManagement } from './useUserFacilitiesManagement';
export type {
  IUserFacility,
  IUseUserFacilitiesManagementReturn,
  SortBy,
  SortOrder,
  ViewMode,
} from './useUserFacilitiesManagement';

// Form management hooks
export { useImageHandling } from './useImageHandling';
export type {
  ImageValidationError,
  UseImageHandlingReturn,
  ImageHandlingConfig,
} from './useImageHandling';

export { useFacilityValidation } from './useFacilityValidation';
export type {
  ValidationRule,
  ValidationErrors,
  UseFacilityValidationReturn,
  ValidationRulesConfig,
  ValidationRuleType,
} from './useFacilityValidation';

export { useGeocodingIntegration } from './useGeocodingIntegration';
export type {
  Coordinates,
  GeocodingStatusType,
  GeocodingStatus,
  GeocodingResult,
  UseGeocodingIntegrationReturn,
  GeocodingConfig,
} from './useGeocodingIntegration';

// Filter and search hooks
export { useFilterState } from './useFilterState';
export type { SortBy as FilterSortBy, SortOrder as FilterSortOrder } from './useFilterState';

// Facility action hooks
export { useFacilityActions } from './useFacilityActions';

// Map hooks
export { useMapOverlay } from './useMapOverlay';
export { useMapErrorHandling } from './useMapErrorHandling';

// Zone data hooks
export { useFacilityZoneData } from './useFacilityZoneData';
export type {
  UseFacilityZoneDataProps,
  UseFacilityZoneDataReturn,
} from './useFacilityZoneData';
