/**
 * useLocalizedDbValues Hook
 *
 * Fetches and caches localized database values from Supabase.
 * Used for dynamic business data like facility types, locations, etc.
 *
 * Features:
 * - Automatic language detection from i18n context
 * - React Query caching (30 minutes)
 * - Type-safe return values
 * - Fallback to entity_key if translation missing
 *
 * Usage:
 * ```tsx
 * const { data: facilityTypes, isLoading } = useLocalizedDbValues('facility_type');
 *
 * {facilityTypes?.map(type => (
 *   <SelectItem key={type.entity_key} value={type.entity_key}>
 *     {type.label}
 *   </SelectItem>
 * ))}
 * ```
 */

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/clients/supabase';

export interface LocalizedDbValue {
  readonly entity_key: string;
  readonly label: string;
  readonly description: string | null;
  readonly sort_order: number | null;
}

export function useLocalizedDbValues(entityType: string) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return useQuery<LocalizedDbValue[]>({
    queryKey: ['localized-db-values', entityType, currentLang],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('localized_db_values')
        .select('entity_key, label, description, sort_order')
        .eq('entity_type', entityType)
        .eq('language_code', currentLang)
        .eq('is_active', true)
        .order('sort_order', { ascending: true, nullsFirst: false });

      if (error) {
        console.error(`Error fetching localized values for ${entityType}:`, error);
        throw error;
      }

      return (data as LocalizedDbValue[]) || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 1000 * 60 * 60, // Background refetch every 1 hour
  });
}

/**
 * Helper hook to get a single localized value by key
 * Returns the label if found, otherwise falls back to entity_key
 */
export function useLocalizedDbValue(entityType: string, entityKey: string): string {
  const { data } = useLocalizedDbValues(entityType);
  
  const value = data?.find(item => item.entity_key === entityKey);
  
  // Fallback to entity_key if translation not found
  return value?.label || entityKey;
}

/**
 * Helper function to get label synchronously from data array
 * Useful when you already have the data loaded
 */
export function getLocalizedLabel(
  items: LocalizedDbValue[] | undefined,
  entityKey: string
): string {
  const value = items?.find(item => item.entity_key === entityKey);
  return value?.label || entityKey;
}

