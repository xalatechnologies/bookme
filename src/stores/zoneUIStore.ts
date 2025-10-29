/**
 * Zone UI State Management Store
 *
 * Manages UI-specific state for zone management pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TZoneView = 'list' | 'grid' | 'map';
export type TZoneSortBy = 'name' | 'capacity' | 'facility' | 'updated_at' | 'created_at';
export type TZoneSortOrder = 'asc' | 'desc';

interface IZoneUIState {
  // View state
  readonly view: TZoneView;
  readonly showFilters: boolean;

  // Search and filter state
  readonly searchTerm: string;
  readonly facilityFilter: readonly string[];
  readonly capacityRange: { readonly min: number; readonly max: number };
  readonly amenityFilter: readonly string[];

  // Sort state
  readonly sortBy: TZoneSortBy;
  readonly sortOrder: TZoneSortOrder;

  // Selection state
  readonly selectedZoneIds: readonly string[];

  // Modal state
  readonly modals: {
    readonly create: boolean;
    readonly edit: boolean;
    readonly delete: boolean;
    readonly availability: boolean;
  };
  readonly activeZoneId: string | null;

  // Actions
  readonly setView: (view: TZoneView) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly toggleFilters: () => void;

  readonly setSearchTerm: (term: string) => void;
  readonly setFacilityFilter: (facilities: readonly string[]) => void;
  readonly toggleFacilityFilter: (facility: string) => void;
  readonly setCapacityRange: (range: { readonly min: number; readonly max: number }) => void;
  readonly setAmenityFilter: (amenities: readonly string[]) => void;
  readonly toggleAmenityFilter: (amenity: string) => void;

  readonly setSortBy: (sortBy: TZoneSortBy) => void;
  readonly setSortOrder: (order: TZoneSortOrder) => void;
  readonly toggleSort: (sortBy: TZoneSortBy) => void;

  readonly selectZone: (id: string) => void;
  readonly deselectZone: (id: string) => void;
  readonly toggleZoneSelection: (id: string) => void;
  readonly selectAllZones: (ids: readonly string[]) => void;
  readonly clearSelection: () => void;

  readonly openModal: (modal: keyof IZoneUIState['modals'], zoneId?: string) => void;
  readonly closeModal: (modal: keyof IZoneUIState['modals']) => void;
  readonly closeAllModals: () => void;
  readonly setActiveZoneId: (id: string | null) => void;

  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  view: 'grid' as TZoneView,
  showFilters: false,
  searchTerm: '',
  facilityFilter: [] as readonly string[],
  capacityRange: { min: 0, max: 500 } as const,
  amenityFilter: [] as readonly string[],
  sortBy: 'name' as TZoneSortBy,
  sortOrder: 'asc' as TZoneSortOrder,
  selectedZoneIds: [] as readonly string[],
  modals: {
    create: false,
    edit: false,
    delete: false,
    availability: false,
  } as const,
  activeZoneId: null as string | null,
};

export const useZoneUIStore = create<IZoneUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setShowFilters: (showFilters) => set({ showFilters }),
        toggleFilters: () => set((state) => ({ showFilters: !state.showFilters })),

        // Search and filter actions
        setSearchTerm: (searchTerm) => set({ searchTerm }),

        setFacilityFilter: (facilityFilter) => set({ facilityFilter }),
        toggleFacilityFilter: (facility) =>
          set((state) => ({
            facilityFilter: state.facilityFilter.includes(facility)
              ? state.facilityFilter.filter((f) => f !== facility)
              : [...state.facilityFilter, facility],
          })),

        setCapacityRange: (capacityRange) => set({ capacityRange }),

        setAmenityFilter: (amenityFilter) => set({ amenityFilter }),
        toggleAmenityFilter: (amenity) =>
          set((state) => ({
            amenityFilter: state.amenityFilter.includes(amenity)
              ? state.amenityFilter.filter((a) => a !== amenity)
              : [...state.amenityFilter, amenity],
          })),

        // Sort actions
        setSortBy: (sortBy) => set({ sortBy }),
        setSortOrder: (sortOrder) => set({ sortOrder }),
        toggleSort: (sortBy) =>
          set((state) => ({
            sortBy,
            sortOrder: state.sortBy === sortBy && state.sortOrder === 'asc' ? 'desc' : 'asc',
          })),

        // Selection actions
        selectZone: (id) =>
          set((state) => ({
            selectedZoneIds: [...state.selectedZoneIds, id],
          })),

        deselectZone: (id) =>
          set((state) => ({
            selectedZoneIds: state.selectedZoneIds.filter((zId) => zId !== id),
          })),

        toggleZoneSelection: (id) =>
          set((state) => ({
            selectedZoneIds: state.selectedZoneIds.includes(id)
              ? state.selectedZoneIds.filter((zId) => zId !== id)
              : [...state.selectedZoneIds, id],
          })),

        selectAllZones: (ids) => set({ selectedZoneIds: ids }),

        clearSelection: () => set({ selectedZoneIds: [] }),

        // Modal actions
        openModal: (modal, zoneId) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
            activeZoneId: zoneId ?? state.activeZoneId,
          })),

        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          })),

        closeAllModals: () =>
          set({
            modals: {
              create: false,
              edit: false,
              delete: false,
              availability: false,
            },
            activeZoneId: null,
          }),

        setActiveZoneId: (activeZoneId) => set({ activeZoneId }),

        // Reset actions
        resetFilters: () =>
          set({
            searchTerm: '',
            facilityFilter: [],
            capacityRange: { min: 0, max: 500 },
            amenityFilter: [],
          }),

        resetAll: () => set(initialState),
      }),
      {
        name: 'zone-ui-store',
        version: 1,
      }
    ),
    { name: 'ZoneUIStore' }
  )
);
