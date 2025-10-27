/**
 * useGlobalSearch Hook
 *
 * Custom hook for global search functionality with facility, location, and category search.
 * Follows Single Responsibility Principle - handles ONLY search logic.
 *
 * @returns Search state and handlers
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFacilityStore } from '@/stores/facilityStore';

export interface SearchResult {
  readonly id: string;
  readonly type: 'facility' | 'location' | 'category' | 'recent';
  readonly title: string;
  readonly subtitle?: string;
  readonly iconType: 'building' | 'location' | 'users';
  readonly url: string;
  readonly image?: string;
  readonly searchParams?: Record<string, string>;
}

interface UseGlobalSearchReturn {
  readonly searchTerm: string;
  readonly isOpen: boolean;
  readonly results: SearchResult[];
  readonly searchRef: React.RefObject<HTMLDivElement>;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly handleSearchChange: (value: string) => void;
  readonly handleResultClick: (result: SearchResult) => void;
  readonly setIsOpen: (isOpen: boolean) => void;
  readonly clearSearch: () => void;
}

export const useGlobalSearch = (
  onResultClick?: () => void
): UseGlobalSearchReturn => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { getPublishedFacilities } = useFacilityStore();
  const facilities = getPublishedFacilities();

  // Create search results from facilities and other data
  const createSearchResults = useCallback(
    (searchTerm: string): SearchResult[] => {
      if (!searchTerm.trim()) return [];

      const searchLower = searchTerm.toLowerCase().trim();

      const facilityResults: SearchResult[] = facilities
        .filter((facility) => {
          const matchesName = facility.name.toLowerCase().includes(searchLower);
          const matchesDescription = facility.description
            ?.toLowerCase()
            .includes(searchLower);
          const matchesType = facility.type.toLowerCase().includes(searchLower);
          const matchesLocation = facility.location
            .toLowerCase()
            .includes(searchLower);
          const matchesAmenities = facility.amenities?.some((amenity) =>
            amenity.toLowerCase().includes(searchLower)
          );

          return (
            matchesName ||
            matchesDescription ||
            matchesType ||
            matchesLocation ||
            matchesAmenities
          );
        })
        .slice(0, 6) // Limit facility results
        .map((facility) => ({
          id: facility.id.toString(),
          type: 'facility' as const,
          title: facility.name,
          subtitle: `${facility.location} - Kapasitet: ${facility.capacity}`,
          iconType: 'building' as const,
          url: `/facilities/${facility.id}`,
          image: facility.images[0],
        }));

      // Add location results (unique locations from facilities)
      const uniqueLocations = Array.from(
        new Set(facilities.map((f) => f.location))
      )
        .filter((location) => location.toLowerCase().includes(searchLower))
        .slice(0, 3)
        .map((location) => {
          const count = facilities.filter((f) => f.location === location).length;
          return {
            id: `location-${location}`,
            type: 'location' as const,
            title: location,
            subtitle: `${count} lokaler tilgjengelig`,
            iconType: 'location' as const,
            url: '/',
            searchParams: {
              location: location.toLowerCase().replace(/\s+/g, '-'),
            },
          };
        });

      // Add category results (unique types from facilities)
      const uniqueTypes = Array.from(new Set(facilities.map((f) => f.type)))
        .filter((type) => type.toLowerCase().includes(searchLower))
        .slice(0, 3)
        .map((type) => {
          const count = facilities.filter((f) => f.type === type).length;
          return {
            id: `category-${type}`,
            type: 'category' as const,
            title: type,
            subtitle: `${count} lokaler tilgjengelig`,
            iconType: 'users' as const,
            url: '/',
            searchParams: {
              facilityType: type.toLowerCase().replace(/\s+/g, '-'),
            },
          };
        });

      return [...facilityResults, ...uniqueLocations, ...uniqueTypes];
    },
    [facilities]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string): void => {
      setSearchTerm(value);
      const searchResults = createSearchResults(value);
      setResults(searchResults);
      setIsOpen(value.trim().length > 0 && searchResults.length > 0);
    },
    [createSearchResults]
  );

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResult): void => {
      if (result.searchParams) {
        const params = new URLSearchParams();
        Object.entries(result.searchParams).forEach(([key, value]) => {
          params.set(key, value);
        });
        navigate(`${result.url}?${params.toString()}`);
      } else {
        navigate(result.url);
      }

      setIsOpen(false);
      setSearchTerm('');
      onResultClick?.();
    },
    [navigate, onResultClick]
  );

  // Clear search
  const clearSearch = useCallback((): void => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleFacilityClick = (): void => {
      setIsOpen(false);
      setSearchTerm('');
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleFacilityClick);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleFacilityClick);
    };
  }, []);

  // Close dropdown when search term is cleared
  useEffect(() => {
    if (!searchTerm.trim()) {
      setIsOpen(false);
    }
  }, [searchTerm]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick,
    setIsOpen,
    clearSearch,
  };
};
