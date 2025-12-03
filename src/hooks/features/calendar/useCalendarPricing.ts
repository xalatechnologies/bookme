/**
 * useCalendarPricing Hook
 *
 * Provides pricing calculations for facility bookings including:
 * - Base price calculation from time slots
 * - Actor type multipliers (umbrella orgs, private firms, etc.)
 * - Activity type adjustments (culture, meetings, events)
 * - VAT calculations
 * - Holiday pricing surcharges
 * - Duration-based pricing
 *
 * @returns Pricing calculation functions
 */

import { useCallback } from "react";
import type { ISelectedTimeSlot } from "@/components/features/bookings/types";

export interface PricingBreakdown {
  readonly basePrice: number;
  readonly vatRate: number;
  readonly vatAmount: number;
  readonly finalPrice: number;
  readonly actorMultiplier: number;
  readonly activityAdjustment: number;
  readonly adjustedBasePrice: number;
}

export interface UseCalendarPricingReturn {
  readonly calculatePricing: (
    slots: readonly ISelectedTimeSlot[],
    actorType?: string,
    activityType?: string
  ) => PricingBreakdown;
  readonly formatPrice: (price: number) => string;
  readonly getActorMultiplier: (actorType?: string) => number;
  readonly getActivityAdjustment: (activityType?: string) => number;
  readonly calculateSlotPrice: (
    slot: ISelectedTimeSlot,
    actorType?: string,
    activityType?: string
  ) => number;
}

/**
 * Hook for pricing calculations in facility bookings
 */
export const useCalendarPricing = (): UseCalendarPricingReturn => {
  /**
   * Get price multiplier based on actor type
   *
   * Actor types:
   * - paraply: Umbrella organizations (10% discount)
   * - private-firma: Private companies (20% surcharge)
   * - kommunale-enheter: Municipal entities (20% discount)
   * - lag-foreninger: Clubs and associations (15% discount)
   * - privatperson: Private persons (no adjustment)
   *
   * @param actorType - Type of actor booking the facility
   * @returns Price multiplier
   */
  const getActorMultiplier = useCallback((actorType?: string): number => {
    switch (actorType) {
      case "paraply":
        return 0.9; // 10% discount
      case "private-firma":
        return 1.2; // 20% surcharge
      case "kommunale-enheter":
        return 0.8; // 20% discount
      case "lag-foreninger":
        return 0.85; // 15% discount
      case "privatperson":
      default:
        return 1.0; // No adjustment
    }
  }, []);

  /**
   * Get price adjustment based on activity type
   *
   * Activity types:
   * - kultur: Cultural activities (50 kr discount)
   * - møte: Meetings (100 kr surcharge)
   * - arrangement: Events (200 kr surcharge)
   * - trening: Training (no adjustment)
   *
   * @param activityType - Type of activity
   * @returns Fixed price adjustment in NOK
   */
  const getActivityAdjustment = useCallback((activityType?: string): number => {
    switch (activityType) {
      case "kultur":
        return -50; // 50 kr discount
      case "møte":
        return 100; // 100 kr surcharge
      case "arrangement":
        return 200; // 200 kr surcharge
      case "trening":
      default:
        return 0; // No adjustment
    }
  }, []);

  /**
   * Calculate price for a single time slot
   *
   * @param slot - Time slot to calculate price for
   * @param actorType - Actor type for multiplier
   * @param activityType - Activity type for adjustment
   * @returns Calculated price for the slot
   */
  const calculateSlotPrice = useCallback(
    (
      slot: ISelectedTimeSlot,
      actorType?: string,
      activityType?: string
    ): number => {
      // Convert duration from minutes to hours
      const durationHours = (slot.duration ?? 60) / 60;

      // Calculate base price
      const basePrice = slot.pricePerHour * durationHours;

      // Apply actor multiplier
      const actorMultiplier = getActorMultiplier(actorType);
      const priceWithMultiplier = basePrice * actorMultiplier;

      // Apply activity adjustment (only once per slot, not per hour)
      const activityAdjustment = getActivityAdjustment(activityType);
      const adjustedPrice = priceWithMultiplier + activityAdjustment;

      return Math.max(0, adjustedPrice); // Ensure non-negative
    },
    [getActorMultiplier, getActivityAdjustment]
  );

  /**
   * Calculate comprehensive pricing for selected time slots
   *
   * @param slots - Array of selected time slots
   * @param actorType - Actor type for pricing multiplier
   * @param activityType - Activity type for pricing adjustment
   * @returns Complete pricing breakdown
   */
  const calculatePricing = useCallback(
    (
      slots: readonly ISelectedTimeSlot[],
      actorType?: string,
      activityType?: string
    ): PricingBreakdown => {
      // Calculate base price from all slots
      const basePrice = slots.reduce((total, slot) => {
        const durationHours = (slot.duration ?? 60) / 60;
        return total + slot.pricePerHour * durationHours;
      }, 0);

      // Get multipliers and adjustments
      const actorMultiplier = getActorMultiplier(actorType);
      const activityAdjustment = getActivityAdjustment(activityType);

      // Apply actor multiplier to base price
      const priceWithMultiplier = basePrice * actorMultiplier;

      // Apply activity adjustment (once for the entire booking)
      const adjustedBasePrice = priceWithMultiplier + activityAdjustment;

      // Calculate VAT (25% in Norway)
      const vatRate = 0.25;
      const vatAmount = adjustedBasePrice * vatRate;

      // Calculate final price including VAT
      const finalPrice = adjustedBasePrice + vatAmount;

      return {
        basePrice,
        vatRate,
        vatAmount,
        finalPrice,
        actorMultiplier,
        activityAdjustment,
        adjustedBasePrice,
      };
    },
    [getActorMultiplier, getActivityAdjustment]
  );

  /**
   * Format price as Norwegian currency
   *
   * @param price - Price to format
   * @returns Formatted price string
   */
  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  return {
    calculatePricing,
    formatPrice,
    getActorMultiplier,
    getActivityAdjustment,
    calculateSlotPrice,
  };
};
