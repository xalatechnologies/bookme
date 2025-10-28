/**
 * useAmenityTranslation Hook
 *
 * Translates amenity names from the stored format to localized labels.
 * Uses database translations for dynamic amenity management.
 *
 * Usage:
 * ```tsx
 * const translateAmenity = useAmenityTranslation();
 * 
 * {facility.amenities.map((amenity) => (
 *   <Badge>{translateAmenity(amenity)}</Badge>
 * ))}
 * ```
 */

import { useLocalizedDbValues } from './useLocalizedDbValues';

/**
 * Normalizes amenity strings to keys for database lookup
 * Converts "Garderober" -> "garderober", "Lyd/lys" -> "lyd-lys"
 */
const normalizeAmenityKey = (amenity: string): string => {
  return amenity
    .toLowerCase()
    .replace(/\//g, '-') // Replace slashes with dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a');
};

/**
 * Hook to translate amenity names
 */
export function useAmenityTranslation() {
  const { data: amenities } = useLocalizedDbValues('amenity');

  return (amenity: string): string => {
    const normalizedKey = normalizeAmenityKey(amenity);
    const translation = amenities?.find(a => a.entity_key === normalizedKey);
    return translation?.label || amenity; // Fallback to original if not found
  };
}

