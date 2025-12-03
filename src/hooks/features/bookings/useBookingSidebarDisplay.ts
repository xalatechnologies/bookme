"use client";

import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ISelectedTimeSlot, BookingType } from "@/components/features/bookings/types";
import type { IPriceCalculationResult } from "@/components/features/bookings/components/StepByStepBooking/hooks/usePriceCalculation";

/**
 * Booking sidebar display hook props
 */
interface IUseBookingSidebarDisplayProps {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly recurringSlots: readonly ISelectedTimeSlot[];
  readonly bookingType: BookingType;
  readonly priceCalculation?: IPriceCalculationResult;
}

/**
 * Booking sidebar display hook return type
 */
interface IUseBookingSidebarDisplayReturn {
  readonly title: string;
  readonly hasSlots: boolean;
  readonly isRecurring: boolean;
  readonly currentLocale: string;
  readonly shouldShowTemplate: boolean;
  readonly shouldShowRecurringPreview: boolean;
  readonly visibleRecurringSlots: readonly ISelectedTimeSlot[];
  readonly remainingRecurringSlotsCount: number;
  readonly shouldShowClearButton: boolean;
  readonly formatSlotDate: (date: Date | string) => string;
  readonly formatPrice: (amount: number) => string;
}

/**
 * Custom hook for booking sidebar display logic
 *
 * Provides computed display values and formatting for the BookingSidebar component:
 * - Dynamic title based on booking state
 * - Locale-aware formatting
 * - Slot visibility calculations
 * - Conditional rendering flags
 *
 * This hook encapsulates all display logic, separating it from
 * the rendering concerns of the BookingSidebar component.
 *
 * @param props - Hook configuration
 * @returns Display values and formatting utilities
 */
export const useBookingSidebarDisplay = ({
  selectedSlots,
  recurringSlots,
  bookingType,
  _priceCalculation,
}: IUseBookingSidebarDisplayProps): IUseBookingSidebarDisplayReturn => {
  const { t, i18n } = useTranslation("booking");

  /**
   * Current locale for date formatting
   */
  const currentLocale = useMemo(
    () => (i18n.language === "en" ? "en-US" : "nb-NO"),
    [i18n.language]
  );

  /**
   * Check if there are any selected slots
   */
  const hasSlots = useMemo(
    () => selectedSlots.length > 0 || recurringSlots.length > 0,
    [selectedSlots.length, recurringSlots.length]
  );

  /**
   * Check if booking type is recurring
   */
  const isRecurring = useMemo(
    () => bookingType === "recurring",
    [bookingType]
  );

  /**
   * Determine if template view should be shown
   */
  const shouldShowTemplate = useMemo(
    () => isRecurring && recurringSlots.length > 0,
    [isRecurring, recurringSlots.length]
  );

  /**
   * Determine if recurring preview should be shown
   */
  const shouldShowRecurringPreview = useMemo(
    () => isRecurring && recurringSlots.length > 0,
    [isRecurring, recurringSlots.length]
  );

  /**
   * Get visible recurring slots (first 5)
   */
  const visibleRecurringSlots = useMemo(
    () => recurringSlots.slice(0, 5),
    [recurringSlots]
  );

  /**
   * Calculate remaining recurring slots count
   */
  const remainingRecurringSlotsCount = useMemo(
    () => Math.max(0, recurringSlots.length - 5),
    [recurringSlots.length]
  );

  /**
   * Determine if clear all button should be shown
   */
  const shouldShowClearButton = useMemo(
    () => selectedSlots.length > 1 || recurringSlots.length > 0,
    [selectedSlots.length, recurringSlots.length]
  );

  /**
   * Get appropriate title based on current state
   */
  const title = useMemo((): string => {
    if (!hasSlots) {
      return t(
        "details.select_slots_pricing",
        "Velg tidspunkter og få en prisberegning"
      );
    }

    if (isRecurring) {
      return recurringSlots.length > 0
        ? t(
            "details.recurring_slots_pricing",
            "Gjentakende tidspunkter og prisberegning"
          )
        : t(
            "details.select_pattern",
            "Tidspunkter og prisberegning (velg gjentakelsesmønster)"
          );
    }

    return t(
      "details.selected_slots_pricing",
      "Valgte tidspunkter og prisberegning"
    );
  }, [hasSlots, isRecurring, recurringSlots.length, t]);

  /**
   * Format slot date for display
   *
   * @param date - Date to format (Date object or string)
   * @returns Formatted date string
   */
  const formatSlotDate = useCallback(
    (date: Date | string): string => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString(currentLocale);
    },
    [currentLocale]
  );

  /**
   * Format price for display
   *
   * @param amount - Amount to format
   * @returns Formatted price string (e.g., "kr 1,234.56")
   */
  const formatPrice = useCallback((amount: number): string => {
    return `kr ${Math.abs(amount).toFixed(2)}`;
  }, []);

  return {
    title,
    hasSlots,
    isRecurring,
    currentLocale,
    shouldShowTemplate,
    shouldShowRecurringPreview,
    visibleRecurringSlots,
    remainingRecurringSlotsCount,
    shouldShowClearButton,
    formatSlotDate,
    formatPrice,
  };
};
