/**
 * PricingDisplay Component
 *
 * Displays pricing breakdown for bookings including:
 * - Base price
 * - Actor type adjustments
 * - Activity type adjustments
 * - VAT calculation
 * - Total price
 *
 * Pure presentational component for pricing information.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PricingBreakdown } from "@/hooks/features/calendar/useCalendarPricing";

export interface PricingDisplayProps {
  readonly pricing: PricingBreakdown;
  readonly formatPrice: (price: number) => string;
  readonly slotCount?: number;
  readonly showBreakdown?: boolean;
}

/**
 * PricingDisplay Component
 *
 * Renders pricing information with optional breakdown
 */
export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  pricing,
  formatPrice,
  slotCount = 0,
  showBreakdown = true,
}): JSX.Element => {
  const { t } = useTranslation("calendar");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{t("pricing.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {showBreakdown && (
          <>
            {/* Slot Count */}
            {slotCount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("pricing.slots_selected")}</span>
                <span className="font-medium">{slotCount}</span>
              </div>
            )}

            {/* Base Price */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t("pricing.base_price")}</span>
              <span className="font-medium">{formatPrice(pricing.basePrice)}</span>
            </div>

            {/* Actor Multiplier (if not 1.0) */}
            {pricing.actorMultiplier !== 1.0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("pricing.actor_adjustment")}</span>
                <span
                  className={`font-medium ${
                    pricing.actorMultiplier < 1.0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {pricing.actorMultiplier < 1.0 ? "-" : "+"}
                  {Math.abs(
                    (1 - pricing.actorMultiplier) * pricing.basePrice
                  ).toFixed(0)}{" "}
                  kr
                </span>
              </div>
            )}

            {/* Activity Adjustment (if not 0) */}
            {pricing.activityAdjustment !== 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t("pricing.activity_adjustment")}</span>
                <span
                  className={`font-medium ${
                    pricing.activityAdjustment < 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {pricing.activityAdjustment > 0 ? "+" : ""}
                  {pricing.activityAdjustment} kr
                </span>
              </div>
            )}

            {/* Adjusted Base Price (if different from base) */}
            {pricing.adjustedBasePrice !== pricing.basePrice && (
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>{t("pricing.adjusted_price")}</span>
                <span>{formatPrice(pricing.adjustedBasePrice)}</span>
              </div>
            )}

            {/* VAT */}
            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {t("pricing.vat")} ({(pricing.vatRate * 100).toFixed(0)}%)
              </span>
              <span className="font-medium">{formatPrice(pricing.vatAmount)}</span>
            </div>
          </>
        )}

        {/* Final Price */}
        <div className="flex justify-between text-lg font-bold border-t-2 pt-3">
          <span>{t("pricing.total")}</span>
          <span className="text-blue-600">{formatPrice(pricing.finalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
