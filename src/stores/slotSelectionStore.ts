"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { ISelectedTimeSlot } from "@/components/features/bookings/types";
import { RecurringTimeSlot, RecurrencePattern } from "@/utils/recurrenceEngine";
import { recurrenceEngine } from "@/utils/recurrenceEngine";

/**
 * Slot selection state interface
 */
interface ISlotSelectionState {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly recurringSlots: readonly RecurringTimeSlot[];
  
  // Actions
  readonly addSlot: (slot: ISelectedTimeSlot) => void;
  readonly removeSlot: (zoneId: string, date: Date, timeSlot: string) => void;
  readonly clearSelection: () => void;
  readonly setSelectedSlots: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly addRecurringSlots: (slots: readonly RecurringTimeSlot[]) => void;
  readonly clearRecurringSlots: () => void;
  readonly generateRecurringSlots: (
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    facilityId: string,
    pricePerHour: number,
    maxOccurrences?: number
  ) => void;
  readonly getAllSlots: () => readonly ISelectedTimeSlot[];
  readonly isSlotSelected: (zoneId: string, date: Date, timeSlot: string) => boolean;
}

/**
 * Ensure date is a proper Date object
 * 
 * @param date - Date or string to normalize
 * @returns Normalized Date object
 */
const ensureDate = (date: Date | string): Date => {
  if (date instanceof Date) {
    return date;
  }
  
  if (typeof date === 'string') {
    return new Date(date);
  }
  
  if (typeof date === 'number') {
    return new Date(date);
  }
  
  return new Date();
};

/**
 * Slot selection store using Zustand with persistence
 * 
 * Manages the state of selected time slots for facility reservations.
 * Provides full CRUD operations for slot selection with automatic
 * persistence to localStorage.
 * 
 * Features:
 * - Add/remove/update selected slots
 * - Recurring slot management
 * - Persistence to localStorage
 * - DevTools support for debugging
 * - Type-safe operations with readonly interfaces
 * 
 * Usage:
 * - Use addSlot() to add a new slot to selection
 * - Use removeSlot() to remove a specific slot
 * - Use clearSelection() to clear all selections
 * - Use isSlotSelected() to check if a slot is selected
 */
export const useSlotSelectionStore = create<ISlotSelectionState>()(
  devtools(
    persist(
      (set, get) => ({
        selectedSlots: [],
        recurringSlots: [],

        /**
         * Add a slot to the selection
         * 
         * @param slot - Slot to add
         */
        addSlot: (slot: ISelectedTimeSlot): void => {
          const currentSlots = get().selectedSlots;
          
          // Check if slot already exists - optimized with early returns
          const exists = currentSlots.some(existingSlot => {
            // Fast path: check zoneId and timeSlot first
            if (existingSlot.zoneId !== slot.zoneId || existingSlot.timeSlot !== slot.timeSlot) {
              return false;
            }
            
            // Only parse dates if other checks pass
            const existingDate = ensureDate(existingSlot.date);
            const newDate = ensureDate(slot.date);
            return existingDate.toDateString() === newDate.toDateString();
          });
          
          if (!exists) {
            const normalizedSlot = {
              ...slot,
              date: ensureDate(slot.date)
            };
            
            set({
              selectedSlots: [...currentSlots, normalizedSlot]
            });
          }
        },

        /**
         * Remove a slot from the selection
         * 
         * @param zoneId - Zone ID
         * @param date - Date of the slot
         * @param timeSlot - Time slot string
         */
        removeSlot: (zoneId: string, date: Date, timeSlot: string): void => {
          const currentSlots = get().selectedSlots;
          const slotDate = ensureDate(date);
          
          const filteredSlots = currentSlots.filter(slot => {
            // Fast path: check zoneId and timeSlot first
            if (slot.zoneId !== zoneId || slot.timeSlot !== timeSlot) {
              return true; // Keep this slot
            }
            
            // Only parse date if other checks pass
            const existingDate = ensureDate(slot.date);
            return existingDate.toDateString() !== slotDate.toDateString();
          });
          
          set({
            selectedSlots: filteredSlots
          });
        },

        /**
         * Clear all selected slots
         */
        clearSelection: (): void => {
          set({
            selectedSlots: []
          });
          
        },

        /**
         * Set selected slots (for external control)
         * 
         * @param slots - Array of slots to set
         */
        setSelectedSlots: (slots: readonly ISelectedTimeSlot[]): void => {
          // Ensure all dates are Date objects
          const normalizedSlots = slots.map(slot => ({
            ...slot,
            date: ensureDate(slot.date)
          }));
          
          set({
            selectedSlots: normalizedSlots
          });
          
        },

        /**
         * Add recurring slots
         * 
         * @param slots - Array of recurring slots to add
         */
        addRecurringSlots: (slots: readonly RecurringTimeSlot[]): void => {
          set({
            recurringSlots: [...get().recurringSlots, ...slots]
          });
          
        },

        /**
         * Clear all recurring slots
         */
        clearRecurringSlots: (): void => {
          set({
            recurringSlots: []
          });
          
        },

        /**
         * Generate recurring slots from a pattern
         * 
         * @param pattern - Recurrence pattern
         * @param startDate - Start date for generation
         * @param zoneId - Zone ID
         * @param facilityId - Facility ID
         * @param pricePerHour - Price per hour
         * @param maxOccurrences - Maximum occurrences to generate
         */
        generateRecurringSlots: (
          pattern: RecurrencePattern,
          startDate: Date,
          zoneId: string,
          facilityId: string,
          pricePerHour: number,
          maxOccurrences: number = 52
        ): void => {
          const generatedSlots = recurrenceEngine.generateOccurrences(
            pattern,
            startDate,
            zoneId,
            facilityId,
            pricePerHour,
            maxOccurrences
          );
          
          set({
            recurringSlots: generatedSlots
          });
          
        },

        /**
         * Get all slots (regular + recurring)
         * 
         * @returns Combined array of all slots
         */
        getAllSlots: (): readonly ISelectedTimeSlot[] => {
          const regularSlots = get().selectedSlots.map(slot => ({
            ...slot,
            isRecurring: false
          }));
          
          const recurringSlotsConverted = get().recurringSlots.map(slot => ({
            id: slot.id,
            zoneId: slot.zoneId,
            date: slot.date,
            timeSlot: slot.timeSlot,
            facilityId: slot.facilityId,
            facilityName: '', // Will be filled by parent component
            zoneName: '', // Will be filled by parent component
            pricePerHour: slot.pricePerHour,
            duration: slot.duration,
            isRecurring: slot.isRecurring,
            recurrencePattern: slot.recurrencePattern,
            parentBookingId: slot.parentBookingId
          }));
          
          const allSlots = [...regularSlots, ...recurringSlotsConverted];
          
          
          return allSlots;
        },

        /**
         * Check if a slot is selected
         * 
         * @param zoneId - Zone ID
         * @param date - Date of the slot
         * @param timeSlot - Time slot string
         * @returns True if the slot is selected
         */
        isSlotSelected: (zoneId: string, date: Date, timeSlot: string): boolean => {
          const currentSlots = get().selectedSlots;
          const slotDate = ensureDate(date);
          
          return currentSlots.some(slot => {
            // Fast path: check zoneId and timeSlot first
            if (slot.zoneId !== zoneId || slot.timeSlot !== timeSlot) {
              return false;
            }
            
            // Only parse date if other checks pass
            const existingDate = ensureDate(slot.date);
            return existingDate.toDateString() === slotDate.toDateString();
          });
        },
      }),
      {
        name: "slot-selection-store", // localStorage key
        version: 1, // Version for migration if needed
      }
    ),
    {
      name: "slot-selection-store", // DevTools name
    }
  )
);

export type { ISlotSelectionState };
