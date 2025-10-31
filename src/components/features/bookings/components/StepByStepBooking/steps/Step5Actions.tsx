import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Step 5 Actions props
 */
export interface IStep5ActionsProps {
  readonly isValid: boolean;
  readonly isLoading: boolean;
  readonly onAddToCart: () => void;
  readonly onCompleteBooking: () => void;
}

/**
 * Step 5: Actions/Complete Booking Component
 *
 * Final step with actions to add to cart or complete booking
 * Shows confirmation message and action buttons
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const Step5Actions = ({
  isValid,
  isLoading,
  onAddToCart,
  onCompleteBooking
}: IStep5ActionsProps): JSX.Element => {
  const { t } = useTranslation('booking');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('steps.actions.title', 'Fullfør booking')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('steps.actions.description', 'Gjennomgå opplysningene og velg hvordan du vil fortsette.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">
                {t('steps.actions.ready', 'Klar for booking!')}
              </h4>
              <p className="text-gray-600 text-sm">
                {t('steps.actions.all_filled', 'Alle opplysninger er fylt ut og vilkårene er godtatt.')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onAddToCart}
                variant="outline"
                className="flex-1"
                disabled={!isValid || isLoading}
                aria-label={t('actions.add_to_cart', 'Legg i reservasjonskurv')}
              >
                {t('actions.add_to_cart', 'Legg i reservasjonskurv')}
              </Button>

              <Button
                onClick={onCompleteBooking}
                className="flex-1"
                disabled={!isValid || isLoading}
                aria-label={t('actions.complete_booking', 'Fullfør booking')}
              >
                {isLoading ? t('checkout.processing', 'Behandler...') : t('actions.complete_booking', 'Fullfør booking')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
