/**
 * Time slot utility functions for calendar operations
 *
 * Provides pure functions for time slot manipulation, validation,
 * and calculations with proper TypeScript types.
 */

export interface TimeSlotInfo {
  readonly startTime: string;
  readonly endTime: string;
  readonly startHour: number;
  readonly startMinute: number;
  readonly endHour: number;
  readonly endMinute: number;
  readonly duration: number; // in minutes
}

/**
 * Parse time slot string into components
 *
 * @param timeSlot - Time slot string (e.g., "09:00-10:00")
 * @returns Time slot info object
 */
export const parseTimeSlot = (timeSlot: string): TimeSlotInfo => {
  const [startTime, endTime] = timeSlot.split('-');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const duration = endTotalMinutes - startTotalMinutes;

  return {
    startTime,
    endTime,
    startHour,
    startMinute,
    endHour,
    endMinute,
    duration,
  };
};

/**
 * Create time slot string from hours
 *
 * @param startHour - Start hour (0-23)
 * @param endHour - End hour (0-23)
 * @returns Time slot string
 */
export const createTimeSlot = (startHour: number, endHour: number): string => {
  const start = `${String(startHour).padStart(2, '0')}:00`;
  const end = `${String(endHour).padStart(2, '0')}:00`;
  return `${start}-${end}`;
};

/**
 * Check if time slot is within opening hours
 *
 * @param timeSlot - Time slot string
 * @param openingHoursStart - Opening hour string (e.g., "08:00")
 * @param openingHoursEnd - Closing hour string (e.g., "22:00")
 * @returns True if slot is within opening hours
 */
export const isTimeSlotAvailable = (
  timeSlot: string,
  openingHoursStart: string,
  openingHoursEnd: string
): boolean => {
  const slotInfo = parseTimeSlot(timeSlot);
  const [openingHour] = openingHoursStart.split(':').map(Number);
  const [closingHour] = openingHoursEnd.split(':').map(Number);

  return slotInfo.startHour >= openingHour && slotInfo.endHour <= closingHour;
};

/**
 * Check if two time slots overlap
 *
 * @param slot1 - First time slot
 * @param slot2 - Second time slot
 * @returns True if slots overlap
 */
export const doTimeSlotsOverlap = (slot1: string, slot2: string): boolean => {
  const info1 = parseTimeSlot(slot1);
  const info2 = parseTimeSlot(slot2);

  const start1 = info1.startHour * 60 + info1.startMinute;
  const end1 = info1.endHour * 60 + info1.endMinute;
  const start2 = info2.startHour * 60 + info2.startMinute;
  const end2 = info2.endHour * 60 + info2.endMinute;

  return start1 < end2 && end1 > start2;
};

/**
 * Merge consecutive time slots
 *
 * @param slots - Array of time slot strings
 * @returns Array of merged time slots
 */
export const mergeConsecutiveSlots = (slots: readonly string[]): readonly string[] => {
  if (slots.length === 0) return [];

  const sortedSlots = [...slots].sort((a, b) => {
    const infoA = parseTimeSlot(a);
    const infoB = parseTimeSlot(b);
    return infoA.startHour * 60 + infoA.startMinute - (infoB.startHour * 60 + infoB.startMinute);
  });

  const merged: string[] = [];
  let current = parseTimeSlot(sortedSlots[0]);

  for (let i = 1; i < sortedSlots.length; i++) {
    const next = parseTimeSlot(sortedSlots[i]);
    const currentEnd = current.endHour * 60 + current.endMinute;
    const nextStart = next.startHour * 60 + next.startMinute;

    if (currentEnd === nextStart) {
      // Consecutive slots - merge them
      current = {
        ...current,
        endTime: next.endTime,
        endHour: next.endHour,
        endMinute: next.endMinute,
        duration: current.duration + next.duration,
      };
    } else {
      // Not consecutive - save current and move to next
      merged.push(`${current.startTime}-${current.endTime}`);
      current = next;
    }
  }

  // Add the last slot
  merged.push(`${current.startTime}-${current.endTime}`);

  return merged;
};

/**
 * Split time slot into smaller intervals
 *
 * @param timeSlot - Time slot to split
 * @param intervalMinutes - Interval size in minutes
 * @returns Array of smaller time slots
 */
export const splitTimeSlot = (
  timeSlot: string,
  intervalMinutes: number
): readonly string[] => {
  const info = parseTimeSlot(timeSlot);
  const slots: string[] = [];

  let currentMinutes = info.startHour * 60 + info.startMinute;
  const endMinutes = info.endHour * 60 + info.endMinute;

  while (currentMinutes < endMinutes) {
    const nextMinutes = Math.min(currentMinutes + intervalMinutes, endMinutes);

    const startHour = Math.floor(currentMinutes / 60);
    const startMinute = currentMinutes % 60;
    const endHour = Math.floor(nextMinutes / 60);
    const endMinute = nextMinutes % 60;

    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    slots.push(`${startTime}-${endTime}`);
    currentMinutes = nextMinutes;
  }

  return slots;
};

/**
 * Calculate price for time slot
 *
 * @param timeSlot - Time slot string
 * @param pricePerHour - Price per hour
 * @returns Calculated price
 */
export const calculateSlotPrice = (timeSlot: string, pricePerHour: number): number => {
  const info = parseTimeSlot(timeSlot);
  const hours = info.duration / 60;
  return pricePerHour * hours;
};

/**
 * Format time slot for display
 *
 * @param timeSlot - Time slot string
 * @param format - Format type ('short', 'long', 'duration')
 * @param locale - Language code
 * @returns Formatted string
 */
export const formatTimeSlot = (
  timeSlot: string,
  format: 'short' | 'long' | 'duration' = 'long',
  locale: string = 'no'
): string => {
  const info = parseTimeSlot(timeSlot);

  switch (format) {
    case 'short':
      return `${info.startTime}`;
    case 'long':
      return `${info.startTime} - ${info.endTime}`;
    case 'duration': {
      const hours = Math.floor(info.duration / 60);
      const minutes = info.duration % 60;
      const hourLabel = locale === 'no' ? (hours === 1 ? 'time' : 'timer') : (hours === 1 ? 'hour' : 'hours');
      const minLabel = locale === 'no' ? (minutes === 1 ? 'minutt' : 'minutter') : (minutes === 1 ? 'minute' : 'minutes');

      if (hours > 0 && minutes > 0) {
        return `${hours} ${hourLabel}, ${minutes} ${minLabel}`;
      } else if (hours > 0) {
        return `${hours} ${hourLabel}`;
      } else {
        return `${minutes} ${minLabel}`;
      }
    }
    default:
      return timeSlot;
  }
};

/**
 * Get all time slots between two times
 *
 * @param startTime - Start time string (e.g., "08:00")
 * @param endTime - End time string (e.g., "22:00")
 * @param interval - Interval in minutes
 * @returns Array of time slots
 */
export const getTimeSlotsInRange = (
  startTime: string,
  endTime: string,
  interval: number = 60
): readonly string[] => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  const totalDuration = endTotalMinutes - startTotalMinutes;
  const slotCount = Math.floor(totalDuration / interval);

  const slots: string[] = [];

  for (let i = 0; i < slotCount; i++) {
    const slotStartMinutes = startTotalMinutes + i * interval;
    const slotEndMinutes = slotStartMinutes + interval;

    const slotStartHour = Math.floor(slotStartMinutes / 60);
    const slotStartMinute = slotStartMinutes % 60;
    const slotEndHour = Math.floor(slotEndMinutes / 60);
    const slotEndMinute = slotEndMinutes % 60;

    const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMinute).padStart(2, '0')}`;
    const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMinute).padStart(2, '0')}`;

    slots.push(`${slotStart}-${slotEnd}`);
  }

  return slots;
};

/**
 * Check if time slot is in the past
 *
 * @param date - Date of the slot
 * @param timeSlot - Time slot string
 * @returns True if slot is in the past
 */
export const isTimeSlotPast = (date: Date, timeSlot: string): boolean => {
  const now = new Date();
  const info = parseTimeSlot(timeSlot);

  const slotDate = new Date(date);
  slotDate.setHours(info.startHour, info.startMinute, 0, 0);

  return slotDate < now;
};

/**
 * Generate unique ID for time slot
 *
 * @param facilityId - Facility ID
 * @param zoneId - Zone ID
 * @param date - Date
 * @param timeSlot - Time slot string
 * @returns Unique slot ID
 */
export const generateSlotId = (
  facilityId: string,
  zoneId: string,
  date: Date,
  timeSlot: string
): string => {
  const dateStr = date.toISOString().split('T')[0];
  return `${facilityId}-${zoneId}-${dateStr}-${timeSlot}`;
};

/**
 * Parse slot ID back into components
 *
 * @param slotId - Slot ID string
 * @returns Parsed components or null if invalid
 */
export const parseSlotId = (
  slotId: string
): { facilityId: string; zoneId: string; date: string; timeSlot: string } | null => {
  const parts = slotId.split('-');
  if (parts.length < 4) return null;

  const facilityId = parts[0];
  const zoneId = parts[1];
  const date = parts[2];
  const timeSlot = parts.slice(3).join('-');

  return { facilityId, zoneId, date, timeSlot };
};
