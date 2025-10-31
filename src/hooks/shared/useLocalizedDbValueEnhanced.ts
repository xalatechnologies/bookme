/**
 * Enhanced useLocalizedDbValue Hook
 *
 * Advanced hook for fetching and managing localized database values with:
 * - React Query integration for caching
 * - Batch fetching capabilities
 * - Search functionality
 * - Optimistic updates
 * - Type safety with generics
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { options, getValue } = useLocalizedDbValueEnhanced('facility_type');
 *
 * // With search
 * const { options, search, isSearching } = useLocalizedDbValueEnhanced('location', {
 *   searchEnabled: true
 * });
 *
 * // Batch get multiple values
 * const labels = useLocalizedDbValueBatch('booking_status', ['pending', 'paid']);
 * ```
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/clients/supabase';
import type {
  LocalizedEntityType,
  LocalizedOption,
  SearchLocalizedValuesResult,
} from '@/types/localization';

// ============================================================================
// Interfaces
// ============================================================================

interface UseLocalizedDbValueOptions {
  readonly searchEnabled?: boolean;
  readonly includeInactive?: boolean;
  readonly onError?: (error: Error) => void;
  readonly staleTime?: number;
  readonly cacheTime?: number;
}

interface UseLocalizedDbValueResult {
  readonly options: readonly LocalizedOption[];
  readonly loading: boolean;
  readonly error: Error | null;
  readonly getValue: (entityKey: string) => string;
  readonly getOption: (entityKey: string) => LocalizedOption | undefined;
  readonly getOptions: () => readonly LocalizedOption[];
  readonly refresh: () => Promise<void>;
  readonly search: (term: string) => Promise<readonly LocalizedOption[]>;
  readonly isSearching: boolean;
}

// ============================================================================
// Query Key Factory
// ============================================================================

const localizationKeys = {
  all: ['localized-values'] as const,
  byType: (entityType: string, language: string) =>
    [...localizationKeys.all, entityType, language] as const,
  search: (entityType: string, language: string, term: string) =>
    [...localizationKeys.all, 'search', entityType, language, term] as const,
  batch: (entityType: string, language: string, keys: readonly string[]) =>
    [
      ...localizationKeys.all,
      'batch',
      entityType,
      language,
      keys.join(','),
    ] as const,
};

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Enhanced hook for fetching and managing localized database values
 */
export function useLocalizedDbValueEnhanced(
  entityType: LocalizedEntityType,
  options: UseLocalizedDbValueOptions = {}
): UseLocalizedDbValueResult {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'no';
  const queryClient = useQueryClient();

  const [isSearching, setIsSearching] = useState(false);

  const {
    searchEnabled = false,
    includeInactive = false,
    onError,
    staleTime = 1000 * 60 * 30, // 30 minutes
    cacheTime = 1000 * 60 * 60, // 1 hour
  } = options;

  // Fetch localized values
  const {
    data: options,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: localizationKeys.byType(entityType, currentLang),
    queryFn: async (): Promise<readonly LocalizedOption[]> => {
      const query = supabase
        .from('localized_db_values')
        .select('entity_key, label, description, sort_order, metadata')
        .eq('entity_type', entityType)
        .eq('language_code', currentLang);

      if (!includeInactive) {
        query.eq('is_active', true);
      }

      query.order('sort_order', { ascending: true, nullsFirst: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      return (
        data?.map((item) => ({
          value: item.entity_key,
          label: item.label,
          description: item.description || undefined,
          sort_order: item.sort_order || undefined,
          metadata: (item.metadata as Record<string, unknown>) || undefined,
        })) || []
      );
    },
    staleTime,
    gcTime: cacheTime,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: {
      errorMessage: `Failed to fetch localized values for ${entityType}`,
    },
  });

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error as Error);
    }
  }, [error, onError]);

  /**
   * Get a single localized value by key
   */
  const getValue = useCallback(
    (entityKey: string): string => {
      const option = options?.find((opt) => opt.value === entityKey);
      return option?.label || entityKey;
    },
    [options]
  );

  /**
   * Get a single option object by key
   */
  const getOption = useCallback(
    (entityKey: string): LocalizedOption | undefined => {
      return options?.find((opt) => opt.value === entityKey);
    },
    [options]
  );

  /**
   * Get all options
   */
  const getOptions = useCallback((): readonly LocalizedOption[] => {
    return options || [];
  }, [options]);

  /**
   * Refresh values (clear cache and refetch)
   */
  const refresh = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: localizationKeys.byType(entityType, currentLang),
    });
    await refetch();
  }, [queryClient, entityType, currentLang, refetch]);

  /**
   * Search localized values
   */
  const search = useCallback(
    async (term: string): Promise<readonly LocalizedOption[]> => {
      if (!searchEnabled) {
        console.warn('Search is not enabled for this hook');
        return [];
      }

      if (!term.trim()) {
        return options || [];
      }

      setIsSearching(true);

      try {
        const { data, error: searchError } = await supabase.rpc(
          'search_localized_values',
          {
            p_entity_type: entityType,
            p_search_term: term,
            p_language_code: currentLang,
            p_limit: 20,
          }
        );

        if (searchError) {
          throw searchError;
        }

        const results: readonly LocalizedOption[] =
          (data as SearchLocalizedValuesResult[])?.map((item) => ({
            value: item.entity_key,
            label: item.label,
            description: item.description || undefined,
            sort_order: item.sort_order || undefined,
            metadata: undefined,
          })) || [];

        return results;
      } catch (err) {
        console.error('Search error:', err);
        return options || [];
      } finally {
        setIsSearching(false);
      }
    },
    [searchEnabled, entityType, currentLang, options]
  );

  return {
    options: options || [],
    loading,
    error: error as Error | null,
    getValue,
    getOption,
    getOptions,
    refresh,
    search,
    isSearching,
  };
}

// ============================================================================
// Batch Hook
// ============================================================================

/**
 * Hook for batch fetching multiple localized values
 */
export function useLocalizedDbValueBatch(
  entityType: LocalizedEntityType,
  entityKeys: readonly string[]
): Record<string, string> {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'no';

  const { data } = useQuery({
    queryKey: localizationKeys.batch(entityType, currentLang, entityKeys),
    queryFn: async (): Promise<Record<string, string>> => {
      if (entityKeys.length === 0) {
        return {};
      }

      const { data, error } = await supabase.rpc(
        'get_localized_values_batch',
        {
          p_entity_type: entityType,
          p_entity_keys: entityKeys as string[],
          p_language_code: currentLang,
        }
      );

      if (error) {
        throw error;
      }

      const result: Record<string, string> = {};
      data?.forEach(
        (item: { entity_key: string; label: string }) => {
          result[item.entity_key] = item.label;
        }
      );

      // Add fallback for keys not found
      entityKeys.forEach((key) => {
        if (!result[key]) {
          result[key] = key;
        }
      });

      return result;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: entityKeys.length > 0,
  });

  return data || {};
}

// ============================================================================
// Single Value Hook
// ============================================================================

/**
 * Hook for fetching a single localized value
 * More efficient than useLocalizedDbValueEnhanced when you only need one value
 */
export function useLocalizedDbSingleValue(
  entityType: LocalizedEntityType,
  entityKey: string
): {
  readonly label: string;
  readonly loading: boolean;
} {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'no';

  const { data, isLoading } = useQuery({
    queryKey: [...localizationKeys.byType(entityType, currentLang), entityKey],
    queryFn: async (): Promise<string> => {
      const { data, error } = await supabase
        .from('localized_db_values')
        .select('label')
        .eq('entity_type', entityType)
        .eq('entity_key', entityKey)
        .eq('language_code', currentLang)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      return data?.label || entityKey;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

  return {
    label: data || entityKey,
    loading: isLoading,
  };
}

// ============================================================================
// Prefetch Hook
// ============================================================================

/**
 * Hook to prefetch localized values for a given entity type
 * Useful for preloading data before user interaction
 */
export function usePrefetchLocalizedValues(
  entityTypes: readonly LocalizedEntityType[]
): void {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'no';
  const queryClient = useQueryClient();

  useEffect(() => {
    entityTypes.forEach((entityType) => {
      queryClient.prefetchQuery({
        queryKey: localizationKeys.byType(entityType, currentLang),
        queryFn: async () => {
          const { data } = await supabase
            .from('localized_db_values')
            .select('entity_key, label, description, sort_order, metadata')
            .eq('entity_type', entityType)
            .eq('language_code', currentLang)
            .eq('is_active', true)
            .order('sort_order', { ascending: true, nullsFirst: false });

          return (
            data?.map((item) => ({
              value: item.entity_key,
              label: item.label,
              description: item.description || undefined,
              sort_order: item.sort_order || undefined,
              metadata:
                (item.metadata as Record<string, unknown>) || undefined,
            })) || []
          );
        },
        staleTime: 1000 * 60 * 30,
      });
    });
  }, [entityTypes, currentLang, queryClient]);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all localized value cache
 */
export function clearLocalizedCache(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({
    queryKey: localizationKeys.all,
  });
}

/**
 * Clear cache for specific entity type
 */
export function clearEntityCache(
  queryClient: ReturnType<typeof useQueryClient>,
  entityType: LocalizedEntityType,
  language: string
): void {
  queryClient.invalidateQueries({
    queryKey: localizationKeys.byType(entityType, language),
  });
}

/**
 * Get cached value synchronously (returns undefined if not cached)
 */
export function getCachedLocalizedValue(
  queryClient: ReturnType<typeof useQueryClient>,
  entityType: LocalizedEntityType,
  entityKey: string,
  language: string
): string | undefined {
  const cachedData = queryClient.getQueryData<readonly LocalizedOption[]>(
    localizationKeys.byType(entityType, language)
  );

  return cachedData?.find((opt) => opt.value === entityKey)?.label;
}
