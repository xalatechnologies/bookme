import { useState, useCallback } from 'react';
import type { IBookingEvent } from '@/types/calendar';

interface UseEventHandlingReturn {
  readonly selectedEvent: IBookingEvent | null;
  readonly hoveredEvent: IBookingEvent | null;
  readonly isDragging: boolean;
  readonly setSelectedEvent: (event: IBookingEvent | null) => void;
  readonly setHoveredEvent: (event: IBookingEvent | null) => void;
  readonly setIsDragging: (dragging: boolean) => void;
  readonly handleEventClick: (event: IBookingEvent) => void;
  readonly handleEventHover: (event: IBookingEvent | null) => void;
  readonly handleEventDragStart: (event: IBookingEvent) => void;
  readonly handleEventDragEnd: () => void;
  readonly clearSelection: () => void;
}

/**
 * Custom hook for managing event interactions
 *
 * Provides state management for event selection, hovering, and dragging
 * with proper TypeScript types and memoized callbacks.
 *
 * Features:
 * - Event selection
 * - Event hovering (for tooltips)
 * - Drag and drop state
 * - Click handling
 * - Keyboard navigation support
 *
 * @returns Event handling state and actions
 */
export const useEventHandling = (): UseEventHandlingReturn => {
  const [selectedEvent, setSelectedEvent] = useState<IBookingEvent | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<IBookingEvent | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  /**
   * Handle event click
   *
   * @param event - Clicked booking event
   */
  const handleEventClick = useCallback((event: IBookingEvent): void => {
    // Don't select if dragging
    if (isDragging) return;

    setSelectedEvent(prev => prev?.id === event.id ? null : event);
  }, [isDragging]);

  /**
   * Handle event hover (for tooltips)
   *
   * @param event - Hovered booking event or null
   */
  const handleEventHover = useCallback((event: IBookingEvent | null): void => {
    // Don't show tooltip while dragging
    if (isDragging) return;

    setHoveredEvent(event);
  }, [isDragging]);

  /**
   * Handle event drag start
   *
   * @param event - Event being dragged
   */
  const handleEventDragStart = useCallback((event: IBookingEvent): void => {
    setIsDragging(true);
    setSelectedEvent(event);
    setHoveredEvent(null); // Clear tooltip during drag
  }, []);

  /**
   * Handle event drag end
   */
  const handleEventDragEnd = useCallback((): void => {
    setIsDragging(false);
  }, []);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback((): void => {
    setSelectedEvent(null);
    setHoveredEvent(null);
    setIsDragging(false);
  }, []);

  return {
    selectedEvent,
    hoveredEvent,
    isDragging,
    setSelectedEvent,
    setHoveredEvent,
    setIsDragging,
    handleEventClick,
    handleEventHover,
    handleEventDragStart,
    handleEventDragEnd,
    clearSelection,
  };
};
