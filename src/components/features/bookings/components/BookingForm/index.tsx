"use client";

// External libraries
import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

// Internal libraries/utilities
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/common/forms/FormField";
import { useBookingFormValidation } from "@/hooks/features/bookings";

// Sibling imports
import { SelectedSlotsDisplay } from "./SelectedSlotsDisplay";
import { PriceCalculation } from "./PriceCalculation";
import { BookingActionButtons } from "./BookingActionButtons";

// Types
import {
  IBookingFormData,
  ActorType,
  ActivityType,
  ISelectedTimeSlot,
} from "../../types";

/**
 * Booking form component
 *
 * Main booking form that combines all booking-related components
 * including slot selection, pricing, and action buttons.
 *
 * Refactored with:
 * - i18n support using react-i18next
 * - SOLID principles (SRP - form state management)
 * - Reusable FormField components
 * - Validation hook
 * - Pixel-perfect UI/UX maintained
 *
 * Features:
 * - Form validation with i18n
 * - Price calculation
 * - Cart integration
 * - Responsive design
 * - Loading states
 * - Error handling
 *
 * @param props - Booking form props
 */
export interface IBookingFormProps {
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

export const BookingForm: React.FC<IBookingFormProps> = ({
  facilityId,
  facilityName,
  zoneId,
  selectedSlots,
  onSlotsChange,
  onAddToCart,
  onCompleteBooking,
  isLoading = false,
  error,
}): JSX.Element => {
  const { t } = useTranslation(["bookings", "validation", "common"]);

  const [formData, setFormData] = useState<IBookingFormData>({
    purpose: "",
    attendees: 1,
    activityType: "",
    additionalInfo: "",
    actorType: "",
    termsAccepted: false,
    bookingType: "one-time",
  });

  // Validation hook with comprehensive validation logic and form options
  const {
    errors,
    validateAll,
    clearError,
    isFormValid: checkFormValid,
    activityTypeOptions,
    actorTypeOptions,
  } = useBookingFormValidation();

  /**
   * Update form data
   *
   * @param updates - Partial form data updates
   */
  const updateFormData = useCallback(
    (updates: Partial<IBookingFormData>): void => {
      setFormData((prev) => ({ ...prev, ...updates }));

      // Clear errors for updated fields
      Object.keys(updates).forEach((key) => clearError(key));
    },
    [clearError]
  );

  /**
   * Remove a selected slot
   *
   * @param slotId - ID of slot to remove
   */
  const handleRemoveSlot = useCallback(
    (slotId: string): void => {
      const newSlots = Array.from(selectedSlots).filter(
        (slot) => slot.id !== slotId
      );
      onSlotsChange(newSlots);
    },
    [selectedSlots, onSlotsChange]
  );

  /**
   * Clear all selected slots
   */
  const handleClearAll = useCallback((): void => {
    onSlotsChange([]);
  }, [onSlotsChange]);

  /**
   * Check if form is valid using validation hook
   *
   * @returns True if form is valid
   */
  const isFormValid = useCallback((): boolean => {
    return checkFormValid(formData, selectedSlots);
  }, [checkFormValid, formData, selectedSlots]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback((): void => {
    if (validateAll(formData) && isFormValid()) {
      onAddToCart(formData);
    }
  }, [formData, validateAll, isFormValid, onAddToCart]);

  /**
   * Handle complete booking
   */
  const handleCompleteBooking = useCallback((): void => {
    if (validateAll(formData) && isFormValid()) {
      onCompleteBooking(formData);
    }
  }, [formData, validateAll, isFormValid, onCompleteBooking]);

  return (
    <div className="space-y-6">
      {/* Booking Form - Moved to top */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            {t("bookings:details.booking_details", "Booking detaljer")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Purpose */}
          <FormField
            id="purpose"
            name="purpose"
            label={t("bookings:fields.purpose", "Formål med bookingen")}
            type="text"
            value={formData.purpose}
            onChange={(value) => updateFormData({ purpose: String(value) })}
            placeholder={t(
              "bookings:placeholders.purpose",
              "F.eks. fotballtrening, møte, arrangement"
            )}
            required
            disabled={isLoading}
            error={errors.purpose}
          />

          {/* Attendees */}
          <FormField
            id="attendees"
            name="attendees"
            label={t("bookings:fields.participants", "Antall deltakere")}
            type="number"
            value={formData.attendees}
            onChange={(value) =>
              updateFormData({ attendees: Number(value) || 1 })
            }
            min={1}
            required
            disabled={isLoading}
            error={errors.attendees}
          />

          {/* Activity Type */}
          <FormField
            id="activityType"
            name="activityType"
            label={t("bookings:fields.activity_type", "Type aktivitet")}
            type="select"
            value={formData.activityType}
            onChange={(value) =>
              updateFormData({ activityType: String(value) as ActivityType })
            }
            placeholder={t(
              "bookings:placeholders.activity_type",
              "Velg aktivitetstype"
            )}
            options={activityTypeOptions}
            required
            disabled={isLoading}
            error={errors.activityType}
          />

          {/* Actor Type */}
          <FormField
            id="actorType"
            name="actorType"
            label={t("bookings:fields.actor_type", "Aktør type")}
            type="select"
            value={formData.actorType}
            onChange={(value) =>
              updateFormData({ actorType: String(value) as ActorType })
            }
            placeholder={t(
              "bookings:placeholders.actor_type",
              "Velg aktør type"
            )}
            options={actorTypeOptions}
            required
            disabled={isLoading}
            error={errors.actorType}
          />

          {/* Additional Info */}
          <FormField
            id="additionalInfo"
            name="additionalInfo"
            label={t("bookings:fields.special_requests", "Tilleggsinformasjon")}
            type="textarea"
            value={formData.additionalInfo}
            onChange={(value) =>
              updateFormData({ additionalInfo: String(value) })
            }
            placeholder={t(
              "bookings:placeholders.additional_info",
              "Eventuelle spesielle ønsker eller behov"
            )}
            disabled={isLoading}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <BookingActionButtons
        isFormValid={isFormValid()}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        onCompleteBooking={handleCompleteBooking}
        onClearSlots={handleClearAll}
      />

      {/* Selected Slots Display and Price Calculation - Combined */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            {selectedSlots.length > 0
              ? t(
                  "bookings:details.selected_slots_pricing",
                  "Valgte tidspunkter og prisberegning"
                )
              : t(
                  "bookings:details.select_slots_pricing",
                  "Velg tidspunkter og få en prisberegning"
                )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Selected Slots Display */}
          <SelectedSlotsDisplay
            selectedSlots={selectedSlots}
            onRemoveSlot={handleRemoveSlot}
            onClearAll={handleClearAll}
            isLoading={isLoading}
          />

          {/* Price Calculation */}
          <PriceCalculation
            selectedSlots={selectedSlots}
            actorType={formData.actorType}
            activityType={formData.activityType}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="font-medium">
            {t("common:messages.error.generic", "Feil oppstod")}
          </p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
