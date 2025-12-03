"use client";

import { addDays, addWeeks, addMonths, getDay } from 'date-fns';

/**
 * Recurrence pattern interface for defining recurring booking patterns
 * 
 * Supports various recurrence types including single, weekly, biweekly, monthly, and custom patterns
 */
export interface RecurrencePattern {
  readonly type: 'single' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  readonly weekdays: readonly number[]; // 0 = Sunday, 1 = Monday, etc.
  readonly timeSlots: readonly string[];
  readonly interval: number; // for custom patterns
  readonly startDate?: Date; // When the recurrence should start
  readonly endDate?: Date; // When the recurrence should end
  readonly monthlyPattern?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  readonly monthlyWeekday?: number;
  readonly maxOccurrences?: number; // Maximum number of occurrences
}

/**
 * Extended time slot interface for recurring bookings
 * 
 * Extends the base ISelectedTimeSlot with recurrence-specific properties
 */
export interface RecurringTimeSlot {
  readonly id: string;
  readonly facilityId: string;
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly duration: number; // in hours
  readonly pricePerHour: number;
  readonly isRecurring: boolean;
  readonly recurrencePattern?: RecurrencePattern;
  readonly parentBookingId?: string; // ID of the parent recurring booking
}

/**
 * Recurrence Engine for generating recurring booking patterns
 * 
 * Handles the complex logic of generating recurring time slots based on various patterns
 * including weekly, biweekly, monthly, and custom intervals.
 * 
 * Features:
 * - Multiple recurrence types (single, weekly, biweekly, monthly, custom)
 * - Weekday filtering for weekly patterns
 * - Monthly pattern matching (first, second, third, fourth, last weekday)
 * - Custom interval support
 * - Maximum occurrence limits
 * - Exception handling
 * 
 * Usage:
 * - Create a RecurrencePattern with desired settings
 * - Use generateOccurrences() to generate time slots
 * - Use getPatternDescription() for user-friendly descriptions
 */
export class RecurrenceEngine {
  /**
   * Generate recurring time slot occurrences based on pattern
   * 
   * @param pattern - Recurrence pattern configuration
   * @param startDate - Base start date for generation
   * @param zoneId - Zone ID for the slots
   * @param facilityId - Facility ID for the slots
   * @param pricePerHour - Price per hour for the slots
   * @param maxOccurrences - Maximum number of occurrences to generate
   * @returns Array of generated recurring time slots
   */
  generateOccurrences(
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    facilityId: string,
    pricePerHour: number,
    maxOccurrences: number = 52
  ): RecurringTimeSlot[] {
    const occurrences: RecurringTimeSlot[] = [];
    
    // Use pattern's start date if available, otherwise use provided startDate
    const actualStartDate = pattern.startDate || startDate;
    const endDate = pattern.endDate;
    let count = 0;
    
    // Validate that we have a valid start date
    if (!actualStartDate) {
      console.error('RecurrenceEngine: No valid start date provided');
      return occurrences;
    }
    

    // For weekly and biweekly patterns
    if (pattern.type === 'weekly' || pattern.type === 'biweekly') {
      const weekIncrement = pattern.type === 'biweekly' ? 2 : 1;

      

      for (const weekday of pattern.weekdays) {
        // Find first occurrence of selected weekday on or after start date
        let currentDate = new Date(actualStartDate);
        const startDay = getDay(currentDate); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate days to add to get to the target weekday
        let daysToAdd = weekday - startDay;
        if (daysToAdd < 0) {
          daysToAdd += 7; // Move to next week
        }
        
        
        
        // Move to the first occurrence of the target weekday
        currentDate = addDays(currentDate, daysToAdd);
        
        

        // Generate occurrences for this weekday
        while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
          // Add all time slots for this date
          pattern.timeSlots.forEach(timeSlot => {
            if (count >= maxOccurrences) return;
            
            
            
            occurrences.push({
              id: `${zoneId}-${currentDate.getTime()}-${timeSlot}-recurring-${count}`,
              facilityId,
              zoneId,
              date: new Date(currentDate),
              timeSlot,
              duration: this.calculateDuration(timeSlot),
              pricePerHour,
              isRecurring: true,
              recurrencePattern: pattern,
              parentBookingId: `${facilityId}-${zoneId}-${actualStartDate.getTime()}`
            });
            count++;
          });

          // Move to next occurrence (next week or biweekly)
          currentDate = addWeeks(currentDate, weekIncrement);
        }
      }
    } else {
      // For other patterns (monthly, custom)
      let currentDate = actualStartDate;
      
      while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
        // Check if current date matches pattern
        if (this.dateMatchesPattern(currentDate, pattern)) {
          // Add all time slots for this date
          pattern.timeSlots.forEach(timeSlot => {
            occurrences.push({
              id: `${zoneId}-${currentDate.getTime()}-${timeSlot}-recurring`,
              facilityId,
              zoneId,
              date: new Date(currentDate),
              timeSlot,
              duration: this.calculateDuration(timeSlot),
              pricePerHour,
              isRecurring: true,
              recurrencePattern: pattern,
              parentBookingId: `${facilityId}-${zoneId}-${actualStartDate.getTime()}`
            });
          });
          count++;
        }

        // Move to next date based on pattern type
        currentDate = this.getNextDate(currentDate, pattern);
      }
    }
    

    return occurrences;
  }

  /**
   * Check if a date matches the recurrence pattern
   * 
   * @param date - Date to check
   * @param pattern - Recurrence pattern
   * @returns True if date matches pattern
   */
  private dateMatchesPattern(date: Date, pattern: RecurrencePattern): boolean {
    const jsDayOfWeek = getDay(date); // 0=Sunday, 1=Monday, etc.

    switch (pattern.type) {
      case 'single':
        return true; // Single occurrence
      case 'weekly':
      case 'biweekly':
        return pattern.weekdays.includes(jsDayOfWeek);
      case 'monthly':
        return this.matchesMonthlyPattern(date, pattern);
      case 'custom':
        return pattern.weekdays.includes(jsDayOfWeek);
      default:
        return false;
    }
  }

  /**
   * Check if date matches monthly pattern
   * 
   * @param date - Date to check
   * @param pattern - Monthly recurrence pattern
   * @returns True if date matches monthly pattern
   */
  private matchesMonthlyPattern(date: Date, pattern: RecurrencePattern): boolean {
    if (!pattern.monthlyPattern || pattern.monthlyWeekday === undefined) return false;

    const dayOfWeek = getDay(date);
    if (dayOfWeek !== pattern.monthlyWeekday) return false;

    // Calculate which occurrence of this weekday in the month
    const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstOccurrence = addDays(firstOfMonth, (7 + pattern.monthlyWeekday - getDay(firstOfMonth)) % 7);
    
    const weekNumber = Math.floor((date.getDate() - firstOccurrence.getDate()) / 7) + 1;

    switch (pattern.monthlyPattern) {
      case 'first': return weekNumber === 1;
      case 'second': return weekNumber === 2;
      case 'third': return weekNumber === 3;
      case 'fourth': return weekNumber === 4;
      case 'last': {
        // Check if this is the last occurrence of this weekday in the month
        const nextWeek = addDays(date, 7);
        return nextWeek.getMonth() !== date.getMonth();
      }
      default: return false;
    }
  }

  /**
   * Get the next date based on recurrence pattern
   * 
   * @param currentDate - Current date
   * @param pattern - Recurrence pattern
   * @returns Next date in the sequence
   */
  private getNextDate(currentDate: Date, pattern: RecurrencePattern): Date {
    switch (pattern.type) {
      case 'single':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'biweekly':
        return addWeeks(currentDate, 2);
      case 'monthly':
        return addMonths(currentDate, 1);
      case 'custom':
        return addDays(currentDate, pattern.interval || 1);
      default:
        return addDays(currentDate, 1);
    }
  }

  /**
   * Calculate duration from time slot string
   * 
   * @param timeSlot - Time slot string (e.g., "09:00-11:00")
   * @returns Duration in hours
   */
  private calculateDuration(timeSlot: string): number {
    if (!timeSlot.includes('-')) return 2; // Default 2 hours
    
    const [start, end] = timeSlot.split('-').map(t => t.trim());
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    
    return endHour - startHour;
  }

  /**
   * Get human-readable description of recurrence pattern
   * 
   * @param pattern - Recurrence pattern
   * @param t - Translation function (optional)
   * @returns Human-readable description
   */
  getPatternDescription(pattern: RecurrencePattern, t?: (key: string, fallback: string) => string): string {
    // Use provided translation function or fallback to English defaults
    const translate = t || ((key: string, fallback: string) => fallback);
    
    const weekdayNames = [
      translate('common:time.weekdays.sunday', 'Sunday'),
      translate('common:time.weekdays.monday', 'Monday'),
      translate('common:time.weekdays.tuesday', 'Tuesday'),
      translate('common:time.weekdays.wednesday', 'Wednesday'),
      translate('common:time.weekdays.thursday', 'Thursday'),
      translate('common:time.weekdays.friday', 'Friday'),
      translate('common:time.weekdays.saturday', 'Saturday')
    ];
    
    const selectedDays = pattern.weekdays.map(day => weekdayNames[day]).join(', ');

    switch (pattern.type) {
      case 'single':
        return translate('booking:recurrence.single', 'Single booking');
      case 'weekly':
        return `${translate('booking:recurrence.weekly', 'Weekly')} ${translate('booking:recurrence.on', 'on')} ${selectedDays}`;
      case 'biweekly':
        return `${translate('booking:recurrence.biweekly', 'Every other week')} ${translate('booking:recurrence.on', 'on')} ${selectedDays}`;
      case 'monthly': {
        // Translate the monthly pattern value
        let monthlyPatternText = '';
        switch (pattern.monthlyPattern) {
          case 'first':
            monthlyPatternText = translate('booking:recurrence.first', 'First');
            break;
          case 'second':
            monthlyPatternText = translate('booking:recurrence.second', 'Second');
            break;
          case 'third':
            monthlyPatternText = translate('booking:recurrence.third', 'Third');
            break;
          case 'fourth':
            monthlyPatternText = translate('booking:recurrence.fourth', 'Fourth');
            break;
          case 'last':
            monthlyPatternText = translate('booking:recurrence.last', 'Last');
            break;
          default:
            monthlyPatternText = pattern.monthlyPattern || '';
        }
        const dayName = weekdayNames[pattern.monthlyWeekday || 0];
        return `${monthlyPatternText} ${dayName} ${translate('booking:recurrence.every_month', 'every month')}`;
      }
      case 'custom':
        return `${translate('booking:recurrence.custom', 'Custom')}: ${translate('booking:recurrence.every', 'every')} ${pattern.interval} ${translate('booking:recurrence.day_on', 'day on')} ${selectedDays}`;
      default:
        return translate('booking:recurrence.unknown_pattern', 'Unknown pattern');
    }
  }

  /**
   * Validate recurrence pattern
   * 
   * @param pattern - Recurrence pattern to validate
   * @param t - Translation function (optional)
   * @returns Validation result with errors if any
   */
  validatePattern(pattern: RecurrencePattern, t?: (key: string, fallback: string) => string): { isValid: boolean; errors: string[] } {
    // Use provided translation function or fallback to English defaults
    const translate = t || ((key: string, fallback: string) => fallback);
    
    const errors: string[] = [];

    if (!pattern.type) {
      errors.push(translate('booking:validation.recurrence_type_required', 'Recurrence type is required'));
    }

    if (pattern.type === 'weekly' || pattern.type === 'biweekly' || pattern.type === 'custom') {
      if (!pattern.weekdays || pattern.weekdays.length === 0) {
        errors.push(translate('booking:validation.weekdays_required', 'Weekdays must be specified for this recurrence type'));
      }
    }

    if (pattern.type === 'monthly') {
      if (!pattern.monthlyPattern) {
        errors.push(translate('booking:validation.monthly_pattern_required', 'Monthly pattern must be specified'));
      }
      if (pattern.monthlyWeekday === undefined) {
        errors.push(translate('booking:validation.monthly_weekday_required', 'Monthly weekday must be specified'));
      }
    }

    if (pattern.type === 'custom' && (!pattern.interval || pattern.interval < 1)) {
      errors.push(translate('booking:validation.custom_interval_required', 'Custom interval must be at least 1'));
    }

    if (pattern.endDate && pattern.startDate && pattern.endDate <= pattern.startDate) {
      errors.push(translate('booking:validation.end_date_after_start', 'End date must be after start date'));
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const recurrenceEngine = new RecurrenceEngine();