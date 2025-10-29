/**
 * User Preferences Hook with Migration Support
 * Phase-aware hook for managing user preferences across localStorage and Supabase
 *
 * @author typescript-pro
 * @date 2025-01-28
 */

import { useStorageMigration } from './useStorageMigration';
import type { UserPreferences, UISettings, BookingFilters, NotificationSettings } from '@/types/supabase/database.types';

export interface UseUserPreferencesOptions {
  readonly userId?: string;
}

export interface UseUserPreferencesReturn {
  readonly preferences: UserPreferences | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly updateLanguage: (language: 'nb-NO' | 'en-US') => Promise<void>;
  readonly updateUISettings: (settings: Partial<UISettings>) => Promise<void>;
  readonly updateBookingFilters: (filters: Partial<BookingFilters>) => Promise<void>;
  readonly updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  readonly refresh: () => Promise<void>;
  readonly syncWithLocalStorage: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  id: '',
  user_id: '',
  language: 'nb-NO',
  ui_settings: {
    theme: 'light',
    collapsed_panels: [],
    view_mode: 'grid',
    items_per_page: 12,
    show_tooltips: true,
    compact_mode: false,
  },
  booking_filters: null,
  search_history: [],
  notification_settings: {
    email_notifications: true,
    push_notifications: false,
    booking_reminders: true,
    system_updates: true,
    marketing: false,
  },
  currency: 'NOK',
  timezone: 'Europe/Oslo',
  date_format: 'DD.MM.YYYY',
  time_format: '24h',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_accessed_at: new Date().toISOString(),
};

/**
 * Phase-aware user preferences hook
 */
export function useUserPreferences(options: UseUserPreferencesOptions = {}): UseUserPreferencesReturn {
  const { userId } = options;

  const {
    data: preferences,
    isLoading,
    error,
    setData,
    refresh,
    syncWithLocalStorage,
  } = useStorageMigration<UserPreferences>({
    localStorageKey: 'userPreferences',
    supabaseTable: 'user_preferences',
    supabaseColumn: 'preferences',
    defaultValue: userId ? { ...defaultPreferences, user_id: userId } : defaultPreferences,
    userId,
  });

  const updateLanguage = async (language: 'nb-NO' | 'en-US'): Promise<void> => {
    if (!preferences) return;
    await setData({
      ...preferences,
      language,
      updated_at: new Date().toISOString(),
    });
  };

  const updateUISettings = async (settings: Partial<UISettings>): Promise<void> => {
    if (!preferences) return;
    await setData({
      ...preferences,
      ui_settings: {
        ...preferences.ui_settings,
        ...settings,
      },
      updated_at: new Date().toISOString(),
    });
  };

  const updateBookingFilters = async (filters: Partial<BookingFilters>): Promise<void> => {
    if (!preferences) return;
    await setData({
      ...preferences,
      booking_filters: preferences.booking_filters
        ? { ...preferences.booking_filters, ...filters }
        : (filters as BookingFilters),
      updated_at: new Date().toISOString(),
    });
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>): Promise<void> => {
    if (!preferences) return;
    await setData({
      ...preferences,
      notification_settings: {
        ...preferences.notification_settings,
        ...settings,
      },
      updated_at: new Date().toISOString(),
    });
  };

  return {
    preferences,
    isLoading,
    error,
    updateLanguage,
    updateUISettings,
    updateBookingFilters,
    updateNotificationSettings,
    refresh,
    syncWithLocalStorage,
  };
}
