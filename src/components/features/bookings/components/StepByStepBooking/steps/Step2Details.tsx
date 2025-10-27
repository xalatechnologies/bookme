import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IBookingFormData, ActivityType, ActorType } from '@/components/features/bookings/types';
import { IFormErrors } from '../hooks/useBookingForm';

/**
 * Step 2 Details props
 */
export interface IStep2DetailsProps {
  readonly formData: IBookingFormData;
  readonly errors: IFormErrors;
  readonly onUpdateField: (field: keyof IBookingFormData, value: unknown) => void;
  readonly isLoading?: boolean;
}

/**
 * Step 2: Booking Details Component
 *
 * Collects booking information including purpose, attendees, and activity type
 * Provides form validation and error display
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const Step2Details = ({
  formData,
  errors,
  onUpdateField,
  isLoading = false
}: IStep2DetailsProps): JSX.Element => {
  const { t } = useTranslation(['bookings', 'common']);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('bookings:steps.details.title', 'Fyll ut bookingdetaljer')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('bookings:steps.details.description', 'Fortell oss om arrangementet ditt så kan vi hjelpe deg med riktig booking.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose" className="text-sm font-medium">
              {t('bookings:fields.purpose', 'Formål med bookingen')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => onUpdateField('purpose', e.target.value)}
              placeholder={t('bookings:placeholders.purpose', 'F.eks. fotballtrening, møte, arrangement')}
              disabled={isLoading}
              className="w-full"
              aria-invalid={!!errors.purpose}
              aria-describedby={errors.purpose ? 'purpose-error' : undefined}
            />
            {errors.purpose && (
              <p id="purpose-error" className="text-sm text-red-600" role="alert">
                {errors.purpose}
              </p>
            )}
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label htmlFor="attendees" className="text-sm font-medium">
              {t('bookings:fields.attendees', 'Antall deltakere')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="attendees"
              type="number"
              min="1"
              value={formData.attendees}
              onChange={(e) => onUpdateField('attendees', parseInt(e.target.value) || 1)}
              disabled={isLoading}
              className="w-full"
              aria-invalid={!!errors.attendees}
              aria-describedby={errors.attendees ? 'attendees-error' : undefined}
            />
            {errors.attendees && (
              <p id="attendees-error" className="text-sm text-red-600" role="alert">
                {errors.attendees}
              </p>
            )}
          </div>

          {/* Activity Type */}
          <div className="space-y-2">
            <Label htmlFor="activityType" className="text-sm font-medium">
              {t('bookings:fields.activity_type', 'Type aktivitet')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.activityType}
              onValueChange={(value) => onUpdateField('activityType', value as ActivityType)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.activityType}>
                <SelectValue placeholder={t('bookings:placeholders.activity_type', 'Velg aktivitetstype')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sport">{t('bookings:activity_types.sport', 'Sport')}</SelectItem>
                <SelectItem value="kultur">{t('bookings:activity_types.culture', 'Kultur')}</SelectItem>
                <SelectItem value="møte">{t('bookings:activity_types.meeting', 'Møte')}</SelectItem>
                <SelectItem value="arrangement">{t('bookings:activity_types.event', 'Arrangement')}</SelectItem>
                <SelectItem value="trening">{t('bookings:activity_types.training', 'Trening')}</SelectItem>
                <SelectItem value="annet">{t('common:other', 'Annet')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p id="activityType-error" className="text-sm text-red-600" role="alert">
                {errors.activityType}
              </p>
            )}
          </div>

          {/* Actor Type */}
          <div className="space-y-2">
            <Label htmlFor="actorType" className="text-sm font-medium">
              {t('bookings:fields.actor_type', 'Aktør type')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.actorType}
              onValueChange={(value) => onUpdateField('actorType', value as ActorType)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.actorType}>
                <SelectValue placeholder={t('bookings:placeholders.actor_type', 'Velg aktør type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private-person">{t('bookings:actor_types.private_person', 'Privatperson')}</SelectItem>
                <SelectItem value="lag-foreninger">{t('bookings:actor_types.lag_foreninger', 'Lag/Foreninger')}</SelectItem>
                <SelectItem value="paraply">{t('bookings:actor_types.paraply', 'Paraply')}</SelectItem>
                <SelectItem value="private-firma">{t('bookings:actor_types.private_firma', 'Privat firma')}</SelectItem>
                <SelectItem value="kommunale-enheter">{t('bookings:actor_types.kommunale_enheter', 'Kommunale enheter')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.actorType && (
              <p id="actorType-error" className="text-sm text-red-600" role="alert">
                {errors.actorType}
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-sm font-medium">
              {t('bookings:fields.special_requests', 'Tilleggsinformasjon')}
            </Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo || ''}
              onChange={(e) => onUpdateField('additionalInfo', e.target.value)}
              placeholder={t('bookings:placeholders.additional_info', 'Eventuelle spesielle ønsker eller behov')}
              disabled={isLoading}
              className="w-full min-h-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
