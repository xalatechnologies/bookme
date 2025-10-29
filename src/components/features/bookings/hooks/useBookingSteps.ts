import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IBookingFormData, BookingType } from '@/components/features/bookings/types';
import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

/**
 * Booking step types
 */
export type BookingStep = 'details' | 'calendar' | 'recurrence' | 'terms' | 'actions';

/**
 * Step configuration interface
 */
export interface IStepConfig {
  readonly id: BookingStep;
  readonly title: string;
  readonly description: string;
  readonly icon: unknown;
}

/**
 * Booking steps hook
 *
 * Manages step-by-step booking flow state and validation
 * Follows Single Responsibility Principle - only handles step management
 *
 * Features:
 * - Step navigation
 * - Step validation
 * - Progress tracking
 * - i18n support
 *
 * @param formData - Current form data
 * @param selectedSlotsCount - Number of selected time slots
 * @param recurrencePattern - Recurrence pattern if applicable
 */
export const useBookingSteps = (
  formData: IBookingFormData,
  selectedSlotsCount: number,
  recurrencePattern: RecurrencePattern | null
) => {
  const { t } = useTranslation('bookings');
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');

  /**
   * Calculate step configuration based on booking type
   */
  const steps = useMemo((): readonly IStepConfig[] => {
    const baseSteps: IStepConfig[] = [
      {
        id: 'calendar' as BookingStep,
        title: t('steps.calendar.title', 'Kalender'),
        description: t('steps.calendar.description', 'Velg dato og tid for bookingen'),
        icon: 'Calendar',
      },
      {
        id: 'details' as BookingStep,
        title: t('steps.details.title', 'Bookingdetaljer'),
        description: t('steps.details.description', 'Fyll ut informasjon om bookingen'),
        icon: 'FileText',
      },
    ];

    // Add recurrence step only for recurring bookings
    if (formData.bookingType === 'recurring') {
      baseSteps.push({
        id: 'recurrence' as BookingStep,
        title: t('recurring.title', 'Gjentakelse'),
        description: t('steps.recurrence.description', 'Velg gjentakelsesmønster'),
        icon: 'Clock',
      });
    }

    baseSteps.push(
      {
        id: 'terms' as BookingStep,
        title: t('steps.terms.title', 'Vilkår og betingelser'),
        description: t('steps.terms.description', 'Les og godta vilkårene'),
        icon: 'Shield',
      },
      {
        id: 'actions' as BookingStep,
        title: t('steps.actions.title', 'Fullfør booking'),
        description: t('steps.actions.description', 'Legg i kurv eller fullfør direkte'),
        icon: 'CheckCircle',
      }
    );

    return baseSteps;
  }, [formData.bookingType, t]);

  /**
   * Calculate current step index
   */
  const currentStepIndex = useMemo(
    () => steps.findIndex(step => step.id === currentStep),
    [steps, currentStep]
  );

  /**
   * Calculate progress percentage
   */
  const progress = useMemo(
    () => ((currentStepIndex + 1) / steps.length) * 100,
    [currentStepIndex, steps.length]
  );

  /**
   * Validate current step
   */
  const validateStep = useCallback((step: BookingStep): boolean => {
    switch (step) {
      case 'details':
        return (
          formData.purpose.trim().length > 0 &&
          formData.attendees > 0 &&
          formData.activityType.trim().length > 0 &&
          formData.actorType.trim().length > 0
        );

      case 'calendar':
        return selectedSlotsCount > 0;

      case 'recurrence':
        return formData.bookingType === 'one-time' || recurrencePattern !== null;

      case 'terms':
        return formData.termsAccepted;

      case 'actions':
        return true; // Always valid, just action buttons

      default:
        return false;
    }
  }, [formData, selectedSlotsCount, recurrencePattern]);

  /**
   * Check if step is accessible
   */
  const isStepAccessible = useCallback((stepIndex: number): boolean => {
    return stepIndex <= currentStepIndex;
  }, [currentStepIndex]);

  /**
   * Check if step is completed
   */
  const isStepCompleted = useCallback((stepIndex: number): boolean => {
    return stepIndex < currentStepIndex;
  }, [currentStepIndex]);

  /**
   * Navigate to next step
   */
  const handleNext = useCallback((): void => {
    const currentStepValid = validateStep(currentStep);

    if (!currentStepValid) {
      return;
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  }, [currentStep, validateStep, currentStepIndex, steps]);

  /**
   * Navigate to previous step
   */
  const handlePrevious = useCallback((): void => {
    const previousStepIndex = currentStepIndex - 1;
    if (previousStepIndex >= 0) {
      setCurrentStep(steps[previousStepIndex].id);
    }
  }, [currentStepIndex, steps]);

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback((step: BookingStep): void => {
    const stepIndex = steps.findIndex(s => s.id === step);
    if (stepIndex !== -1 && isStepAccessible(stepIndex)) {
      setCurrentStep(step);
    }
  }, [steps, isStepAccessible]);

  /**
   * Check if can proceed to next step
   */
  const canProceed = useMemo(
    () => currentStepIndex < steps.length - 1 && validateStep(currentStep),
    [currentStepIndex, steps.length, currentStep, validateStep]
  );

  /**
   * Check if can go back
   */
  const canGoBack = useMemo(
    () => currentStepIndex > 0,
    [currentStepIndex]
  );

  return {
    currentStep,
    setCurrentStep,
    steps,
    currentStepIndex,
    progress,
    validateStep,
    isStepAccessible,
    isStepCompleted,
    handleNext,
    handlePrevious,
    goToStep,
    canProceed,
    canGoBack,
  };
};
