"use client";

import { addDays, addWeeks, addMonths, isSameDay, getDay } from 'date-fns';
import type { RecurrencePattern } from '@/utils/recurrenceEngine';
import type { ISelectedTimeSlot } from '@/components/features/bookings/types';

/**
 * Recurring booking configuration
 */
export interface RecurringBookingConfig {
  readonly pattern: RecurrencePattern;
  readonly baseBooking: ISelectedTimeSlot;
  readonly maxOccurrences?: number;
  readonly endDate?: Date;
}

/**
 * Generated recurring booking
 */
export interface GeneratedRecurringBooking {
  readonly id: string;
  readonly baseBookingId: string;
  readonly occurrenceNumber: number;
  readonly slot: ISelectedTimeSlot;
  readonly isException?: boolean;
  readonly exceptionReason?: string;
}

/**
 * RecurringBookingRepository
 * 
 * Handles the generation and management of recurring bookings based on patterns.
 * Provides functionality to create recurring booking instances from base patterns.
 * 
 * Features:
 * - Generate recurring bookings from patterns
 * - Handle various recurrence types (weekly, monthly, custom)
 * - Support for exceptions and modifications
 * - Date range validation
 * - Conflict detection
 * 
 * Usage:
 * - Create repository instance with base booking
 * - Use generateRecurringBookings() to create instances
 * - Use validatePattern() to check pattern validity
 */
export class RecurringBookingRepository {
  private readonly baseBooking: ISelectedTimeSlot;
  private readonly pattern: RecurrencePattern;

  constructor(baseBooking: ISelectedTimeSlot, pattern: RecurrencePattern) {
    this.baseBooking = baseBooking;
    this.pattern = pattern;
  }

  /**
   * Generate recurring bookings based on pattern
   * 
   * @param maxOccurrences - Maximum number of occurrences to generate
   * @param endDate - Optional end date for generation
   * @returns Array of generated recurring bookings
   */
  async generateRecurringBookings(
    maxOccurrences: number = 52,
    endDate?: Date
  ): Promise<{ success: boolean; data?: GeneratedRecurringBooking[]; error?: string }> {
    try {
      if (!this.pattern || !this.pattern.endDate) {
        return { success: false, error: { message: 'Invalid recurrence pattern' } };
      }

      const generatedBookings: GeneratedRecurringBooking[] = [];
      let currentDate = new Date(this.baseBooking.date);
      const patternEndDate = endDate || this.pattern.endDate;
      let count = 0;

      while (count < maxOccurrences && currentDate <= patternEndDate) {
        // Check if current date matches pattern
        if (this.dateMatchesPattern(currentDate)) {
          // Create booking for this date
          const newSlot: ISelectedTimeSlot = {
            ...this.baseBooking,
            id: `${this.baseBooking.id}-recur-${currentDate.getTime()}`,
            date: new Date(currentDate),
            isRecurring: true,
            recurrencePattern: this.pattern,
            parentBookingId: this.baseBooking.id
          };

          generatedBookings.push({
            id: `${this.baseBooking.id}-recur-${currentDate.getTime()}`,
            baseBookingId: this.baseBooking.id,
            occurrenceNumber: count + 1,
            slot: newSlot
          });

          count++;
        }

        // Move to next date based on pattern type
        currentDate = this.getNextDate(currentDate);
      }

      return { success: true, data: generatedBookings };
    } catch (error) {
      return { 
        success: false, 
        error: { 
          message: 'Failed to generate recurring bookings', 
          details: error 
        } 
      };
    }
  }

  /**
   * Check if a date matches the recurrence pattern
   * 
   * @param date - Date to check
   * @returns True if date matches pattern
   */
  private dateMatchesPattern(date: Date): boolean {
    const dayOfWeek = getDay(date);

    switch (this.pattern.type) {
      case 'single':
        return true; // Single occurrence
      case 'weekly':
      case 'biweekly':
        return this.pattern.weekdays.includes(dayOfWeek);
      case 'monthly':
        return this.matchesMonthlyPattern(date);
      case 'custom':
        return this.pattern.weekdays.includes(dayOfWeek);
      default:
        return false;
    }
  }

  /**
   * Check if date matches monthly pattern
   * 
   * @param date - Date to check
   * @returns True if date matches monthly pattern
   */
  private matchesMonthlyPattern(date: Date): boolean {
    if (!this.pattern.monthlyPattern || this.pattern.monthlyWeekday === undefined) {
      return false;
    }

    const dayOfWeek = getDay(date);
    if (dayOfWeek !== this.pattern.monthlyWeekday) return false;

    // Calculate which occurrence of this weekday in the month
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstOccurrence = addDays(firstOfMonth, (7 + this.pattern.monthlyWeekday - getDay(firstOfMonth)) % 7);
    
    const weekNumber = Math.floor((date.getDate() - firstOccurrence.getDate()) / 7) + 1;

    switch (this.pattern.monthlyPattern) {
      case 'first': return weekNumber === 1;
      case 'second': return weekNumber === 2;
      case 'third': return weekNumber === 3;
      case 'fourth': return weekNumber === 4;
      case 'last':
        // Check if this is the last occurrence of this weekday in the month
        const nextWeek = addDays(date, 7);
        return nextWeek.getMonth() !== date.getMonth();
      default: return false;
    }
  }

  /**
   * Get the next date based on recurrence pattern
   * 
   * @param currentDate - Current date
   * @returns Next date in the sequence
   */
  private getNextDate(currentDate: Date): Date {
    const newDate = new Date(currentDate);

    switch (this.pattern.type) {
      case 'single':
        return addDays(newDate, 1);
      case 'weekly':
        return addDays(newDate, 1);
      case 'biweekly':
        return addDays(newDate, 1);
      case 'monthly':
        return addDays(newDate, 1);
      case 'custom':
        return addDays(newDate, this.pattern.interval || 1);
      default:
        return addDays(newDate, 1);
    }
  }

  /**
   * Validate recurrence pattern
   * 
   * @returns Validation result with errors if any
   */
  validatePattern(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.pattern.type) {
      errors.push('Recurrence type is required');
    }

    if (this.pattern.type === 'weekly' || this.pattern.type === 'biweekly' || this.pattern.type === 'custom') {
      if (!this.pattern.weekdays || this.pattern.weekdays.length === 0) {
        errors.push('Weekdays must be specified for this recurrence type');
      }
    }

    if (this.pattern.type === 'monthly') {
      if (!this.pattern.monthlyPattern) {
        errors.push('Monthly pattern must be specified');
      }
      if (this.pattern.monthlyWeekday === undefined) {
        errors.push('Monthly weekday must be specified');
      }
    }

    if (this.pattern.type === 'custom' && (!this.pattern.interval || this.pattern.interval < 1)) {
      errors.push('Custom interval must be at least 1');
    }

    if (this.pattern.endDate && this.pattern.startDate && this.pattern.endDate <= this.pattern.startDate) {
      errors.push('End date must be after start date');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get pattern description
   * 
   * @returns Human-readable pattern description
   */
  getPatternDescription(): string {
    const weekdayNames = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const selectedDays = this.pattern.weekdays.map(day => weekdayNames[day]).join(', ');

    switch (this.pattern.type) {
      case 'single':
        return 'Enkelt booking';
      case 'weekly':
        return `Ukentlig på ${selectedDays}`;
      case 'biweekly':
        return `Annenhver uke på ${selectedDays}`;
      case 'monthly':
        const dayName = weekdayNames[this.pattern.monthlyWeekday || 0];
        return `${this.pattern.monthlyPattern} ${dayName} hver måned`;
      case 'custom':
        return `Egendefinert: hver ${this.pattern.interval}. dag på ${selectedDays}`;
      default:
        return 'Ukjent mønster';
    }
  }

  /**
   * Calculate total occurrences for pattern
   * 
   * @param endDate - Optional end date
   * @returns Total number of occurrences
   */
  calculateTotalOccurrences(endDate?: Date): number {
    const patternEndDate = endDate || this.pattern.endDate;
    if (!patternEndDate) return 0;

    let count = 0;
    let currentDate = new Date(this.baseBooking.date);

    while (currentDate <= patternEndDate) {
      if (this.dateMatchesPattern(currentDate)) {
        count++;
      }
      currentDate = this.getNextDate(currentDate);
    }

    return count;
  }
}
