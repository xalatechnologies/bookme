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
 * Matches the database normalize_amenity function behavior
 */
const normalizeAmenityKey = (amenity: string): string => {
  const normalized = amenity
    .toLowerCase()
    .replace(/\//g, '-') // Replace slashes with dashes
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a');
  
  // Handle special cases to match database function behavior
  // These are the exact matches that should be preserved as-is
  const exactMatches = [
    'garderober', 'dusj', 'parkering', 'lyd-lys', 'tribuner',
    'scene', 'projektor', 'kjøkken', 'video-konferanse',
    'tavle', 'wifi', 'kaffe-te', 'klimaanlegg', 'whiteboard',
    'kunstgress', 'flombelysning', '25m-basseng', 'barnebasseng',
    'badstue', 'cafeteria', 'innendørs', 'profesjonell-underlag',
    'utstyr-utleie', 'fotball', 'basketball'
  ];
  
  // If the normalized version matches one of our exact keys, return it as is
  // This handles cases like "innendørs" -> "innendrs" -> "innendørs"
  if (exactMatches.includes(normalized)) {
    return normalized;
  }
  
  // For variations that should map to the exact keys
  switch (normalized) {
    case 'lyd-og-lys': return 'lyd-lys';
    case 'lyd': 
    case 'lys': return 'lyd-lys';
    case 'garderobe': 
    case 'changing-rooms': 
    case 'locker-rooms': return 'garderober';
    case 'shower': 
    case 'showers': 
    case 'dusjer': return 'dusj';
    case 'parking': 
    case 'parkingplass': return 'parkering';
    case 'stands': 
    case 'bleachers': 
    case 'seating': return 'tribuner';
    case 'stage': 
    case 'scenen': return 'scene';
    case 'projector': 
    case 'beamer': return 'projektor';
    case 'kitchen': 
    case 'catering': return 'kjøkken';
    case 'video-conference': 
    case 'videokonferanse': 
    case 'zoom': return 'video-konferanse';
    case 'board': 
    case 'blackboard': return 'tavle';
    case 'wi-fi': 
    case 'internet': 
    case 'wireless': return 'wifi';
    case 'coffee': 
    case 'tea': 
    case 'kaffe': 
    case 'te': return 'kaffe-te';
    case 'hvac': 
    case 'air-conditioning': 
    case 'ac': return 'klimaanlegg';
    case 'artificial-grass': 
    case 'turf': return 'kunstgress';
    case 'floodlights': 
    case 'lights': 
    case 'belysning': return 'flombelysning';
    case 'pool': 
    case 'basseng': 
    case 'swimming-pool': return '25m-basseng';
    case 'kids-pool': 
    case 'children-pool': return 'barnebasseng';
    case 'sauna': return 'badstue';
    case 'cafe': 
    case 'kafe': 
    case 'kafeteria': return 'cafeteria';
    case 'indoor': 
    case 'inside': 
    case 'innendors': return 'innendørs';
    case 'professional-surface': 
    case 'pro-surface': return 'profesjonell-underlag';
    case 'equipment-rental': 
    case 'rental': 
    case 'leie': return 'utstyr-utleie';
    case 'soccer': 
    case 'football-field': return 'fotball';
    default: return normalized;
  }
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

