import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Step 4 Terms props
 */
export interface IStep4TermsProps {
  readonly termsAccepted: boolean;
  readonly onTermsChange: (accepted: boolean) => void;
}

/**
 * Step 4: Terms and Conditions Component
 *
 * Displays terms and conditions with acceptance checkbox
 * User must accept terms before proceeding
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const Step4Terms = ({
  termsAccepted,
  onTermsChange
}: IStep4TermsProps): JSX.Element => {
  const { t } = useTranslation(['booking', 'common']);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('booking:steps.terms.title', 'Vilkår og betingelser')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('booking:steps.terms.description', 'Les gjennom vilkårene og godta dem for å fortsette.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Usage Rules */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t('common:terms.usage_rules.title', 'Regler for bruk')}
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• {t('common:terms.usage_rules.cleaning', 'Renhold etter bruk er påkrevd')}</li>
                <li>• {t('common:terms.usage_rules.key_pickup', 'Nøkler hentes ved inngang 15 min før start')}</li>
                <li>• {t('common:terms.usage_rules.cancellation', 'Avbestilling gratis til 48 timer før start')}</li>
                <li>• {t('common:terms.usage_rules.no_show_fee', 'Gebyr ved no-show: 50% av leiepris')}</li>
              </ul>
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t('common:terms.privacy.title', 'Personvern')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('common:terms.privacy.description', 'Vi behandler dine personopplysninger i henhold til vår personvernerklæring. Ved å godta vilkårene samtykker du til behandling av personopplysninger for denne bestillingen.')}
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-3">
              <h4 className="font-medium">
                {t('common:terms.cancellation.title', 'Avbestilling')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('common:terms.cancellation.description', 'Du kan avbestille bookingen din gratis inntil 48 timer før arrangementet starter. Ved avbestilling senere enn dette vil det bli trukket et gebyr på 50% av leieprisen.')}
              </p>
            </div>

            {/* Acceptance Checkbox */}
            <div className="flex items-start space-x-3 pt-4 border-t">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => onTermsChange(checked === true)}
                aria-describedby="terms-label"
              />
              <Label
                id="terms-label"
                htmlFor="terms"
                className="text-sm cursor-pointer leading-relaxed"
              >
                {t('booking:checkout.accept_terms', 'Jeg godtar')}{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('common:terms.rental_terms', 'vilkår for leie')}
                </a>
                {' '}{t('common:and', 'og')}{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('common:terms.privacy_policy', 'personvernerklæring')}
                </a>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
