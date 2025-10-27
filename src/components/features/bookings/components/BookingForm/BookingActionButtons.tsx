"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, CreditCard, Trash2 } from "lucide-react";
import { IBookingActionButtonsProps } from "../../types";

/**
 * Booking action buttons component
 * 
 * Provides action buttons for booking operations including
 * adding to cart, completing booking, and clearing selections.
 * 
 * Features:
 * - Terms and conditions checkbox
 * - Add to cart button
 * - Complete booking button
 * - Clear all button
 * - Form validation
 * - Loading states
 * - Accessibility support
 * 
 * @param props - Booking action buttons props
 */
export const BookingActionButtons: React.FC<IBookingActionButtonsProps> = ({
  isFormValid,
  isLoading,
  onAddToCart,
  onCompleteBooking,
  onClearSlots,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['bookings', 'common']);
  const [termsAccepted, setTermsAccepted] = React.useState<boolean>(false);

  /**
   * Check if all conditions are met for booking
   * 
   * @returns True if booking can proceed
   */
  const canProceed = (): boolean => {
    return isFormValid && termsAccepted && !isLoading;
  };

  /**
   * Handle terms acceptance change
   * 
   * @param accepted - Whether terms are accepted
   */
  const handleTermsChange = (accepted: boolean): void => {
    setTermsAccepted(accepted);
  };

  /**
   * Handle add to cart click
   */
  const handleAddToCart = (): void => {
    if (canProceed()) {
      onAddToCart();
    }
  };

  /**
   * Handle complete booking click
   */
  const handleCompleteBooking = (): void => {
    if (canProceed()) {
      onCompleteBooking();
      navigate("/checkout");
    }
  };

  /**
   * Handle clear slots click
   */
  const handleClearSlots = (): void => {
    onClearSlots();
    setTermsAccepted(false);
  };

  return (
    <div className="space-y-4">
      {/* Terms and Conditions */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => handleTermsChange(!!checked)}
          className="mt-1"
          disabled={isLoading}
        />
        <div className="text-sm leading-relaxed">
          <label htmlFor="terms" className="cursor-pointer">
            {t('bookings:terms.accept_label')}{" "}
            <a
              href="/vilkar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {t('bookings:terms.accept_terms_and_privacy')}
            </a>
            {" "}{t('bookings:terms.and')}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              {t('bookings:terms.privacy_policy')}
            </a>
            {" "}{t('bookings:terms.for_use')}{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={!canProceed()}
          variant="outline"
          className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 py-3"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {t('bookings:button_labels.add_to_cart')}
        </Button>

        {/* Complete Booking Button */}
        <Button
          onClick={handleCompleteBooking}
          disabled={!canProceed()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          size="lg"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          {t('bookings:button_labels.complete_booking')}
        </Button>

        {/* Clear All Button */}
        <Button
          onClick={handleClearSlots}
          disabled={isLoading}
          variant="ghost"
          className="w-full text-gray-600 hover:text-red-600 hover:bg-red-50 py-2"
          size="sm"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t('bookings:sidebar.clear_all_slots')}
        </Button>
      </div>

      {/* Validation Messages */}
      {!isFormValid && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <p className="font-medium">{t('bookings:validation.form_incomplete')}</p>
          <p className="text-xs mt-1">
            {t('bookings:validation.fill_required_fields')}
          </p>
        </div>
      )}

      {!termsAccepted && isFormValid && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="font-medium">{t('bookings:validation.terms_required')}</p>
          <p className="text-xs mt-1">
            {t('bookings:validation.accept_terms_message')}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="text-sm text-gray-500">{t('bookings:validation.processing')}</div>
        </div>
      )}
    </div>
  );
};

export default BookingActionButtons;
