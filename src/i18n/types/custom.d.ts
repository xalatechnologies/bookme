/**
 * Custom Type Definitions for i18n
 *
 * Extends and customizes type definitions for the i18n system.
 *
 * @module i18n/types/custom
 */

import 'react-i18next';
import type { Resources, DefaultNamespace } from './resources';

/**
 * Extend react-i18next types with our custom resources
 */
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: DefaultNamespace;
    resources: Resources;
    returnNull: false;
    returnEmptyString: false;
  }

  interface TFunction {
    // Add custom formatter support
    (key: string, options?: { format?: string; [key: string]: unknown }): string;
  }
}

/**
 * Custom translation interpolation values
 */
export interface InterpolationValues {
  readonly [key: string]: string | number | boolean | Date | undefined | null;
}

/**
 * RBAC-specific translation types
 */
export interface RBACTranslations {
  roles: {
    [key: string]: {
      label: string;
      description: string;
      shortLabel?: string;
    };
  };
  permissions: {
    resources: {
      [key: string]: string;
    };
    actions: {
      [key: string]: string;
    };
    messages: {
      granted: string;
      denied: string;
      insufficientRole: string;
      requiresApproval: string;
    };
  };
  features: {
    [key: string]: {
      name: string;
      description: string;
      category?: string;
    };
  };
}

/**
 * Form translation types
 */
export interface FormTranslations {
  labels: {
    [key: string]: string;
  };
  placeholders: {
    [key: string]: string;
  };
  helpers: {
    [key: string]: string;
  };
  buttons: {
    [key: string]: string;
  };
}

/**
 * Validation translation types
 */
export interface ValidationTranslations {
  required: string;
  email: string;
  url: string;
  min: string;
  max: string;
  minLength: string;
  maxLength: string;
  pattern: string;
  number: string;
  integer: string;
  positive: string;
  negative: string;
  between: string;
  custom: {
    [key: string]: string;
  };
}

/**
 * Error translation types
 */
export interface ErrorTranslations {
  general: string;
  network: string;
  server: string;
  unauthorized: string;
  forbidden: string;
  notFound: string;
  validation: string;
  timeout: string;
  unknown: string;
  api: {
    [statusCode: number]: string;
  };
  custom: {
    [key: string]: string;
  };
}

/**
 * Booking translation types
 */
export interface BookingTranslations {
  status: {
    pending: string;
    confirmed: string;
    cancelled: string;
    completed: string;
    noShow: string;
  };
  actions: {
    create: string;
    confirm: string;
    cancel: string;
    modify: string;
    view: string;
  };
  messages: {
    created: string;
    confirmed: string;
    cancelled: string;
    modified: string;
    reminder: string;
  };
  fields: {
    [key: string]: string;
  };
}

/**
 * Facility translation types
 */
export interface FacilityTranslations {
  types: {
    [key: string]: string;
  };
  amenities: {
    [key: string]: string;
  };
  status: {
    available: string;
    unavailable: string;
    maintenance: string;
    reserved: string;
  };
  fields: {
    [key: string]: string;
  };
}

/**
 * Date/Time formatting options
 */
export interface DateTimeFormatOptions {
  format?: 'short' | 'medium' | 'long' | 'full';
  relative?: boolean;
  includeTime?: boolean;
}

/**
 * Currency formatting options
 */
export interface CurrencyFormatOptions {
  showDecimals?: boolean;
  compact?: boolean;
  showSign?: boolean;
}

/**
 * Number formatting options
 */
export interface NumberFormatOptions {
  decimals?: number;
  compact?: boolean;
  percent?: boolean;
  unit?: string;
}

/**
 * Global window augmentation for i18n debugging
 */
declare global {
  interface Window {
    __i18n_debug__?: boolean;
    __i18n_missing_keys__?: Set<string>;
  }
}

export {};