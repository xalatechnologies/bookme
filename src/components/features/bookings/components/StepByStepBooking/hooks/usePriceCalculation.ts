import { useMemo } from 'react';
import { ISelectedTimeSlot, ActorType, ActivityType, BookingType } from '@/components/features/bookings/types';

/**
 * Price breakdown interface
 */
export interface IPriceBreakdown {
  readonly description: string;
  readonly amount: number;
  readonly type: 'base' | 'discount' | 'surcharge' | 'vat';
}

/**
 * Price calculation result interface
 */
export interface IPriceCalculationResult {
  readonly basePrice: number;
  readonly discounts: number;
  readonly totalBeforeVat: number;
  readonly vatAmount: number;
  readonly totalPrice: number;
  readonly priceBreakdown: readonly IPriceBreakdown[];
  readonly requiresApproval: boolean;
}

/**
 * Price calculation hook
 *
 * Calculates pricing for bookings based on slots, actor type, and activity type
 * Follows Single Responsibility Principle - only handles price calculation
 *
 * @param selectedSlots - Selected time slots
 * @param recurringSlots - Recurring time slots (if applicable)
 * @param actorType - Type of actor (affects pricing)
 * @param activityType - Type of activity (affects pricing)
 * @param bookingType - Type of booking (one-time or recurring)
 * @returns Price calculation result
 */
export const usePriceCalculation = (
  selectedSlots: readonly ISelectedTimeSlot[],
  recurringSlots: readonly ISelectedTimeSlot[],
  actorType: ActorType | "",
  activityType: ActivityType | "",
  bookingType: BookingType
): IPriceCalculationResult => {
  /**
   * Calculate base price from slots
   */
  const basePrice = useMemo(() => {
    // Use recurring slots for recurring bookings, otherwise use selected slots
    const slotsToCalculate = bookingType === 'recurring' && recurringSlots.length > 0
      ? recurringSlots
      : selectedSlots;

    return slotsToCalculate.reduce((total, slot) => {
      const hours = slot.duration / 60; // duration is in minutes
      return total + (slot.pricePerHour * hours);
    }, 0);
  }, [selectedSlots, recurringSlots, bookingType]);

  /**
   * Calculate discounts based on actor type
   */
  const discounts = useMemo(() => {
    let discountPercentage = 0;

    // Actor type discounts
    switch (actorType) {
      case 'private-person':
        discountPercentage = 0; // No discount
        break;
      case 'lag-foreninger':
        discountPercentage = 0.20; // 20% discount
        break;
      case 'paraply':
        discountPercentage = 0.30; // 30% discount
        break;
      case 'private-firma':
        discountPercentage = 0; // No discount
        break;
      case 'kommunale-enheter':
        discountPercentage = 0.50; // 50% discount
        break;
      default:
        discountPercentage = 0;
    }

    return basePrice * discountPercentage;
  }, [basePrice, actorType]);

  /**
   * Calculate total before VAT
   */
  const totalBeforeVat = useMemo(() => {
    return basePrice - discounts;
  }, [basePrice, discounts]);

  /**
   * Calculate VAT amount
   */
  const vatAmount = useMemo(() => {
    const vatRate = 0.25; // 25% VAT
    return totalBeforeVat * vatRate;
  }, [totalBeforeVat]);

  /**
   * Calculate final total price
   */
  const totalPrice = useMemo(() => {
    return totalBeforeVat + vatAmount;
  }, [totalBeforeVat, vatAmount]);

  /**
   * Build price breakdown
   */
  const priceBreakdown = useMemo((): readonly IPriceBreakdown[] => {
    const breakdown: IPriceBreakdown[] = [
      {
        description: 'Grunnpris',
        amount: basePrice,
        type: 'base' as const,
      },
    ];

    if (discounts > 0) {
      let discountLabel = 'Rabatt';
      switch (actorType) {
        case 'lag-foreninger':
          discountLabel = 'Rabatt - Lag/Foreninger (20%)';
          break;
        case 'paraply':
          discountLabel = 'Rabatt - Paraply (30%)';
          break;
        case 'kommunale-enheter':
          discountLabel = 'Rabatt - Kommunale enheter (50%)';
          break;
      }

      breakdown.push({
        description: discountLabel,
        amount: -discounts,
        type: 'discount' as const,
      });
    }

    breakdown.push({
      description: 'MVA (25%)',
      amount: vatAmount,
      type: 'vat' as const,
    });

    return breakdown;
  }, [basePrice, discounts, vatAmount, actorType]);

  /**
   * Determine if approval is required
   */
  const requiresApproval = useMemo(() => {
    // Municipal entities require approval
    if (actorType === 'kommunale-enheter') {
      return true;
    }

    // Large bookings require approval (more than 10 hours or recurring with more than 5 occurrences)
    const totalHours = selectedSlots.reduce((total, slot) => total + (slot.duration / 60), 0);
    if (totalHours > 10) {
      return true;
    }

    if (bookingType === 'recurring' && recurringSlots.length > 5) {
      return true;
    }

    return false;
  }, [actorType, selectedSlots, recurringSlots, bookingType]);

  return {
    basePrice,
    discounts,
    totalBeforeVat,
    vatAmount,
    totalPrice,
    priceBreakdown,
    requiresApproval,
  };
};
