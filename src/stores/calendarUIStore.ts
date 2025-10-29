/**
 * Calendar UI State Management Store
 *
 * Manages UI-specific state for calendar and booking views.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TCalendarView = 'month' | 'week' | 'day' | 'list';
export type TBookingStatus = 'available' | 'booked' | 'pending' | 'completed' | 'cancelled';
export type TSlotDuration = 15 | 30 | 60;

interface ITimeSlot {
  readonly id: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly date: string;
  readonly facilityId?: string;
}

interface ITimeRange {
  readonly start: number;
  readonly end: number;
}

interface ICalendarUIState {
  // View state
  readonly view: TCalendarView;
  readonly currentDate: string;
  readonly selectedDate: string;

  // Filter state
  readonly facilityFilter: readonly string[];
  readonly statusFilter: readonly TBookingStatus[];
  readonly showWeekends: boolean;
  readonly showOnlyAvailable: boolean;

  // Time settings
  readonly businessHoursStart: number;
  readonly businessHoursEnd: number;
  readonly slotDuration: TSlotDuration;

  // Selection state
  readonly selectedSlots: readonly ITimeSlot[];
  readonly dragSelectionMode: boolean;

  // Modal state
  readonly quickBookModal: { readonly isOpen: boolean; readonly slotId?: string };
  readonly slotDetailsModal: { readonly isOpen: boolean; readonly slotId?: string };
  readonly availabilityModal: { readonly isOpen: boolean; readonly facilityId?: string };

  // Display options
  readonly showMiniCalendar: boolean;
  readonly showLegend: boolean;
  readonly highlightToday: boolean;

  // View actions
  readonly setView: (view: TCalendarView) => void;
  readonly setCurrentDate: (date: string) => void;
  readonly setSelectedDate: (date: string) => void;

  // Filter actions
  readonly setFacilityFilter: (facilities: readonly string[]) => void;
  readonly toggleFacilityFilter: (facilityId: string) => void;
  readonly setStatusFilter: (statuses: readonly TBookingStatus[]) => void;
  readonly toggleStatusFilter: (status: TBookingStatus) => void;
  readonly setShowWeekends: (show: boolean) => void;
  readonly toggleShowWeekends: () => void;
  readonly setShowOnlyAvailable: (show: boolean) => void;
  readonly toggleShowOnlyAvailable: () => void;

  // Time settings actions
  readonly setBusinessHours: (start: number, end: number) => void;
  readonly setBusinessHoursStart: (hours: number) => void;
  readonly setBusinessHoursEnd: (hours: number) => void;
  readonly setSlotDuration: (duration: TSlotDuration) => void;

  // Selection actions
  readonly addSlot: (slot: ITimeSlot) => void;
  readonly removeSlot: (slotId: string) => void;
  readonly toggleSlot: (slot: ITimeSlot) => void;
  readonly clearSelectedSlots: () => void;
  readonly selectSlots: (slots: readonly ITimeSlot[]) => void;
  readonly setDragSelectionMode: (enabled: boolean) => void;
  readonly toggleDragSelectionMode: () => void;

  // Modal actions
  readonly openQuickBookModal: (slotId: string) => void;
  readonly closeQuickBookModal: () => void;
  readonly openSlotDetailsModal: (slotId: string) => void;
  readonly closeSlotDetailsModal: () => void;
  readonly openAvailabilityModal: (facilityId: string) => void;
  readonly closeAvailabilityModal: () => void;

  // Display options actions
  readonly setShowMiniCalendar: (show: boolean) => void;
  readonly toggleShowMiniCalendar: () => void;
  readonly setShowLegend: (show: boolean) => void;
  readonly toggleShowLegend: () => void;
  readonly setHighlightToday: (highlight: boolean) => void;
  readonly toggleHighlightToday: () => void;

  // Reset actions
  readonly resetFilters: () => void;
  readonly resetAll: () => void;
}

const initialState = {
  // View state
  view: 'month' as TCalendarView,
  currentDate: new Date().toISOString().split('T')[0],
  selectedDate: new Date().toISOString().split('T')[0],

  // Filter state
  facilityFilter: [] as readonly string[],
  statusFilter: [] as readonly TBookingStatus[],
  showWeekends: true,
  showOnlyAvailable: false,

  // Time settings
  businessHoursStart: 8,
  businessHoursEnd: 18,
  slotDuration: 30 as TSlotDuration,

  // Selection state
  selectedSlots: [] as readonly ITimeSlot[],
  dragSelectionMode: false,

  // Modal state
  quickBookModal: { isOpen: false } as const,
  slotDetailsModal: { isOpen: false } as const,
  availabilityModal: { isOpen: false } as const,

  // Display options
  showMiniCalendar: true,
  showLegend: true,
  highlightToday: true,
};

export const useCalendarUIStore = create<ICalendarUIState>()(
  persist(
    devtools(
      (set) => ({
        ...initialState,

        // View actions
        setView: (view) => set({ view }),
        setCurrentDate: (currentDate) => set({ currentDate }),
        setSelectedDate: (selectedDate) => set({ selectedDate }),

        // Filter actions
        setFacilityFilter: (facilityFilter) => set({ facilityFilter }),
        toggleFacilityFilter: (facilityId) =>
          set((state) => ({
            facilityFilter: state.facilityFilter.includes(facilityId)
              ? state.facilityFilter.filter((id) => id !== facilityId)
              : [...state.facilityFilter, facilityId],
          })),

        setStatusFilter: (statusFilter) => set({ statusFilter }),
        toggleStatusFilter: (status) =>
          set((state) => ({
            statusFilter: state.statusFilter.includes(status)
              ? state.statusFilter.filter((s) => s !== status)
              : [...state.statusFilter, status],
          })),

        setShowWeekends: (showWeekends) => set({ showWeekends }),
        toggleShowWeekends: () =>
          set((state) => ({ showWeekends: !state.showWeekends })),

        setShowOnlyAvailable: (showOnlyAvailable) => set({ showOnlyAvailable }),
        toggleShowOnlyAvailable: () =>
          set((state) => ({ showOnlyAvailable: !state.showOnlyAvailable })),

        // Time settings actions
        setBusinessHours: (businessHoursStart, businessHoursEnd) =>
          set({ businessHoursStart, businessHoursEnd }),
        setBusinessHoursStart: (businessHoursStart) => set({ businessHoursStart }),
        setBusinessHoursEnd: (businessHoursEnd) => set({ businessHoursEnd }),
        setSlotDuration: (slotDuration) => set({ slotDuration }),

        // Selection actions
        addSlot: (slot) =>
          set((state) => ({
            selectedSlots: [...state.selectedSlots, slot],
          })),

        removeSlot: (slotId) =>
          set((state) => ({
            selectedSlots: state.selectedSlots.filter((slot) => slot.id !== slotId),
          })),

        toggleSlot: (slot) =>
          set((state) => ({
            selectedSlots: state.selectedSlots.find((s) => s.id === slot.id)
              ? state.selectedSlots.filter((s) => s.id !== slot.id)
              : [...state.selectedSlots, slot],
          })),

        clearSelectedSlots: () => set({ selectedSlots: [] }),

        selectSlots: (selectedSlots) => set({ selectedSlots }),

        setDragSelectionMode: (dragSelectionMode) => set({ dragSelectionMode }),
        toggleDragSelectionMode: () =>
          set((state) => ({ dragSelectionMode: !state.dragSelectionMode })),

        // Modal actions
        openQuickBookModal: (slotId) =>
          set({ quickBookModal: { isOpen: true, slotId } }),
        closeQuickBookModal: () =>
          set({ quickBookModal: { isOpen: false } }),

        openSlotDetailsModal: (slotId) =>
          set({ slotDetailsModal: { isOpen: true, slotId } }),
        closeSlotDetailsModal: () =>
          set({ slotDetailsModal: { isOpen: false } }),

        openAvailabilityModal: (facilityId) =>
          set({ availabilityModal: { isOpen: true, facilityId } }),
        closeAvailabilityModal: () =>
          set({ availabilityModal: { isOpen: false } }),

        // Display options actions
        setShowMiniCalendar: (showMiniCalendar) => set({ showMiniCalendar }),
        toggleShowMiniCalendar: () =>
          set((state) => ({ showMiniCalendar: !state.showMiniCalendar })),

        setShowLegend: (showLegend) => set({ showLegend }),
        toggleShowLegend: () =>
          set((state) => ({ showLegend: !state.showLegend })),

        setHighlightToday: (highlightToday) => set({ highlightToday }),
        toggleHighlightToday: () =>
          set((state) => ({ highlightToday: !state.highlightToday })),

        // Reset actions
        resetFilters: () =>
          set({
            facilityFilter: [],
            statusFilter: [],
            showWeekends: true,
            showOnlyAvailable: false,
          }),

        resetAll: () => set(initialState),
      }),
      { name: 'CalendarUIStore' }
    ),
    {
      name: 'calendar-ui-store',
      version: 1,
    }
  )
);
