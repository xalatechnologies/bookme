/**
 * Amenity Icon Utilities
 *
 * Centralized utilities for amenity icon mapping and rendering.
 * Provides consistent icon mapping across facility components.
 */

export type AmenityIconType = 
  // Technology & Media
  | 'wifi' 
  | 'projector'
  | 'camera'
  | 'sound'
  | 'screen'
  | 'whiteboard'
  | 'video'
  
  // Facilities & Infrastructure
  | 'car'
  | 'toilet'
  | 'kitchen'
  | 'cafeteria'
  | 'locker'
  | 'shower'
  | 'light'
  
  // Sports & Activities
  | 'football'
  | 'basketball'
  | 'volleyball'
  | 'pool'
  | 'tribune'
  | 'stage'
  | 'grass'
  | 'indoor'
  
  // Safety & Equipment
  | 'equipment'
  | 'safety'
  | 'professional'
  
  // Default
  | 'check';

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

  // Technology & Media
  if (nameLower.includes('wifi') || nameLower.includes('internett') || nameLower.includes('internet')) {
    return 'wifi';
  }
  
  if (nameLower.includes('projektor')) {
    return 'projector';
  }
  
  if (nameLower.includes('kamera') || nameLower.includes('camera') || nameLower.includes('photo') || nameLower.includes('foto')) {
    return 'camera';
  }
  
  if (nameLower.includes('lyd') || nameLower.includes('sound') || nameLower.includes('audio') || nameLower.includes('høyttaler') || nameLower.includes('speaker')) {
    return 'sound';
  }
  
  if (nameLower.includes('whiteboard') || nameLower.includes('tavle')) {
    return 'whiteboard';
  }
  
  if (nameLower.includes('video')) {
    return 'video';
  }
  
  // Facilities & Infrastructure
  if (nameLower.includes('parkering') || nameLower.includes('parking')) {
    return 'car';
  }
  
  if (nameLower.includes('toilet') || nameLower.includes('toalett')) {
    return 'toilet';
  }
  
  if (nameLower.includes('kjøkken') || nameLower.includes('kitchen')) {
    return 'kitchen';
  }
  
  if (nameLower.includes('cafeteria') || nameLower.includes('kafeteria')) {
    return 'cafeteria';
  }
  
  if (nameLower.includes('garderober') || nameLower.includes('locker')) {
    return 'locker';
  }
  
  if (nameLower.includes('dusj') || nameLower.includes('shower')) {
    return 'shower';
  }
  
  if (nameLower.includes('lys') || nameLower.includes('light') || nameLower.includes('belysning') || nameLower.includes('flom')) {
    return 'light';
  }
  
  // Sports & Activities
  if (nameLower.includes('fotball') || nameLower.includes('football')) {
    return 'football';
  }
  
  if (nameLower.includes('basketball')) {
    return 'basketball';
  }
  
  if (nameLower.includes('volleyball')) {
    return 'volleyball';
  }
  
  if (nameLower.includes('basseng') || nameLower.includes('pool') || nameLower.includes('swim')) {
    return 'pool';
  }
  
  if (nameLower.includes('tribuner') || nameLower.includes('tribune')) {
    return 'tribune';
  }
  
  if (nameLower.includes('scene') || nameLower.includes('stage')) {
    return 'stage';
  }
  
  if (nameLower.includes('kunstgress') || nameLower.includes('grass')) {
    return 'grass';
  }
  
  if (nameLower.includes('innendørs') || nameLower.includes('indoor') || nameLower.includes('badstue') || nameLower.includes('sauna')) {
    return 'indoor';
  }
  
  // Safety & Equipment
  if (nameLower.includes('utstyr') || nameLower.includes('equipment')) {
    return 'equipment';
  }
  
  if (nameLower.includes('rednings') || nameLower.includes('safety') || nameLower.includes('emergency')) {
    return 'safety';
  }
  
  if (nameLower.includes('profesjonell')) {
    return 'professional';
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