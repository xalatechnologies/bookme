import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type SortBy = 'price' | 'popularity' | 'name';
export type SortOrder = 'asc' | 'desc';

interface FacilityType {
  readonly value: string;
  readonly label: string;
}

interface UseFilterStateReturn {
  readonly showFilters: boolean;
  readonly facilityTypes: readonly FacilityType[];
  readonly toggleFilters: () => void;
  readonly handleSortClick: (newSortBy: SortBy) => void;
  readonly getActiveFilterCount: () => number;
}

interface UseFilterStateProps {
  readonly selectedType: string;
  readonly sortBy: SortBy;
  readonly sortOrder: SortOrder;
  readonly onSortChange: (sortBy: SortBy, order: SortOrder) => void;
  readonly showAvailableOnly: boolean;
}

/**
 * Custom hook for managing filter state and interactions
 *
 * Handles:
 * - Filter panel visibility
 * - Facility type definitions with translations
 * - Sort logic and state management
 * - Active filter counting
 *
 * @param props - Filter state and callbacks
 * @returns Filter state and handler functions
 */
export const useFilterState = (props: UseFilterStateProps): UseFilterStateReturn => {
  const { t } = useTranslation(['facility']);
  const {
    selectedType,
    sortBy,
    sortOrder,
    onSortChange,
    showAvailableOnly
  } = props;

  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Define facility types with translations
  const facilityTypes: readonly FacilityType[] = [
    { value: 'all', label: t('facility:facility_types.all_types') },
    { value: 'sports_hall', label: t('facility:facility_types.sports_hall') },
    { value: 'cultural_center', label: t('facility:facility_types.cultural_center') },
    { value: 'meeting_room', label: t('facility:facility_types.meeting_room') },
    { value: 'fitness_center', label: t('facility:facility_types.fitness_center') },
    { value: 'outdoor', label: t('facility:facility_types.outdoor') }
  ];

  /**
   * Toggle filter panel visibility
   */
  const toggleFilters = useCallback((): void => {
    setShowFilters(prev => !prev);
  }, []);

  /**
   * Handle sort button clicks with toggle logic
   *
   * If clicking the same sort criterion:
   * - Toggle between asc/desc
   * If clicking a different criterion:
   * - Switch to new criterion with asc order
   *
   * @param newSortBy - The sort criterion to apply
   */
  const handleSortClick = useCallback((newSortBy: SortBy): void => {
    if (sortBy === newSortBy) {
      onSortChange(newSortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(newSortBy, 'asc');
    }
  }, [sortBy, sortOrder, onSortChange]);

  /**
   * Calculate the number of active filters
   *
   * Counts:
   * - Type filter (if not "all")
   * - Availability filter (if enabled)
   *
   * @returns Number of active filters
   */
  const getActiveFilterCount = useCallback((): number => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (showAvailableOnly) count++;
    return count;
  }, [selectedType, showAvailableOnly]);

  return {
    showFilters,
    facilityTypes,
    toggleFilters,
    handleSortClick,
    getActiveFilterCount
  };
};
