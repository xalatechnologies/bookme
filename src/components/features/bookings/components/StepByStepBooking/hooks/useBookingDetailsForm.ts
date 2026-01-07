import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Form field type
 */
export type FieldType = 'text' | 'number' | 'textarea' | 'select';

/**
 * Form field option
 */
export interface FieldOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Form field configuration
 */
export interface FormField {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly placeholder: string;
  readonly type: FieldType;
  readonly required: boolean;
  readonly options?: readonly FieldOption[];
  readonly min?: number;
}

/**
 * Form fields configuration
 */
export interface FormFieldsConfig {
  readonly purpose: FormField;
  readonly attendees: FormField;
  readonly activityType: FormField;
  readonly priceGroup: FormField;
  readonly actorType: FormField;
  readonly additionalInfo: FormField;
}

/**
 * Hook return type
 */
export interface UseBookingDetailsFormReturn {
  readonly fields: FormFieldsConfig;
  readonly activityTypeOptions: readonly FieldOption[];
  readonly actorTypeOptions: readonly FieldOption[];
  readonly priceGroupOptions: readonly FieldOption[];
}

/**
 * Custom hook for booking details form configuration
 *
 * Provides field configurations, options, and layout for the booking details form.
 * Handles internationalization and field validation requirements.
 *
 * @returns Form configuration and options
 *
 * @example
 * ```tsx
 * const { fields, activityTypeOptions, actorTypeOptions } = useBookingDetailsForm();
 * ```
 */
export const useBookingDetailsForm = (): UseBookingDetailsFormReturn => {
  const { t } = useTranslation(['booking', 'common']);

  /**
   * Activity type options
   */
  const activityTypeOptions = useMemo((): readonly FieldOption[] => [
    { value: 'sport', label: t('booking:activity_types.sport', 'Sport') },
    { value: 'kultur', label: t('booking:activity_types.culture', 'Kultur') },
    { value: 'møte', label: t('booking:activity_types.meeting', 'Møte') },
    { value: 'arrangement', label: t('booking:activity_types.event', 'Arrangement') },
    { value: 'trening', label: t('booking:activity_types.training', 'Trening') },
    { value: 'annet', label: t('common:other', 'Annet') }
  ], [t]);

  /**
   * Actor type options
   */
  const actorTypeOptions = useMemo((): readonly FieldOption[] => [
  const priceGroupOptions = useMemo((): readonly FieldOption[] => [
    { value: 'kommunale-virksomheter', label: 'Kommunale virksomheter' },
    { value: 'ikke-kommersielle-aktorer', label: 'Ikke-kommersielle aktører' },
    { value: 'kommersielle-private', label: 'Kommersielle aktører og private arrangementer' },
  ], []);

    { value: 'private-person', label: t('booking:actor_types.private_person', 'Privatperson') },
    { value: 'lag-foreninger', label: t('booking:actor_types.lag_foreninger', 'Lag/Foreninger') },
    { value: 'paraply', label: t('booking:actor_types.paraply', 'Paraply') },
    { value: 'private-firma', label: t('booking:actor_types.private_firma', 'Privat firma') },
    { value: 'kommunale-enheter', label: t('booking:actor_types.kommunale_enheter', 'Kommunale enheter') }
  ], [t]);

  /**
   * Form fields configuration
   */
  const fields = useMemo((): FormFieldsConfig => ({
    purpose: {
      id: 'purpose',
      name: 'purpose',
      label: t('booking:fields.purpose', 'Formål med bookingen'),
      placeholder: t('booking:placeholders.purpose', 'F.eks. fotballtrening, møte, arrangement'),
      type: 'text',
      required: true
    },
    attendees: {
      id: 'attendees',
      name: 'attendees',
      label: t('booking:fields.attendees', 'Antall deltakere'),
      placeholder: '',
      type: 'number',
      required: true,
      min: 1
    },
    activityType: {
      id: 'activityType',
      name: 'activityType',
      label: t('booking:fields.activity_type', 'Type aktivitet'),
      placeholder: t('booking:placeholders.activity_type', 'Velg aktivitetstype'),
      type: 'select',
      required: true,
      options: activityTypeOptions
    },
    priceGroup: {
      id: 'priceGroup',
      name: 'priceGroup',
      label: t('booking:fields.price_group', 'Prisgruppe'),
      placeholder: t('booking:placeholders.price_group', 'Velg prisgruppe'),
      type: 'select',
      required: true,
      options: priceGroupOptions
    },
    actorType: {
      id: 'actorType',
      name: 'actorType',
      label: t('booking:fields.actor_type', 'Aktør type'),
      placeholder: t('booking:placeholders.actor_type', 'Velg aktør type'),
      type: 'select',
      required: true,
      options: actorTypeOptions
    },
    additionalInfo: {
      id: 'additionalInfo',
      name: 'additionalInfo',
      label: t('booking:fields.special_requests', 'Tilleggsinformasjon'),
      placeholder: t('booking:placeholders.additional_info', 'Eventuelle spesielle ønsker eller behov'),
      type: 'textarea',
      required: false
    }
  }), [t, activityTypeOptions, actorTypeOptions]);

  return {
    fields,
    activityTypeOptions,
    actorTypeOptions,
    priceGroupOptions
  };
};
