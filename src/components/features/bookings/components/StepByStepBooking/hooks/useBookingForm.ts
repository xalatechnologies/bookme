import { useState, useCallback } from 'react';
import { IBookingFormData, BookingType } from '@/components/features/bookings/types';
import type { RecurrencePattern } from '@/utils/recurrenceEngine';

/**
 * Form validation errors
 */
export interface IFormErrors {
  purpose?: string;
  attendees?: string;
  activityType?: string;
  actorType?: string;
  termsAccepted?: string;
}

/**
 * Initial form data
 */
const initialFormData: IBookingFormData = {
  purpose: "",
  attendees: 1,
  activityType: "",
  additionalInfo: "",
  actorType: "",
  termsAccepted: false,
  bookingType: "one-time",
};

/**
 * Booking form state management hook
 *
 * Manages form data state, validation, and updates
 * Follows Single Responsibility Principle - only handles form state
 *
 * @returns Form state and handlers
 */
export const useBookingForm = () => {
  const [formData, setFormData] = useState<IBookingFormData>(initialFormData);
  const [errors, setErrors] = useState<IFormErrors>({});

  /**
   * Update single field
   */
  const updateField = useCallback((field: keyof IBookingFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field as keyof IFormErrors];
      return newErrors;
    });
  }, []);

  /**
   * Update multiple fields
   */
  const updateFormData = useCallback((updates: Partial<IBookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Validate details step
   */
  const validateDetailsStep = useCallback((): boolean => {
    const newErrors: Partial<IFormErrors> = {};

    if (!formData.purpose || formData.purpose.trim().length === 0) {
      newErrors.purpose = "Formål er påkrevd";
    }

    if (!formData.attendees || formData.attendees < 1) {
      newErrors.attendees = "Minimum 1 deltaker";
    }

    if (!formData.activityType || formData.activityType.trim().length === 0) {
      newErrors.activityType = "Velg aktivitetstype";
    }

    if (!formData.actorType || formData.actorType.trim().length === 0) {
      newErrors.actorType = "Velg aktør type";
    }

    setErrors(newErrors as IFormErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Validate terms step
   */
  const validateTermsStep = useCallback((): boolean => {
    if (!formData.termsAccepted) {
      setErrors({ termsAccepted: "Du må godta vilkårene" });
      return false;
    }
    return true;
  }, [formData.termsAccepted]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  /**
   * Handle booking type change
   */
  const handleBookingTypeChange = useCallback((type: BookingType) => {
    updateField('bookingType', type);
  }, [updateField]);

  /**
   * Handle recurrence pattern change
   */
  const handleRecurrencePatternChange = useCallback((pattern: RecurrencePattern | null) => {
    updateField('recurrencePattern', pattern);
  }, [updateField]);

  return {
    formData,
    errors,
    updateField,
    updateFormData,
    validateDetailsStep,
    validateTermsStep,
    handleBookingTypeChange,
    handleRecurrencePatternChange,
    reset,
  };
};
