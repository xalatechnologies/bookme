/**
 * Field Mapping Utilities
 *
 * Centralized utilities for mapping, formatting, and displaying facility fields.
 * Eliminates duplication across facility components.
 */

import type { TFunction } from 'i18next';

export interface FieldConfig {
  readonly id: string;
  readonly label: string;
  readonly key: string;
  readonly type: 'text' | 'number' | 'boolean';
  readonly visible: boolean;
  readonly value: string | number | boolean;
}

export interface FieldValueContext {
  readonly capacity?: number;
  readonly area?: string;
  readonly t: TFunction;
}

export type FieldIconType =
  | 'users'
  | 'mapPin'
  | 'money'
  | 'star'
  | 'document'
  | 'building'
  | 'accessibility'
  | 'parking'
  | 'wifi'
  | 'projector'
  | 'whiteboard'
  | 'sound'
  | 'snowflake'
  | 'fire'
  | 'sun'
  | 'window'
  | 'door'
  | 'ruler'
  | 'palette'
  | 'brush'
  | 'default';

export interface FieldMapping {
  readonly value: string | number;
  readonly iconType: FieldIconType;
  readonly unit: string;
}

/**
 * Get the display value for a field based on its configuration and context
 */
export const getFieldValue = (
  field: FieldConfig,
  context: FieldValueContext
): string | number => {
  const { capacity, area, t } = context;

  // Handle specific known fields from props
  if (field.key === 'capacity' && capacity !== undefined) {
    return capacity;
  }

  if (field.key === 'area' && area !== undefined) {
    return area;
  }

  // Handle boolean values
  if (typeof field.value === 'boolean') {
    return field.value ? t('facility:card.yes') : t('facility:card.no');
  }

  // Return the field value as-is
  return field.value;
};

/**
 * Get the icon type for a field based on its key
 */
export const getFieldIconType = (fieldKey: string): FieldIconType => {
  switch (fieldKey) {
    case 'capacity':
      return 'users';

    case 'area':
      return 'mapPin';

    case 'pricePerHour':
    case 'price':
      return 'money';

    case 'rating':
      return 'star';

    case 'reviewCount':
      return 'document';

    case 'floor':
      return 'building';

    case 'accessibility':
      return 'accessibility';

    case 'parking':
      return 'parking';

    case 'wifi':
      return 'wifi';

    case 'projector':
      return 'projector';

    case 'whiteboard':
      return 'whiteboard';

    case 'soundSystem':
      return 'sound';

    case 'airConditioning':
      return 'snowflake';

    case 'heating':
      return 'fire';

    case 'naturalLight':
      return 'sun';

    case 'windows':
      return 'window';

    case 'doors':
      return 'door';

    case 'ceilingHeight':
      return 'ruler';

    case 'floorType':
      return 'palette';

    case 'wallColor':
      return 'brush';

    default:
      return 'default';
  }
};

/**
 * Get the unit/suffix for a field based on its key
 */
export const getFieldUnit = (fieldKey: string, t: TFunction): string => {
  switch (fieldKey) {
    case 'capacity':
      return t('facility:card.people');

    case 'area':
      return t('facility:card.squareMeters');

    case 'pricePerHour':
    case 'price':
      return t('facility:card.pricePerHour');

    case 'rating':
      return t('facility:card.outOf5');

    case 'reviewCount':
      return t('facility:card.reviewCount');

    case 'ceilingHeight':
      return 'm';

    default:
      return '';
  }
};

/**
 * Get the translated label for a field
 */
export const getFieldLabel = (field: FieldConfig, t: TFunction): string => {
  return t(field.label);
};

/**
 * Format a field value with its unit
 */
export const formatFieldValue = (
  value: string | number,
  unit: string
): string => {
  if (!unit) {
    return String(value);
  }
  return `${value} ${unit}`;
};

/**
 * Map a field to its complete display information
 */
export const mapFieldToDisplay = (
  field: FieldConfig,
  context: FieldValueContext
): FieldMapping => {
  const value = getFieldValue(field, context);
  const iconType = getFieldIconType(field.key);
  const unit = getFieldUnit(field.key, context.t);

  return {
    value,
    iconType,
    unit
  };
};

/**
 * Split fields into two columns for display
 */
export const splitFieldsIntoColumns = <T,>(
  fields: readonly T[]
): { readonly firstColumn: readonly T[]; readonly secondColumn: readonly T[] } => {
  const midpoint = Math.ceil(fields.length / 2);

  return {
    firstColumn: fields.slice(0, midpoint),
    secondColumn: fields.slice(midpoint)
  };
};

/**
 * Filter visible fields from field configs
 */
export const getVisibleFields = (
  fields: readonly FieldConfig[]
): readonly FieldConfig[] => {
  return fields.filter(field => field.visible);
};
