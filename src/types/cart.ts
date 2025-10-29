/**
 * Cart types for reservation system
 * 
 * Defines the structure for cart items and related interfaces
 * used throughout the booking and reservation system.
 */

import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

/**
 * Represents a selected time slot for booking
 * Contains all necessary information to identify and book a specific time slot
 */
export interface ISelectedTimeSlot {
  readonly id: string;
  readonly facilityId: string;
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string; // Format: "08:00-09:00"
  readonly duration: number; // Duration in hours
  readonly pricePerHour: number;
  readonly isRecurring?: boolean; // Whether this is part of a recurring booking
  readonly recurrencePattern?: RecurrencePattern; // Recurrence pattern if applicable
  readonly parentBookingId?: string; // ID of the parent recurring booking
}

/**
 * Represents a cart item containing one or more time slots
 * Groups related time slots together for easier management
 */
export interface ICartItem {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly timeSlots: readonly ISelectedTimeSlot[];
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly additionalInfo?: string;
  readonly actorType: 'private-person' | 'lag-foreninger' | 'paraply' | 'private-firma' | 'kommunale-enheter';
  readonly bookingType: 'one-time' | 'recurring'; // Type of booking
  readonly recurrencePattern?: RecurrencePattern; // For recurring bookings
  readonly pricing: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly vatAmount: number;
    readonly finalPrice: number;
  };
  readonly status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'; // Booking status
  readonly createdAt: string; // ISO date string
  readonly updatedAt: string; // ISO date string
}

/**
 * Cart state interface for Zustand store
 * Manages the shopping cart state and operations
 */
export interface ICartState {
  readonly items: readonly ICartItem[];
  readonly totalPrice: number;
  readonly itemCount: number;
  readonly addItem: (item: Omit<ICartItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  readonly removeItem: (itemId: string) => void;
  readonly updateItem: (itemId: string, updates: Partial<ICartItem>) => void;
  readonly clearCart: () => void;
  readonly getTotalPrice: () => number;
  readonly getItemCount: () => number;
  readonly getRecurringItems: () => readonly ICartItem[]; // Get only recurring items
  readonly getOneTimeItems: () => readonly ICartItem[]; // Get only one-time items
  readonly getItemsByType: (type: 'one-time' | 'recurring') => readonly ICartItem[]; // Get items by type
}

/**
 * Cart context type for React context
 * Provides cart functionality to components
 */
export interface ICartContext {
  readonly items: readonly ICartItem[];
  readonly totalPrice: number;
  readonly itemCount: number;
  readonly addItem: (item: Omit<ICartItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  readonly removeItem: (itemId: string) => void;
  readonly updateItem: (itemId: string, updates: Partial<ICartItem>) => void;
  readonly clearCart: () => void;
  readonly getTotalPrice: () => number;
  readonly getItemCount: () => number;
}