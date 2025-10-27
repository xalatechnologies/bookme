import type { IBookingEvent } from '@/types/calendar';
import { isWithinInterval } from 'date-fns';

/**
 * Event utility functions for calendar operations
 *
 * Provides pure functions for event manipulation, filtering,
 * and sorting with proper TypeScript types.
 */

/**
 * Filter events by search query
 *
 * @param events - Array of booking events
 * @param query - Search query string
 * @returns Filtered events
 */
export const filterEventsByQuery = (
  events: readonly IBookingEvent[],
  query: string
): readonly IBookingEvent[] => {
  if (!query || query.trim() === '') return events;

  const lowerQuery = query.toLowerCase();

  return events.filter(event =>
    event.title.toLowerCase().includes(lowerQuery) ||
    event.facilityName.toLowerCase().includes(lowerQuery) ||
    event.description?.toLowerCase().includes(lowerQuery) ||
    event.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Filter events by facility names
 *
 * @param events - Array of booking events
 * @param facilities - Array of facility names to filter by
 * @returns Filtered events
 */
export const filterEventsByFacilities = (
  events: readonly IBookingEvent[],
  facilities: readonly string[]
): readonly IBookingEvent[] => {
  if (!facilities || facilities.length === 0) return events;

  return events.filter(event =>
    facilities.includes(event.facilityName)
  );
};

/**
 * Filter events by status
 *
 * @param events - Array of booking events
 * @param statuses - Array of statuses to filter by
 * @returns Filtered events
 */
export const filterEventsByStatus = (
  events: readonly IBookingEvent[],
  statuses: readonly string[]
): readonly IBookingEvent[] => {
  if (!statuses || statuses.length === 0) return events;

  return events.filter(event =>
    statuses.includes(event.status)
  );
};

/**
 * Filter events by date range
 *
 * @param events - Array of booking events
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Filtered events
 */
export const filterEventsByDateRange = (
  events: readonly IBookingEvent[],
  startDate: Date,
  endDate: Date
): readonly IBookingEvent[] => {
  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check if event overlaps with the date range
    return (
      isWithinInterval(eventStart, { start: startDate, end: endDate }) ||
      isWithinInterval(eventEnd, { start: startDate, end: endDate }) ||
      (eventStart <= startDate && eventEnd >= endDate)
    );
  });
};

/**
 * Get events for a specific date
 *
 * @param events - Array of booking events
 * @param date - Target date
 * @returns Events on that date
 */
export const getEventsForDate = (
  events: readonly IBookingEvent[],
  date: Date
): readonly IBookingEvent[] => {
  const targetDateStr = date.toISOString().split('T')[0];

  return events.filter(event => {
    const eventStart = new Date(event.start);
    const eventDateStr = eventStart.toISOString().split('T')[0];
    return eventDateStr === targetDateStr;
  });
};

/**
 * Get events for a specific time slot
 *
 * @param events - Array of booking events
 * @param date - Target date
 * @param timeSlot - Time slot string (e.g., "09:00-10:00")
 * @returns Events in that time slot
 */
export const getEventsForTimeSlot = (
  events: readonly IBookingEvent[],
  date: Date,
  timeSlot: string
): readonly IBookingEvent[] => {
  const [startTime] = timeSlot.split('-');
  const [hour, minute] = startTime.split(':').map(Number);

  return getEventsForDate(events, date).filter(event => {
    const eventStart = new Date(event.start);
    return eventStart.getHours() === hour && eventStart.getMinutes() === minute;
  });
};

/**
 * Sort events by start date
 *
 * @param events - Array of booking events
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted events
 */
export const sortEventsByDate = (
  events: readonly IBookingEvent[],
  order: 'asc' | 'desc' = 'asc'
): readonly IBookingEvent[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.start).getTime();
    const dateB = new Date(b.start).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Sort events by facility name
 *
 * @param events - Array of booking events
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted events
 */
export const sortEventsByFacility = (
  events: readonly IBookingEvent[],
  order: 'asc' | 'desc' = 'asc'
): readonly IBookingEvent[] => {
  return [...events].sort((a, b) => {
    const comparison = a.facilityName.localeCompare(b.facilityName);
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Sort events by status
 *
 * @param events - Array of booking events
 * @returns Sorted events (confirmed, pending, cancelled)
 */
export const sortEventsByStatus = (
  events: readonly IBookingEvent[]
): readonly IBookingEvent[] => {
  const statusOrder: Record<string, number> = {
    confirmed: 1,
    approved: 1,
    pending: 2,
    cancelled: 3,
    rejected: 3,
  };

  return [...events].sort((a, b) => {
    const orderA = statusOrder[a.status] || 99;
    const orderB = statusOrder[b.status] || 99;
    return orderA - orderB;
  });
};

/**
 * Group events by date
 *
 * @param events - Array of booking events
 * @returns Map of date strings to events
 */
export const groupEventsByDate = (
  events: readonly IBookingEvent[]
): Map<string, readonly IBookingEvent[]> => {
  const grouped = new Map<string, IBookingEvent[]>();

  events.forEach(event => {
    const dateKey = new Date(event.start).toISOString().split('T')[0];
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, event]);
  });

  return grouped;
};

/**
 * Group events by facility
 *
 * @param events - Array of booking events
 * @returns Map of facility names to events
 */
export const groupEventsByFacility = (
  events: readonly IBookingEvent[]
): Map<string, readonly IBookingEvent[]> => {
  const grouped = new Map<string, IBookingEvent[]>();

  events.forEach(event => {
    const existing = grouped.get(event.facilityName) || [];
    grouped.set(event.facilityName, [...existing, event]);
  });

  return grouped;
};

/**
 * Get unique facility names from events
 *
 * @param events - Array of booking events
 * @returns Array of unique facility names
 */
export const getUniqueFacilities = (
  events: readonly IBookingEvent[]
): readonly string[] => {
  const facilities = new Set(events.map(event => event.facilityName));
  return Array.from(facilities).sort();
};

/**
 * Get event status color
 *
 * @param status - Event status
 * @returns Tailwind color classes
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

/**
 * Check if event conflicts with a time slot
 *
 * @param event - Booking event
 * @param date - Target date
 * @param timeSlot - Time slot string
 * @returns True if there's a conflict
 */
export const hasEventConflict = (
  event: IBookingEvent,
  date: Date,
  timeSlot: string
): boolean => {
  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);

  // Check if event is on the same date
  const targetDateStr = date.toISOString().split('T')[0];
  const eventDateStr = eventStart.toISOString().split('T')[0];
  if (eventDateStr !== targetDateStr) return false;

  // Parse time slot
  const [startTime, endTime] = timeSlot.split('-');
  const [slotStartHour, slotStartMinute] = startTime.split(':').map(Number);
  const [slotEndHour, slotEndMinute] = endTime.split(':').map(Number);

  const slotStart = new Date(date);
  slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);

  const slotEnd = new Date(date);
  slotEnd.setHours(slotEndHour, slotEndMinute, 0, 0);

  // Check for overlap
  return eventStart < slotEnd && eventEnd > slotStart;
};

/**
 * Calculate event duration in minutes
 *
 * @param event - Booking event
 * @returns Duration in minutes
 */
export const getEventDuration = (event: IBookingEvent): number => {
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  return Math.floor((end - start) / (1000 * 60));
};

/**
 * Format event time range
 *
 * @param event - Booking event
 * @param locale - Language code
 * @returns Formatted time range string
 */
export const formatEventTimeRange = (event: IBookingEvent, locale: string = 'no'): string => {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const localeStr = locale === 'no' ? 'no-NO' : 'en-US';
  const startStr = start.toLocaleTimeString(localeStr, options);
  const endStr = end.toLocaleTimeString(localeStr, options);

  return `${startStr} - ${endStr}`;
};
