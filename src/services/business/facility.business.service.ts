/**
 * Facility Business Logic Service
 *
 * Contains all business logic related to facility operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Database } from "@/types/database";

type Facility = Database['public']['Tables']['facilities']['Row'];

export interface IFacilityFilters {
  readonly searchTerm?: string;
  readonly statusFilter?: readonly string[];
  readonly typeFilter?: readonly string[];
  readonly capacityRange?: { readonly min: number; readonly max: number };
}

export interface IFacilitySortConfig {
  readonly sortBy: 'name' | 'capacity' | 'updated_at' | 'created_at';
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * Filter facilities based on search and filter criteria
 */
export const filterFacilities = (
  facilities: readonly Facility[],
  filters: IFacilityFilters
): readonly Facility[] => {
  return facilities.filter(facility => {
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        facility.name.toLowerCase().includes(searchLower) ||
        facility.facility_type.toLowerCase().includes(searchLower) ||
        (facility.address || '').toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      if (!filters.statusFilter.includes(facility.status)) return false;
    }

    // Type filter
    if (filters.typeFilter && filters.typeFilter.length > 0) {
      if (!filters.typeFilter.includes(facility.facility_type)) return false;
    }

    // Capacity range filter
    if (filters.capacityRange) {
      const { min, max } = filters.capacityRange;
      if (facility.capacity < min || facility.capacity > max) return false;
    }

    return true;
  });
};

/**
 * Sort facilities based on sort configuration
 */
export const sortFacilities = (
  facilities: readonly Facility[],
  sortConfig: IFacilitySortConfig
): readonly Facility[] => {
  const sorted = [...facilities].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'capacity':
        comparison = a.capacity - b.capacity;
        break;
      case 'updated_at':
        comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Get unique facility types from a list of facilities
 */
export const getUniqueFacilityTypes = (facilities: readonly Facility[]): readonly string[] => {
  return Array.from(new Set(facilities.map(f => f.facility_type)));
};

/**
 * Get unique facility statuses
 */
export const getUniqueFacilityStatuses = (): readonly string[] => {
  return ["published", "draft", "archived"];
};

/**
 * Validate if a facility can be deleted
 */
export const canDeleteFacility = (facility: Facility): { canDelete: boolean; reason?: string } => {
  // Business rule: Can't delete published facilities with active bookings (to be implemented)
  // For now, allow all deletions
  return { canDelete: true };
};

/**
 * Validate if facilities can be batch deleted
 */
export const canBatchDeleteFacilities = (
  facilities: readonly Facility[]
): { canDelete: boolean; reason?: string } => {
  // Business rule: Check if any facility has active bookings
  // For now, allow all batch deletions
  return { canDelete: true };
};

/**
 * Calculate facility statistics
 */
export const calculateFacilityStats = (facilities: readonly Facility[]) => {
  const total = facilities.length;
  const published = facilities.filter(f => f.status === 'published').length;
  const draft = facilities.filter(f => f.status === 'draft').length;
  const archived = facilities.filter(f => f.status === 'archived').length;

  return {
    total,
    published,
    draft,
    archived,
    publishedPercentage: total > 0 ? Math.round((published / total) * 100) : 0,
  };
};

/**
 * Format facility for display
 */
export const formatFacilityForDisplay = (facility: Facility) => {
  return {
    ...facility,
    formattedCreatedAt: new Date(facility.created_at).toLocaleDateString('no-NO'),
    formattedUpdatedAt: new Date(facility.updated_at).toLocaleDateString('no-NO'),
    hasAddress: Boolean(facility.address),
    hasImages: Boolean(facility.images && Array.isArray(facility.images) && facility.images.length > 0),
  };
};

/**
 * Validate facility data
 */
export const validateFacilityData = (facility: Partial<Facility>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!facility.name || facility.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  }

  if (!facility.facility_type) {
    errors.push('Facility type is required');
  }

  if (!facility.capacity || facility.capacity < 1) {
    errors.push('Capacity must be at least 1');
  }

  if (!facility.address) {
    errors.push('Address is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
