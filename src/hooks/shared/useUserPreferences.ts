/**
 * useUserPreferences Hook
 *
 * Manages user preferences with automatic storage migration support.
 * Handles language settings, filters, and UI configurations with
 * seamless transition between localStorage and Supabase.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IBookingFilters } from '@/utils/localStorageTypes';
import {
  getMigrationPhase,
  syncUserPreferences,
  type MigrationPhase,
  MigrationError,
} from '@/utils/storageMigration';

/**
 * User preferences structure
 */
export interface UserPreferences {
  readonly language: 'en' | 'no';
  readonly filters: IBookingFilters;
  readonly uiSettings: {
    readonly collapsedPanels: readonly string[];
    readonly viewMode: 'grid' | 'list';
    readonly theme?: 'light' | 'dark' | 'system';
    readonly notificationsEnabled?: boolean;
    readonly compactMode?: boolean;
  };
}

/**
 * Default user preferences
 */
const defaultPreferences: UserPreferences = {
  language: 'no',
  filters: {},
  uiSettings: {
    collapsedPanels: [],
    viewMode: 'grid',
    theme: 'system',
    notificationsEnabled: true,
    compactMode: false,
  },
};

/**
 * Return type for useUserPreferences hook
 */
interface UseUserPreferencesReturn {
  readonly preferences: UserPreferences;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  readonly updateLanguage: (language: 'en' | 'no') => Promise<void>;
  readonly updateFilters: (filters: Partial<IBookingFilters>) => Promise<void>;
  readonly updateUISettings: (settings: Partial<UserPreferences['uiSettings']>) => Promise<void>;
  readonly resetPreferences: () => Promise<void>;
  readonly refetch: () => Promise<void>;
}

/**
 * Get preferences key for localStorage
 */
const getLocalStorageKey = (userId: string): string => {
  return `user_preferences_${userId}`;
};

/**
 * Load preferences from localStorage
 */
const loadFromLocalStorage = (userId: string): UserPreferences | null => {
  try {
    const key = getLocalStorageKey(userId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<UserPreferences>;
    return {
      ...defaultPreferences,
      ...parsed,
      uiSettings: {
        ...defaultPreferences.uiSettings,
        ...parsed.uiSettings,
      },
    };
  } catch (error) {
    console.error('Failed to load preferences from localStorage:', error);
    return null;
  }
};

/**
 * Save preferences to localStorage
 */
const saveToLocalStorage = (userId: string, preferences: UserPreferences): void => {
  try {
    const key = getLocalStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save preferences to localStorage:', error);
  }
};

/**
 * Hook to manage user preferences with storage migration
 *
 * @param userId - The current user ID
 * @param autoFetch - Whether to automatically fetch on mount
 *
 * @example
 * ```typescript
 * const {
 *   preferences,
 *   updateLanguage,
 *   updateFilters,
 *   updateUISettings
 * } = useUserPreferences(userId, true);
 *
 * // Update language
 * const handleLanguageChange = async (lang: 'en' | 'no') => {
 *   await updateLanguage(lang);
 * };
 *
 * // Update filters
 * const handleFilterChange = async (filters: IBookingFilters) => {
 *   await updateFilters(filters);
 * };
 *
 * // Update UI settings
 * const handleViewModeChange = async (mode: 'grid' | 'list') => {
 *   await updateUISettings({ viewMode: mode });
 * };
 * ```
 */
export const useUserPreferences = (
  userId: string | null,
  autoFetch: boolean = true
): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const phase = getMigrationPhase();

  /**
   * Fetch preferences based on current migration phase
   */
  const fetchPreferences = useCallback(async (): Promise<void> => {
    if (!userId) {
      setPreferences(defaultPreferences);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let fetchedPreferences: UserPreferences | null = null;

      // Phase 1: Try Supabase first, fallback to localStorage
      if (phase === 'fallback') {
        try {
          const { data, error: supabaseError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (!supabaseError && data) {
            fetchedPreferences = {
              language: (data.language as 'en' | 'no') || 'no',
              filters: (data.filters as IBookingFilters) || {},
              uiSettings: {
                ...defaultPreferences.uiSettings,
                ...((data.ui_settings as Partial<UserPreferences['uiSettings']>) || {}),
              },
            };
          } else {
            // Fallback to localStorage
            fetchedPreferences = loadFromLocalStorage(userId);
          }
        } catch (supabaseError) {
          console.error('Supabase fetch failed, using localStorage:', supabaseError);
          fetchedPreferences = loadFromLocalStorage(userId);
        }
      }

      // Phase 2 & 3: Read from Supabase (with fallback in phase 2)
      if (phase === 'dual-write' || phase === 'supabase-only') {
        try {
          const { data, error: supabaseError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (supabaseError) {
            throw supabaseError;
          }

          if (data) {
            fetchedPreferences = {
              language: (data.language as 'en' | 'no') || 'no',
              filters: (data.filters as IBookingFilters) || {},
              uiSettings: {
                ...defaultPreferences.uiSettings,
                ...((data.ui_settings as Partial<UserPreferences['uiSettings']>) || {}),
              },
            };
          }
        } catch (supabaseError) {
          // Only fallback in phase 2
          if (phase === 'dual-write') {
            console.error('Supabase fetch failed, using localStorage:', supabaseError);
            fetchedPreferences = loadFromLocalStorage(userId);
          } else {
            throw supabaseError;
          }
        }
      }

      setPreferences(fetchedPreferences || defaultPreferences);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(new Error(`Failed to fetch preferences: ${errorMessage}`));
      console.error('Error fetching preferences:', err);
      // Use default preferences on error
      setPreferences(defaultPreferences);
    } finally {
      setIsLoading(false);
    }
  }, [userId, phase]);

  /**
   * Update preferences with phase-aware storage
   */
  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>): Promise<void> => {
      if (!userId) {
        throw new Error('User ID is required to update preferences');
      }

      setError(null);

      try {
        const newPreferences: UserPreferences = {
          ...preferences,
          ...updates,
          uiSettings: {
            ...preferences.uiSettings,
            ...(updates.uiSettings || {}),
          },
        };

        // Phase 1: Write to localStorage only
        if (phase === 'fallback') {
          saveToLocalStorage(userId, newPreferences);
          setPreferences(newPreferences);
        }

        // Phase 2: Write to both
        if (phase === 'dual-write') {
          // Write to localStorage
          saveToLocalStorage(userId, newPreferences);

          // Write to Supabase
          await syncUserPreferences(userId, newPreferences);
          setPreferences(newPreferences);
        }

        // Phase 3: Write to Supabase only
        if (phase === 'supabase-only') {
          await syncUserPreferences(userId, newPreferences);
          setPreferences(newPreferences);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Failed to update preferences: ${errorMessage}`));
        throw err;
      }
    },
    [userId, preferences, phase]
  );

  /**
   * Update language preference
   */
  const updateLanguage = useCallback(
    async (language: 'en' | 'no'): Promise<void> => {
      await updatePreferences({ language });
    },
    [updatePreferences]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback(
    async (filters: Partial<IBookingFilters>): Promise<void> => {
      await updatePreferences({
        filters: {
          ...preferences.filters,
          ...filters,
        },
      });
    },
    [preferences.filters, updatePreferences]
  );

  /**
   * Update UI settings
   */
  const updateUISettings = useCallback(
    async (settings: Partial<UserPreferences['uiSettings']>): Promise<void> => {
      await updatePreferences({
        uiSettings: {
          ...preferences.uiSettings,
          ...settings,
        },
      });
    },
    [preferences.uiSettings, updatePreferences]
  );

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(async (): Promise<void> => {
    await updatePreferences(defaultPreferences);
  }, [updatePreferences]);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch && userId) {
      fetchPreferences();
    }
  }, [autoFetch, userId, fetchPreferences]);

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
    updateLanguage,
    updateFilters,
    updateUISettings,
    resetPreferences,
    refetch: fetchPreferences,
  };
};

/**
 * Export types for external use
 */
export type { UseUserPreferencesReturn };
