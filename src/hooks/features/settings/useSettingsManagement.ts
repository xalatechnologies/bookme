/**
 * Settings Management Hook
 *
 * Connects UI components to business logic and data services.
 * Provides a clean interface for organization settings management operations.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { useAppUIStore } from '@/stores/appUIStore';
import { organizationsService } from '@/services/supabase/organizations.service';

import {
  validateSettingsData,
  compareSettings,
  prepareSettingsForStorage,
  getDefaultSettings,
  getAvailableTimezones,
  getAvailableCurrencies,
  getAvailableLanguages,
  validateEmailSettings,
  validatePaymentSettings,
  type IOrganizationSettings,
} from '@/services/business/settings.business.service';

export interface IUseSettingsManagementReturn {
  // Data
  readonly settings: IOrganizationSettings | null;
  readonly originalSettings: IOrganizationSettings | null;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // UI State
  readonly activeTab: string;
  readonly unsavedChanges: boolean;
  readonly isSaving: boolean;
  readonly saveSuccess: boolean;
  readonly saveError: string | null;
  readonly validationErrors: Record<string, string[]>;

  // Available options
  readonly availableTimezones: readonly string[];
  readonly availableCurrencies: readonly string[];
  readonly availableLanguages: readonly { code: string; name: string }[];

  // UI Actions
  readonly setActiveTab: (tab: string) => void;
  readonly openModal: (modal: keyof import('@/stores/appUIStore').ISettingsState['modals']) => void;
  readonly closeModal: (modal: keyof import('@/stores/appUIStore').ISettingsState['modals']) => void;

  // Settings Management
  readonly updateSettings: <K extends keyof IOrganizationSettings>(section: K, data: Partial<IOrganizationSettings[K]>) => void;
  readonly saveSettings: () => Promise<void>;
  readonly resetSettings: () => void;
  readonly discardChanges: () => void;

  // Validation
  readonly validateEmailConfig: () => { isValid: boolean; errors: string[] };
  readonly validatePaymentConfig: () => { isValid: boolean; errors: string[] };
  readonly testEmailConnection: () => Promise<boolean>;
  readonly testPaymentConnection: () => Promise<boolean>;
}

/**
 * Hook for managing organization settings with business logic separation
 */
export const useSettingsManagement = (): IUseSettingsManagementReturn => {
  // Data layer
  const orgId = useOrganizationId();
  const [settings, setSettings] = useState<IOrganizationSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<IOrganizationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // UI state layer - use appUIStore settings section
  const appUIStore = useAppUIStore();
  const {
    activeSection: activeTab,
    unsavedChanges,
    isSaving,
    saveSuccess,
    saveError,
    validationErrors,
  } = appUIStore.settings;

  // Actions from appUIStore with settings prefix
  const setActiveTab = appUIStore.setSettingsSection;
  const setUnsavedChanges = appUIStore.setSettingsUnsavedChanges;
  const setIsSaving = appUIStore.setSettingsIsSaving;
  const setSaveSuccess = appUIStore.setSettingsSaveSuccess;
  const setSaveError = appUIStore.setSettingsSaveError;
  const setValidationErrors = appUIStore.setSettingsValidationErrors;
  const clearValidationErrors = appUIStore.clearSettingsValidationErrors;
  const openModal = appUIStore.openSettingsModal;
  const closeModal = appUIStore.closeSettingsModal;

  // Available options
  const availableTimezones = useMemo(() => getAvailableTimezones(), []);
  const availableCurrencies = useMemo(() => getAvailableCurrencies(), []);
  const availableLanguages = useMemo(() => getAvailableLanguages(), []);

  /**
   * Load organization settings
   */
  const loadSettings = useCallback(async () => {
    if (!orgId) return;

    try {
      setIsLoading(true);
      setError(null);

      const loadedSettings = await organizationsService.getOrganizationSettings(orgId);

      setSettings(loadedSettings);
      setOriginalSettings(loadedSettings);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orgId]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Check for unsaved changes
   */
  useEffect(() => {
    if (!settings || !originalSettings) {
      setUnsavedChanges(false);
      return;
    }

    const hasChanges = compareSettings(originalSettings, settings);
    setUnsavedChanges(hasChanges);
  }, [settings, originalSettings, setUnsavedChanges]);

  /**
   * Update settings section
   */
  const updateSettings = useCallback(
    <K extends keyof IOrganizationSettings>(section: K, data: Partial<IOrganizationSettings[K]>) => {
      if (!settings) return;

      const updatedSettings: IOrganizationSettings = {
        ...settings,
        [section]: {
          ...settings[section],
          ...data,
        },
      };

      setSettings(updatedSettings);
      clearValidationErrors();
    },
    [settings, clearValidationErrors]
  );

  /**
   * Save settings
   */
  const saveSettings = useCallback(async () => {
    if (!settings || !orgId) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      clearValidationErrors();

      // Validate all settings
      const validation = validateSettingsData(settings);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Validation failed. Please check all fields.');
      }

      // Prepare settings for storage
      const settingsToStore = prepareSettingsForStorage(settings);

      // Update organization settings
      await organizationsService.updateOrganizationSettings(orgId, settingsToStore);

      // Update original settings to reflect saved state
      setOriginalSettings(settings);
      setSaveSuccess(true);
      setUnsavedChanges(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setSaveError(errorMessage);
      console.error('Failed to save settings:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [settings, orgId, setIsSaving, setSaveError, setSaveSuccess, setUnsavedChanges, clearValidationErrors, setValidationErrors]);

  /**
   * Reset settings to default
   */
  const resetSettings = useCallback(() => {
    const defaultSettings = getDefaultSettings();
    setSettings(defaultSettings);
    clearValidationErrors();
  }, [clearValidationErrors]);

  /**
   * Discard changes and restore original settings
   */
  const discardChanges = useCallback(() => {
    if (originalSettings) {
      setSettings(originalSettings);
      setUnsavedChanges(false);
      clearValidationErrors();
    }
  }, [originalSettings, setUnsavedChanges, clearValidationErrors]);

  /**
   * Validate email configuration
   */
  const validateEmailConfig = useCallback((): { isValid: boolean; errors: string[] } => {
    if (!settings) {
      return { isValid: false, errors: ['Settings not loaded'] };
    }

    return validateEmailSettings(settings.email);
  }, [settings]);

  /**
   * Validate payment configuration
   */
  const validatePaymentConfig = useCallback((): { isValid: boolean; errors: string[] } => {
    if (!settings) {
      return { isValid: false, errors: ['Settings not loaded'] };
    }

    return validatePaymentSettings(settings.payment);
  }, [settings]);

  /**
   * Test email connection
   */
  const testEmailConnection = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    try {
      const validation = validateEmailSettings(settings.email);
      if (!validation.isValid) {
        throw new Error('Invalid email configuration');
      }

      // TODO: Implement actual email connection test
      // This would typically send a test email through the configured SMTP server
      console.log('Testing email connection with:', {
        host: settings.email.smtpHost,
        port: settings.email.smtpPort,
        user: settings.email.smtpUser,
      });

      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (err) {
      console.error('Email connection test failed:', err);
      return false;
    }
  }, [settings]);

  /**
   * Test payment connection
   */
  const testPaymentConnection = useCallback(async (): Promise<boolean> => {
    if (!settings) return false;

    try {
      const validation = validatePaymentSettings(settings.payment);
      if (!validation.isValid) {
        throw new Error('Invalid payment configuration');
      }

      // TODO: Implement actual payment connection test
      // This would typically validate API keys with the payment provider
      console.log('Testing payment connection with:', {
        provider: settings.payment.provider,
        testMode: settings.payment.testMode,
      });

      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (err) {
      console.error('Payment connection test failed:', err);
      return false;
    }
  }, [settings]);

  return {
    // Data
    settings,
    originalSettings,
    isLoading,
    error,

    // UI State
    activeTab,
    unsavedChanges,
    isSaving,
    saveSuccess,
    saveError,
    validationErrors,

    // Available options
    availableTimezones,
    availableCurrencies,
    availableLanguages,

    // UI Actions
    setActiveTab,
    openModal,
    closeModal,

    // Settings Management
    updateSettings,
    saveSettings,
    resetSettings,
    discardChanges,

    // Validation
    validateEmailConfig,
    validatePaymentConfig,
    testEmailConnection,
    testPaymentConnection,
  };
};
