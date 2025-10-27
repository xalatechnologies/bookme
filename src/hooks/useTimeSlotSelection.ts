import { useState, useCallback } from 'react';

export interface TimeSlot {
  readonly id: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly zoneId: string;
  readonly facilityId: string;
  readonly duration: number; // in minutes
  readonly pricePerHour: number;
}

interface UseTimeSlotSelectionReturn {
  readonly selectedSlots: readonly TimeSlot[];
  readonly toggleSlot: (slot: TimeSlot) => void;
  readonly addSlot: (slot: TimeSlot) => void;
  readonly removeSlot: (slotId: string) => void;
  readonly clearSelection: () => void;
  readonly isSlotSelected: (slotId: string) => boolean;
  readonly getTotalDuration: () => number;
  readonly getTotalPrice: () => number;
}

/**
 * Custom hook for managing time slot selection
 *
 * Provides state management for selecting and managing time slots
 * with proper TypeScript types and memoized calculations.
 *
 * Features:
 * - Multi-slot selection
 * - Toggle slot selection
 * - Add/remove slots
 * - Clear all selections
 * - Check if slot is selected
 * - Calculate total duration
 * - Calculate total price
 *
 * @returns Time slot selection state and actions
 */
export const useTimeSlotSelection = (): UseTimeSlotSelectionReturn => {
  const [selectedSlots, setSelectedSlots] = useState<readonly TimeSlot[]>([]);

  /**
   * Toggle slot selection
   *
   * @param slot - Time slot to toggle
   */
  const toggleSlot = useCallback((slot: TimeSlot): void => {
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.id === slot.id);
      if (exists) {
        return prev.filter(s => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  }, []);

  /**
   * Add slot to selection
   *
   * @param slot - Time slot to add
   */
  const addSlot = useCallback((slot: TimeSlot): void => {
    setSelectedSlots(prev => {
      const exists = prev.some(s => s.id === slot.id);
      if (exists) return prev;
      return [...prev, slot];
    });
  }, []);

  /**
   * Remove slot from selection
   *
   * @param slotId - ID of slot to remove
   */
  const removeSlot = useCallback((slotId: string): void => {
    setSelectedSlots(prev => prev.filter(s => s.id !== slotId));
  }, []);

  /**
   * Clear all selected slots
   */
  const clearSelection = useCallback((): void => {
    setSelectedSlots([]);
  }, []);

  /**
   * Check if slot is selected
   *
   * @param slotId - ID of slot to check
   * @returns True if slot is selected
   */
  const isSlotSelected = useCallback((slotId: string): boolean => {
    return selectedSlots.some(s => s.id === slotId);
  }, [selectedSlots]);

  /**
   * Calculate total duration of selected slots
   *
   * @returns Total duration in minutes
   */
  const getTotalDuration = useCallback((): number => {
    return selectedSlots.reduce((total, slot) => total + slot.duration, 0);
  }, [selectedSlots]);

  /**
   * Calculate total price of selected slots
   *
   * @returns Total price
   */
  const getTotalPrice = useCallback((): number => {
    return selectedSlots.reduce((total, slot) => {
      const hours = slot.duration / 60;
      return total + (slot.pricePerHour * hours);
    }, 0);
  }, [selectedSlots]);

  return {
    selectedSlots,
    toggleSlot,
    addSlot,
    removeSlot,
    clearSelection,
    isSlotSelected,
    getTotalDuration,
    getTotalPrice,
  };
};
