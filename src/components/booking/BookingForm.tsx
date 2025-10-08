"use client";

// External libraries
import React, { useState } from "react";

// Internal libraries/utilities
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sibling imports
import { SelectedSlotsDisplay } from "./SelectedSlotsDisplay";
import { PriceCalculation } from "./PriceCalculation";
import { BookingActionButtons } from "./BookingActionButtons";

// Types
import { IBookingFormData, ActorType, ActivityType, ISelectedTimeSlot } from "./types";

/**
 * Booking form component
 * 
 * Main booking form that combines all booking-related components
 * including slot selection, pricing, and action buttons.
 * 
 * Features:
 * - Form validation
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
}) => {
  const [formData, setFormData] = useState<IBookingFormData>({
    purpose: "",
    attendees: 1,
    activityType: "annet",
    additionalInfo: "",
    actorType: "private-person",
    termsAccepted: false,
    bookingType: "one-time",
  });

  /**
   * Update form data
   * 
   * @param updates - Partial form data updates
   */
  const updateFormData = (updates: Partial<IBookingFormData>): void => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  /**
   * Remove a selected slot
   * 
   * @param slotId - ID of slot to remove
   */
  const handleRemoveSlot = (slotId: string): void => {
    const newSlots = selectedSlots.filter(slot => slot.id !== slotId);
    onSlotsChange(newSlots);
  };

  /**
   * Clear all selected slots
   */
  const handleClearAll = (): void => {
    onSlotsChange([]);
  };

  /**
   * Validate form data
   * 
   * @returns True if form is valid
   */
  const isFormValid = (): boolean => {
    return (
      formData.purpose.trim().length > 0 &&
      formData.attendees > 0 &&
      formData.activityType !== "annet" &&
      formData.actorType !== "private-person" &&
      selectedSlots.length > 0
    );
  };

  /**
   * Handle add to cart
   */
  const handleAddToCart = (): void => {
    if (isFormValid()) {
      onAddToCart(formData);
    }
  };

  /**
   * Handle complete booking
   */
  const handleCompleteBooking = (): void => {
    if (isFormValid()) {
      onCompleteBooking(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Form - Moved to top */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            Booking detaljer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              Formål med bookingen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => updateFormData({ purpose: e.target.value })}
              placeholder="F.eks. fotballtrening, møte, arrangement"
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees" className="text-sm font-medium">
              Antall deltakere <span className="text-red-500">*</span>
            </Label>
            <Input
              id="attendees"
              type="number"
              min="1"
              value={formData.attendees}
              onChange={(e) => updateFormData({ attendees: parseInt(e.target.value) || 1 })}
              disabled={isLoading}
              className="w-full"
            />
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType" className="text-sm font-medium">
              Type aktivitet <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.activityType}
              onValueChange={(value) => updateFormData({ activityType: value as ActivityType })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Velg aktivitetstype" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sport">Sport</SelectItem>
                <SelectItem value="kultur">Kultur</SelectItem>
                <SelectItem value="møte">Møte</SelectItem>
                <SelectItem value="arrangement">Arrangement</SelectItem>
                <SelectItem value="trening">Trening</SelectItem>
                <SelectItem value="annet">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actor Type */}
          <div className="space-y-2">
            <Label htmlFor="actorType" className="text-sm font-medium">
              Aktør type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.actorType}
              onValueChange={(value) => updateFormData({ actorType: value as ActorType })}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Velg aktør type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private-person">Privatperson</SelectItem>
                <SelectItem value="lag-foreninger">Lag og foreninger</SelectItem>
                <SelectItem value="paraply">Paraplyorganisasjoner</SelectItem>
                <SelectItem value="private-firma">Private firma</SelectItem>
                <SelectItem value="kommunale-enheter">Kommunale enheter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-sm font-medium">
              Tilleggsinformasjon
            </Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => updateFormData({ additionalInfo: e.target.value })}
              placeholder="Eventuelle spesielle ønsker eller behov"
              disabled={isLoading}
              className="w-full"
              rows={3}
            />
          </div>
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
            {selectedSlots.length > 0 ? "Valgte tidspunkter og prisberegning" : "Velg tidspunkter og få en prisberegning"}
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
          <p className="font-medium">Feil oppstod</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
