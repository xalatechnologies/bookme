/**
 * useBookingCoordination Hook
 *
 * Coordinates booking flow and state management including:
 * - Slot selection coordination
 * - Booking form state
 * - Cart operations
 * - Conflict checking
 * - Booking completion
 *
 * @returns Booking coordination functions and state
 */

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "@/contexts/CartContext";
import type {
  ISelectedTimeSlot,
  IZone,
  BookingType,
} from "@/components/features/bookings/types";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import type { PricingBreakdown } from "./useCalendarPricing";

export interface BookingFormData {
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly additionalInfo: string;
  readonly actorType: string;
  readonly bookingType: BookingType;
  readonly recurrencePattern?: RecurrencePattern | null;
  readonly recurringSlots?: readonly ISelectedTimeSlot[];
}

export interface CartItemData {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly timeSlots: readonly ISelectedTimeSlot[];
  readonly purpose: string;
  readonly attendees: number;
  readonly activityType: string;
  readonly additionalInfo: string;
  readonly actorType: string;
  readonly bookingType: BookingType;
  readonly recurrencePattern: RecurrencePattern | null;
  readonly pricing: {
    readonly basePrice: number;
    readonly totalPrice: number;
    readonly vatAmount: number;
    readonly finalPrice: number;
  };
  readonly status: "pending";
}

export interface UseBookingCoordinationProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly selectedZone: IZone | undefined;
  readonly recurrencePattern: RecurrencePattern | null;
  readonly t: (key: string) => string;
}

export interface UseBookingCoordinationReturn {
  readonly handleAddToCart: (
    bookingData: BookingFormData,
    allSelectedSlots: readonly ISelectedTimeSlot[],
    pricing: PricingBreakdown,
    clearSelection: () => void,
    clearRecurringSlots: () => void
  ) => void;
  readonly handleCompleteBooking: (
    bookingData: BookingFormData,
    allSelectedSlots: readonly ISelectedTimeSlot[],
    pricing: PricingBreakdown,
    clearSelection: () => void,
    clearRecurringSlots: () => void
  ) => void;
  readonly createCartItem: (
    bookingData: BookingFormData,
    pricing: PricingBreakdown,
    slotsToUse: readonly ISelectedTimeSlot[]
  ) => CartItemData;
  readonly handleSlotClickCoordination: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    status: string,
    handleSlotClick: (
      zoneId: string,
      date: Date,
      timeSlot: string,
      status: string,
      facilityId: string,
      pricePerHour: number
    ) => void,
    stepByStepSelectedSlots: readonly ISelectedTimeSlot[],
    handleSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void,
    useStepByStepBooking: boolean,
    selectedZonePricePerHour: number
  ) => void;
  readonly handleBulkSelectCoordination: (
    slots: readonly ISelectedTimeSlot[],
    handleBulkSlotSelection: (slots: readonly ISelectedTimeSlot[]) => void,
    stepByStepSelectedSlots: readonly ISelectedTimeSlot[],
    handleSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void,
    useStepByStepBooking: boolean,
    selectedZonePricePerHour: number
  ) => void;
}

/**
 * Hook for coordinating booking flow and operations
 */
export const useBookingCoordination = ({
  facilityId,
  facilityName,
  selectedZone,
  recurrencePattern,
  t,
}: UseBookingCoordinationProps): UseBookingCoordinationReturn => {
  const navigate = useNavigate();
  const { addItem } = useCart();

  /**
   * Create cart item from booking data
   *
   * @param bookingData - Booking form data
   * @param pricing - Pricing breakdown
   * @param slotsToUse - Time slots to include
   * @returns Cart item data
   */
  const createCartItem = useCallback(
    (
      bookingData: BookingFormData,
      pricing: PricingBreakdown,
      slotsToUse: readonly ISelectedTimeSlot[]
    ): CartItemData => {
      if (!selectedZone) {
        throw new Error("No zone selected");
      }

      // Use recurrencePattern from bookingData if available
      const patternToUse =
        bookingData.recurrencePattern !== undefined
          ? bookingData.recurrencePattern
          : recurrencePattern;

      return {
        facilityId,
        facilityName,
        zoneId: selectedZone.id,
        zoneName: selectedZone.name,
        timeSlots: slotsToUse,
        purpose: bookingData.purpose,
        attendees: bookingData.attendees,
        activityType: bookingData.activityType,
        additionalInfo: bookingData.additionalInfo,
        actorType: bookingData.actorType,
        bookingType: bookingData.bookingType,
        recurrencePattern: patternToUse,
        pricing: {
          basePrice: pricing.basePrice,
          totalPrice: pricing.adjustedBasePrice,
          vatAmount: pricing.vatAmount,
          finalPrice: pricing.finalPrice,
        },
        status: "pending" as const,
      };
    },
    [selectedZone, facilityId, facilityName, recurrencePattern]
  );

  /**
   * Handle adding booking to cart
   *
   * @param bookingData - Booking form data
   * @param allSelectedSlots - All selected slots
   * @param pricing - Pricing breakdown
   * @param clearSelection - Function to clear selection
   * @param clearRecurringSlots - Function to clear recurring slots
   */
  const handleAddToCart = useCallback(
    (
      bookingData: BookingFormData,
      allSelectedSlots: readonly ISelectedTimeSlot[],
      pricing: PricingBreakdown,
      clearSelection: () => void,
      clearRecurringSlots: () => void
    ): void => {
      try {
        if (!selectedZone) {
          toast.error(t("errors.no_zone_selected"));
          return;
        }

        // Use recurring slots if available, otherwise use selected slots
        const slotsToUse =
          bookingData.recurringSlots && bookingData.recurringSlots.length > 0
            ? bookingData.recurringSlots
            : allSelectedSlots;

        if (slotsToUse.length === 0) {
          toast.error(t("errors.no_slots_selected"));
          return;
        }

        const cartItem = createCartItem(bookingData, pricing, slotsToUse);

        addItem(cartItem);
        clearSelection();
        clearRecurringSlots();
        toast.success(t("toast.booking_added_to_cart"));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.save_failed");
        toast.error(`${t("errors.add_to_cart_failed")}: ${errorMessage}`);
      }
    },
    [selectedZone, createCartItem, addItem, t]
  );

  /**
   * Handle completing a booking (add to cart and navigate to checkout)
   *
   * @param bookingData - Booking form data
   * @param allSelectedSlots - All selected slots
   * @param pricing - Pricing breakdown
   * @param clearSelection - Function to clear selection
   * @param clearRecurringSlots - Function to clear recurring slots
   */
  const handleCompleteBooking = useCallback(
    (
      bookingData: BookingFormData,
      allSelectedSlots: readonly ISelectedTimeSlot[],
      pricing: PricingBreakdown,
      clearSelection: () => void,
      clearRecurringSlots: () => void
    ): void => {
      try {
        if (!selectedZone) {
          toast.error(t("errors.no_zone_selected"));
          return;
        }

        // Use recurring slots if available, otherwise use selected slots
        const slotsToUse =
          bookingData.recurringSlots && bookingData.recurringSlots.length > 0
            ? bookingData.recurringSlots
            : allSelectedSlots;

        if (slotsToUse.length === 0) {
          toast.error(t("errors.no_slots_selected"));
          return;
        }

        const cartItem = createCartItem(bookingData, pricing, slotsToUse);

        addItem(cartItem);
        clearSelection();
        clearRecurringSlots();
        toast.success(t("toast.booking_added_to_cart"));

        // Navigate to checkout
        navigate("/checkout");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.save_failed");
        toast.error(`${t("errors.complete_booking_failed")}: ${errorMessage}`);
      }
    },
    [selectedZone, createCartItem, addItem, navigate, t]
  );

  /**
   * Coordinate slot click with zone context
   *
   * @param zoneId - Zone ID
   * @param date - Date of slot
   * @param timeSlot - Time slot string
   * @param status - Slot status
   * @param handleSlotClick - Slot click handler
   * @param stepByStepSelectedSlots - Currently selected slots
   * @param handleSlotsChange - Function to update slots
   * @param useStepByStepBooking - Whether using step-by-step mode
   * @param selectedZonePricePerHour - Price per hour for zone
   */
  const handleSlotClickCoordination = useCallback(
    (
      zoneId: string,
      date: Date,
      timeSlot: string,
      status: string,
      handleSlotClick: (
        zoneId: string,
        date: Date,
        timeSlot: string,
        status: string,
        facilityId: string,
        pricePerHour: number
      ) => void,
      stepByStepSelectedSlots: readonly ISelectedTimeSlot[],
      handleSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void,
      useStepByStepBooking: boolean,
      selectedZonePricePerHour: number
    ): void => {
      if (status === "available" || status === "selected") {
        // Call the slot selection hook
        handleSlotClick(
          zoneId,
          date,
          timeSlot,
          status,
          facilityId,
          selectedZonePricePerHour
        );

        // Update external slots if in step-by-step mode
        if (useStepByStepBooking) {
          const updatedSlots = [...stepByStepSelectedSlots];
          const existingIndex = updatedSlots.findIndex((slot) => {
            const slotDate =
              slot.date instanceof Date ? slot.date : new Date(slot.date);
            return (
              slot.zoneId === zoneId &&
              slotDate.toDateString() === date.toDateString() &&
              slot.timeSlot === timeSlot
            );
          });

          if (existingIndex >= 0) {
            updatedSlots.splice(existingIndex, 1);
          } else {
            // Calculate duration
            const [startTime, endTime] = timeSlot.split("-");
            const startMinutes =
              parseInt(startTime.split(":")[0]) * 60 +
              parseInt(startTime.split(":")[1]);
            const endMinutes =
              parseInt(endTime.split(":")[0]) * 60 +
              parseInt(endTime.split(":")[1]);
            const duration = endMinutes - startMinutes;

            const newSlot: ISelectedTimeSlot = {
              id: `${facilityId}-${zoneId}-${
                date.toISOString().split("T")[0]
              }-${timeSlot}`,
              facilityId,
              zoneId,
              date,
              timeSlot,
              duration,
              pricePerHour: selectedZonePricePerHour,
            };
            updatedSlots.push(newSlot);
          }

          handleSlotsChange(updatedSlots);
        }
      }
    },
    [facilityId]
  );

  /**
   * Coordinate bulk slot selection
   *
   * @param slots - Selected slots
   * @param handleBulkSlotSelection - Bulk selection handler
   * @param stepByStepSelectedSlots - Currently selected slots
   * @param handleSlotsChange - Function to update slots
   * @param useStepByStepBooking - Whether using step-by-step mode
   * @param selectedZonePricePerHour - Price per hour for zone
   */
  const handleBulkSelectCoordination = useCallback(
    (
      slots: readonly ISelectedTimeSlot[],
      handleBulkSlotSelection: (slots: readonly ISelectedTimeSlot[]) => void,
      stepByStepSelectedSlots: readonly ISelectedTimeSlot[],
      handleSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void,
      useStepByStepBooking: boolean,
      selectedZonePricePerHour: number
    ): void => {
      // Update slots with facility context
      const updatedSlots: ISelectedTimeSlot[] = slots.map((slot) => ({
        ...slot,
        facilityId,
        pricePerHour: selectedZonePricePerHour,
      }));

      handleBulkSlotSelection(updatedSlots);

      // Update external slots if in step-by-step mode
      if (useStepByStepBooking) {
        const currentSlots = [...stepByStepSelectedSlots];

        updatedSlots.forEach((dragSlot) => {
          const existingIndex = currentSlots.findIndex((existingSlot) => {
            const existingDate =
              existingSlot.date instanceof Date
                ? existingSlot.date
                : new Date(existingSlot.date);
            const dragDate =
              dragSlot.date instanceof Date
                ? dragSlot.date
                : new Date(dragSlot.date);
            return (
              existingSlot.zoneId === dragSlot.zoneId &&
              existingDate.toDateString() === dragDate.toDateString() &&
              existingSlot.timeSlot === dragSlot.timeSlot
            );
          });

          if (existingIndex >= 0) {
            currentSlots.splice(existingIndex, 1);
          } else {
            currentSlots.push(dragSlot);
          }
        });

        handleSlotsChange(currentSlots);
      }
    },
    [facilityId]
  );

  return {
    handleAddToCart,
    handleCompleteBooking,
    createCartItem,
    handleSlotClickCoordination,
    handleBulkSelectCoordination,
  };
};
