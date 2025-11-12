"use client";

import { useState, useMemo, useCallback } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import type { IBookingEventWithMeta } from '@/types/calendar';
import { useUserBookings, type BookingWithDetails } from '@/services/supabase/bookings.service';
import { useAuth } from "@/contexts/hooks";

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
 * Transform Supabase booking data to calendar event format
 */
const transformBookingToEvent = (booking: BookingWithDetails): IBookingEventWithMeta => {
  // Normalize status to match calendar types
  let mappedStatus: 'confirmed' | 'pending' | 'cancelled' = 'pending';

  if (booking.status === 'paid' || booking.status === 'completed') {
    mappedStatus = 'confirmed';
  } else if (booking.status === 'cancelled' || booking.status === 'rejected') {
    mappedStatus = 'cancelled';
  } else if (booking.status === 'pending' || booking.status === 'awaiting_payment') {
    mappedStatus = 'pending';
  }

  // Format price text for meta
  const priceText = booking.total_price
    ? `${booking.total_price} NOK`
    : booking.price_per_hour
      ? `${booking.price_per_hour} NOK/hr`
      : undefined;

  return {
    id: booking.id,
    facilityId: booking.facility_id,
    facilityName: booking.facility?.name || 'Unknown Facility',
    title: booking.purpose || 'Booking',
    start: booking.starts_at,
    end: booking.ends_at,
    status: mappedStatus,
    price: booking.total_price || undefined,
    meta: {
      priceText,
    },
  };
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
 *
 * Migrated from localStorage to Supabase backend integration.
 * Fetches real-time booking data for the authenticated user.
 */
export const useCalendarPageManagement = (): IUseCalendarPageManagementReturn => {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<IBookingEventWithMeta | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Fetch bookings from Supabase
  const { data: bookings = [], isLoading } = useUserBookings(user?.id || '', !!user?.id);

  // Calculate date range based on current view and date
  const dateRange = useMemo(
    () => calculateDateRange(view, currentDate),
    [view, currentDate]
  );

  // Transform Supabase bookings to calendar events
  const allEvents = useMemo(() => {
    try {
      return bookings.map(transformBookingToEvent);
    } catch (error) {
      console.error('Error transforming booking data:', error);
      return [];
    }
  }, [bookings]);

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
    // TODO: Implement delete functionality with useCancelBooking mutation
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
    // TODO: Implement add to calendar functionality (.ics export)
    console.log('Add to calendar:', event);
  }, []);

  return {
    events: filteredEvents,
    isLoading,
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
