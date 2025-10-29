import { useState, useCallback, useMemo } from 'react';

export interface CalendarFilterState {
  readonly searchQuery: string;
  readonly selectedFacilities: readonly string[];
  readonly selectedStatuses: readonly string[];
  readonly isFilterOpen: boolean;
  readonly hasActiveFilters: boolean;
}

export interface CalendarFilterActions {
  readonly handleFacilityToggle: (facility: string) => void;
  readonly handleStatusToggle: (status: string) => void;
  readonly clearAllFilters: () => void;
  readonly setIsFilterOpen: (isOpen: boolean) => void;
  readonly onSearchChange: (query: string) => void;
  readonly onFacilitiesChange: (facilities: readonly string[]) => void;
  readonly onStatusesChange: (statuses: readonly string[]) => void;
}

export interface UseCalendarFilterStateProps {
  readonly initialSearchQuery?: string;
  readonly initialSelectedFacilities?: readonly string[];
  readonly initialSelectedStatuses?: readonly string[];
  readonly onSearchChange?: (query: string) => void;
  readonly onFacilitiesChange?: (facilities: readonly string[]) => void;
  readonly onStatusesChange?: (statuses: readonly string[]) => void;
}

export interface UseCalendarFilterStateReturn {
  readonly state: CalendarFilterState;
  readonly actions: CalendarFilterActions;
}

/**
 * Custom hook for managing calendar filter state
 * Handles search, facility, and status filters with toggle and clear functionality
 */
export const useCalendarFilterState = ({
  initialSearchQuery = '',
  initialSelectedFacilities = [],
  initialSelectedStatuses = [],
  onSearchChange: externalOnSearchChange,
  onFacilitiesChange: externalOnFacilitiesChange,
  onStatusesChange: externalOnStatusesChange
}: UseCalendarFilterStateProps = {}): UseCalendarFilterStateReturn => {
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedFacilities, setSelectedFacilities] = useState<readonly string[]>(initialSelectedFacilities);
  const [selectedStatuses, setSelectedStatuses] = useState<readonly string[]>(initialSelectedStatuses);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Handle search change with external callback
  const handleSearchChange = useCallback((query: string): void => {
    setSearchQuery(query);
    externalOnSearchChange?.(query);
  }, [externalOnSearchChange]);

  // Handle facilities change with external callback
  const handleFacilitiesChange = useCallback((facilities: readonly string[]): void => {
    setSelectedFacilities(facilities);
    externalOnFacilitiesChange?.(facilities);
  }, [externalOnFacilitiesChange]);

  // Handle statuses change with external callback
  const handleStatusesChange = useCallback((statuses: readonly string[]): void => {
    setSelectedStatuses(statuses);
    externalOnStatusesChange?.(statuses);
  }, [externalOnStatusesChange]);

  // Toggle facility selection
  const handleFacilityToggle = useCallback((facility: string): void => {
    const newFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter(f => f !== facility)
      : [...selectedFacilities, facility];
    handleFacilitiesChange(newFacilities);
  }, [selectedFacilities, handleFacilitiesChange]);

  // Toggle status selection
  const handleStatusToggle = useCallback((status: string): void => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    handleStatusesChange(newStatuses);
  }, [selectedStatuses, handleStatusesChange]);

  // Clear all filters
  const clearAllFilters = useCallback((): void => {
    handleSearchChange('');
    handleFacilitiesChange([]);
    handleStatusesChange([]);
  }, [handleSearchChange, handleFacilitiesChange, handleStatusesChange]);

  // Calculate if any filters are active
  const hasActiveFilters = useMemo(() =>
    searchQuery !== '' || selectedFacilities.length > 0 || selectedStatuses.length > 0,
    [searchQuery, selectedFacilities.length, selectedStatuses.length]
  );

  return {
    state: {
      searchQuery,
      selectedFacilities,
      selectedStatuses,
      isFilterOpen,
      hasActiveFilters
    },
    actions: {
      handleFacilityToggle,
      handleStatusToggle,
      clearAllFilters,
      setIsFilterOpen,
      onSearchChange: handleSearchChange,
      onFacilitiesChange: handleFacilitiesChange,
      onStatusesChange: handleStatusesChange
    }
  };
};
