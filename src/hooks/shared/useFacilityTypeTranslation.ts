/**
 * useFacilityTypeTranslation Hook
 *
 * Translates facility type keys to localized labels.
 * Uses database translations for dynamic facility type management.
 *
 * Usage:
 * ```tsx
 * const translateFacilityType = useFacilityTypeTranslation();
 * 
 * <Badge>{translateFacilityType(facility.facility_type)}</Badge>
 * ```
 */

import { useLocalizedDbValues } from './useLocalizedDbValues';

/**
 * Hook to translate facility type names
 */
export function useFacilityTypeTranslation() {
  const { data: facilityTypes } = useLocalizedDbValues('facility_type');

  return (facilityType: string): string => {
    const translation = facilityTypes?.find(ft => ft.entity_key === facilityType);
    return translation?.label || facilityType; // Fallback to original if not found
  };
}