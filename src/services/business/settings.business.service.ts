/**
 * Settings Business Logic Service
 *
 * Contains all business logic related to organization settings operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Database } from "@/types/database";

type Organization = Database['public']['Tables']['organizations']['Row'];

export interface IEmailSettings {
  readonly enabled: boolean;
  readonly smtpHost: string;
  readonly smtpPort: number;
  readonly smtpUser: string;
  readonly smtpPassword: string;
  readonly fromEmail: string;
  readonly fromName: string;
  readonly useSSL: boolean;
  readonly useTLS: boolean;
}

export interface IPaymentSettings {
  readonly enabled: boolean;
  readonly provider: 'stripe' | 'vipps' | null;
  readonly publicKey: string;
  readonly secretKey: string;
  readonly webhookSecret: string;
  readonly currency: string;
  readonly testMode: boolean;
}

export interface INotificationSettings {
  readonly bookingCreated: boolean;
  readonly bookingCancelled: boolean;
  readonly bookingModified: boolean;
  readonly paymentReceived: boolean;
  readonly systemUpdates: boolean;
  readonly securityAlerts: boolean;
  readonly pushEnabled: boolean;
  readonly pushSound: boolean;
}

export interface ISecuritySettings {
  readonly twoFactorEnabled: boolean;
  readonly twoFactorMethod: 'sms' | 'app' | null;
  readonly sessionTimeout: number;
  readonly passwordExpiryDays: number;
  readonly requirePasswordChange: boolean;
  readonly allowedIpAddresses: readonly string[];
}

export interface IGeneralSettings {
  readonly timezone: string;
  readonly dateFormat: 'dd.mm.yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd';
  readonly timeFormat: '12h' | '24h';
  readonly language: 'en' | 'no';
  readonly currency: string;
  readonly businessHoursStart: string;
  readonly businessHoursEnd: string;
}

export interface IOrganizationSettings {
  readonly general: IGeneralSettings;
  readonly email: IEmailSettings;
  readonly payment: IPaymentSettings;
  readonly notifications: INotificationSettings;
  readonly security: ISecuritySettings;
}

/**
 * Default settings for new organizations
 */
export const getDefaultSettings = (): IOrganizationSettings => ({
  general: {
    timezone: 'Europe/Oslo',
    dateFormat: 'dd.mm.yyyy',
    timeFormat: '24h',
    language: 'no',
    currency: 'NOK',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
  },
  email: {
    enabled: false,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    useSSL: false,
    useTLS: true,
  },
  payment: {
    enabled: false,
    provider: null,
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'NOK',
    testMode: true,
  },
  notifications: {
    bookingCreated: true,
    bookingCancelled: true,
    bookingModified: true,
    paymentReceived: true,
    systemUpdates: false,
    securityAlerts: true,
    pushEnabled: true,
    pushSound: false,
  },
  security: {
    twoFactorEnabled: false,
    twoFactorMethod: null,
    sessionTimeout: 30,
    passwordExpiryDays: 90,
    requirePasswordChange: false,
    allowedIpAddresses: [],
  },
});

/**
 * Validate general settings
 */
export const validateGeneralSettings = (settings: IGeneralSettings): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!settings.timezone) {
    errors.push('Timezone is required');
  }

  if (!settings.dateFormat) {
    errors.push('Date format is required');
  }

  if (!settings.timeFormat) {
    errors.push('Time format is required');
  }

  if (!settings.language) {
    errors.push('Language is required');
  }

  if (!settings.currency || settings.currency.length !== 3) {
    errors.push('Valid currency code is required (e.g., NOK, USD)');
  }

  if (!settings.businessHoursStart) {
    errors.push('Business hours start time is required');
  }

  if (!settings.businessHoursEnd) {
    errors.push('Business hours end time is required');
  }

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (settings.businessHoursStart && !timeRegex.test(settings.businessHoursStart)) {
    errors.push('Invalid business hours start time format (use HH:MM)');
  }

  if (settings.businessHoursEnd && !timeRegex.test(settings.businessHoursEnd)) {
    errors.push('Invalid business hours end time format (use HH:MM)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email settings
 */
export const validateEmailSettings = (settings: IEmailSettings): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!settings.enabled) {
    return { isValid: true, errors: [] };
  }

  if (!settings.smtpHost || settings.smtpHost.trim().length === 0) {
    errors.push('SMTP host is required');
  }

  if (!settings.smtpPort || settings.smtpPort < 1 || settings.smtpPort > 65535) {
    errors.push('Valid SMTP port is required (1-65535)');
  }

  if (!settings.smtpUser || settings.smtpUser.trim().length === 0) {
    errors.push('SMTP username is required');
  }

  if (!settings.smtpPassword || settings.smtpPassword.trim().length === 0) {
    errors.push('SMTP password is required');
  }

  if (!settings.fromEmail || !isValidEmail(settings.fromEmail)) {
    errors.push('Valid from email address is required');
  }

  if (!settings.fromName || settings.fromName.trim().length === 0) {
    errors.push('From name is required');
  }

  if (settings.useSSL && settings.useTLS) {
    errors.push('Cannot use both SSL and TLS simultaneously');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate payment settings
 */
export const validatePaymentSettings = (settings: IPaymentSettings): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!settings.enabled) {
    return { isValid: true, errors: [] };
  }

  if (!settings.provider) {
    errors.push('Payment provider is required');
  }

  if (!settings.publicKey || settings.publicKey.trim().length === 0) {
    errors.push('Public key is required');
  }

  if (!settings.secretKey || settings.secretKey.trim().length === 0) {
    errors.push('Secret key is required');
  }

  if (!settings.webhookSecret || settings.webhookSecret.trim().length === 0) {
    errors.push('Webhook secret is required');
  }

  if (!settings.currency || settings.currency.length !== 3) {
    errors.push('Valid currency code is required (e.g., NOK, USD)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate notification settings
 */
export const validateNotificationSettings = (settings: INotificationSettings): { isValid: boolean; errors: string[] } => {
  // Notification settings are boolean flags, so always valid
  return { isValid: true, errors: [] };
};

/**
 * Validate security settings
 */
export const validateSecuritySettings = (settings: ISecuritySettings): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (settings.twoFactorEnabled && !settings.twoFactorMethod) {
    errors.push('Two-factor method is required when two-factor is enabled');
  }

  if (settings.sessionTimeout < 5 || settings.sessionTimeout > 1440) {
    errors.push('Session timeout must be between 5 and 1440 minutes');
  }

  if (settings.passwordExpiryDays < 0 || settings.passwordExpiryDays > 365) {
    errors.push('Password expiry days must be between 0 and 365');
  }

  if (settings.allowedIpAddresses.length > 0) {
    for (const ip of settings.allowedIpAddresses) {
      if (!isValidIpAddress(ip)) {
        errors.push(`Invalid IP address: ${ip}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all settings
 */
export const validateSettingsData = (settings: IOrganizationSettings): { isValid: boolean; errors: Record<string, string[]> } => {
  const generalValidation = validateGeneralSettings(settings.general);
  const emailValidation = validateEmailSettings(settings.email);
  const paymentValidation = validatePaymentSettings(settings.payment);
  const notificationValidation = validateNotificationSettings(settings.notifications);
  const securityValidation = validateSecuritySettings(settings.security);

  const errors: Record<string, string[]> = {};

  if (generalValidation.errors.length > 0) {
    errors.general = generalValidation.errors;
  }

  if (emailValidation.errors.length > 0) {
    errors.email = emailValidation.errors;
  }

  if (paymentValidation.errors.length > 0) {
    errors.payment = paymentValidation.errors;
  }

  if (notificationValidation.errors.length > 0) {
    errors.notifications = notificationValidation.errors;
  }

  if (securityValidation.errors.length > 0) {
    errors.security = securityValidation.errors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Compare two settings objects to detect changes
 */
export const compareSettings = (
  original: IOrganizationSettings,
  updated: IOrganizationSettings
): boolean => {
  return JSON.stringify(original) !== JSON.stringify(updated);
};

/**
 * Get changed fields between two settings objects
 */
export const getChangedFields = (
  original: IOrganizationSettings,
  updated: IOrganizationSettings
): string[] => {
  const changes: string[] = [];

  // Compare general settings
  Object.keys(updated.general).forEach((key) => {
    if (original.general[key as keyof IGeneralSettings] !== updated.general[key as keyof IGeneralSettings]) {
      changes.push(`general.${key}`);
    }
  });

  // Compare email settings
  Object.keys(updated.email).forEach((key) => {
    if (original.email[key as keyof IEmailSettings] !== updated.email[key as keyof IEmailSettings]) {
      changes.push(`email.${key}`);
    }
  });

  // Compare payment settings
  Object.keys(updated.payment).forEach((key) => {
    if (original.payment[key as keyof IPaymentSettings] !== updated.payment[key as keyof IPaymentSettings]) {
      changes.push(`payment.${key}`);
    }
  });

  // Compare notification settings
  Object.keys(updated.notifications).forEach((key) => {
    if (original.notifications[key as keyof INotificationSettings] !== updated.notifications[key as keyof INotificationSettings]) {
      changes.push(`notifications.${key}`);
    }
  });

  // Compare security settings
  Object.keys(updated.security).forEach((key) => {
    if (JSON.stringify(original.security[key as keyof ISecuritySettings]) !== JSON.stringify(updated.security[key as keyof ISecuritySettings])) {
      changes.push(`security.${key}`);
    }
  });

  return changes;
};

/**
 * Format settings for display
 */
export const formatSettingsForDisplay = (settings: IOrganizationSettings) => {
  return {
    ...settings,
    email: {
      ...settings.email,
      // Mask sensitive data
      smtpPassword: settings.email.smtpPassword ? '********' : '',
    },
    payment: {
      ...settings.payment,
      // Mask sensitive data
      secretKey: settings.payment.secretKey ? '********' : '',
      webhookSecret: settings.payment.webhookSecret ? '********' : '',
      publicKey: settings.payment.publicKey ? maskKey(settings.payment.publicKey) : '',
    },
  };
};

/**
 * Prepare settings for storage (remove display-only fields)
 */
export const prepareSettingsForStorage = (settings: IOrganizationSettings): IOrganizationSettings => {
  // Remove any display-only transformations
  return {
    ...settings,
  };
};

/**
 * Get available timezones
 */
export const getAvailableTimezones = (): readonly string[] => {
  return [
    'Europe/Oslo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];
};

/**
 * Get available currencies
 */
export const getAvailableCurrencies = (): readonly string[] => {
  return ['NOK', 'USD', 'EUR', 'GBP', 'SEK', 'DKK'];
};

/**
 * Get available languages
 */
export const getAvailableLanguages = (): readonly { code: string; name: string }[] => {
  return [
    { code: 'no', name: 'Norsk' },
    { code: 'en', name: 'English' },
  ];
};

// Helper functions

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate IP address format
 */
const isValidIpAddress = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Mask sensitive key for display
 */
const maskKey = (key: string): string => {
  if (key.length <= 8) {
    return '********';
  }
  const visibleChars = 4;
  return `${key.substring(0, visibleChars)}${'*'.repeat(key.length - visibleChars * 2)}${key.substring(key.length - visibleChars)}`;
};
