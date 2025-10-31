/**
 * useFilters Hook
 *
 * Generic filtering hook with support for multiple filter criteria.
 * Implements Interface Segregation Principle through flexible filter options.
 *
 * @template T - The type of items being filtered
 * @template F - The type of filter criteria
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

export interface UseFiltersOptions<T, F extends Record<string, unknown>> {
  readonly items: readonly T[];
  readonly initialFilters: F;
  readonly filterFn: (item: T, filters: F) => boolean;
  readonly onFiltersChange?: (filters: F) => void;
}

export interface UseFiltersResult<T, F extends Record<string, unknown>> {
  readonly filters: F;
  readonly filteredItems: readonly T[];
  readonly activeFilterCount: number;
  readonly hasActiveFilters: boolean;
  readonly setFilters: (filters: F | ((prev: F) => F)) => void;
  readonly setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
  readonly clearFilters: () => void;
  readonly clearFilter: <K extends keyof F>(key: K) => void;
  readonly resetToInitial: () => void;
}

/**
 * Count active filters (non-default values)
 */
const countActiveFilters = <F extends Record<string, unknown>>(
  filters: F,
  initialFilters: F
): number => {
  return Object.keys(filters).filter(key => {
    const currentValue = filters[key];
    const initialValue = initialFilters[key];

    // Handle arrays
    if (Array.isArray(currentValue) && Array.isArray(initialValue)) {
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    }

    // Handle objects
    if (typeof currentValue === 'object' && currentValue !== null) {
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    }

    // Handle primitive values
    return currentValue !== initialValue;
  }).length;
};

/**
 * Hook for implementing filtering functionality
 *
 * @example
 * ```typescript
 * interface FacilityFilters {
 *   type: string;
 *   capacity: [number, number];
 *   available: boolean;
 * }
 *
 * const { filters, filteredItems, setFilter, clearFilters } = useFilters({
 *   items: facilities,
 *   initialFilters: { type: 'all', capacity: [0, 100], available: false },
 *   filterFn: (facility, filters) => {
 *     if (filters.type !== 'all' && facility.type !== filters.type) return false;
 *     if (facility.capacity < filters.capacity[0] || facility.capacity > filters.capacity[1]) return false;
 *     if (filters.available && !facility.isAvailable) return false;
 *     return true;
 *   }
 * });
 * ```
 */
export const useFilters = <T, F extends Record<string, unknown>>({
  items,
  initialFilters,
  filterFn,
  onFiltersChange
}: UseFiltersOptions<T, F>): UseFiltersResult<T, F> => {
  const [filters, setFiltersState] = useState<F>(initialFilters);

  // Notify parent component when filters change
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // Apply filters to items
  const filteredItems = useMemo(() => {
    try {
      return items.filter(item => filterFn(item, filters));
    } catch (error) {
      console.error('Filter error:', error);
      return items;
    }
  }, [items, filters, filterFn]);

  // Count active filters
  const activeFilterCount = useMemo(
    () => countActiveFilters(filters, initialFilters),
    [filters, initialFilters]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () => activeFilterCount > 0,
    [activeFilterCount]
  );

  // Set all filters at once
  const setFilters = useCallback((newFilters: F | ((prev: F) => F)) => {
    setFiltersState(prevFilters => {
      if (typeof newFilters === 'function') {
        return newFilters(prevFilters);
      }
      return newFilters;
    });
  }, []);

  // Set a single filter value
  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters (reset to empty/default state)
  const clearFilters = useCallback(() => {
    // Create a cleared version of filters
    const clearedFilters = Object.keys(initialFilters).reduce((acc, key) => {
      const value = initialFilters[key];
      if (Array.isArray(value)) {
        acc[key] = [] as F[Extract<keyof F, string>];
      } else if (typeof value === 'string') {
        acc[key] = '' as F[Extract<keyof F, string>];
      } else if (typeof value === 'boolean') {
        acc[key] = false as F[Extract<keyof F, string>];
      } else if (typeof value === 'number') {
        acc[key] = 0 as F[Extract<keyof F, string>];
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as F);

    setFiltersState(clearedFilters);
  }, [initialFilters]);

  // Clear a single filter
  const clearFilter = useCallback(<K extends keyof F>(key: K) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: initialFilters[key]
    }));
  }, [initialFilters]);

  // Reset to initial filter values
  const resetToInitial = useCallback(() => {
    setFiltersState(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    filteredItems,
    activeFilterCount,
    hasActiveFilters,
    setFilters,
    setFilter,
    clearFilters,
    clearFilter,
    resetToInitial
  };
};
