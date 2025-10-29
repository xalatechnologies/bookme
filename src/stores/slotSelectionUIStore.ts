/**
 * Slot Selection UI State Management Store
 *
 * Manages UI-specific state for time slot selection and management.
 * Separated from business logic and booking operations.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TBookingType = 'single' | 'recurring';

export interface ITimeSlot {
  readonly id: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly available: boolean;
  readonly date: string;
}

export interface ISlotConflictWarning {
  readonly slotId: string;
  readonly conflictType: 'overlap' | 'double_booking' | 'invalid_time';
  readonly message: string;
}

interface ISlotSelectionUIState {
  // Facility context
  readonly currentFacilityId: string | null;

  // Selection state
  readonly selectedSlots: readonly ITimeSlot[];
  readonly dragSelectionMode: boolean;
  readonly multiSelectEnabled: boolean;

  // Booking configuration
  readonly bookingType: TBookingType;

  // Conflict warnings
  readonly conflictWarnings: readonly ISlotConflictWarning[];

  // Facility context actions
  readonly setCurrentFacilityId: (id: string | null) => void;

  // Slot selection actions
  readonly addSelectedSlot: (slot: ITimeSlot) => void;
  readonly removeSelectedSlot: (slotId: string) => void;
  readonly toggleSelectedSlot: (slot: ITimeSlot) => void;
  readonly selectMultipleSlots: (slots: readonly ITimeSlot[]) => void;
  readonly clearSelectedSlots: () => void;
  readonly setSelectedSlots: (slots: readonly ITimeSlot[]) => void;

  // Drag selection actions
  readonly setDragSelectionMode: (enabled: boolean) => void;
  readonly enableDragSelection: () => void;
  readonly disableDragSelection: () => void;

  // Multi-select actions
  readonly setMultiSelectEnabled: (enabled: boolean) => void;
  readonly toggleMultiSelect: () => void;

  // Booking type actions
  readonly setBookingType: (type: TBookingType) => void;

  // Conflict warning actions
  readonly addConflictWarning: (warning: ISlotConflictWarning) => void;
  readonly removeConflictWarning: (slotId: string) => void;
  readonly clearConflictWarnings: () => void;
  readonly setConflictWarnings: (warnings: readonly ISlotConflictWarning[]) => void;

  // Reset actions
  readonly resetAll: () => void;
}

const initialState = {
  currentFacilityId: null as string | null,
  selectedSlots: [] as readonly ITimeSlot[],
  dragSelectionMode: false,
  multiSelectEnabled: false,
  bookingType: 'single' as TBookingType,
  conflictWarnings: [] as readonly ISlotConflictWarning[],
};

export const useSlotSelectionUIStore = create<ISlotSelectionUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Facility context actions
        setCurrentFacilityId: (id) => set({ currentFacilityId: id }),

        // Slot selection actions
        addSelectedSlot: (slot) =>
          set((state) => {
            const slotExists = state.selectedSlots.some((s) => s.id === slot.id);
            if (slotExists) return state;

            return {
              selectedSlots: [...state.selectedSlots, slot],
            };
          }),

        removeSelectedSlot: (slotId) =>
          set((state) => ({
            selectedSlots: state.selectedSlots.filter((s) => s.id !== slotId),
          })),

        toggleSelectedSlot: (slot) =>
          set((state) => {
            const isSelected = state.selectedSlots.some((s) => s.id === slot.id);

            if (isSelected) {
              return {
                selectedSlots: state.selectedSlots.filter((s) => s.id !== slot.id),
              };
            }

            return {
              selectedSlots: [...state.selectedSlots, slot],
            };
          }),

        selectMultipleSlots: (slots) =>
          set((state) => {
            const existingIds = new Set(state.selectedSlots.map((s) => s.id));
            const newSlots = slots.filter((slot) => !existingIds.has(slot.id));

            return {
              selectedSlots: [...state.selectedSlots, ...newSlots],
            };
          }),

        clearSelectedSlots: () => set({ selectedSlots: [] }),

        setSelectedSlots: (slots) => set({ selectedSlots: slots }),

        // Drag selection actions
        setDragSelectionMode: (enabled) => set({ dragSelectionMode: enabled }),

        enableDragSelection: () => set({ dragSelectionMode: true }),

        disableDragSelection: () => set({ dragSelectionMode: false }),

        // Multi-select actions
        setMultiSelectEnabled: (enabled) => set({ multiSelectEnabled: enabled }),

        toggleMultiSelect: () =>
          set((state) => ({
            multiSelectEnabled: !state.multiSelectEnabled,
          })),

        // Booking type actions
        setBookingType: (type) => set({ bookingType: type }),

        // Conflict warning actions
        addConflictWarning: (warning) =>
          set((state) => {
            const warningExists = state.conflictWarnings.some(
              (w) => w.slotId === warning.slotId && w.conflictType === warning.conflictType
            );

            if (warningExists) return state;

            return {
              conflictWarnings: [...state.conflictWarnings, warning],
            };
          }),

        removeConflictWarning: (slotId) =>
          set((state) => ({
            conflictWarnings: state.conflictWarnings.filter((w) => w.slotId !== slotId),
          })),

        clearConflictWarnings: () => set({ conflictWarnings: [] }),

        setConflictWarnings: (warnings) => set({ conflictWarnings: warnings }),

        // Reset actions
        resetAll: () => set(initialState),
      }),
      {
        name: 'slot-selection-ui-store',
        version: 1,
      }
    ),
    { name: 'SlotSelectionUIStore' }
  )
);
