/**
 * Preferences Service
 *
 * Manages user preferences including language, theme, and notification settings.
 *
 * Features:
 * - Language preferences
 * - Theme preferences
 * - Notification settings
 *
 * @module services/supabase/preferences
 */

import { supabase } from './client';
import { handleSupabaseError } from './errors';


// ============================================================================
// Types
// ============================================================================

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'nb-NO' | 'en-US';

// Note: The user_notification_preferences table doesn't have language and theme columns
// We'll store these in localStorage as a fallback, but use the correct format for the UI
export interface UserPreferences {
  readonly user_id: string;
  readonly language: 'nb-NO' | 'en-US';  // Service format
  readonly theme: Theme;
  // Notification preferences from the user_notification_preferences table
  readonly email_booking_confirmation: boolean;
  readonly email_booking_reminder: boolean;
  readonly sms_booking_confirmation: boolean;
  readonly sms_booking_reminder: boolean;
  readonly browser_booking_reminder: boolean;
  readonly browser_enabled: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

// ============================================================================
// Preferences Service
// ============================================================================

export class PreferencesService {
  /**
   * Get user preferences
   *
   * @param userId - User ID
   * @returns User preferences
   */
  async getByUserId(userId: string): Promise<UserPreferences | null> {
    try {
      // First, try to get notification preferences from the database
      let notificationData: Record<string, unknown> | null = null;
      try {
        const { data, error } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', userId);

        // Check if we got data (even an empty array)
        if (!error && data && data.length > 0) {
          notificationData = data[0]; // Take the first item
        }
      } catch {
        // Ignore errors here, we'll handle them below
      }

      // Get language and theme from localStorage as fallback
      let language: Language = 'nb-NO';
      let theme: Theme = 'system';

      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem(`language_${userId}`);
        const storedTheme = localStorage.getItem(`theme_${userId}`);

        if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
          language = storedLanguage;
        }

        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          theme = storedTheme;
        }
      }

      // If we don't have notification preferences, return null
      if (!notificationData) {
        return null;
      }

      return {
        user_id: notificationData.user_id,
        language,
        theme,
        email_booking_confirmation: notificationData.email_booking_confirmation,
        email_booking_reminder: notificationData.email_booking_reminder,
        sms_booking_confirmation: notificationData.sms_booking_confirmation,
        sms_booking_reminder: notificationData.sms_booking_reminder,
        browser_booking_reminder: notificationData.browser_booking_reminder,
        browser_enabled: notificationData.browser_enabled,
        created_at: notificationData.created_at,
        updated_at: notificationData.updated_at,
      } as UserPreferences;
    } catch (error) {
      // Handle case where no preferences exist yet
      if (error instanceof Error && (error.message.includes('406') || error.message.includes('PGRST116'))) {
        return null;
      }
      // For other errors, we still want to return preferences with defaults
      // Get language and theme from localStorage as fallback
      let language: Language = 'nb-NO';
      let theme: Theme = 'system';

      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem(`language_${userId}`);
        const storedTheme = localStorage.getItem(`theme_${userId}`);

        if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
          language = storedLanguage;
        }

        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          theme = storedTheme;
        }
      }

      return {
        user_id: userId,
        language,
        theme,
        email_booking_confirmation: true,
        email_booking_reminder: true,
        sms_booking_confirmation: false,
        sms_booking_reminder: false,
        browser_booking_reminder: true,
        browser_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as UserPreferences;
    }
  }

  /**
   * Create or update user notification preferences
   *
   * @param userId - User ID
   * @param preferences - Notification preferences to update
   * @returns Updated preferences
   */
  async upsertNotificationPreferences(
    userId: string,
    preferences: Partial<{
      email_booking_confirmation: boolean;
      email_booking_reminder: boolean;
      sms_booking_confirmation: boolean;
      sms_booking_reminder: boolean;
      browser_booking_reminder: boolean;
      browser_enabled: boolean;
    }>
  ): Promise<UserPreferences> {
    try {
      // First, try to get existing preferences
      const existing = await this.getByUserId(userId);

      const now = new Date().toISOString();
      const payload = {
        user_id: userId,
        email_booking_confirmation: existing?.email_booking_confirmation ?? true,
        email_booking_reminder: existing?.email_booking_reminder ?? true,
        sms_booking_confirmation: existing?.sms_booking_confirmation ?? false,
        sms_booking_reminder: existing?.sms_booking_reminder ?? false,
        browser_booking_reminder: existing?.browser_booking_reminder ?? true,
        browser_enabled: existing?.browser_enabled ?? true,
        created_at: existing?.created_at ?? now,
        updated_at: now,
        ...preferences,
      };

      // Try to update first
      const { data: updateData, error: updateError } = await supabase
        .from('user_notification_preferences')
        .update(payload)
        .eq('user_id', userId);

      // Check if update affected any rows
      if (updateError || updateData === null) {
        // If update failed or didn't affect any rows, try to insert
        const { data: insertData, error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert(payload)
          .select();

        if (insertError) {
          throw handleSupabaseError(insertError, 'upsertNotificationPreferences');
        }

        // Get language and theme from localStorage as fallback
        let language: Language = 'nb-NO';
        let theme: Theme = 'system';

        if (typeof window !== 'undefined') {
          const storedLanguage = localStorage.getItem(`language_${userId}`);
          const storedTheme = localStorage.getItem(`theme_${userId}`);

          if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
            language = storedLanguage;
          }

          if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
            theme = storedTheme;
          }
        }

        // Return the inserted data
        if (insertData && insertData.length > 0) {
          const inserted = insertData[0];
          return {
            user_id: inserted.user_id,
            language,
            theme,
            email_booking_confirmation: inserted.email_booking_confirmation,
            email_booking_reminder: inserted.email_booking_reminder,
            sms_booking_confirmation: inserted.sms_booking_confirmation,
            sms_booking_reminder: inserted.sms_booking_reminder,
            browser_booking_reminder: inserted.browser_booking_reminder,
            browser_enabled: inserted.browser_enabled,
            created_at: inserted.created_at,
            updated_at: inserted.updated_at,
          } as UserPreferences;
        }
      }

      // If update was successful, get the updated data
      // We need to fetch it again since update doesn't return the data by default
      const { data: fetchData, error: fetchError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) {
        throw handleSupabaseError(fetchError, 'upsertNotificationPreferences');
      }

      // Get language and theme from localStorage as fallback
      let language: Language = 'nb-NO';
      let theme: Theme = 'system';

      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem(`language_${userId}`);
        const storedTheme = localStorage.getItem(`theme_${userId}`);

        if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
          language = storedLanguage;
        }

        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          theme = storedTheme;
        }
      }

      // Return the fetched data
      if (fetchData && fetchData.length > 0) {
        const fetched = fetchData[0];
        return {
          user_id: fetched.user_id,
          language,
          theme,
          email_booking_confirmation: fetched.email_booking_confirmation,
          email_booking_reminder: fetched.email_booking_reminder,
          sms_booking_confirmation: fetched.sms_booking_confirmation,
          sms_booking_reminder: fetched.sms_booking_reminder,
          browser_booking_reminder: fetched.browser_booking_reminder,
          browser_enabled: fetched.browser_enabled,
          created_at: fetched.created_at,
          updated_at: fetched.updated_at,
        } as UserPreferences;
      }

      // Fallback if something went wrong
      return {
        user_id: userId,
        language,
        theme,
        email_booking_confirmation: payload.email_booking_confirmation,
        email_booking_reminder: payload.email_booking_reminder,
        sms_booking_confirmation: payload.sms_booking_reminder,
        sms_booking_reminder: payload.sms_booking_reminder,
        browser_booking_reminder: payload.browser_booking_reminder,
        browser_enabled: payload.browser_enabled,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
      } as UserPreferences;
    } catch (error) {
      throw handleSupabaseError(error, 'upsertNotificationPreferences');
    }
  }

  /**
   * Get user theme preference from database
   *
   * @param userId - User ID
   * @returns User theme preference or null if not found
   */
  async getThemePreference(userId: string): Promise<Theme | null> {
    try {
      // Try to get theme preference from database
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If not found, try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem(`theme_${userId}`);
          if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
            return storedTheme as Theme;
          }
        }
        return null;
      }

      // Check if theme column exists in the data
      if (data && typeof data === 'object' && 'theme' in data) {
        const theme = (data as Record<string, unknown>).theme;
        if (theme && (theme === 'light' || theme === 'dark' || theme === 'system')) {
          return theme as Theme;
        }
      }

      // Fallback to localStorage if theme column doesn't exist
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem(`theme_${userId}`);
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          return storedTheme as Theme;
        }
      }

      return null;
    } catch {
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem(`theme_${userId}`);
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          return storedTheme as Theme;
        }
      }
      return null;
    }
  }

  /**
   * Update user theme preference in database
   *
   * @param userId - User ID
   * @param theme - Theme preference
   */
  async updateThemePreference(userId: string, theme: Theme): Promise<void> {
    try {
      // Try to update theme in database
      const { error } = await supabase
        .from('user_notification_preferences')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      // If the update succeeded, try to update the theme column specifically
      if (!error) {
        try {
          await supabase
            .from('user_notification_preferences')
            .update({ theme, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } catch {
          // If theme column doesn't exist, continue with localStorage only
        }
      }

      // Also save to localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`theme_${userId}`, theme);
        localStorage.setItem('theme', theme);
      }
    } catch {
      // Fallback to localStorage only
      if (typeof window !== 'undefined') {
        localStorage.setItem(`theme_${userId}`, theme);
        localStorage.setItem('theme', theme);
      }
      // Don't throw error for localStorage fallback
    }
  }

  /**
   * Get user language preference from database
   *
   * @param userId - User ID
   * @returns User language preference or null if not found
   */
  async getLanguagePreference(userId: string): Promise<Language | null> {
    try {
      // Try to get language preference from database
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If not found, try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          const storedLanguage = localStorage.getItem(`language_${userId}`);
          if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
            return storedLanguage as Language;
          }
        }
        return null;
      }

      // Check if language column exists in the data
      if (data && typeof data === 'object' && 'language' in data) {
        const language = (data as Record<string, unknown>).language;
        if (language && (language === 'nb-NO' || language === 'en-US')) {
          return language as Language;
        }
      }

      // Fallback to localStorage if language column doesn't exist
      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem(`language_${userId}`);
        if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
          return storedLanguage as Language;
        }
      }

      return null;
    } catch {
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        const storedLanguage = localStorage.getItem(`language_${userId}`);
        if (storedLanguage && (storedLanguage === 'nb-NO' || storedLanguage === 'en-US')) {
          return storedLanguage as Language;
        }
      }
      return null;
    }
  }

  /**
   * Update user language preference in database
   *
   * @param userId - User ID
   * @param language - Language preference
   */
  async updateLanguagePreference(userId: string, language: Language): Promise<void> {
    try {
      // Try to update language in database
      const { error } = await supabase
        .from('user_notification_preferences')
        .update({ updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      // If the update succeeded, try to update the language column specifically
      if (!error) {
        try {
          await supabase
            .from('user_notification_preferences')
            .update({ language, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        } catch {
          // If language column doesn't exist, continue with localStorage only
        }
      }

      // Also save to localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`language_${userId}`, language);
        const uiLanguage = language === 'en-US' ? 'EN' : 'NO';
        localStorage.setItem('booknor-language', uiLanguage);
      }
    } catch {
      // Fallback to localStorage only
      if (typeof window !== 'undefined') {
        localStorage.setItem(`language_${userId}`, language);
        const uiLanguage = language === 'en-US' ? 'EN' : 'NO';
        localStorage.setItem('booknor-language', uiLanguage);
      }
      // Don't throw error for localStorage fallback
    }
  }
}

/**
 * Singleton instance of PreferencesService
 */
export const preferencesService = new PreferencesService();