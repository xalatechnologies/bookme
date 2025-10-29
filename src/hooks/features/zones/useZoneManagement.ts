/**
 * Zone Management Hook
 *
 * Connects UI components to zone business logic and data services.
 * Provides a clean interface for zone management operations including
 * filtering, sorting, CRUD operations, and availability checking.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useZoneUIStore, type TZoneView, type TZoneSortBy } from '@/stores/zoneUIStore';
import {
  filterZones,
  sortZones,
  validateZoneData,
  canDeleteZone,
  calculateZoneUtilization,
  findAvailableZones,
  groupZonesByFacility,
  getAveragePricePerHour,
  getZoneCapacityBounds,
  getUniqueAmenities,
  calculateTotalCapacity,
  hasAmenity,
  hasAllAmenities,
  calculateBookingCost,
  getZonesAvailableForDateTimeRange,
  type IZoneFilters,
  type IZoneSortConfig,
  type ZoneValidationResult,
  type ZoneDeleteCheckResult,
  type ZoneUtilizationStats,
  type ZonesByFacility,
} from '@/services/business/zone.business.service';
import type { Zone } from '@/types/booking';

export interface IUseZoneManagementReturn {
  // Data (would be fetched from API in real implementation)
  readonly zones: readonly Zone[];
  readonly filteredZones: readonly Zone[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly totalCapacity: number;
  readonly averagePrice: number;
  readonly capacityBounds: ReturnType<typeof getZoneCapacityBounds>;
  readonly uniqueAmenities: readonly string[];
  readonly zonesByFacility: readonly ZonesByFacility[];

  // UI State
  readonly view: TZoneView;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly facilityFilter: readonly string[];
  readonly capacityRange: { readonly min: number; readonly max: number };
  readonly amenityFilter: readonly string[];
  readonly sortBy: TZoneSortBy;
  readonly sortOrder: string;
  readonly selectedZoneIds: readonly string[];
  readonly modals: {
    readonly create: boolean;
    readonly edit: boolean;
    readonly delete: boolean;
    readonly availability: boolean;
  };
  readonly activeZoneId: string | null;

  // UI Actions
  readonly setView: (view: TZoneView) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleFacilityFilter: (facility: string) => void;
  readonly setCapacityRange: (range: { min: number; max: number }) => void;
  readonly toggleAmenityFilter: (amenity: string) => void;
  readonly toggleSort: (sortBy: TZoneSortBy) => void;
  readonly toggleZoneSelection: (id: string) => void;
  readonly selectAllZones: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;
  readonly openModal: (modal: 'create' | 'edit' | 'delete' | 'availability', zoneId?: string) => void;
  readonly closeModal: (modal: 'create' | 'edit' | 'delete' | 'availability') => void;
  readonly closeAllModals: () => void;
  readonly setActiveZoneId: (id: string | null) => void;

  // Business Operations
  readonly validateZoneData: (zone: Partial<Zone>) => ZoneValidationResult;
  readonly canDeleteZone: (zone: Zone, activeBookingCount: number) => ZoneDeleteCheckResult;
  readonly calculateZoneUtilization: (zone: Zone, currentOccupancy: number) => number;
  readonly findAvailableZones: (
    dayOfWeek: number,
    timeSlot: string,
    facilityId?: string,
    minimumCapacity?: number
  ) => readonly Zone[];
  readonly hasAmenity: (zone: Zone, amenity: string) => boolean;
  readonly hasAllAmenities: (zone: Zone, amenities: readonly string[]) => boolean;
  readonly calculateBookingCost: (zone: Zone, hours: number) => number;
  readonly getZonesAvailableForDateTimeRange: (
    date: Date,
    startTime: string,
    endTime: string,
    facilityId?: string
  ) => readonly Zone[];
}

/**
 * Hook for managing zones with business logic separation
 *
 * Provides comprehensive zone management functionality including:
 * - Data fetching and caching (would use React Query in real implementation)
 * - UI state management via Zustand store
 * - Business logic validation and operations
 * - Filtering by facility, capacity, amenities
 * - Sorting by multiple criteria
 * - CRUD operations validation
 * - Availability checking
 * - Cost calculations
 *
 * @returns Complete zone management interface
 *
 * @example
 * ```tsx
 * function ZoneManagementPage() {
 *   const {
 *     filteredZones,
 *     searchTerm,
 *     setSearchTerm,
 *     validateZoneData,
 *     canDeleteZone,
 *     openModal,
 *   } = useZoneManagement();
 *
 *   const handleDelete = (zone: Zone) => {
 *     const validation = canDeleteZone(zone, activeBookingCount);
 *     if (!validation.canDelete) {
 *       toast.error(validation.reason);
 *       return;
 *     }
 *     openModal('delete', zone.id);
 *   };
 *
 *   return (
 *     <div>
 *       <SearchBar value={searchTerm} onChange={setSearchTerm} />
 *       <ZoneGrid zones={filteredZones} onDelete={handleDelete} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useZoneManagement = (zones: readonly Zone[] = []): IUseZoneManagementReturn => {
  // In a real implementation, data would be fetched here
  // const { data: zones = [], isLoading, error } = useZones(orgId);
  const isLoading = false;
  const error = null;

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    facilityFilter,
    capacityRange,
    amenityFilter,
    sortBy,
    sortOrder,
    selectedZoneIds,
    modals,
    activeZoneId,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleFacilityFilter,
    setCapacityRange,
    toggleAmenityFilter,
    toggleSort,
    toggleZoneSelection,
    selectAllZones: selectAll,
    clearSelection,
    resetFilters,
    openModal,
    closeModal,
    closeAllModals,
    setActiveZoneId,
  } = useZoneUIStore();

  // Business logic layer - filtering and sorting
  const filteredZones = useMemo(() => {
    const filters: IZoneFilters = {
      searchTerm,
      facilityId: facilityFilter.length > 0 ? facilityFilter[0] : undefined,
      capacityRange,
    };

    const filtered = filterZones(zones, filters);

    const sortConfig: IZoneSortConfig = {
      sortBy: sortBy === 'facility' || sortBy === 'updated_at' || sortBy === 'created_at'
        ? 'name' // Map unsupported sort fields to 'name'
        : sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return sortZones(filtered, sortConfig);
  }, [zones, searchTerm, facilityFilter, capacityRange, sortBy, sortOrder]);

  // Statistics
  const totalCapacity = useMemo(() => calculateTotalCapacity(zones), [zones]);
  const averagePrice = useMemo(() => getAveragePricePerHour(zones), [zones]);
  const capacityBounds = useMemo(() => getZoneCapacityBounds(zones), [zones]);
  const uniqueAmenities = useMemo(() => getUniqueAmenities(zones), [zones]);
  const zonesByFacility = useMemo(() => groupZonesByFacility(zones), [zones]);

  // Business operations - wrapped with useCallback for stability
  const findAvailableZonesCallback = useCallback(
    (
      dayOfWeek: number,
      timeSlot: string,
      facilityId?: string,
      minimumCapacity?: number
    ): readonly Zone[] => {
      return findAvailableZones(zones, dayOfWeek, timeSlot, facilityId, minimumCapacity);
    },
    [zones]
  );

  const getZonesAvailableForDateTimeRangeCallback = useCallback(
    (
      date: Date,
      startTime: string,
      endTime: string,
      facilityId?: string
    ): readonly Zone[] => {
      return getZonesAvailableForDateTimeRange(zones, date, startTime, endTime, facilityId);
    },
    [zones]
  );

  const hasAmenityCallback = useCallback(
    (zone: Zone, amenity: string): boolean => {
      return hasAmenity(zone, amenity);
    },
    []
  );

  const hasAllAmenitiesCallback = useCallback(
    (zone: Zone, amenities: readonly string[]): boolean => {
      return hasAllAmenities(zone, amenities);
    },
    []
  );

  const calculateBookingCostCallback = useCallback(
    (zone: Zone, hours: number): number => {
      return calculateBookingCost(zone, hours);
    },
    []
  );

  const selectAllZones = useCallback(() => {
    selectAll(filteredZones.map((z) => z.id));
  }, [filteredZones, selectAll]);

  return {
    // Data
    zones,
    filteredZones,
    isLoading,
    error,

    // Statistics
    totalCapacity,
    averagePrice,
    capacityBounds,
    uniqueAmenities,
    zonesByFacility,

    // UI State
    view,
    showFilters,
    searchTerm,
    facilityFilter,
    capacityRange,
    amenityFilter,
    sortBy,
    sortOrder,
    selectedZoneIds,
    modals,
    activeZoneId,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleFacilityFilter,
    setCapacityRange,
    toggleAmenityFilter,
    toggleSort,
    toggleZoneSelection,
    selectAllZones,
    clearSelection,
    resetFilters,
    openModal,
    closeModal,
    closeAllModals,
    setActiveZoneId,

    // Business Operations
    validateZoneData,
    canDeleteZone,
    calculateZoneUtilization,
    findAvailableZones: findAvailableZonesCallback,
    hasAmenity: hasAmenityCallback,
    hasAllAmenities: hasAllAmenitiesCallback,
    calculateBookingCost: calculateBookingCostCallback,
    getZonesAvailableForDateTimeRange: getZonesAvailableForDateTimeRangeCallback,
  };
};
