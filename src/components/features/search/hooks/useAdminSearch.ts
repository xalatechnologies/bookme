/**
 * useAdminSearch Hook
 *
 * Custom hook for admin search functionality with facility, user, booking, and document search.
 * Follows Single Responsibility Principle - handles ONLY admin search logic.
 *
 * @returns Search state and handlers for admin interface
 */

import { useState, useCallback, useEffect, useRef } from 'react';

export interface AdminSearchResult {
  readonly id: string;
  readonly type: 'facility' | 'user' | 'booking' | 'document';
  readonly title: string;
  readonly subtitle?: string;
  readonly iconType: 'building' | 'users' | 'calendar' | 'document';
  readonly url: string;
}

interface UseAdminSearchReturn {
  readonly searchTerm: string;
  readonly isOpen: boolean;
  readonly results: AdminSearchResult[];
  readonly searchRef: React.RefObject<HTMLDivElement>;
  readonly inputRef: React.RefObject<HTMLInputElement>;
  readonly handleSearchChange: (value: string) => void;
  readonly handleResultClick: (result: AdminSearchResult) => void;
  readonly handleSearchSubmit: () => void;
  readonly handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  readonly setIsOpen: (isOpen: boolean) => void;
}

export const useAdminSearch = (): UseAdminSearchReturn => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create mock search results for admin data
  // In production, this would be replaced with API calls
  const createSearchResults = useCallback(
    (searchTerm: string): AdminSearchResult[] => {
      if (!searchTerm.trim()) return [];

      const searchLower = searchTerm.toLowerCase().trim();

      // Mock facilities
      const facilityResults: AdminSearchResult[] = [
        {
          id: '1',
          type: 'facility' as const,
          title: 'Solberghallen',
          subtitle: 'Drammen - Kapasitet: 100',
          iconType: 'building' as const,
          url: '/admin/facilities/1',
        },
        {
          id: '2',
          type: 'facility' as const,
          title: 'Drammen Idrettshall',
          subtitle: 'Drammen - Kapasitet: 200',
          iconType: 'building' as const,
          url: '/admin/facilities/2',
        },
      ].filter(
        (f) =>
          f.title.toLowerCase().includes(searchLower) ||
          f.subtitle?.toLowerCase().includes(searchLower)
      );

      // Mock users
      const userResults: AdminSearchResult[] = [
        {
          id: '101',
          type: 'user' as const,
          title: 'Amin Ismail',
          subtitle: 'amin.ismail@example.com - Admin',
          iconType: 'users' as const,
          url: '/admin/users/101',
        },
        {
          id: '102',
          type: 'user' as const,
          title: 'John Doe',
          subtitle: 'john.doe@example.com - User',
          iconType: 'users' as const,
          url: '/admin/users/102',
        },
      ].filter(
        (u) =>
          u.title.toLowerCase().includes(searchLower) ||
          u.subtitle?.toLowerCase().includes(searchLower)
      );

      // Mock bookings
      const bookingResults: AdminSearchResult[] = [
        {
          id: '201',
          type: 'booking' as const,
          title: 'Booking #201',
          subtitle: 'Solberghallen - 15.01.2024 14:00',
          iconType: 'calendar' as const,
          url: '/admin/bookings/201',
        },
      ].filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.subtitle?.toLowerCase().includes(searchLower)
      );

      // Mock documents
      const documentResults: AdminSearchResult[] = [
        {
          id: '301',
          type: 'document' as const,
          title: 'Brukerhåndbok.pdf',
          subtitle: 'Systemdokumentasjon',
          iconType: 'document' as const,
          url: '/admin/documents/301',
        },
      ].filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) ||
          d.subtitle?.toLowerCase().includes(searchLower)
      );

      return [
        ...facilityResults,
        ...userResults,
        ...bookingResults,
        ...documentResults,
      ].slice(0, 8);
    },
    []
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (value: string): void => {
      setSearchTerm(value);
      const searchResults = createSearchResults(value);
      setResults(searchResults);
      setIsOpen(value.trim().length > 0);
    },
    [createSearchResults]
  );

  // Handle search submission
  const handleSearchSubmit = useCallback((): void => {
    if (searchTerm.trim() === '') return;

    // In a real app, this would navigate to a search results page

    // For now, just show an alert with the number of results
    alert(`Fant ${results.length} resultater for "${searchTerm}"`);

    setIsOpen(false);
  }, [searchTerm, results.length]);

  // Handle result click
  const handleResultClick = useCallback((
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _result: AdminSearchResult
  ): void => {
    // In a real app, this would navigate to the result page

    setIsOpen(false);
    setSearchTerm('');
  }, []);

  // Handle key down events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen && results.length > 0) {
          // Navigate to first result
          handleResultClick(results[0]);
        } else {
          // Submit search
          handleSearchSubmit();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    },
    [isOpen, results, handleResultClick, handleSearchSubmit]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard shortcut handler (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick,
    handleSearchSubmit,
    handleKeyDown,
    setIsOpen,
  };
};
