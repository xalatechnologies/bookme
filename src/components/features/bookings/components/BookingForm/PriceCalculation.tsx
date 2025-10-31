"use client";

import React, { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import { Calculator, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { IPriceCalculationProps } from "../../types";
import { usePricingDisplay } from "../../hooks";

/**
 * Price breakdown item type
 */
type PriceBreakdownItem = {
  readonly description: string;
  readonly amount: number;
  readonly type: "base" | "discount" | "surcharge";
};

/**
 * Price calculation component
 *
 * Calculates and displays the total price for selected time slots
 * including base price, VAT, and any applicable discounts or surcharges.
 *
 * Features:
 * - Real-time price calculation
 * - VAT calculation (25%)
 * - Actor type based pricing
 * - Activity type considerations
 * - Detailed price breakdown
 * - Responsive design
 *
 * @param props - Price calculation props
 */
export const PriceCalculation: React.FC<IPriceCalculationProps> = ({
  selectedSlots,
  recurringSlots = [],
  actorType,
  activityType,
  isLoading = false,
  bookingType = 'one-time',
}): JSX.Element | null => {
  const { t } = useTranslation(['booking','common']);
  const {
    getActorMultiplier,
    getActivityAdjustment,
    getActorDescription,
    getActivityDescription
  } = usePricingDisplay();

  /**
   * Calculate pricing for selected slots
   *
   * @returns Calculated pricing information
   */
  const pricing = useMemo(() => {
    // For recurring bookings, use recurring slots if available, otherwise use selected slots
    // For one-time bookings, only use selected slots
    const allSlots = bookingType === 'recurring' && recurringSlots.length > 0 ? recurringSlots : selectedSlots;

    if (allSlots.length === 0) {
      return {
        basePrice: 0,
        totalPrice: 0,
        vatAmount: 0,
        finalPrice: 0,
        breakdown: [] as readonly PriceBreakdownItem[],
        requiresApproval: false,
        totalOccurrences: 0,
      };
    }

    // Calculate base price
    const basePrice = allSlots.reduce((total, slot) => {
      // Convert duration from minutes to hours for price calculation
      const durationInHours = slot.duration / 60;
      return total + (slot.pricePerHour * durationInHours);
    }, 0);

    // Apply actor type multiplier
    const actorMultiplier = getActorMultiplier(actorType);
    const adjustedPrice = basePrice * actorMultiplier;

    // Apply activity type adjustments
    const activityAdjustment = getActivityAdjustment(activityType);
    const finalBasePrice = adjustedPrice + activityAdjustment;

    // Calculate VAT (25%)
    const vatAmount = finalBasePrice * 0.25;
    const finalPrice = finalBasePrice + vatAmount;

    // Create breakdown
    const breakdown: PriceBreakdownItem[] = [
      {
        description: t('booking:pricing.base_price', 'Grunnpris'),
        amount: basePrice,
        type: "base",
      },
    ];

    if (actorMultiplier !== 1) {
      breakdown.push({
        description: getActorDescription(actorType),
        amount: adjustedPrice - basePrice,
        type: actorMultiplier < 1 ? "discount" : "surcharge",
      });
    }

    if (activityAdjustment !== 0) {
      breakdown.push({
        description: getActivityDescription(activityType),
        amount: activityAdjustment,
        type: activityAdjustment < 0 ? "discount" : "surcharge",
      });
    }

    // Check if approval is required
    const requiresApproval = actorType === "kommunale-enheter" || finalPrice > 5000;

    return {
      basePrice: finalBasePrice,
      totalPrice: finalBasePrice,
      vatAmount,
      finalPrice,
      breakdown: breakdown as readonly PriceBreakdownItem[],
      requiresApproval,
      totalOccurrences: allSlots.length,
    };
  }, [selectedSlots, recurringSlots, actorType, activityType, bookingType]);

  if (bookingType === 'recurring' ? recurringSlots.length === 0 : selectedSlots.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Calculator className="h-4 w-4" />
        {t('booking:details.pricing_breakdown', 'Prisberegning')}
        {pricing.totalOccurrences > 0 && (
          <Badge variant="secondary" className="ml-2">
            {pricing.totalOccurrences} {t('booking:labels.occurrences', 'forekomster')}
          </Badge>
        )}
      </h4>
        {/* Price Breakdown */}
        <div className="space-y-2">
          {pricing.breakdown.map((item, index) => (
            <div
              key={index}
              className={`flex justify-between text-sm ${
                item.type === "discount" ? "text-green-700" :
                item.type === "surcharge" ? "text-orange-700" :
                "text-gray-700"
              }`}
            >
              <span>{item.description}:</span>
              <span>
                {item.amount < 0 ? "-" : ""}
                {Math.abs(item.amount)} kr
              </span>
            </div>
          ))}

          {/* VAT */}
        <div className="flex justify-between text-sm text-gray-700 pt-2 border-t border-gray-200">
          <span>{t('booking:pricing.vat_25', 'MVA (25%):')}</span>
            <span>{Math.round(pricing.vatAmount)} kr</span>
          </div>

          {/* Total */}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
          <span>{t('booking:pricing.total_incl_vat', 'Total inkl. MVA:')}</span>
            <span>{Math.round(pricing.finalPrice)} kr</span>
          </div>
        </div>

        {/* Special Notices */}
        {pricing.requiresApproval && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">{t('booking:warnings.approval_required', 'Godkjenning påkrevd')}</p>
                <p className="text-xs mt-1">{t('booking:messages.warning_title_text', 'Denne bookingen krever godkjenning fra administrator')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">{t('booking:validation.processing', 'Beregner pris...')}</div>
          </div>
        )}
    </div>
  );
};

export default PriceCalculation;
