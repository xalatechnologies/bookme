"use client";

// External imports
import { useState, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';

// Internal imports
import type { DragState, SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';

interface UseDragSelectionReturn {
  readonly dragState: DragState;
  readonly startDrag: (zoneId: string, date: Date, timeSlot: string, event: React.MouseEvent) => void;
  readonly updateDrag: (zoneId: string, date: Date, timeSlot: string, timeSlots: readonly string[], weekDays: readonly Date[], getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => AvailabilityStatus) => void;
  readonly endDrag: () => readonly SelectedTimeSlot[];
  readonly cancelDrag: () => void;
  readonly isSlotInPreview: (zoneId: string, date: Date, timeSlot: string) => boolean;
}

export const useDragSelection = (): UseDragSelectionReturn => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    previewSlots: []
  });

  const startDrag = useCallback((zoneId: string, date: Date, timeSlot: string, event: React.MouseEvent): void => {
    event.preventDefault();
    setDragState({
      isDragging: true,
      startSlot: { zoneId, date, timeSlot },
      previewSlots: []
    });
  }, []);

  const updateDrag = useCallback((
    zoneId: string, 
    date: Date, 
    timeSlot: string, 
    timeSlots: readonly string[], 
    weekDays: readonly Date[],
    getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => AvailabilityStatus
  ): void => {
    if (!dragState.isDragging || !dragState.startSlot) return;

    // Simple implementation - just add current slot to preview
    setDragState(prev => ({
      ...prev,
      previewSlots: [{
        zoneId,
        date,
        timeSlot,
        facilityId: '',
        facilityName: '',
        zoneName: '',
        pricePerHour: 0
      }]
    }));
  }, [dragState.isDragging, dragState.startSlot]);

  const endDrag = useCallback((): readonly SelectedTimeSlot[] => {
    const previewSlots = dragState.previewSlots;
    setDragState({
      isDragging: false,
      previewSlots: []
    });
    return previewSlots;
  }, [dragState.previewSlots]);

  const cancelDrag = useCallback((): void => {
    setDragState({
      isDragging: false,
      previewSlots: []
    });
  }, []);

  const isSlotInPreview = useCallback((zoneId: string, date: Date, timeSlot: string): boolean => {
    return dragState.previewSlots.some(slot => 
      slot.zoneId === zoneId && 
      isSameDay(slot.date, date) && 
      slot.timeSlot === timeSlot
    );
  }, [dragState.previewSlots]);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    isSlotInPreview
  };
};
