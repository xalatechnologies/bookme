/**
 * User Facilities Management Hook
 *
 * Handles all business logic for user-facing facilities view including:
 * - Real-time availability calculation
 * - Facility data transformation
 * - Filtering and sorting logic
 * - View mode persistence
 * - Search and filter state management
 *
 * Clean Architecture Pattern: Business logic separation from UI
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * User-facing facility interface with availability and favorites
 */
export interface IUserFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly address: string;
  readonly capacity: number;
  readonly amenities: readonly string[];
  readonly image: string;
  readonly rating: number;
  readonly price: string;
  readonly description: string;
  readonly availability: 'available' | 'busy' | 'full';
  readonly isFavorite?: boolean;
  readonly coordinates?: { lat: number; lng: number };
  readonly slug?: string;
}

/**
 * Sort configuration type
 */
export type SortBy = 'price' | 'popularity' | 'name';
export type SortOrder = 'asc' | 'desc';

/**
 * View mode type
 */
export type ViewMode = 'grid' | 'list' | 'map';

/**
 * Hook return interface
 */
export interface IUseUserFacilitiesManagementReturn {
  // Data
  readonly facilities: readonly IUserFacility[];
  readonly filteredFacilities: readonly IUserFacility[];
  readonly isLoading: boolean;

  // Search & Filter State
  readonly searchQuery: string;
  readonly selectedType: string;
  readonly showAvailableOnly: boolean;
  readonly sortBy: SortBy;
  readonly sortOrder: SortOrder;
  readonly viewMode: ViewMode;

  // Actions
  readonly setSearchQuery: (query: string) => void;
  readonly setSelectedType: (type: string) => void;
  readonly setShowAvailableOnly: (show: boolean) => void;
  readonly handleSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  readonly setViewMode: (mode: ViewMode) => void;
  readonly resetFilters: () => void;

  // Computed
  readonly resultsCount: number;
}

/**
 * Local storage key for view mode persistence
 */
const VIEW_MODE_STORAGE_KEY = 'userFacilitiesViewMode';

/**
 * Get real-time availability status for a facility
 *
 * Simulates real-time availability based on:
 * - Current time and day of week
 * - Facility type patterns
 * - Deterministic randomness per facility
 *
 * @param facilityId - ID of the facility
 * @param facilityType - Type of the facility
 * @returns Availability status
 */
const getRealTimeAvailability = (
  facilityId: string,
  facilityType: string
): 'available' | 'busy' | 'full' => {
  try {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    let baseAvailability = 0.8; // 80% chance of being available

    // Adjust based on facility type
    switch (facilityType.toLowerCase()) {
      case 'idrettshall':
      case 'gym':
        // More busy during evening hours and weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          baseAvailability = hour >= 8 && hour <= 20 ? 0.6 : 0.9;
        } else { // Weekday
          baseAvailability = hour >= 17 && hour <= 21 ? 0.4 : 0.8;
        }
        break;
      case 'møterom':
      case 'konferanse':
        // More busy during business hours
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
          baseAvailability = hour >= 9 && hour <= 17 ? 0.3 : 0.8;
        } else { // Weekend
          baseAvailability = 0.9;
        }
        break;
      case 'kulturhus':
      case 'teater':
        // More busy during evening and weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          baseAvailability = hour >= 14 && hour <= 22 ? 0.2 : 0.8;
        } else { // Weekday
          baseAvailability = hour >= 18 && hour <= 22 ? 0.3 : 0.7;
        }
        break;
      default:
        // Default pattern
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          baseAvailability = hour >= 8 && hour <= 22 ? 0.7 : 0.9;
        } else { // Weekday
          baseAvailability = hour >= 6 && hour <= 23 ? 0.6 : 0.9;
        }
    }

    // Add deterministic randomness based on facility ID for consistency
    const seed = facilityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomFactor = (seed % 100) / 100;
    const finalAvailability = baseAvailability + (randomFactor - 0.5) * 0.2;

    // Determine status based on availability probability
    if (finalAvailability >= 0.7) {
      return 'available';
    } else if (finalAvailability >= 0.3) {
      return 'busy';
    } else {
      return 'full';
    }
  } catch (error) {
    console.error('Failed to get real-time availability:', error);
    return 'available'; // Default to available on error
  }
};

/**
 * Transform Supabase facility to user facility format
 *
 * @param facility - Raw facility from database
 * @param isFavorite - Function to check if facility is favorited
 * @returns Transformed user facility
 */
const transformFacilityToUserFormat = (
  facility: Facility,
  isFavorite: (id: string) => boolean
): IUserFacility => {
  return {
    id: facility.id,
    name: facility.name,
    type: facility.facility_type || '',
    address: facility.address || '',
    capacity: facility.capacity || 0,
    amenities: (facility.amenities as string[]) || [],
    image: (facility.images as any)?.[0] || '/placeholder.svg',
    rating: facility.rating || 0,
    price: `0 kr/time`,
    description: facility.description || '',
    availability: getRealTimeAvailability(facility.id, facility.facility_type || ''),
    isFavorite: isFavorite(facility.id),
    coordinates: facility.location as { lat: number; lng: number } | undefined,
    slug: facility.slug,
  };
};

/**
 * Filter facilities based on search and filter criteria
 *
 * @param facilities - Array of facilities
 * @param searchQuery - Search text
 * @param selectedType - Selected facility type
 * @param showAvailableOnly - Show only available facilities
 * @returns Filtered facilities
 */
const filterFacilities = (
  facilities: readonly IUserFacility[],
  searchQuery: string,
  selectedType: string,
  showAvailableOnly: boolean
): readonly IUserFacility[] => {
  return facilities.filter(facility => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || facility.type === selectedType;
    const matchesAvailability = !showAvailableOnly || facility.availability === 'available';

    return matchesSearch && matchesType && matchesAvailability;
  });
};

/**
 * Sort facilities based on sort configuration
 *
 * @param facilities - Array of facilities
 * @param sortBy - Sort field
 * @param sortOrder - Sort direction
 * @returns Sorted facilities
 */
const sortFacilities = (
  facilities: readonly IUserFacility[],
  sortBy: SortBy,
  sortOrder: SortOrder
): readonly IUserFacility[] => {
  return [...facilities].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'price':
        const priceA = parseInt(a.price.replace(/[^\d]/g, ''));
        const priceB = parseInt(b.price.replace(/[^\d]/g, ''));
        comparison = priceA - priceB;
        break;
      case 'popularity':
        comparison = b.rating - a.rating;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

/**
 * Load view mode from localStorage
 */
const loadViewMode = (): ViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored && ['grid', 'list', 'map'].includes(stored)) {
      return stored as ViewMode;
    }
  } catch (error) {
    console.error('Failed to load view mode from localStorage:', error);
  }
  return 'grid';
};

/**
 * Save view mode to localStorage
 */
const saveViewMode = (mode: ViewMode): void => {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch (error) {
    console.error('Failed to save view mode to localStorage:', error);
  }
};

/**
 * Hook for managing user facilities with business logic separation
 *
 * This hook centralizes all business logic for the user facilities view:
 * - Fetches published facilities
 * - Calculates real-time availability
 * - Transforms data to user format
 * - Handles filtering and sorting
 * - Manages view mode persistence
 *
 * @returns Facilities data and management functions
 */
export const useUserFacilitiesManagement = (): IUseUserFacilitiesManagementReturn => {
  // Data layer
  const orgId = useOrganizationId();
  const { data: rawFacilities = [], isLoading } = usePublishedFacilities(orgId);
  const { isFavorite } = useFavoritesStore();

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false);

  // Sort state
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // View state with persistence
  const [viewMode, setViewModeState] = useState<ViewMode>(loadViewMode());

  // Persist view mode changes
  useEffect(() => {
    saveViewMode(viewMode);
  }, [viewMode]);

  /**
   * Transform raw facilities to user format with availability and favorites
   */
  const facilities = useMemo<readonly IUserFacility[]>(() => {
    return rawFacilities.map(facility =>
      transformFacilityToUserFormat(facility, isFavorite)
    );
  }, [rawFacilities, isFavorite]);

  /**
   * Apply filtering and sorting
   */
  const filteredFacilities = useMemo<readonly IUserFacility[]>(() => {
    const filtered = filterFacilities(
      facilities,
      searchQuery,
      selectedType,
      showAvailableOnly
    );

    return sortFacilities(filtered, sortBy, sortOrder);
  }, [facilities, searchQuery, selectedType, showAvailableOnly, sortBy, sortOrder]);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((newSortBy: SortBy, newOrder: SortOrder): void => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  }, []);

  /**
   * Handle view mode change with persistence
   */
  const setViewMode = useCallback((mode: ViewMode): void => {
    setViewModeState(mode);
  }, []);

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback((): void => {
    setSearchQuery('');
    setSelectedType('all');
    setShowAvailableOnly(false);
  }, []);

  return {
    // Data
    facilities,
    filteredFacilities,
    isLoading,

    // State
    searchQuery,
    selectedType,
    showAvailableOnly,
    sortBy,
    sortOrder,
    viewMode,

    // Actions
    setSearchQuery,
    setSelectedType,
    setShowAvailableOnly,
    handleSortChange,
    setViewMode,
    resetFilters,

    // Computed
    resultsCount: filteredFacilities.length,
  };
};
