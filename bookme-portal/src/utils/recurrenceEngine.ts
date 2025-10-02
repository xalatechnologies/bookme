import { addDays, addWeeks, addMonths, format, startOfWeek, isSameDay, getDay } from 'date-fns';

export interface RecurrencePattern {
  readonly type: 'single' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  readonly weekdays: readonly number[]; // 0 = Sunday, 1 = Monday, etc.
  readonly timeSlots: readonly string[];
  readonly interval: number; // for custom patterns
  readonly startDate?: Date; // When the recurrence should start
  readonly endDate?: Date; // When the recurrence should end
  readonly monthlyPattern?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  readonly monthlyWeekday?: number;
}

export interface SelectedTimeSlot {
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly duration: number; // in hours
}

export class RecurrenceEngine {
  generateOccurrences(
    pattern: RecurrencePattern,
    startDate: Date,
    zoneId: string,
    maxOccurrences: number = 52
  ): readonly SelectedTimeSlot[] {
    const occurrences: SelectedTimeSlot[] = [];
    
    // Use pattern's start date if available, otherwise use provided startDate
    let currentDate = pattern.startDate || startDate;
    const endDate = pattern.endDate;
    let count = 0;

    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
      // Check if current date matches pattern
      if (this.dateMatchesPattern(currentDate, pattern)) {
        // Add all time slots for this date
        pattern.timeSlots.forEach(timeSlot => {
          occurrences.push({
            zoneId,
            date: new Date(currentDate),
            timeSlot,
            duration: this.calculateDuration(timeSlot)
          });
        });
        count++;
      }

      // Move to next date based on pattern type
      currentDate = this.getNextDate(currentDate, pattern);
    }

    return occurrences;
  }

  private dateMatchesPattern(date: Date, pattern: RecurrencePattern): boolean {
    const dayOfWeek = getDay(date);
    
    switch (pattern.type) {
      case 'single':
        return true; // Single occurrence, always matches
      
      case 'weekly':
      case 'biweekly':
        return pattern.weekdays.indexOf(dayOfWeek) !== -1;
      
      case 'monthly':
        if (pattern.monthlyPattern && pattern.monthlyWeekday !== undefined) {
          return this.matchesMonthlyPattern(date, pattern.monthlyPattern, pattern.monthlyWeekday);
        }
        return pattern.weekdays.indexOf(dayOfWeek) !== -1;
      
      case 'custom':
        return pattern.weekdays.indexOf(dayOfWeek) !== -1;
      
      default:
        return false;
    }
  }

  private matchesMonthlyPattern(date: Date, monthlyPattern: string, weekday: number): boolean {
    const dayOfWeek = getDay(date);
    if (dayOfWeek !== weekday) return false;

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekdayOfMonth = new Date(firstDayOfMonth);
    
    // Find the first occurrence of the weekday in the month
    while (getDay(firstWeekdayOfMonth) !== weekday) {
      firstWeekdayOfMonth.setDate(firstWeekdayOfMonth.getDate() + 1);
    }

    const weekNumber = Math.floor((date.getDate() - firstWeekdayOfMonth.getDate()) / 7) + 1;

    switch (monthlyPattern) {
      case 'first': return weekNumber === 1;
      case 'second': return weekNumber === 2;
      case 'third': return weekNumber === 3;
      case 'fourth': return weekNumber === 4;
      case 'last': {
        // Check if this is the last occurrence of the weekday in the month
        const nextWeek = addWeeks(date, 1);
        return nextWeek.getMonth() !== date.getMonth();
      }
      default: return false;
    }
  }

  private getNextDate(currentDate: Date, pattern: RecurrencePattern): Date {
    switch (pattern.type) {
      case 'single':
        return addDays(currentDate, 1); // Move to next day to end the loop
      
      case 'weekly':
        return addDays(currentDate, 1);
      
      case 'biweekly':
        return addDays(currentDate, 1);
      
      case 'monthly':
        return addDays(currentDate, 1);
      
      case 'custom':
        return addDays(currentDate, pattern.interval);
      
      default:
        return addDays(currentDate, 1);
    }
  }

  private calculateDuration(timeSlot: string): number {
    // Parse time slot format like "09:00-10:00" or "14:00-16:00"
    const [start, end] = timeSlot.split('-');
    if (!start || !end) return 1; // Default to 1 hour

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return (endMinutes - startMinutes) / 60; // Return duration in hours
  }

  // Helper method to validate a recurrence pattern
  validatePattern(pattern: RecurrencePattern): { valid: boolean; errors: readonly string[] } {
    const errors: string[] = [];

    if (!pattern.type) {
      errors.push('Pattern type is required');
    }

    if (!pattern.weekdays || pattern.weekdays.length === 0) {
      errors.push('At least one weekday must be selected');
    }

    if (!pattern.timeSlots || pattern.timeSlots.length === 0) {
      errors.push('At least one time slot must be selected');
    }

    if (pattern.type === 'custom' && pattern.interval <= 0) {
      errors.push('Custom pattern interval must be greater than 0');
    }

    if (pattern.startDate && pattern.endDate && pattern.startDate > pattern.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
