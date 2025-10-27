import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { RecurrencePatternSelector } from '@/components/features/bookings/components/RecurringBookingModal/RecurrencePatternSelector';
import type { RecurrencePattern } from '@/utils/recurrenceEngine';

/**
 * Step 3 Recurrence props
 */
export interface IStep3RecurrenceProps {
  readonly recurrencePattern: RecurrencePattern | null;
  readonly onPatternChange: (pattern: RecurrencePattern | null) => void;
}

/**
 * Step 3: Recurrence Pattern Component
 *
 * Allows users to configure recurrence pattern for recurring bookings
 * Only shown when booking type is 'recurring'
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const Step3Recurrence = ({
  recurrencePattern,
  onPatternChange
}: IStep3RecurrenceProps): JSX.Element => {
  const { t } = useTranslation('bookings');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('steps.recurrence.title', 'Velg gjentakelsesmønster')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('steps.recurrence.description', 'Velg hvordan ofte bookingen skal gjentas. Dette gjelder for alle valgte tidspunkter.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <RecurrencePatternSelector
            pattern={recurrencePattern}
            onPatternChange={onPatternChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
