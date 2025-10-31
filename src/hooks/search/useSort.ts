/**
 * useSort Hook
 *
 * Generic sorting hook with support for multiple sort criteria.
 * Implements Single Responsibility Principle by focusing on sorting logic.
 *
 * @template T - The type of items being sorted
 */

import { useState, useCallback, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig<T> {
  readonly key: keyof T | string;
  readonly order: SortOrder;
  readonly compareFn?: (a: T, b: T, order: SortOrder) => number;
}

export interface UseSortOptions<T> {
  readonly items: readonly T[];
  readonly initialSort?: SortConfig<T>;
  readonly sortFns?: Record<string, (a: T, b: T, order: SortOrder) => number>;
}

export interface UseSortResult<T> {
  readonly sortedItems: readonly T[];
  readonly sortConfig: SortConfig<T> | null;
  readonly setSort: (key: keyof T | string, order?: SortOrder) => void;
  readonly toggleSort: (key: keyof T | string) => void;
  readonly clearSort: () => void;
}

/**
 * Default comparison function for primitive values
 */
const defaultCompare = <T>(a: T, b: T, key: keyof T | string, order: SortOrder): number => {
  const aValue = typeof key === 'string' && key.includes('.')
    ? getNestedValue(a, key)
    : (a as Record<string, unknown>)[key];
  const bValue = typeof key === 'string' && key.includes('.')
    ? getNestedValue(b, key)
    : (b as Record<string, unknown>)[key];

  // Handle null/undefined
  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return order === 'asc' ? 1 : -1;
  if (bValue == null) return order === 'asc' ? -1 : 1;

  // Handle numbers
  if (typeof aValue === 'number' && typeof bValue === 'number') {
    return order === 'asc' ? aValue - bValue : bValue - aValue;
  }

  // Handle strings
  if (typeof aValue === 'string' && typeof bValue === 'string') {
    const comparison = aValue.localeCompare(bValue, 'no');
    return order === 'asc' ? comparison : -comparison;
  }

  // Handle dates
  if (aValue instanceof Date && bValue instanceof Date) {
    const comparison = aValue.getTime() - bValue.getTime();
    return order === 'asc' ? comparison : -comparison;
  }

  // Handle booleans
  if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
    const comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
    return order === 'asc' ? comparison : -comparison;
  }

  // Fallback to string comparison
  const aStr = String(aValue);
  const bStr = String(bValue);
  const comparison = aStr.localeCompare(bStr, 'no');
  return order === 'asc' ? comparison : -comparison;
};

/**
 * Get nested value from object using dot notation
 */
const getNestedValue = <T>(obj: T, path: string): unknown => {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object'
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj as unknown);
};

/**
 * Hook for implementing sorting functionality
 *
 * @example
 * ```typescript
 * const { sortedItems, setSort, toggleSort } = useSort({
 *   items: facilities,
 *   initialSort: { key: 'name', order: 'asc' },
 *   sortFns: {
 *     price: (a, b, order) => {
 *       const priceA = a.price || 0;
 *       const priceB = b.price || 0;
 *       return order === 'asc' ? priceA - priceB : priceB - priceA;
 *     }
 *   }
 * });
 * ```
 */
export const useSort = <T>({
  items,
  initialSort = null,
  sortFns = {}
}: UseSortOptions<T>): UseSortResult<T> => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialSort);

  // Sort items based on current sort configuration
  const sortedItems = useMemo(() => {
    if (!sortConfig) {
      return items;
    }

    try {
      const sorted = [...items];
      const { key, order, compareFn } = sortConfig;

      sorted.sort((a, b) => {
        // Use custom compare function if provided in sortConfig
        if (compareFn) {
          return compareFn(a, b, order);
        }

        // Use predefined sort function for this key
        const keyStr = String(key);
        if (sortFns[keyStr]) {
          return sortFns[keyStr](a, b, order);
        }

        // Use default comparison
        return defaultCompare(a, b, key, order);
      });

      return sorted;
    } catch (error) {
      console.error('Sort error:', error);
      return items;
    }
  }, [items, sortConfig, sortFns]);

  // Set sort configuration
  const setSort = useCallback((key: keyof T | string, order: SortOrder = 'asc') => {
    setSortConfig({
      key,
      order,
      compareFn: typeof key === 'string' && sortFns[key]
        ? sortFns[key]
        : undefined
    });
  }, [sortFns]);

  // Toggle sort order for a key
  const toggleSort = useCallback((key: keyof T | string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return {
          key,
          order: 'asc',
          compareFn: typeof key === 'string' && sortFns[key]
            ? sortFns[key]
            : undefined
        };
      }

      if (prev.order === 'asc') {
        return { ...prev, order: 'desc' };
      }

      // Clear sort after desc
      return null;
    });
  }, [sortFns]);

  // Clear sort
  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  return {
    sortedItems,
    sortConfig,
    setSort,
    toggleSort,
    clearSort
  };
};
