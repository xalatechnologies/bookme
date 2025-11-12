import { useState, useCallback, useMemo } from 'react';
import type { IBookingEvent } from '@/types/calendar';

interface CalendarEnhancementsState {
  readonly searchQuery: string;
  readonly selectedFacilities: readonly string[];
  readonly selectedStatuses: readonly string[];
  readonly hoveredEvent: IBookingEvent | null;
  readonly contextMenuEvent: IBookingEvent | null;
  readonly contextMenuPosition: { x: number; y: number } | null;
  readonly isLoading: boolean;
  readonly lastRefresh: Date | null;
}

interface CalendarEnhancementsActions {
  readonly setSearchQuery: (query: string) => void;
  readonly setSelectedFacilities: (facilities: readonly string[]) => void;
  readonly setSelectedStatuses: (statuses: readonly string[]) => void;
  readonly setHoveredEvent: (event: IBookingEvent | null) => void;
  readonly setContextMenuEvent: (event: IBookingEvent | null) => void;
  readonly setContextMenuPosition: (position: { x: number; y: number } | null) => void;
  readonly setIsLoading: (loading: boolean) => void;
  readonly setLastRefresh: (date: Date | null) => void;
  readonly clearAllFilters: () => void;
  readonly handleEventClick: (event: IBookingEvent) => void;
  readonly handleEventRightClick: (event: IBookingEvent, position: { x: number; y: number }) => void;
  readonly handleContextMenuClose: () => void;
  readonly refreshCalendar: () => Promise<void>;
}

export const useCalendarEnhancements = (): CalendarEnhancementsState & CalendarEnhancementsActions => {
  const [state, setState] = useState<CalendarEnhancementsState>({
    searchQuery: '',
    selectedFacilities: [],
    selectedStatuses: [],
    hoveredEvent: null,
    contextMenuEvent: null,
    contextMenuPosition: null,
    isLoading: false,
    lastRefresh: null
  });

  const setSearchQuery = useCallback((query: string): void => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedFacilities = useCallback((facilities: readonly string[]): void => {
    setState(prev => ({ ...prev, selectedFacilities: facilities }));
  }, []);

  const setSelectedStatuses = useCallback((statuses: readonly string[]): void => {
    setState(prev => ({ ...prev, selectedStatuses: statuses }));
  }, []);

  const setHoveredEvent = useCallback((event: IBookingEvent | null): void => {
    setState(prev => ({ ...prev, hoveredEvent: event }));
  }, []);

  const setContextMenuEvent = useCallback((event: IBookingEvent | null): void => {
    setState(prev => ({ ...prev, contextMenuEvent: event }));
  }, []);

  const setContextMenuPosition = useCallback((position: { x: number; y: number } | null): void => {
    setState(prev => ({ ...prev, contextMenuPosition: position }));
  }, []);

  const setIsLoading = useCallback((loading: boolean): void => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setLastRefresh = useCallback((date: Date | null): void => {
    setState(prev => ({ ...prev, lastRefresh: date }));
  }, []);

  const clearAllFilters = useCallback((): void => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      selectedFacilities: [],
      selectedStatuses: []
    }));
  }, []);

  const handleEventClick = useCallback((_event: IBookingEvent): void => {
    // This will be handled by the parent component
  }, []);

  const handleEventRightClick = useCallback((event: IBookingEvent, position: { x: number; y: number }): void => {
    setState(prev => ({
      ...prev,
      contextMenuEvent: event,
      contextMenuPosition: position
    }));
  }, []);

  const handleContextMenuClose = useCallback((): void => {
    setState(prev => ({
      ...prev,
      contextMenuEvent: null,
      contextMenuPosition: null
    }));
  }, []);

  const refreshCalendar = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastRefresh(new Date());
    } catch (_error: unknown) {
      // Error handling can be added here if needed
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setLastRefresh]);

  return {
    ...state,
    setSearchQuery,
    setSelectedFacilities,
    setSelectedStatuses,
    setHoveredEvent,
    setContextMenuEvent,
    setContextMenuPosition,
    setIsLoading,
    setLastRefresh,
    clearAllFilters,
    handleEventClick,
    handleEventRightClick,
    handleContextMenuClose,
    refreshCalendar
  };
};

// Hook for filtering events
export const useFilteredEvents = (
  events: readonly IBookingEvent[],
  searchQuery: string,
  selectedFacilities: readonly string[],
  selectedStatuses: readonly string[]
): readonly IBookingEvent[] => {
  return useMemo(() => {
    return events.filter(event => {
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !event.facilityName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Facility filter
      if (selectedFacilities.length > 0 && !selectedFacilities.includes(event.facilityName)) {
        return false;
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(event.status)) {
        return false;
      }

      return true;
    });
  }, [events, searchQuery, selectedFacilities, selectedStatuses]);
};

// Hook for getting unique facilities from events
export const useAvailableFacilities = (events: readonly IBookingEvent[]): readonly string[] => {
  return useMemo(() => {
    const facilities = new Set(events.map(event => event.facilityName));
    return Array.from(facilities).sort();
  }, [events]);
};
