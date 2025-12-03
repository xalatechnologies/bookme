/**
 * User Preferences Hook
 *
 * Manages user preferences including language, theme, and notification settings.
 *
 * @module hooks/features/profile/useUserPreferences
 */

import { useState, useEffect, useCallback } from 'react';
import { preferencesService } from '@/services/supabase/preferences.service';
import type { Theme } from '@/services/supabase/preferences.service';
import { changeLanguage as changeI18nLanguage } from '@/i18n/config';
import type { Language as I18nLanguage } from '@/i18n/types';

export interface UserPreferences {
  readonly language: I18nLanguage;
  readonly theme: Theme;
  readonly emailBookingConfirmation: boolean;
  readonly emailBookingReminder: boolean;
  readonly smsBookingConfirmation: boolean;
  readonly smsBookingReminder: boolean;
  readonly browserBookingReminder: boolean;
  readonly browserEnabled: boolean;
}

export interface UseUserPreferencesReturn {
  readonly preferences: UserPreferences | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly updateLanguage: (language: I18nLanguage) => Promise<void>;
  readonly updateTheme: (theme: Theme) => Promise<void>;
  readonly updateNotifications: (notifications: {
    readonly emailBookingConfirmation?: boolean;
    readonly emailBookingReminder?: boolean;
    readonly smsBookingConfirmation?: boolean;
    readonly smsBookingReminder?: boolean;
    readonly browserBookingReminder?: boolean;
    readonly browserEnabled?: boolean;
  }) => Promise<void>;
  readonly refresh: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  language: 'NO',
  theme: 'system',
  emailBookingConfirmation: true,
  emailBookingReminder: true,
  smsBookingConfirmation: false,
  smsBookingReminder: false,
  browserBookingReminder: true,
  browserEnabled: true,
};

export const useUserPreferences = (userId: string | undefined): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load preferences from Supabase and localStorage
  const loadPreferences = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get notification preferences from Supabase
      const data = await preferencesService.getByUserId(userId);
      
      // Get language and theme from database (with localStorage fallback)
      let language: I18nLanguage = 'NO';
      let theme: Theme = 'system';
      
      // Try to get language from database
      const dbLanguage = await preferencesService.getLanguagePreference(userId);
      if (dbLanguage) {
        language = dbLanguage === 'en-US' ? 'EN' : 'NO';
      } else {
        // Fallback to localStorage
        const savedLanguage = localStorage.getItem('booknor-language');
        if (savedLanguage === 'EN') {
          language = 'EN';
        } else if (savedLanguage === 'NO') {
          language = 'NO';
        }
      }
      
      // Try to get theme from database
      const dbTheme = await preferencesService.getThemePreference(userId);
      if (dbTheme) {
        theme = dbTheme;
      } else {
        // Fallback to localStorage
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          theme = savedTheme;
        }
      }

      if (data) {
        setPreferences({
          language,
          theme,
          emailBookingConfirmation: data.email_booking_confirmation,
          emailBookingReminder: data.email_booking_reminder,
          smsBookingConfirmation: data.sms_booking_confirmation,
          smsBookingReminder: data.sms_booking_reminder,
          browserBookingReminder: data.browser_booking_reminder,
          browserEnabled: data.browser_enabled,
        });
      } else {
        // If no preferences exist, use defaults with localStorage values
        setPreferences({
          ...defaultPreferences,
          language,
          theme
        });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setPreferences(defaultPreferences);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update language preference
  const updateLanguage = useCallback(async (language: I18nLanguage) => {
    if (!userId) return;

    try {
      // Update in database (with localStorage fallback)
      const serviceLanguage = language === 'EN' ? 'en-US' : 'nb-NO';
      await preferencesService.updateLanguagePreference(userId, serviceLanguage);
      
      // Update i18n
      const i18nLang = language === 'EN' ? 'en' : 'no';
      await changeI18nLanguage(i18nLang as 'no' | 'en');
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, language } : {
        ...defaultPreferences,
        language
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [userId]);

  // Update theme preference - disabled (dark mode removed)
  const updateTheme = useCallback(async (theme: Theme) => {
    if (!userId) return;

    try {
      // Dark mode has been removed - always use light theme
      const lightTheme: Theme = 'light';
      
      // Update in localStorage (existing system)
      localStorage.setItem('theme', lightTheme);
      
      // Also save in user-specific storage
      localStorage.setItem(`theme_${userId}`, lightTheme);
      
      // Ensure dark class is never added
      document.documentElement.classList.remove('dark');
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, theme: lightTheme } : {
        ...defaultPreferences,
        theme: lightTheme
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [userId]);

  // Update notification preferences
  const updateNotifications = useCallback(async (notifications: {
    readonly emailBookingConfirmation?: boolean;
    readonly emailBookingReminder?: boolean;
    readonly smsBookingConfirmation?: boolean;
    readonly smsBookingReminder?: boolean;
    readonly browserBookingReminder?: boolean;
    readonly browserEnabled?: boolean;
  }) => {
    if (!userId) return;

    try {
      // Prepare the update data for the notification preferences
      const updateData: any = {};
      if (notifications.emailBookingConfirmation !== undefined) {
        updateData.email_booking_confirmation = notifications.emailBookingConfirmation;
      }
      if (notifications.emailBookingReminder !== undefined) {
        updateData.email_booking_reminder = notifications.emailBookingReminder;
      }
      if (notifications.smsBookingConfirmation !== undefined) {
        updateData.sms_booking_confirmation = notifications.smsBookingConfirmation;
      }
      if (notifications.smsBookingReminder !== undefined) {
        updateData.sms_booking_reminder = notifications.smsBookingReminder;
      }
      if (notifications.browserBookingReminder !== undefined) {
        updateData.browser_booking_reminder = notifications.browserBookingReminder;
      }
      if (notifications.browserEnabled !== undefined) {
        updateData.browser_enabled = notifications.browserEnabled;
      }
      
      // Only update notification preferences in Supabase if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await preferencesService.upsertNotificationPreferences(userId, updateData);
      }
      
      // Update local state
      setPreferences(prev => {
        if (!prev) return defaultPreferences;
        
        return {
          ...prev,
          emailBookingConfirmation: notifications.emailBookingConfirmation ?? prev.emailBookingConfirmation,
          emailBookingReminder: notifications.emailBookingReminder ?? prev.emailBookingReminder,
          smsBookingConfirmation: notifications.smsBookingConfirmation ?? prev.smsBookingConfirmation,
          smsBookingReminder: notifications.smsBookingReminder ?? prev.smsBookingReminder,
          browserBookingReminder: notifications.browserBookingReminder ?? prev.browserBookingReminder,
          browserEnabled: notifications.browserEnabled ?? prev.browserEnabled,
        };
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [userId]);

  // Refresh preferences
  const refresh = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  // Load preferences when userId changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updateLanguage,
    updateTheme,
    updateNotifications,
    refresh,
  };
};