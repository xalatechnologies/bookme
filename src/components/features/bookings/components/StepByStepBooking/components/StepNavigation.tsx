import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

/**
 * Step navigation props
 */
export interface IStepNavigationProps {
  readonly canGoBack: boolean;
  readonly canGoNext: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
  readonly isLastStep?: boolean;
}

/**
 * Step navigation component
 *
 * Provides previous/next navigation buttons for step-by-step flow
 * Handles disabled states based on step validation
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const StepNavigation = ({
  canGoBack,
  canGoNext,
  onPrevious,
  onNext,
  isLastStep = false
}: IStepNavigationProps): JSX.Element => {
  const { t } = useTranslation(['bookings', 'common']);

  return (
    <div className="flex justify-between">
      <Button
        onClick={onPrevious}
        variant="outline"
        disabled={!canGoBack}
        className="flex items-center gap-2"
        aria-label={t('common:navigation.previous', 'Forrige')}
      >
        <ChevronLeft className="h-4 w-4" />
        {t('common:navigation.previous', 'Forrige')}
      </Button>

      <Button
        onClick={onNext}
        disabled={!canGoNext || isLastStep}
        className="flex items-center gap-2"
        aria-label={t('common:navigation.next', 'Neste')}
      >
        {t('common:navigation.next', 'Neste')}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
