/**
 * Booking form validation hook
 *
 * Provides comprehensive validation logic for booking forms including:
 * - Field validation (purpose, attendees, activity type, actor type)
 * - Cross-field validation
 * - Time slot validation
 * - Error message generation
 * - Form validity checking
 *
 * Extracted from BookingForm component to follow Single Responsibility Principle.
 * This hook encapsulates all validation logic, making the main component cleaner
 * and the validation logic reusable across different booking forms.
 *
 * @module hooks/features/bookings/useBookingFormValidation
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '@/hooks/shared';
import type { IBookingFormData, ISelectedTimeSlot, ActorType, ActivityType } from '@/components/features/bookings/types';

/**
 * Validation state interface
 */
interface ValidationState {
  readonly errors: Record<string, string>;
  readonly isValid: boolean;
}

/**
 * Select option type
 */
interface SelectOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Booking form validation hook return type
 */
interface UseBookingFormValidationReturn {
  /**
   * Current validation errors for form fields
   */
  readonly errors: Record<string, string>;

  /**
   * Validate all form fields
   * @param formData - Form data to validate
   * @returns True if form is valid
   */
  readonly validateAll: (formData: IBookingFormData) => boolean;

  /**
   * Validate a single field
   * @param fieldName - Name of field to validate
   * @param value - Value to validate
   * @returns Error message or null if valid
   */
  readonly validateField: (fieldName: string, value: unknown) => string | null;

  /**
   * Clear error for a specific field
   * @param fieldName - Name of field to clear error for
   */
  readonly clearError: (fieldName: string) => void;

  /**
   * Clear all validation errors
   */
  readonly clearAllErrors: () => void;

  /**
   * Set error for a specific field
   * @param fieldName - Name of field to set error for
   * @param message - Error message
   */
  readonly setError: (fieldName: string, message: string) => void;

  /**
   * Check if form is valid
   * @param formData - Form data to check
   * @param selectedSlots - Selected time slots
   * @returns True if form is valid
   */
  readonly isFormValid: (formData: IBookingFormData, selectedSlots: readonly ISelectedTimeSlot[]) => boolean;

  /**
   * Validate purpose field
   * @param purpose - Purpose value to validate
   * @returns Error message or null if valid
   */
  readonly validatePurpose: (purpose: string) => string | null;

  /**
   * Validate attendees field
   * @param attendees - Number of attendees to validate
   * @returns Error message or null if valid
   */
  readonly validateAttendees: (attendees: number) => string | null;

  /**
   * Validate activity type field
   * @param activityType - Activity type to validate
   * @returns Error message or null if valid
   */
  readonly validateActivityType: (activityType: ActivityType | "") => string | null;

  /**
   * Validate actor type field
   * @param actorType - Actor type to validate
   * @returns Error message or null if valid
   */
  readonly validateActorType: (actorType: ActorType | "") => string | null;

  /**
   * Validate selected time slots
   * @param slots - Time slots to validate
   * @returns Error message or null if valid
   */
  readonly validateTimeSlots: (slots: readonly ISelectedTimeSlot[]) => string | null;

  /**
   * Validate additional info field (optional)
   * @param additionalInfo - Additional info to validate
   * @returns Error message or null if valid
   */
  readonly validateAdditionalInfo: (additionalInfo?: string) => string | null;

  /**
   * Activity type select options with translations
   */
  readonly activityTypeOptions: readonly SelectOption[];

  /**
   * Actor type select options with translations
   */
  readonly actorTypeOptions: readonly SelectOption[];
}

/**
 * Booking form validation hook
 *
 * Provides comprehensive validation for booking forms including field validation,
 * cross-field validation, and error management.
 *
 * @returns Validation methods and state
 *
 * @example
 * ```tsx
 * const {
 *   errors,
 *   validateAll,
 *   isFormValid,
 *   clearError
 * } = useBookingFormValidation();
 *
 * // Validate entire form
 * if (validateAll(formData)) {
 *   // Form is valid
 * }
 *
 * // Check form validity
 * const valid = isFormValid(formData, selectedSlots);
 *
 * // Clear field error
 * clearError('purpose');
 * ```
 */
export const useBookingFormValidation = (): UseBookingFormValidationReturn => {
  const { t } = useTranslation(['validation', 'bookings', 'common']);

  // Base validation rules using shared hook
  const {
    errors,
    validateField: baseValidateField,
    validateAll: baseValidateAll,
    clearError,
    clearAllErrors,
    setError,
  } = useFormValidation({
    purpose: [{ type: 'required' }],
    attendees: [{ type: 'required' }, { type: 'minValue', value: 1 }],
    activityType: [{ type: 'required' }],
    actorType: [{ type: 'required' }],
  });

  /**
   * Validate purpose field
   */
  const validatePurpose = useCallback((purpose: string): string | null => {
    if (!purpose || purpose.trim().length === 0) {
      return t('validation:required', 'Dette feltet er påkrevd');
    }

    if (purpose.trim().length < 3) {
      return t('validation:min_length', { count: 3 }, 'Må være minst 3 tegn');
    }

    if (purpose.trim().length > 200) {
      return t('validation:max_length', { count: 200 }, 'Må være maks 200 tegn');
    }

    return null;
  }, [t]);

  /**
   * Validate attendees field
   */
  const validateAttendees = useCallback((attendees: number): string | null => {
    if (!attendees || attendees < 1) {
      return t('validation:min_value', { value: 1 }, 'Må være minst 1 deltaker');
    }

    if (attendees > 1000) {
      return t('validation:max_value', { value: 1000 }, 'Må være maks 1000 deltakere');
    }

    if (!Number.isInteger(attendees)) {
      return t('validation:invalid_format', 'Må være et heltall');
    }

    return null;
  }, [t]);

  /**
   * Validate activity type field
   */
  const validateActivityType = useCallback((activityType: ActivityType | ""): string | null => {
    if (!activityType || activityType.trim().length === 0) {
      return t('validation:required', 'Dette feltet er påkrevd');
    }

    const validActivityTypes: readonly ActivityType[] = [
      'sport',
      'kultur',
      'møte',
      'arrangement',
      'trening',
      'annet'
    ];

    if (!validActivityTypes.includes(activityType as ActivityType)) {
      return t('validation:invalid_format', 'Ugyldig aktivitetstype');
    }

    return null;
  }, [t]);

  /**
   * Validate actor type field
   */
  const validateActorType = useCallback((actorType: ActorType | ""): string | null => {
    if (!actorType || actorType.trim().length === 0) {
      return t('validation:required', 'Dette feltet er påkrevd');
    }

    const validActorTypes: readonly ActorType[] = [
      'private-person',
      'lag-foreninger',
      'paraply',
      'private-firma',
      'kommunale-enheter'
    ];

    if (!validActorTypes.includes(actorType as ActorType)) {
      return t('validation:invalid_format', 'Ugyldig aktør type');
    }

    return null;
  }, [t]);

  /**
   * Validate selected time slots
   */
  const validateTimeSlots = useCallback((slots: readonly ISelectedTimeSlot[]): string | null => {
    if (!slots || slots.length === 0) {
      return t('bookings:validation.no_slots_selected', 'Du må velge minst ett tidspunkt');
    }

    // Check for invalid slots
    const invalidSlots = slots.filter(slot =>
      !slot.id ||
      !slot.facilityId ||
      !slot.zoneId ||
      !slot.date ||
      !slot.timeSlot ||
      slot.duration <= 0 ||
      slot.pricePerHour < 0
    );

    if (invalidSlots.length > 0) {
      return t('bookings:validation.invalid_slots', 'Noen tidspunkter er ugyldige');
    }

    // Check for duplicate slots
    const slotIds = slots.map(slot => slot.id);
    const uniqueSlotIds = new Set(slotIds);
    if (slotIds.length !== uniqueSlotIds.size) {
      return t('bookings:validation.duplicate_slots', 'Det er duplikate tidspunkter');
    }

    return null;
  }, [t]);

  /**
   * Validate additional info field (optional)
   */
  const validateAdditionalInfo = useCallback((additionalInfo?: string): string | null => {
    if (!additionalInfo) {
      return null; // Optional field
    }

    if (additionalInfo.trim().length > 1000) {
      return t('validation:max_length', { count: 1000 }, 'Må være maks 1000 tegn');
    }

    return null;
  }, [t]);

  /**
   * Validate a single field with custom logic
   */
  const validateField = useCallback((fieldName: string, value: unknown): string | null => {
    switch (fieldName) {
      case 'purpose':
        return validatePurpose(String(value || ''));

      case 'attendees':
        return validateAttendees(Number(value || 0));

      case 'activityType':
        return validateActivityType(String(value || '') as ActivityType | "");

      case 'actorType':
        return validateActorType(String(value || '') as ActorType | "");

      case 'additionalInfo':
        return validateAdditionalInfo(String(value || ''));

      default:
        return baseValidateField(fieldName, value);
    }
  }, [
    validatePurpose,
    validateAttendees,
    validateActivityType,
    validateActorType,
    validateAdditionalInfo,
    baseValidateField
  ]);

  /**
   * Validate all form fields
   */
  const validateAll = useCallback((formData: IBookingFormData): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate purpose
    const purposeError = validatePurpose(formData.purpose);
    if (purposeError) {
      newErrors.purpose = purposeError;
      isValid = false;
    }

    // Validate attendees
    const attendeesError = validateAttendees(formData.attendees);
    if (attendeesError) {
      newErrors.attendees = attendeesError;
      isValid = false;
    }

    // Validate activity type
    const activityTypeError = validateActivityType(formData.activityType);
    if (activityTypeError) {
      newErrors.activityType = activityTypeError;
      isValid = false;
    }

    // Validate actor type
    const actorTypeError = validateActorType(formData.actorType);
    if (actorTypeError) {
      newErrors.actorType = actorTypeError;
      isValid = false;
    }

    // Validate additional info (optional)
    const additionalInfoError = validateAdditionalInfo(formData.additionalInfo);
    if (additionalInfoError) {
      newErrors.additionalInfo = additionalInfoError;
      isValid = false;
    }

    // Set all errors at once
    if (!isValid) {
      Object.entries(newErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    }

    return isValid;
  }, [
    validatePurpose,
    validateAttendees,
    validateActivityType,
    validateActorType,
    validateAdditionalInfo,
    setError
  ]);

  /**
   * Check if entire form is valid
   * Combines field validation with time slot validation
   */
  const isFormValid = useCallback((
    formData: IBookingFormData,
    selectedSlots: readonly ISelectedTimeSlot[]
  ): boolean => {
    // Validate all form fields
    const formFieldsValid = (
      formData.purpose.trim().length > 0 &&
      formData.attendees > 0 &&
      formData.activityType.trim().length > 0 &&
      formData.actorType.trim().length > 0
    );

    // Validate time slots
    const timeSlotsError = validateTimeSlots(selectedSlots);
    const timeSlotsValid = timeSlotsError === null;

    return formFieldsValid && timeSlotsValid;
  }, [validateTimeSlots]);

  /**
   * Activity type select options with translations
   */
  const activityTypeOptions: readonly SelectOption[] = [
    { value: "sport", label: t("bookings:activity_types.sport", "Sport") },
    { value: "kultur", label: t("bookings:activity_types.culture", "Kultur") },
    { value: "møte", label: t("bookings:activity_types.meeting", "Møte") },
    {
      value: "arrangement",
      label: t("bookings:activity_types.event", "Arrangement"),
    },
    {
      value: "trening",
      label: t("bookings:activity_types.training", "Trening"),
    },
    { value: "annet", label: t("common:other", "Annet") },
  ];

  /**
   * Actor type select options with translations
   */
  const actorTypeOptions: readonly SelectOption[] = [
    {
      value: "private-person",
      label: t("bookings:actor_types.private_person", "Privatperson"),
    },
    {
      value: "lag-foreninger",
      label: t("bookings:actor_types.lag_foreninger", "Lag og foreninger"),
    },
    {
      value: "paraply",
      label: t("bookings:actor_types.paraply", "Paraplyorganisasjoner"),
    },
    {
      value: "private-firma",
      label: t("bookings:actor_types.private_firma", "Private firma"),
    },
    {
      value: "kommunale-enheter",
      label: t("bookings:actor_types.kommunale_enheter", "Kommunale enheter"),
    },
  ];

  return {
    errors,
    validateAll,
    validateField,
    clearError,
    clearAllErrors,
    setError,
    isFormValid,
    validatePurpose,
    validateAttendees,
    validateActivityType,
    validateActorType,
    validateTimeSlots,
    validateAdditionalInfo,
    activityTypeOptions,
    actorTypeOptions,
  };
};
