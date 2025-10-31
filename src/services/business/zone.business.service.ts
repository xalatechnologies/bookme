/**
 * Zone Business Logic Service
 *
 * Contains all business logic related to zone operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Zone } from '@/types/booking';

export interface IZoneFilters {
  readonly searchTerm?: string;
  readonly facilityId?: string;
  readonly capacityRange?: { readonly min: number; readonly max: number };
  readonly priceRange?: { readonly min: number; readonly max: number };
}

export interface IZoneSortConfig {
  readonly sortBy: 'name' | 'capacity' | 'pricePerHour';
  readonly sortOrder: 'asc' | 'desc';
}

export interface ZoneValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

export interface ZoneDeleteCheckResult {
  readonly canDelete: boolean;
  readonly reason?: string;
}

export interface ZoneUtilizationStats {
  readonly zoneId: string;
  readonly name: string;
  readonly totalCapacity: number;
  readonly utilizationPercentage: number;
  readonly averageOccupancy: number;
}

export interface ZonesByFacility {
  readonly facilityId: string;
  readonly zones: readonly Zone[];
  readonly totalCapacity: number;
  readonly zoneCount: number;
}

export interface AvailableZone {
  readonly zone: Zone;
  readonly availableCapacity: number;
  readonly isFullyAvailable: boolean;
}

/**
 * Filter zones based on search and filter criteria
 *
 * @param zones - Array of zones to filter
 * @param filters - Filter configuration
 * @returns Filtered array of zones
 */
export const filterZones = (
  zones: readonly Zone[],
  filters: IZoneFilters
): readonly Zone[] => {
  return zones.filter(zone => {
    // Search filter - searches in name, description, and amenities
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        zone.name.toLowerCase().includes(searchLower) ||
        (zone.description || '').toLowerCase().includes(searchLower) ||
        zone.amenities.some(amenity =>
          amenity.toLowerCase().includes(searchLower)
        );

      if (!matchesSearch) return false;
    }

    // Facility filter
    if (filters.facilityId) {
      if (zone.facilityId !== filters.facilityId) return false;
    }

    // Capacity range filter
    if (filters.capacityRange) {
      const { min, max } = filters.capacityRange;
      if (zone.capacity < min || zone.capacity > max) return false;
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (zone.pricePerHour < min || zone.pricePerHour > max) return false;
    }

    return true;
  });
};

/**
 * Sort zones based on sort configuration
 *
 * @param zones - Array of zones to sort
 * @param sortConfig - Sort configuration
 * @returns Sorted array of zones
 */
export const sortZones = (
  zones: readonly Zone[],
  sortConfig: IZoneSortConfig
): readonly Zone[] => {
  const sorted = [...zones].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'capacity':
        comparison = a.capacity - b.capacity;
        break;
      case 'pricePerHour':
        comparison = a.pricePerHour - b.pricePerHour;
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate zone form data
 *
 * @param zone - Partial zone data to validate
 * @returns Validation result with errors
 */
export const validateZoneData = (zone: Partial<Zone>): ZoneValidationResult => {
  const errors: string[] = [];

  // Validate name
  if (!zone.name || zone.name.trim().length < 2) {
    errors.push('Zone name must be at least 2 characters');
  }

  if (zone.name && zone.name.length > 100) {
    errors.push('Zone name must not exceed 100 characters');
  }

  // Validate facility ID
  if (!zone.facilityId) {
    errors.push('Facility ID is required');
  }

  // Validate capacity
  if (!zone.capacity || zone.capacity < 1) {
    errors.push('Capacity must be at least 1 person');
  }

  if (zone.capacity && zone.capacity > 10000) {
    errors.push('Capacity cannot exceed 10000 people');
  }

  // Validate price per hour
  if (zone.pricePerHour === undefined || zone.pricePerHour < 0) {
    errors.push('Price per hour must be a non-negative number');
  }

  if (zone.pricePerHour && zone.pricePerHour > 999999) {
    errors.push('Price per hour is too high');
  }

  // Validate area if provided
  if (zone.area !== undefined && zone.area !== null) {
    if (zone.area < 0) {
      errors.push('Area cannot be negative');
    }

    if (zone.area > 999999) {
      errors.push('Area value is too high');
    }
  }

  // Validate description if provided
  if (zone.description && zone.description.length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }

  // Validate amenities if provided
  if (zone.amenities && !Array.isArray(zone.amenities)) {
    errors.push('Amenities must be an array');
  }

  if (zone.amenities && zone.amenities.length > 50) {
    errors.push('Cannot have more than 50 amenities');
  }

  // Validate availability if provided
  if (zone.availability) {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    for (const day of daysOfWeek) {
      const dayAvailability = zone.availability[day];
      if (dayAvailability) {
        if (!isValidTimeFormat(dayAvailability.start)) {
          errors.push(`Invalid start time for ${day}`);
        }

        if (!isValidTimeFormat(dayAvailability.end)) {
          errors.push(`Invalid end time for ${day}`);
        }

        // Check if start time is before end time
        if (
          isValidTimeFormat(dayAvailability.start) &&
          isValidTimeFormat(dayAvailability.end)
        ) {
          const startMinutes = timeToMinutes(dayAvailability.start);
          const endMinutes = timeToMinutes(dayAvailability.end);

          if (startMinutes >= endMinutes) {
            errors.push(`Start time must be before end time for ${day}`);
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors as readonly string[],
  };
};

/**
 * Check if a zone can be deleted based on business rules
 *
 * @param zone - Zone to check for deletion
 * @param activeBookingCount - Number of active bookings for this zone
 * @returns Deletion check result with reason if cannot delete
 */
export const canDeleteZone = (
  zone: Zone,
  activeBookingCount: number
): ZoneDeleteCheckResult => {
  // Business rule: Cannot delete zones with active bookings
  if (activeBookingCount > 0) {
    return {
      canDelete: false,
      reason: `Cannot delete zone with ${activeBookingCount} active booking(s). Please cancel all bookings before deletion.`,
    };
  }

  return { canDelete: true };
};

/**
 * Calculate zone utilization percentage
 *
 * @param zone - Zone to calculate utilization for
 * @param currentOccupancy - Current number of occupants
 * @returns Utilization percentage (0-100)
 */
export const calculateZoneUtilization = (
  zone: Zone,
  currentOccupancy: number
): number => {
  if (zone.capacity === 0) {
    return 0;
  }

  const utilization = (currentOccupancy / zone.capacity) * 100;
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(utilization)));
};

/**
 * Find zones available for a specific time slot
 *
 * @param zones - All zones to search
 * @param dayOfWeek - Day of the week (0-6, where 0 is Sunday)
 * @param timeSlot - Time slot to check (HH:mm format)
 * @param facilityId - Optional: filter by facility
 * @param minimumCapacity - Optional: minimum required capacity
 * @returns Array of available zones for the time slot
 */
export const findAvailableZones = (
  zones: readonly Zone[],
  dayOfWeek: number,
  timeSlot: string,
  facilityId?: string,
  minimumCapacity?: number
): readonly Zone[] => {
  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayName = daysMap[dayOfWeek % 7];

  return zones.filter(zone => {
    // Filter by facility if specified
    if (facilityId && zone.facilityId !== facilityId) {
      return false;
    }

    // Filter by minimum capacity if specified
    if (minimumCapacity && zone.capacity < minimumCapacity) {
      return false;
    }

    // Check availability for the day
    const dayAvailability = zone.availability[dayName];
    if (!dayAvailability) {
      return false;
    }

    // Check if time slot falls within available hours
    const slotMinutes = timeToMinutes(timeSlot);
    const startMinutes = timeToMinutes(dayAvailability.start);
    const endMinutes = timeToMinutes(dayAvailability.end);

    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  });
};

/**
 * Group zones by facility for display
 *
 * @param zones - All zones to group
 * @returns Array of zones grouped by facility with metadata
 */
export const groupZonesByFacility = (
  zones: readonly Zone[]
): readonly ZonesByFacility[] => {
  const grouped = new Map<string, Zone[]>();

  // Group zones by facility ID
  for (const zone of zones) {
    if (!grouped.has(zone.facilityId)) {
      grouped.set(zone.facilityId, []);
    }
    grouped.get(zone.facilityId)!.push(zone);
  }

  // Convert to array with metadata
  return Array.from(grouped.entries()).map(([facilityId, facilityZones]) => ({
    facilityId,
    zones: facilityZones as readonly Zone[],
    totalCapacity: facilityZones.reduce((sum, zone) => sum + zone.capacity, 0),
    zoneCount: facilityZones.length,
  }));
};

/**
 * Get average price per hour across zones
 *
 * @param zones - Array of zones
 * @returns Average price per hour, or 0 if no zones
 */
export const getAveragePricePerHour = (zones: readonly Zone[]): number => {
  if (zones.length === 0) {
    return 0;
  }

  const totalPrice = zones.reduce((sum, zone) => sum + zone.pricePerHour, 0);
  return Math.round((totalPrice / zones.length) * 100) / 100;
};

/**
 * Get zones with minimum and maximum capacities
 *
 * @param zones - Array of zones
 * @returns Object with min and max capacity zones
 */
export const getZoneCapacityBounds = (zones: readonly Zone[]) => {
  if (zones.length === 0) {
    return { minCapacity: 0, maxCapacity: 0, minZone: null, maxZone: null };
  }

  const sorted = [...zones].sort((a, b) => a.capacity - b.capacity);

  return {
    minCapacity: sorted[0].capacity,
    maxCapacity: sorted[sorted.length - 1].capacity,
    minZone: sorted[0],
    maxZone: sorted[sorted.length - 1],
  };
};

/**
 * Get unique amenities across all zones
 *
 * @param zones - Array of zones
 * @returns Array of unique amenities
 */
export const getUniqueAmenities = (zones: readonly Zone[]): readonly string[] => {
  const amenitiesSet = new Set<string>();

  for (const zone of zones) {
    for (const amenity of zone.amenities) {
      amenitiesSet.add(amenity);
    }
  }

  return Array.from(amenitiesSet).sort();
};

/**
 * Calculate total capacity across multiple zones
 *
 * @param zones - Array of zones
 * @returns Total capacity sum
 */
export const calculateTotalCapacity = (zones: readonly Zone[]): number => {
  return zones.reduce((sum, zone) => sum + zone.capacity, 0);
};

/**
 * Find zones that match specific criteria
 *
 * @param zones - Array of zones to search
 * @param predicateFn - Function to test each zone
 * @returns Matching zones
 */
export const findZonesByCriteria = (
  zones: readonly Zone[],
  predicateFn: (zone: Zone) => boolean
): readonly Zone[] => {
  return zones.filter(predicateFn);
};

/**
 * Check if zone has specific amenity
 *
 * @param zone - Zone to check
 * @param amenity - Amenity to search for
 * @returns True if zone has the amenity
 */
export const hasAmenity = (zone: Zone, amenity: string): boolean => {
  return zone.amenities.some(
    a => a.toLowerCase() === amenity.toLowerCase()
  );
};

/**
 * Check if zone has all specified amenities
 *
 * @param zone - Zone to check
 * @param amenities - Amenities to search for
 * @returns True if zone has all amenities
 */
export const hasAllAmenities = (
  zone: Zone,
  amenities: readonly string[]
): boolean => {
  return amenities.every(amenity => hasAmenity(zone, amenity));
};

/**
 * Calculate cost for booking a zone
 *
 * @param zone - Zone to book
 * @param hours - Number of hours to book
 * @returns Total cost
 */
export const calculateBookingCost = (zone: Zone, hours: number): number => {
  return Math.round(zone.pricePerHour * hours * 100) / 100;
};

/**
 * Get zones available on a specific date and time range
 *
 * @param zones - All zones to search
 * @param date - Date to check
 * @param startTime - Start time (HH:mm format)
 * @param endTime - End time (HH:mm format)
 * @param facilityId - Optional: filter by facility
 * @returns Available zones for the date and time range
 */
export const getZonesAvailableForDateTimeRange = (
  zones: readonly Zone[],
  date: Date,
  startTime: string,
  endTime: string,
  facilityId?: string
): readonly Zone[] => {
  const dayOfWeek = date.getDay();

  const availableZones = findAvailableZones(
    zones,
    dayOfWeek,
    startTime,
    facilityId
  );

  // Further filter by end time
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const dayName = daysMap[dayOfWeek % 7];

  return availableZones.filter(zone => {
    const dayAvailability = zone.availability[dayName];
    if (!dayAvailability) return false;

    const zoneEndMinutes = timeToMinutes(dayAvailability.end);

    // End time must not exceed zone's available end time
    return endMinutes <= zoneEndMinutes;
  });
};

/**
 * Helper function to validate time format (HH:mm)
 *
 * @param time - Time string to validate
 * @returns True if time is in valid HH:mm format
 */
const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Helper function to convert time string (HH:mm) to minutes
 *
 * @param time - Time string in HH:mm format
 * @returns Total minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
