"use client";

import { useState, useMemo, useCallback } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import type { IBookingEventWithMeta, IRawBookingData } from '@/types/calendar';

interface IDateRange {
  readonly from: string;
  readonly to: string;
}

interface IUseCalendarPageManagementReturn {
  readonly events: readonly IBookingEventWithMeta[];
  readonly isLoading: boolean;
  readonly view: 'month' | 'week' | 'day';
  readonly currentDate: Date;
  readonly selectedEvent: IBookingEventWithMeta | null;
  readonly setView: (view: 'month' | 'week' | 'day') => void;
  readonly setCurrentDate: (date: Date) => void;
  readonly setSelectedEvent: (event: IBookingEventWithMeta | null) => void;
  readonly handleEventClick: (event: IBookingEventWithMeta) => void;
  readonly handleEventEdit: (event: IBookingEventWithMeta) => void;
  readonly handleEventDelete: (event: IBookingEventWithMeta) => void;
  readonly handleEventCopy: (event: IBookingEventWithMeta) => void;
  readonly handleEventShare: (event: IBookingEventWithMeta) => void;
  readonly handleEventAddToCalendar: (event: IBookingEventWithMeta) => void;
}

/**
 * Calculate date range based on view and current date
 */
const calculateDateRange = (view: 'month' | 'week' | 'day', currentDate: Date): IDateRange => {
  if (view === 'week') {
    return {
      from: startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
      to: endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
    };
  }

  if (view === 'day') {
    return {
      from: startOfDay(currentDate).toISOString(),
      to: endOfDay(currentDate).toISOString(),
    };
  }

  // Default to month view
  return {
    from: startOfMonth(currentDate).toISOString(),
    to: endOfMonth(currentDate).toISOString(),
  };
};

/**
 * Load and transform booking data from localStorage
 */
const loadBookingData = (): readonly IBookingEventWithMeta[] => {
  try {
    const pending = JSON.parse(localStorage.getItem('pendingBookings') || '[]') as IRawBookingData[];
    const processed = JSON.parse(localStorage.getItem('processedBookings') || '[]') as IRawBookingData[];
    const all = [...pending, ...processed];

    return all.map((booking: IRawBookingData): IBookingEventWithMeta => {
      // Parse time range: 'HH:MM-HH:MM'
      const timeRange = booking.time || '09:00-10:00';
      const [startTime, endTime] = timeRange.split('-');
      const [startH, startM] = startTime.split(':').map((n: string) => parseInt(n, 10));
      const [endH, endM] = endTime.split(':').map((n: string) => parseInt(n, 10));

      // Parse date: 'YYYY-MM-DD'
      const dateStr = booking.date || '';
      const [year, month, day] = dateStr.split('-').map((n: string) => parseInt(n, 10));

      // Create start and end Date objects
      const start = new Date(year, (month || 1) - 1, day || 1, startH, startM, 0, 0);
      const end = new Date(year, (month || 1) - 1, day || 1, endH, endM, 0, 0);

      // Normalize status to match calendar types
      let mappedStatus = booking.status || 'pending';
      if (mappedStatus === 'approved') {
        mappedStatus = 'confirmed';
      } else if (mappedStatus === 'rejected') {
        mappedStatus = 'cancelled';
      }

      return {
        id: booking.id,
        facilityId: booking.facilityId || '',
        facilityName: booking.facility || booking.facilityName || '',
        title: booking.purpose || 'Booking',
        start: start.toISOString(),
        end: end.toISOString(),
        status: mappedStatus as 'confirmed' | 'pending' | 'cancelled',
        // Preserve original price text in meta for modal display
        meta: { priceText: booking.price },
      };
    });
  } catch (error) {
    console.error('Error loading booking data:', error);
    return [];
  }
};

/**
 * Filter events by date range
 */
const filterEventsByRange = (
  events: readonly IBookingEventWithMeta[],
  range: IDateRange
): readonly IBookingEventWithMeta[] => {
  const from = new Date(range.from);
  const to = new Date(range.to);

  return events.filter((event) => {
    const eventStart = new Date(event.start);
    return eventStart >= from && eventStart <= to;
  });
};

/**
 * Hook for managing calendar page state and business logic
 */
export const useCalendarPageManagement = (): IUseCalendarPageManagementReturn => {
  const [selectedEvent, setSelectedEvent] = useState<IBookingEventWithMeta | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Calculate date range based on current view and date
  const dateRange = useMemo(
    () => calculateDateRange(view, currentDate),
    [view, currentDate]
  );

  // Load all booking events from localStorage
  const allEvents = useMemo(() => loadBookingData(), []);

  // Filter events by current date range
  const filteredEvents = useMemo(
    () => filterEventsByRange(allEvents, dateRange),
    [allEvents, dateRange]
  );

  // Event handlers
  const handleEventClick = useCallback((event: IBookingEventWithMeta): void => {
    setSelectedEvent(event);
  }, []);

  const handleEventEdit = useCallback((event: IBookingEventWithMeta): void => {
    setSelectedEvent(null);
    // TODO: Implement edit functionality
    console.log('Edit event:', event);
  }, []);

  const handleEventDelete = useCallback((event: IBookingEventWithMeta): void => {
    setSelectedEvent(null);
    // TODO: Implement delete functionality
    console.log('Delete event:', event);
  }, []);

  const handleEventCopy = useCallback((event: IBookingEventWithMeta): void => {
    // TODO: Implement copy functionality
    console.log('Copy event:', event);
  }, []);

  const handleEventShare = useCallback((event: IBookingEventWithMeta): void => {
    // TODO: Implement share functionality
    console.log('Share event:', event);
  }, []);

  const handleEventAddToCalendar = useCallback((event: IBookingEventWithMeta): void => {
    // TODO: Implement add to calendar functionality
    console.log('Add to calendar:', event);
  }, []);

  return {
    events: filteredEvents,
    isLoading: false,
    view,
    currentDate,
    selectedEvent,
    setView,
    setCurrentDate,
    setSelectedEvent,
    handleEventClick,
    handleEventEdit,
    handleEventDelete,
    handleEventCopy,
    handleEventShare,
    handleEventAddToCalendar,
  };
};
