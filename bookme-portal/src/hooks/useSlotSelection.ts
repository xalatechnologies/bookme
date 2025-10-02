"use client";

// External imports
import { useState, useCallback } from 'react';
import { isSameDay } from 'date-fns';

// Internal imports
import type { SelectedTimeSlot } from '@/types/booking';

interface UseSlotSelectionReturn {
  readonly selectedSlots: readonly SelectedTimeSlot[];
  readonly handleSlotClick: (zoneId: string, date: Date, timeSlot: string, availability: string) => void;
  readonly handleBulkSlotSelection: (slots: readonly SelectedTimeSlot[]) => void;
  readonly clearSelection: () => void;
  readonly isSlotSelected: (zoneId: string, date: Date, timeSlot: string) => boolean;
  readonly removeSlot: (zoneId: string, date: Date, timeSlot: string) => void;
}

export const useSlotSelection = (): UseSlotSelectionReturn => {
  const [selectedSlots, setSelectedSlots] = useState<readonly SelectedTimeSlot[]>([]);

  const handleSlotClick = useCallback((zoneId: string, date: Date, timeSlot: string, availability: string): void => {
    if (availability !== 'available') return;

    setSelectedSlots(prev => {
      const isAlreadySelected = prev.some(slot => 
        slot.zoneId === zoneId && 
        isSameDay(slot.date, date) && 
        slot.timeSlot === timeSlot
      );

      if (isAlreadySelected) {
        // Remove slot
        return prev.filter(slot => 
          !(slot.zoneId === zoneId && 
            isSameDay(slot.date, date) && 
            slot.timeSlot === timeSlot)
        );
      } else {
        // Add slot (will be filled with proper data by the calling component)
        const newSlot: SelectedTimeSlot = {
          zoneId,
          date,
          timeSlot,
          facilityId: '', // Will be filled by the calling component
          facilityName: '', // Will be filled by the calling component
          zoneName: '', // Will be filled by the calling component
          pricePerHour: 0 // Will be filled by the calling component
        };
        return [...prev, newSlot];
      }
    });
  }, []);

  const handleBulkSlotSelection = useCallback((slots: readonly SelectedTimeSlot[]): void => {
    setSelectedSlots(prev => {
      // Remove any existing slots that are in the new selection
      const filteredPrev = prev.filter(existingSlot => 
        !slots.some(newSlot => 
          newSlot.zoneId === existingSlot.zoneId &&
          isSameDay(newSlot.date, existingSlot.date) &&
          newSlot.timeSlot === existingSlot.timeSlot
        )
      );
      
      // Add the new slots
      return [...filteredPrev, ...slots];
    });
  }, []);

  const clearSelection = useCallback((): void => {
    setSelectedSlots([]);
  }, []);

  const isSlotSelected = useCallback((zoneId: string, date: Date, timeSlot: string): boolean => {
    return selectedSlots.some(slot => 
      slot.zoneId === zoneId && 
      isSameDay(slot.date, date) && 
      slot.timeSlot === timeSlot
    );
  }, [selectedSlots]);

  const removeSlot = useCallback((zoneId: string, date: Date, timeSlot: string): void => {
    setSelectedSlots(prev => 
      prev.filter(slot => 
        !(slot.zoneId === zoneId && 
          isSameDay(slot.date, date) && 
          slot.timeSlot === timeSlot)
      )
    );
  }, []);

  return {
    selectedSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    isSlotSelected,
    removeSlot
  };
};