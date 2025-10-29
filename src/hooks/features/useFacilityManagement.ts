/**
 * Facility Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for facility management operations.
 */

import { useMemo, useCallback } from 'react';
import { useFacilities, useDeleteFacility, useUpdateFacility } from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useFacilityUIStore } from '@/stores/facilityUIStore';
import {
  filterFacilities,
  sortFacilities,
  getUniqueFacilityTypes,
  getUniqueFacilityStatuses,
  canDeleteFacility,
  canBatchDeleteFacilities,
  calculateFacilityStats,
  type IFacilityFilters,
  type IFacilitySortConfig,
} from '@/services/business/facility.business.service';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export interface IUseFacilityManagementReturn {
  // Data
  readonly facilities: readonly Facility[];
  readonly filteredFacilities: readonly Facility[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Statistics
  readonly stats: ReturnType<typeof calculateFacilityStats>;
  readonly uniqueTypes: readonly string[];
  readonly uniqueStatuses: readonly string[];

  // UI State
  readonly view: string;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly statusFilter: readonly string[];
  readonly typeFilter: readonly string[];
  readonly capacityRange: { readonly min: number; readonly max: number };
  readonly sortBy: string;
  readonly sortOrder: string;
  readonly selectedFacilityIds: readonly string[];

  // UI Actions
  readonly setView: (view: any) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleStatusFilter: (status: string) => void;
  readonly toggleTypeFilter: (type: string) => void;
  readonly setCapacityRange: (range: { min: number; max: number }) => void;
  readonly toggleSort: (sortBy: any) => void;
  readonly toggleFacilitySelection: (id: string) => void;
  readonly selectAllFacilities: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;

  // Business Operations
  readonly deleteFacility: (id: string) => Promise<void>;
  readonly batchDeleteFacilities: (ids: readonly string[]) => Promise<void>;
  readonly updateFacilityStatus: (id: string, status: string) => Promise<void>;
  readonly batchUpdateStatus: (ids: readonly string[], status: string) => Promise<void>;

  // Validation
  readonly canDeleteFacility: (facility: Facility) => { canDelete: boolean; reason?: string };
}

/**
 * Hook for managing facilities with business logic separation
 */
export const useFacilityManagement = (): IUseFacilityManagementReturn => {
  // Data layer
  const orgId = useOrganizationId();
  const { facilities, loading: isLoading, error } = useFacilities(orgId);
  const deleteFacilityMutation = useDeleteFacility();
  const updateFacilityMutation = useUpdateFacility();

  // UI state layer
  const {
    view,
    showFilters,
    searchTerm,
    statusFilter,
    typeFilter,
    capacityRange,
    sortBy,
    sortOrder,
    selectedFacilityIds,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleStatusFilter,
    toggleTypeFilter,
    setCapacityRange,
    toggleSort,
    toggleFacilitySelection,
    selectAllFacilities: selectAll,
    clearSelection,
    resetFilters,
  } = useFacilityUIStore();

  // Business logic layer - filtering
  const filteredFacilities = useMemo(() => {
    const filters: IFacilityFilters = {
      searchTerm,
      statusFilter,
      typeFilter,
      capacityRange,
    };

    const filtered = filterFacilities(facilities, filters);

    const sortConfig: IFacilitySortConfig = {
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
    };

    return sortFacilities(filtered, sortConfig);
  }, [facilities, searchTerm, statusFilter, typeFilter, capacityRange, sortBy, sortOrder]);

  // Statistics
  const stats = useMemo(() => calculateFacilityStats(facilities), [facilities]);
  const uniqueTypes = useMemo(() => getUniqueFacilityTypes(facilities), [facilities]);
  const uniqueStatuses = useMemo(() => getUniqueFacilityStatuses(), []);

  // Business operations
  const deleteFacility = useCallback(
    async (id: string): Promise<void> => {
      const facility = facilities.find((f) => f.id === id);
      if (!facility) {
        throw new Error('Facility not found');
      }

      const validation = canDeleteFacility(facility);
      if (!validation.canDelete) {
        throw new Error(validation.reason || 'Cannot delete facility');
      }

      await deleteFacilityMutation.mutateAsync(id);
    },
    [facilities, deleteFacilityMutation]
  );

  const batchDeleteFacilities = useCallback(
    async (ids: readonly string[]): Promise<void> => {
      const facilitiesToDelete = facilities.filter((f) => ids.includes(f.id));

      const validation = canBatchDeleteFacilities(facilitiesToDelete);
      if (!validation.canDelete) {
        throw new Error(validation.reason || 'Cannot delete facilities');
      }

      await Promise.all(ids.map((id) => deleteFacilityMutation.mutateAsync(id)));
      clearSelection();
    },
    [facilities, deleteFacilityMutation, clearSelection]
  );

  const updateFacilityStatus = useCallback(
    async (id: string, status: string): Promise<void> => {
      await updateFacilityMutation.mutateAsync({
        id,
        data: { status },
      });
    },
    [updateFacilityMutation]
  );

  const batchUpdateStatus = useCallback(
    async (ids: readonly string[], status: string): Promise<void> => {
      await Promise.all(
        ids.map((id) =>
          updateFacilityMutation.mutateAsync({
            id,
            data: { status },
          })
        )
      );
      clearSelection();
    },
    [updateFacilityMutation, clearSelection]
  );

  const selectAllFacilities = useCallback(() => {
    selectAll(filteredFacilities.map((f) => f.id));
  }, [filteredFacilities, selectAll]);

  return {
    // Data
    facilities,
    filteredFacilities,
    isLoading,
    error,

    // Statistics
    stats,
    uniqueTypes,
    uniqueStatuses,

    // UI State
    view,
    showFilters,
    searchTerm,
    statusFilter,
    typeFilter,
    capacityRange,
    sortBy,
    sortOrder,
    selectedFacilityIds,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleStatusFilter,
    toggleTypeFilter,
    setCapacityRange,
    toggleSort,
    toggleFacilitySelection,
    selectAllFacilities,
    clearSelection,
    resetFilters,

    // Business Operations
    deleteFacility,
    batchDeleteFacilities,
    updateFacilityStatus,
    batchUpdateStatus,

    // Validation
    canDeleteFacility,
  };
};
