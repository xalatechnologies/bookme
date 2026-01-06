import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IBookingFormData, ActivityType, ActorType } from '@/components/features/bookings/types';
import { IFormErrors } from '../hooks/useBookingForm';
import { useBookingDetailsForm } from '../hooks';

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
  const { t } = useTranslation(['booking', 'common']);
  const { fields, activityTypeOptions, actorTypeOptions, priceGroupOptions } = useBookingDetailsForm();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {t('booking:steps.details.title', 'Fyll ut bookingdetaljer')}
        </h3>
        <p className="text-gray-600 text-sm">
          {t('booking:steps.details.description', 'Fortell oss om arrangementet ditt så kan vi hjelpe deg med riktig booking.')}
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor={fields.purpose.id} className="text-sm font-medium">
              {fields.purpose.label} {fields.purpose.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fields.purpose.id}
              value={formData.purpose}
              onChange={(e) => onUpdateField('purpose', e.target.value)}
              placeholder={fields.purpose.placeholder}
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
            <Label htmlFor={fields.attendees.id} className="text-sm font-medium">
              {fields.attendees.label} {fields.attendees.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fields.attendees.id}
              type="number"
              min={fields.attendees.min}
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
            <Label htmlFor={fields.activityType.id} className="text-sm font-medium">
              {fields.activityType.label} {fields.activityType.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData.activityType}
              onValueChange={(value) => onUpdateField('activityType', value as ActivityType)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.activityType}>
                <SelectValue placeholder={fields.activityType.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {activityTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && (
              <p id="activityType-error" className="text-sm text-red-600" role="alert">
                {errors.activityType}
              </p>
            )}
          </div>

          {/* Price Group */}
          <div className="space-y-2">
            <Label htmlFor={fields.priceGroup.id} className="text-sm font-medium">
              {fields.priceGroup.label} {fields.priceGroup.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData.priceGroup}
              onValueChange={(value) => onUpdateField('priceGroup', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.priceGroup}>
                <SelectValue placeholder={fields.priceGroup.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {priceGroupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priceGroup && (
              <p id="priceGroup-error" className="text-sm text-red-600" role="alert">
                {errors.priceGroup}
              </p>
            )}
          </div>

          {/* Actor Type */}
          <div className="space-y-2">
            <Label htmlFor={fields.actorType.id} className="text-sm font-medium">
              {fields.actorType.label} {fields.actorType.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData.actorType}
              onValueChange={(value) => onUpdateField('actorType', value as ActorType)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full" aria-invalid={!!errors.actorType}>
                <SelectValue placeholder={fields.actorType.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {actorTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
            <Label htmlFor={fields.additionalInfo.id} className="text-sm font-medium">
              {fields.additionalInfo.label}
            </Label>
            <Textarea
              id={fields.additionalInfo.id}
              value={formData.additionalInfo || ''}
              onChange={(e) => onUpdateField('additionalInfo', e.target.value)}
              placeholder={fields.additionalInfo.placeholder}
              disabled={isLoading}
              className="w-full min-h-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
