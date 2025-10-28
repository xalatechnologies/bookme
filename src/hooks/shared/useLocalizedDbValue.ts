/**
 * Hook: useLocalizedDbValue
 * 
 * Fetches localized database values based on entity type and current language.
 * Values are cached for performance.
 * 
 * @example
 * ```tsx
 * const { getValue, getOptions } = useLocalizedDbValue('facility_type');
 * 
 * // Get single value
 * const label = getValue('idrettshall'); // "Sports Hall" in EN, "Idrettshall" in NO
 * 
 * // Get all options for select
 * const options = getOptions(); // [{ value: 'idrettshall', label: 'Sports Hall' }, ...]
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

export interface LocalizedOption {
  value: string;
  label: string;
  description?: string;
  sort_order?: number;
  metadata?: Record<string, unknown>;
}

interface LocalizedDbValueCache {
  [entityType: string]: {
    [language: string]: LocalizedOption[];
  };
}

// Global cache to prevent unnecessary database calls
const cache: LocalizedDbValueCache = {};

/**
 * Hook to fetch and use localized database values
 */
export const useLocalizedDbValue = (entityType: string) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'no';
  
  const [options, setOptions] = useState<LocalizedOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch values from database or cache
   */
  const fetchValues = useCallback(async () => {
    // Check cache first
    if (cache[entityType]?.[currentLang]) {
      setOptions(cache[entityType][currentLang]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('localized_db_values' as any)
        .select('entity_key, label, description, sort_order, metadata')
        .eq('entity_type', entityType)
        .eq('language_code', currentLang)
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false });

      if (fetchError) throw fetchError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formattedOptions: LocalizedOption[] = (data || []).map((item: any) => ({
        value: item.entity_key,
        label: item.label,
        description: item.description || undefined,
        sort_order: item.sort_order || undefined,
        metadata: item.metadata as Record<string, unknown> || undefined,
      }));

      // Update cache
      if (!cache[entityType]) cache[entityType] = {};
      cache[entityType][currentLang] = formattedOptions;

      setOptions(formattedOptions);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching localized values'));
      console.error(`Error fetching localized values for ${entityType}:`, err);
    } finally {
      setLoading(false);
    }
  }, [entityType, currentLang]);

  /**
   * Fetch values on mount and when language changes
   */
  useEffect(() => {
    fetchValues();
  }, [fetchValues]);

  /**
   * Get a single localized value by key
   */
  const getValue = useCallback((entityKey: string): string => {
    const option = options.find(opt => opt.value === entityKey);
    return option?.label || entityKey;
  }, [options]);

  /**
   * Get all options for use in select components
   */
  const getOptions = useCallback((): LocalizedOption[] => {
    return options;
  }, [options]);

  /**
   * Refresh values (clear cache and refetch)
   */
  const refresh = useCallback(async () => {
    // Clear cache for this entity and language
    if (cache[entityType]?.[currentLang]) {
      delete cache[entityType][currentLang];
    }
    await fetchValues();
  }, [entityType, currentLang, fetchValues]);

  return {
    options,
    loading,
    error,
    getValue,
    getOptions,
    refresh,
  };
};

/**
 * Clear all cached localized values
 * Useful when language changes or after database updates
 */
export const clearLocalizedCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};
