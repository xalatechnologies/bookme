import { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

/**
 * Recurring booking interface for managing recurring facility bookings
 * 
 * Supports various recurrence patterns including weekly, biweekly, monthly, and custom patterns
 * with full pricing, occurrence tracking, and status management.
 */
export interface RecurringBooking {
  readonly id: string;
  readonly userId: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly recurrencePattern: RecurrencePattern;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly timeSlots: readonly string[];
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly actorType: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly status: 'active' | 'paused' | 'cancelled';
  readonly occurrences: readonly {
    readonly id: string;
    readonly date: Date;
    readonly status: 'pending' | 'confirmed' | 'cancelled';
  }[];
  readonly pricing: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly discount: number;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Recurring booking occurrence interface for individual booking instances
 * 
 * Represents a single occurrence within a recurring booking series
 */
export interface RecurringBookingOccurrence {
  readonly id: string;
  readonly recurringBookingId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly status: 'pending' | 'confirmed' | 'cancelled';
  readonly price: number;
  readonly createdAt: string;
}

/**
 * Recurring booking creation data interface
 * 
 * Used when creating new recurring bookings with all required fields
 */
export interface CreateRecurringBookingData {
  readonly userId: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly recurrencePattern: RecurrencePattern;
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly timeSlots: readonly string[];
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly actorType: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly pricing: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly discount: number;
  };
}

/**
 * Recurring booking update data interface
 * 
 * Used when updating existing recurring bookings with partial data
 */
export interface UpdateRecurringBookingData {
  readonly recurrencePattern?: RecurrencePattern;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly timeSlots?: readonly string[];
  readonly purpose?: string;
  readonly attendees?: number;
  readonly activityType?: string;
  readonly actorType?: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly status?: 'active' | 'paused' | 'cancelled';
  readonly pricing?: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly discount: number;
  };
}

