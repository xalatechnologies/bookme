"use client";

import { useState, useCallback } from "react";
import { ISelectedTimeSlot } from "@/components/booking/types";
import { RecurringTimeSlot, RecurrencePattern } from "@/utils/recurrenceEngine";
import { recurrenceEngine } from "@/utils/recurrenceEngine";

/**
 * Slot selection hook for calendar time slot management
 * 
 * Provides functionality to manage selected time slots including
 * adding, removing, and bulk operations. Handles state management
 * and provides callbacks for UI interactions.
 * 
 * Features:
 * - Single slot selection/deselection
 * - Bulk slot operations
 * - Clear all selections
 * - Optimized state updates
 * - Date normalization
 * 
 * @returns Slot selection state and handlers
 */
export const useSlotSelection = () => {
  const [selectedSlots, setSelectedSlots] = useState<readonly ISelectedTimeSlot[]>([]);
  const [recurringSlots, setRecurringSlots] = useState<readonly RecurringTimeSlot[]>([]);

  /**
   * Ensure date is a proper Date object
   * 
   * @param date - Date or string to normalize
   * @returns Normalized Date object
   */
  const ensureDate = useCallback((date: Date | string): Date => {
    return date instanceof Date ? date : new Date(date);
  }, []);

  /**
   * Handle single slot click
   * 
   * @param zoneId - Zone ID
   * @param date - Date of the slot
   * @param timeSlot - Time slot string
   * @param availability - Availability status
   * @param facilityId - Facility ID (optional)
   * @param pricePerHour - Price per hour (optional)
   */
  const handleSlotClick = useCallback((
    zoneId: string,
    date: Date,
    timeSlot: string,
    availability: string,
    facilityId: string = "",
    pricePerHour: number = 0
  ): void => {
    if (availability !== "available") {
      console.log("Slot not available:", { zoneId, date, timeSlot, availability });
      return;
    }

    const slotDate = ensureDate(date);
    const isSelected = selectedSlots.some(slot => {
      const selectedDate = ensureDate(slot.date);
      return slot.zoneId === zoneId &&
        selectedDate.toDateString() === slotDate.toDateString() &&
        slot.timeSlot === timeSlot;
    });

    if (isSelected) {
      // Remove slot
      setSelectedSlots(prev => prev.filter(slot => {
        const existingSlotDate = ensureDate(slot.date);
        return !(slot.zoneId === zoneId &&
          existingSlotDate.toDateString() === slotDate.toDateString() &&
          slot.timeSlot === timeSlot);
      }));
    } else {
      // Add slot
      const newSlot: ISelectedTimeSlot = {
        id: `${zoneId}-${slotDate.getTime()}-${timeSlot}`,
        facilityId,
        zoneId,
        date: slotDate,
        timeSlot,
        duration: 1,
        pricePerHour,
      };
      
      console.log("Adding slot with pricePerHour:", pricePerHour, "slot:", newSlot);
      
      setSelectedSlots(prev => [...prev, newSlot]);
    }
  }, [selectedSlots, ensureDate]);

  /**
   * Handle bulk slot selection
   * 
   * @param newSlots - Array of slots to add
   */
  const handleBulkSlotSelection = useCallback((newSlots: readonly ISelectedTimeSlot[]): void => {
    console.log("Bulk slot selection called with:", newSlots.length, "slots");
    console.log("Current selected slots:", selectedSlots.length);
    
    if (newSlots.length === 0) {
      return;
    }

    // Ensure all dates are Date objects
    const normalizedSlots = newSlots.map(slot => ({
      ...slot,
      date: ensureDate(slot.date)
    }));

    // Filter out slots that already exist
    const newSlotsToAdd = normalizedSlots.filter(newSlot => 
      !selectedSlots.some(existingSlot => {
        const existingDate = ensureDate(existingSlot.date);
        const newSlotDate = ensureDate(newSlot.date);
        return existingSlot.zoneId === newSlot.zoneId &&
          existingDate.toDateString() === newSlotDate.toDateString() &&
          existingSlot.timeSlot === newSlot.timeSlot;
      })
    );

    console.log("New slots to add:", newSlotsToAdd.length);
    console.log("New slots pricePerHour:", newSlotsToAdd.map(s => ({ id: s.id, pricePerHour: s.pricePerHour })));

    if (newSlotsToAdd.length > 0) {
      setSelectedSlots(prev => {
        const updated = [...prev, ...newSlotsToAdd];
        console.log("Updated selected slots:", updated.length);
        console.log("Final slots with pricePerHour:", updated.map(s => ({ id: s.id, pricePerHour: s.pricePerHour })));
        return updated;
      });
    }
  }, [selectedSlots, ensureDate]);

  /**
   * Clear all selected slots
   */
  const clearSelection = useCallback((): void => {
    setSelectedSlots([]);
  }, []);

  /**
   * Set selected slots (for external control)
   * 
   * @param slots - Array of slots to set
   */
  const setSelectedSlotsExternal = useCallback((slots: readonly ISelectedTimeSlot[]): void => {
    // Ensure all dates are Date objects
    const normalizedSlots = slots.map(slot => ({
      ...slot,
      date: ensureDate(slot.date)
    }));
    setSelectedSlots(normalizedSlots);
  }, [ensureDate]);

  /**
   * Generate recurring slots from a pattern
   * 
   * @param pattern - Recurrence pattern
   * @param startDate - Start date for generation
   * @param zoneId - Zone ID
   * @param facilityId - Facility ID
   * @param pricePerHour - Price per hour
   * @param maxOccurrences - Maximum occurrences to generate
   */
  const generateRecurringSlots = useCallback((
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    facilityId: string,
    pricePerHour: number,
    maxOccurrences: number = 52
  ): void => {
    const generatedSlots = recurrenceEngine.generateOccurrences(
      pattern,
      startDate,
      zoneId,
      facilityId,
      pricePerHour,
      maxOccurrences
    );
    
    setRecurringSlots(generatedSlots);
  }, []);

  /**
   * Clear all recurring slots
   */
  const clearRecurringSlots = useCallback((): void => {
    setRecurringSlots([]);
  }, []);

  /**
   * Get all slots (regular + recurring)
   */
  const getAllSlots = useCallback((): readonly ISelectedTimeSlot[] => {
    const regularSlots = selectedSlots.map(slot => ({
      ...slot,
      isRecurring: false
    }));
    
    const recurringSlotsConverted = recurringSlots.map(slot => ({
      id: slot.id,
      zoneId: slot.zoneId,
      date: slot.date,
      timeSlot: slot.timeSlot,
      facilityId: slot.facilityId,
      facilityName: '', // Will be filled by parent component
      zoneName: '', // Will be filled by parent component
      pricePerHour: slot.pricePerHour,
      duration: slot.duration,
      isRecurring: slot.isRecurring,
      recurrencePattern: slot.recurrencePattern,
      parentBookingId: slot.parentBookingId
    }));
    
    return [...regularSlots, ...recurringSlotsConverted];
  }, [selectedSlots, recurringSlots]);

  return {
    selectedSlots,
    recurringSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    setSelectedSlots: setSelectedSlotsExternal,
    generateRecurringSlots,
    clearRecurringSlots,
    getAllSlots,
  };
};