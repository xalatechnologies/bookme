"use client";

/**
 * Availability Calculation Hook
 *
 * Provides availability status calculation and conflict detection
 * for calendar time slots. Handles:
 * - Availability status determination
 * - Time slot conflict detection
 * - Booking overlap checking
 * - Real-time availability updates
 * - Status aggregation
 */

// External imports
import { useCallback, useMemo } from 'react';
import { isSameDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Internal imports
import type { AvailabilityStatus } from '@/types/booking';
import type { ISelectedTimeSlot } from '@/components/features/bookings/types';

/**
 * Availability calculation hook props
 */
interface UseAvailabilityCalculationProps {
  readonly selectedSlots?: readonly ISelectedTimeSlot[];
}

/**
 * Availability calculation hook return type
 */
interface UseAvailabilityCalculationReturn {
  readonly getAvailabilityStatus: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => AvailabilityStatus;
  readonly isSlotAvailable: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly hasConflict: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly getConflictReason: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => string | undefined;
  readonly availabilityMap: Map<string, AvailabilityStatus>;
}

/**
 * Hook for calculating availability status and detecting conflicts
 * for calendar time slots.
 *
 * @param props - Hook configuration
 * @returns Availability calculation functions and state
 */
export const useAvailabilityCalculation = ({
  selectedSlots = []
}: UseAvailabilityCalculationProps = {}): UseAvailabilityCalculationReturn => {
  const { t } = useTranslation('calendar');

  /**
   * Generates a unique key for a time slot
   */
  const generateSlotKey = useCallback(
    (zoneId: string, date: Date, timeSlot: string): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${zoneId}-${year}-${month}-${day}-${timeSlot}`;
    },
    []
  );

  /**
   * Parses time slot string to extract hour and minute
   */
  const parseTimeSlot = useCallback(
    (timeSlot: string): { readonly startHour: number; readonly startMinute: number; readonly endHour: number; readonly endMinute: number } | null => {
      const parts = timeSlot.split('-');
      if (parts.length !== 2) return null;

      const [start, end] = parts;
      const [startHour, startMinute] = start.split(':').map(Number);
      const [endHour, endMinute] = end.split(':').map(Number);

      if (
        isNaN(startHour) || isNaN(startMinute) ||
        isNaN(endHour) || isNaN(endMinute)
      ) {
        return null;
      }

      return { startHour, startMinute, endHour, endMinute };
    },
    []
  );

  /**
   * Checks if two time slots overlap
   */
  const doSlotsOverlap = useCallback(
    (slot1: string, slot2: string): boolean => {
      const parsed1 = parseTimeSlot(slot1);
      const parsed2 = parseTimeSlot(slot2);

      if (!parsed1 || !parsed2) return false;

      const start1 = parsed1.startHour * 60 + parsed1.startMinute;
      const end1 = parsed1.endHour * 60 + parsed1.endMinute;
      const start2 = parsed2.startHour * 60 + parsed2.startMinute;
      const end2 = parsed2.endHour * 60 + parsed2.endMinute;

      // Check for overlap: slot1 starts before slot2 ends AND slot2 starts before slot1 ends
      return start1 < end2 && start2 < end1;
    },
    [parseTimeSlot]
  );

  /**
   * Checks if a slot conflicts with selected slots
   */
  const checkSelectedSlotConflict = useCallback(
    (zoneId: string, date: Date, timeSlot: string): boolean => {
      return selectedSlots.some(
        (slot) =>
          slot.zoneId === zoneId &&
          isSameDay(slot.date, date) &&
          doSlotsOverlap(slot.timeSlot, timeSlot)
      );
    },
    [selectedSlots, doSlotsOverlap]
  );

  /**
   * Calculates mock availability status
   * In production, this would fetch from API/database
   */
  const calculateMockAvailability = useCallback(
    (zoneId: string, date: Date, timeSlot: string): AvailabilityStatus => {
      // Use local date components to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Generate a deterministic hash for consistent mock data
      const hash = `${zoneId}-${dateStr}-${timeSlot}`
        .split('')
        .reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);

      // Make about 20% of slots busy
      if (Math.abs(hash) % 5 === 0) {
        return {
          status: 'busy',
          conflict: {
            id: `conflict-${hash}`,
            type: 'booking',
            title: t('slot_selection.existing_booking'),
            startTime: timeSlot.split('-')[0],
            endTime: timeSlot.split('-')[1],
            description: t('slot_selection.time_not_available'),
          },
        };
      }

      // Make weekend evenings unavailable
      const dayOfWeek = date.getDay();
      const parsed = parseTimeSlot(timeSlot);
      if (parsed && (dayOfWeek === 0 || dayOfWeek === 6) && parsed.startHour >= 20) {
        return { status: 'unavailable' };
      }

      return { status: 'available' };
    },
    [t, parseTimeSlot]
  );

  /**
   * Gets the availability status for a specific time slot
   */
  const getAvailabilityStatus = useCallback(
    (zoneId: string, date: Date, timeSlot: string): AvailabilityStatus => {
      // Check if slot conflicts with already selected slots
      if (checkSelectedSlotConflict(zoneId, date, timeSlot)) {
        return {
          status: 'busy',
          conflict: {
            id: `selected-${zoneId}-${timeSlot}`,
            type: 'booking',
            title: t('slot_selection.already_selected'),
            startTime: timeSlot.split('-')[0],
            endTime: timeSlot.split('-')[1],
            description: t('slot_selection.remove_to_select_again'),
          },
        };
      }

      // Calculate mock availability
      // In production, this would query the API/database
      return calculateMockAvailability(zoneId, date, timeSlot);
    },
    [checkSelectedSlotConflict, calculateMockAvailability, t]
  );

  /**
   * Checks if a slot is available (convenience function)
   */
  const isSlotAvailable = useCallback(
    (zoneId: string, date: Date, timeSlot: string): boolean => {
      const status = getAvailabilityStatus(zoneId, date, timeSlot);
      return status.status === 'available';
    },
    [getAvailabilityStatus]
  );

  /**
   * Checks if a slot has any conflicts (convenience function)
   */
  const hasConflict = useCallback(
    (zoneId: string, date: Date, timeSlot: string): boolean => {
      const status = getAvailabilityStatus(zoneId, date, timeSlot);
      return status.status !== 'available';
    },
    [getAvailabilityStatus]
  );

  /**
   * Gets the conflict reason for a slot (convenience function)
   */
  const getConflictReason = useCallback(
    (zoneId: string, date: Date, timeSlot: string): string | undefined => {
      const status = getAvailabilityStatus(zoneId, date, timeSlot);
      return status.conflict?.description;
    },
    [getAvailabilityStatus]
  );

  /**
   * Pre-computed availability map for all selected slots
   * This can be used for batch operations or UI optimization
   */
  const availabilityMap = useMemo((): Map<string, AvailabilityStatus> => {
    const map = new Map<string, AvailabilityStatus>();

    selectedSlots.forEach((slot) => {
      const key = generateSlotKey(slot.zoneId, slot.date, slot.timeSlot);
      const status = getAvailabilityStatus(slot.zoneId, slot.date, slot.timeSlot);
      map.set(key, status);
    });

    return map;
  }, [selectedSlots, generateSlotKey, getAvailabilityStatus]);

  return {
    getAvailabilityStatus,
    isSlotAvailable,
    hasConflict,
    getConflictReason,
    availabilityMap,
  };
};
