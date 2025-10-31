/**
 * useSearch Hook
 *
 * Generic search hook for filtering items based on a search query.
 * Implements Single Responsibility Principle by focusing solely on search logic.
 *
 * @template T - The type of items being searched
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface UseSearchOptions<T> {
  readonly items: readonly T[];
  readonly searchFn: (item: T, query: string) => boolean;
  readonly initialQuery?: string;
  readonly debounceMs?: number;
}

export interface UseSearchResult<T> {
  readonly query: string;
  readonly results: readonly T[];
  readonly isSearching: boolean;
  readonly setQuery: (query: string) => void;
  readonly clearQuery: () => void;
  readonly hasActiveQuery: boolean;
}

/**
 * Hook for implementing search functionality with debouncing
 *
 * @example
 * ```typescript
 * const { query, results, setQuery } = useSearch({
 *   items: facilities,
 *   searchFn: (facility, query) =>
 *     facility.name.toLowerCase().includes(query.toLowerCase())
 * });
 * ```
 */
export const useSearch = <T>({
  items,
  searchFn,
  initialQuery = '',
  debounceMs = 300
}: UseSearchOptions<T>): UseSearchResult<T> => {
  const [query, setQueryState] = useState<string>(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(initialQuery);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Debounce search query
  useEffect(() => {
    if (query === debouncedQuery) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debouncedQuery, debounceMs]);

  // Filter items based on debounced query
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    try {
      return items.filter(item => searchFn(item, debouncedQuery));
    } catch (error) {
      console.error('Search error:', error);
      return items;
    }
  }, [items, debouncedQuery, searchFn]);

  // Set query with immediate update
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  // Clear query
  const clearQuery = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setIsSearching(false);
  }, []);

  // Check if there's an active query
  const hasActiveQuery = useMemo(() => query.trim().length > 0, [query]);

  return {
    query,
    results,
    isSearching,
    setQuery,
    clearQuery,
    hasActiveQuery
  };
};
