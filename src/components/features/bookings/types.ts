/**
 * Booking component types
 *
 * Defines types and interfaces used by booking components
 * for facility reservation and cart management.
 */

import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';
import type { Zone } from '@/types/booking';

/**
 * Actor type for pricing calculation
 * Different actor types have different pricing rules
 */
export type ActorType =
  | "private-person"      // Privatperson
  | "lag-foreninger"      // Lag og foreninger
  | "paraply"            // Paraplyorganisasjoner
  | "private-firma"      // Private firma
  | "kommunale-enheter"; // Kommunale enheter

/**
 * Activity type for booking
 * Different activities may have different rules or pricing
 */
export type ActivityType =
  | "sport"              // Sport
  | "kultur"             // Kultur
  | "møte"               // Møte
  | "arrangement"        // Arrangement
  | "trening"            // Trening
  | "annet";             // Annet

/**
 * Booking type enumeration
 */
export type BookingType = 'one-time' | 'recurring';

export type PriceGroup =
  | "privat"
  | "lag-foreninger"
  | "barn-u18"
  | "utenbygds";

/**
 * Booking form data
 * Data collected from the booking form
 */
export interface IBookingFormData {
  readonly bookingType: BookingType;
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: ActivityType | "";
  readonly priceGroup: PriceGroup | "";
  readonly additionalInfo?: string;
  readonly actorType: ActorType | "";
  readonly termsAccepted: boolean;
  readonly recurrencePattern?: RecurrencePattern | null; // For recurring bookings
  readonly recurringSlots?: readonly ISelectedTimeSlot[]; // Generated recurring slots
}

/**
 * Selected time slot for booking
 * Represents a time slot that has been selected for booking
 */
export interface ISelectedTimeSlot {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName?: string; // Optional facility name for display
  readonly zoneId: string;
  readonly zoneName?: string; // Optional zone name for display
  readonly date: Date;
  readonly timeSlot: string; // Format: "08:00-09:00"
  readonly duration: number; // Duration in minutes (not hours)
  readonly pricePerHour: number;
  readonly isRecurring?: boolean; // Whether this is part of a recurring booking
  readonly recurrencePattern?: RecurrencePattern; // Recurrence pattern if applicable
  readonly parentBookingId?: string; // ID of the parent recurring booking
}

/**
 * Pricing calculation result
 * Result of price calculation for a booking
 */
export interface IPricingCalculation {
  readonly basePrice: number;
  readonly totalPrice: number;
  readonly vatAmount: number;
  readonly finalPrice: number;
  readonly breakdown: readonly {
    readonly description: string;
    readonly amount: number;
    readonly type: "base" | "discount" | "surcharge";
  }[];
  readonly requiresApproval: boolean;
}

/**
 * Booking panel props
 * Props for the main booking panel component
 */
export interface IBookingPanelProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly onAddToCart: (bookingData: IBookingFormData) => void;
  readonly onCompleteBooking: (bookingData: IBookingFormData) => void;
  readonly isLoading?: boolean;
  readonly error?: string;
}

/**
 * Selected slots display props
 * Props for the selected slots display component
 */
export interface ISelectedSlotsDisplayProps {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onRemoveSlot: (slotId: string) => void;
  readonly onClearAll: () => void;
  readonly isLoading?: boolean;
}

/**
 * Price calculation props
 * Props for the price calculation component
 */
export interface IPriceCalculationProps {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly recurringSlots?: readonly ISelectedTimeSlot[];
  readonly actorType: ActorType | "";
  readonly activityType: ActivityType | "";
  readonly isLoading?: boolean;
  readonly bookingType?: BookingType;
}

/**
 * Booking action buttons props
 * Props for the booking action buttons component
 */
export interface IBookingActionButtonsProps {
  readonly isFormValid: boolean;
  readonly isLoading: boolean;
  readonly onAddToCart: () => void;
  readonly onCompleteBooking: () => void;
  readonly onClearSlots: () => void;
}

/**
 * Zone type re-export
 * Re-export Zone from shared types for convenience
 */
export type IZone = Zone;

/**
 * Slot removal handler
 * Function type for handling slot removal
 *
 * @param slotId - ID of the slot to remove
 */
export type SlotRemovalHandler = (slotId: string) => void;

/**
 * Clear all handler
 * Function type for handling clearing all slots
 */
export type ClearAllHandler = () => void;
