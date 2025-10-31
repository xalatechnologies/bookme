/**
 * Amenity Icon Utilities
 *
 * Centralized utilities for amenity icon mapping and rendering.
 * Provides consistent icon mapping across facility components.
 */

export type AmenityIconType = 'wifi' | 'car' | 'camera' | 'volume' | 'check';

export interface AmenityWithIcon {
  readonly name: string;
  readonly iconType: AmenityIconType;
}

export interface AmenityCategory {
  readonly category: string;
  readonly amenities: readonly AmenityWithIcon[];
}

/**
 * Get the appropriate icon type for an amenity based on its name
 */
export const getAmenityIconType = (amenityName: string): AmenityIconType => {
  const nameLower = amenityName.toLowerCase();

  // WiFi / Internet
  if (nameLower.includes('wifi') || nameLower.includes('internett') || nameLower.includes('internet')) {
    return 'wifi';
  }

  // Parking
  if (nameLower.includes('parkering') || nameLower.includes('parking')) {
    return 'car';
  }

  // Sound / Audio
  if (
    nameLower.includes('lyd') ||
    nameLower.includes('sound') ||
    nameLower.includes('audio') ||
    nameLower.includes('høyttaler') ||
    nameLower.includes('speaker')
  ) {
    return 'volume';
  }

  // Camera / Photo equipment
  if (
    nameLower.includes('kamera') ||
    nameLower.includes('camera') ||
    nameLower.includes('photo') ||
    nameLower.includes('foto')
  ) {
    return 'camera';
  }

  // Default icon
  return 'check';
};

/**
 * Map amenities to include their icon types
 */
export const mapAmenitiesToIcons = (
  amenities: readonly string[]
): readonly AmenityWithIcon[] => {
  return amenities.map(amenity => ({
    name: amenity,
    iconType: getAmenityIconType(amenity)
  }));
};

/**
 * Group amenities by category based on their type
 * This is a simple categorization - can be enhanced based on requirements
 */
export const groupAmenitiesByCategory = (
  amenities: readonly string[]
): readonly AmenityCategory[] => {
  const categories: Record<string, string[]> = {
    technology: [],
    facilities: [],
    comfort: [],
    other: []
  };

  amenities.forEach(amenity => {
    const nameLower = amenity.toLowerCase();

    if (
      nameLower.includes('wifi') ||
      nameLower.includes('internett') ||
      nameLower.includes('projector') ||
      nameLower.includes('screen') ||
      nameLower.includes('kamera') ||
      nameLower.includes('camera')
    ) {
      categories.technology.push(amenity);
    } else if (
      nameLower.includes('parkering') ||
      nameLower.includes('parking') ||
      nameLower.includes('toilet') ||
      nameLower.includes('kjøkken') ||
      nameLower.includes('kitchen')
    ) {
      categories.facilities.push(amenity);
    } else if (
      nameLower.includes('lyd') ||
      nameLower.includes('sound') ||
      nameLower.includes('heating') ||
      nameLower.includes('air') ||
      nameLower.includes('klima')
    ) {
      categories.comfort.push(amenity);
    } else {
      categories.other.push(amenity);
    }
  });

  const result: AmenityCategory[] = [];

  if (categories.technology.length > 0) {
    result.push({
      category: 'technology',
      amenities: mapAmenitiesToIcons(categories.technology)
    });
  }

  if (categories.facilities.length > 0) {
    result.push({
      category: 'facilities',
      amenities: mapAmenitiesToIcons(categories.facilities)
    });
  }

  if (categories.comfort.length > 0) {
    result.push({
      category: 'comfort',
      amenities: mapAmenitiesToIcons(categories.comfort)
    });
  }

  if (categories.other.length > 0) {
    result.push({
      category: 'other',
      amenities: mapAmenitiesToIcons(categories.other)
    });
  }

  return result;
};

/**
 * Check if amenities include parking
 */
export const hasParkingAmenity = (amenities: readonly string[]): boolean => {
  return amenities.some(amenity => {
    const nameLower = amenity.toLowerCase();
    return nameLower.includes('parkering') || nameLower.includes('parking');
  });
};

/**
 * Check if amenities include WiFi
 */
export const hasWiFiAmenity = (amenities: readonly string[]): boolean => {
  return amenities.some(amenity => {
    const nameLower = amenity.toLowerCase();
    return nameLower.includes('wifi') || nameLower.includes('internett') || nameLower.includes('internet');
  });
};
