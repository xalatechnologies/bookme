"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info } from "lucide-react";
import { IPriceCalculationProps, ActorType, ActivityType } from "./types";

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
  actorType,
  activityType,
  isLoading = false,
}) => {
  /**
   * Get actor type multiplier for pricing
   * 
   * @param actorType - Type of actor
   * @returns Multiplier for base price
   */
  const getActorMultiplier = (actorType: ActorType): number => {
    switch (actorType) {
      case "private-person":
        return 1.0; // Full price
      case "lag-foreninger":
        return 0.8; // 20% discount
      case "paraply":
        return 0.7; // 30% discount
      case "private-firma":
        return 1.2; // 20% surcharge
      case "kommunale-enheter":
        return 0.5; // 50% discount
      default:
        return 1.0;
    }
  };

  /**
   * Get activity type adjustment
   * 
   * @param activityType - Type of activity
   * @returns Price adjustment amount
   */
  const getActivityAdjustment = (activityType: ActivityType): number => {
    switch (activityType) {
      case "sport":
        return 0; // No adjustment
      case "kultur":
        return -50; // 50 kr discount
      case "møte":
        return 100; // 100 kr surcharge
      case "arrangement":
        return 200; // 200 kr surcharge
      case "trening":
        return 0; // No adjustment
      case "annet":
        return 0; // No adjustment
      default:
        return 0;
    }
  };

  /**
   * Get actor type description
   * 
   * @param actorType - Type of actor
   * @returns Description string
   */
  const getActorDescription = (actorType: ActorType): string => {
    switch (actorType) {
      case "lag-foreninger":
        return "Lag/foreninger (20% rabatt)";
      case "paraply":
        return "Paraplyorganisasjoner (30% rabatt)";
      case "private-firma":
        return "Private firma (20% tillegg)";
      case "kommunale-enheter":
        return "Kommunale enheter (50% rabatt)";
      default:
        return "Privatperson";
    }
  };

  /**
   * Get activity type description
   * 
   * @param activityType - Type of activity
   * @returns Description string
   */
  const getActivityDescription = (activityType: ActivityType): string => {
    switch (activityType) {
      case "kultur":
        return "Kultur (50 kr rabatt)";
      case "møte":
        return "Møte (100 kr tillegg)";
      case "arrangement":
        return "Arrangement (200 kr tillegg)";
      default:
        return "Aktivitet";
    }
  };

  /**
   * Calculate pricing for selected slots
   * 
   * @returns Calculated pricing information
   */
  const pricing = useMemo(() => {
    if (selectedSlots.length === 0) {
      return {
        basePrice: 0,
        totalPrice: 0,
        vatAmount: 0,
        finalPrice: 0,
        breakdown: [],
        requiresApproval: false,
      };
    }

    // Calculate base price
    const basePrice = selectedSlots.reduce((total, slot) => {
      return total + (slot.pricePerHour * slot.duration);
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
    const breakdown = [
      {
        description: "Grunnpris",
        amount: basePrice,
        type: "base" as const,
      },
    ];

    if (actorMultiplier !== 1) {
      breakdown.push({
        description: getActorDescription(actorType),
        amount: adjustedPrice - basePrice,
        type: actorMultiplier < 1 ? "discount" as const : "surcharge" as const,
      });
    }

    if (activityAdjustment !== 0) {
      breakdown.push({
        description: getActivityDescription(activityType),
        amount: activityAdjustment,
        type: activityAdjustment < 0 ? "discount" as const : "surcharge" as const,
      });
    }

    // Check if approval is required
    const requiresApproval = actorType === "kommunale-enheter" || finalPrice > 5000;

    return {
      basePrice: finalBasePrice,
      totalPrice: finalBasePrice,
      vatAmount,
      finalPrice,
      breakdown,
      requiresApproval,
    };
  }, [selectedSlots, actorType, activityType]);

  if (selectedSlots.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Prisberegning
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Velg tidspunkter for å se pris
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Prisberegning
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
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
            <span>MVA (25%):</span>
            <span>{Math.round(pricing.vatAmount)} kr</span>
          </div>

          {/* Total */}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
            <span>Total inkl. MVA:</span>
            <span>{Math.round(pricing.finalPrice)} kr</span>
          </div>
        </div>

        {/* Special Notices */}
        {pricing.requiresApproval && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Godkjenning påkrevd</p>
                <p className="text-xs mt-1">
                  Denne bookingen krever godkjenning fra administrator
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Beregner pris...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceCalculation;
