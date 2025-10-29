/**
 * User Settings Management Hook
 *
 * Handles business logic for user preference settings including:
 * - Notification preferences (email, SMS, push, booking reminders, marketing)
 * - Privacy & Security settings (profile visibility, two-factor authentication)
 * - Language and Regional settings (language, timezone)
 *
 * Separates state management and persistence logic from UI rendering.
 */

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface IUserSettings {
  readonly emailNotifications: boolean;
  readonly smsNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly bookingReminders: boolean;
  readonly marketingEmails: boolean;
  readonly language: string;
  readonly timezone: string;
  readonly showProfile: boolean;
  readonly twoFactorAuth: boolean;
}

interface IUseUserSettingsManagementReturn {
  // State
  readonly settings: IUserSettings;
  readonly isSaving: boolean;
  readonly saveError: string | null;
  readonly saveSuccess: boolean;

  // Actions
  readonly updateSetting: (key: keyof IUserSettings, value: boolean | string) => void;
  readonly saveSettings: () => Promise<void>;
  readonly resetSettings: () => void;
  readonly clearSuccess: () => void;
}

const DEFAULT_SETTINGS: IUserSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  bookingReminders: true,
  marketingEmails: false,
  language: 'no',
  timezone: 'Europe/Oslo',
  showProfile: true,
  twoFactorAuth: false,
};

const STORAGE_KEY = 'userSettings';

/**
 * Hook for managing user-level settings with persistent storage
 *
 * Provides settings state management, updates, and persistence to localStorage.
 * In production, this would integrate with a backend API and user context.
 */
export const useUserSettingsManagement = (): IUseUserSettingsManagementReturn => {
  const { t } = useTranslation(['user']);

  // Settings state
  const [settings, setSettings] = useState<IUserSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = (): void => {
      try {
        const storedSettings = localStorage.getItem(STORAGE_KEY);
        if (storedSettings) {
          const parsed = JSON.parse(storedSettings) as Partial<IUserSettings>;
          // Merge with defaults to ensure all fields exist
          setSettings(prev => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (error) {
        console.error('Failed to load user settings from localStorage:', error);
      }
    };

    loadSettings();
  }, []);

  /**
   * Update a single setting field
   */
  const updateSetting = useCallback(
    (key: keyof IUserSettings, value: boolean | string): void => {
      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
      // Clear previous success message when making changes
      setSaveSuccess(false);
    },
    []
  );

  /**
   * Save settings to localStorage
   *
   * In a production application, this would:
   * 1. Validate settings data
   * 2. Call backend API to persist to database
   * 3. Update user context/state management
   * 4. Show toast notifications instead of alerts
   * 5. Handle errors with proper error recovery
   */
  const saveSettings = useCallback(async (): Promise<void> => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      // Success state
      setSaveSuccess(true);

      // Auto-clear success message after 3 seconds
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      return (): void => clearTimeout(timer);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('user:settings.settings_save_failed');
      setSaveError(errorMessage);
      console.error('Failed to save user settings:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [settings, t]);

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback((): void => {
    setSettings(DEFAULT_SETTINGS);
    setSaveSuccess(false);
    setSaveError(null);
  }, []);

  /**
   * Clear success message
   */
  const clearSuccess = useCallback((): void => {
    setSaveSuccess(false);
  }, []);

  return {
    settings,
    isSaving,
    saveError,
    saveSuccess,
    updateSetting,
    saveSettings,
    resetSettings,
    clearSuccess,
  };
};
