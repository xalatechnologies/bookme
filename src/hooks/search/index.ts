/**
 * Search and Filter Hooks
 *
 * Centralized export for all search, filter, and sort hooks.
 * These hooks implement SOLID principles for reusable search/filter logic.
 */

export { useSearch } from './useSearch';
export type { UseSearchOptions, UseSearchResult } from './useSearch';

export { useFilters } from './useFilters';
export type { UseFiltersOptions, UseFiltersResult } from './useFilters';

export { useSort } from './useSort';
export type { UseSortOptions, UseSortResult, SortConfig, SortOrder } from './useSort';
