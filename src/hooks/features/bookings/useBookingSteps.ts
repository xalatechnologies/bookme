/**
 * Booking Steps Hook
 *
 * Manages step-by-step booking flow navigation and validation.
 * Provides step management, validation, and progress tracking.
 */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText, Clock, Shield, CheckCircle } from 'lucide-react';
import type { IBookingFormData, ISelectedTimeSlot } from '@/components/features/bookings/types';
import type { RecurrencePattern } from '@/components/features/bookings/utils/recurrence';

export type BookingStep = 'details' | 'calendar' | 'recurrence' | 'terms' | 'actions';

export interface IStepDefinition {
  readonly id: BookingStep;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

export interface IUseBookingStepsOptions {
  readonly formData: IBookingFormData;
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly recurrencePattern: RecurrencePattern | null;
  readonly initialStep?: BookingStep;
}

export interface IUseBookingStepsReturn {
  // Current state
  readonly currentStep: BookingStep;
  readonly currentStepIndex: number;
  readonly steps: readonly IStepDefinition[];
  readonly progress: number;

  // Navigation
  readonly goToStep: (step: BookingStep) => void;
  readonly nextStep: () => void;
  readonly previousStep: () => void;
  readonly canGoToStep: (step: BookingStep) => boolean;

  // Validation
  readonly validateStep: (step: BookingStep) => boolean;
  readonly validateCurrentStep: () => boolean;
  readonly canProceedToNext: boolean;
  readonly isFirstStep: boolean;
  readonly isLastStep: boolean;
}

/**
 * Hook for managing step-by-step booking flow
 *
 * Provides comprehensive step management including:
 * - Dynamic step configuration based on booking type
 * - Step validation
 * - Progress tracking
 * - Navigation controls
 * - Accessibility checks
 *
 * @param options - Configuration including form data and selected slots
 * @returns Complete step management interface
 *
 * @example
 * ```tsx
 * function StepByStepBooking() {
 *   const {
 *     currentStep,
 *     steps,
 *     progress,
 *     nextStep,
 *     previousStep,
 *     validateCurrentStep,
 *     canProceedToNext,
 *   } = useBookingSteps({
 *     formData,
 *     selectedSlots,
 *     recurrencePattern,
 *   });
 *
 *   return (
 *     <div>
 *       <ProgressBar value={progress} />
 *       <StepIndicator steps={steps} currentStep={currentStep} />
 *       <StepContent step={currentStep} />
 *       <NavigationButtons
 *         onNext={nextStep}
 *         onPrev={previousStep}
 *         nextDisabled={!canProceedToNext}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export const useBookingSteps = (options: IUseBookingStepsOptions): IUseBookingStepsReturn => {
  const {
    formData,
    selectedSlots,
    recurrencePattern,
    initialStep = 'calendar',
  } = options;

  const { t } = useTranslation(['bookings', 'common']);

  // Current step state
  const [currentStep, setCurrentStep] = useState<BookingStep>(initialStep);

  /**
   * Generate step definitions based on booking type
   */
  const steps = useMemo((): readonly IStepDefinition[] => {
    const baseSteps: IStepDefinition[] = [
      {
        id: 'calendar' as BookingStep,
        title: t('bookings:steps.calendar.title', 'Kalender'),
        description: t(
          'bookings:steps.calendar.description',
          'Velg dato og tid for bookingen'
        ),
        icon: Calendar,
      },
      {
        id: 'details' as BookingStep,
        title: t('bookings:steps.details.title', 'Bookingdetaljer'),
        description: t(
          'bookings:steps.details.description',
          'Fyll ut informasjon om bookingen'
        ),
        icon: FileText,
      },
    ];

    // Add recurrence step only for recurring bookings
    if (formData.bookingType === 'recurring') {
      baseSteps.push({
        id: 'recurrence' as BookingStep,
        title: t('bookings:steps.recurrence.title', 'Gjentakelse'),
        description: t(
          'bookings:steps.recurrence.description',
          'Velg gjentakelsesmønster'
        ),
        icon: Clock,
      });
    }

    baseSteps.push(
      {
        id: 'terms' as BookingStep,
        title: t('bookings:steps.terms.title', 'Vilkår og betingelser'),
        description: t(
          'bookings:steps.terms.description',
          'Les og godta vilkårene'
        ),
        icon: Shield,
      },
      {
        id: 'actions' as BookingStep,
        title: t('bookings:steps.actions.title', 'Fullfør booking'),
        description: t(
          'bookings:steps.actions.description',
          'Legg i kurv eller fullfør direkte'
        ),
        icon: CheckCircle,
      }
    );

    return baseSteps;
  }, [formData.bookingType, t]);

  /**
   * Get current step index
   */
  const currentStepIndex = useMemo(
    () => steps.findIndex((step) => step.id === currentStep),
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
   * Validate a specific step
   */
  const validateStep = useCallback(
    (step: BookingStep): boolean => {
      switch (step) {
        case 'details':
          return (
            formData.purpose.trim().length > 0 &&
            formData.attendees > 0 &&
            formData.activityType.trim().length > 0
          );

        case 'calendar':
          return selectedSlots.length > 0;

        case 'recurrence':
          return (
            formData.bookingType === 'one-time' || recurrencePattern !== null
          );

        case 'terms':
          return formData.termsAccepted;

        case 'actions':
          return true; // Always valid, just action buttons

        default:
          return false;
      }
    },
    [formData, selectedSlots.length, recurrencePattern]
  );

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback(
    (): boolean => validateStep(currentStep),
    [validateStep, currentStep]
  );

  /**
   * Check if can proceed to next step
   */
  const canProceedToNext = useMemo(
    () => validateCurrentStep() && currentStepIndex < steps.length - 1,
    [validateCurrentStep, currentStepIndex, steps.length]
  );

  /**
   * Check if a step is accessible
   */
  const canGoToStep = useCallback(
    (step: BookingStep): boolean => {
      const targetIndex = steps.findIndex((s) => s.id === step);
      if (targetIndex === -1) return false;

      // Can only go to steps that are at or before current accessible step
      return targetIndex <= currentStepIndex;
    },
    [steps, currentStepIndex]
  );

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback(
    (step: BookingStep): void => {
      if (canGoToStep(step)) {
        setCurrentStep(step);
      }
    },
    [canGoToStep]
  );

  /**
   * Navigate to next step
   */
  const nextStep = useCallback((): void => {
    if (!validateCurrentStep()) {
      return; // Don't allow forward navigation if current step is invalid
    }

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  }, [validateCurrentStep, currentStepIndex, steps]);

  /**
   * Navigate to previous step
   */
  const previousStep = useCallback((): void => {
    const previousStepIndex = currentStepIndex - 1;
    if (previousStepIndex >= 0) {
      setCurrentStep(steps[previousStepIndex].id);
    }
  }, [currentStepIndex, steps]);

  /**
   * Check if on first step
   */
  const isFirstStep = useMemo(
    () => currentStepIndex === 0,
    [currentStepIndex]
  );

  /**
   * Check if on last step
   */
  const isLastStep = useMemo(
    () => currentStepIndex === steps.length - 1,
    [currentStepIndex, steps.length]
  );

  return {
    // Current state
    currentStep,
    currentStepIndex,
    steps,
    progress,

    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canGoToStep,

    // Validation
    validateStep,
    validateCurrentStep,
    canProceedToNext,
    isFirstStep,
    isLastStep,
  };
};
