"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Command, Building, Users, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchResult {
  readonly id: string;
  readonly type: 'facility' | 'user' | 'booking' | 'document';
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: React.ReactNode;
  readonly url: string;
}

interface ISearchFieldProps {
  readonly children?: never;
}

const SearchField = (_props: ISearchFieldProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<AdminSearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Create mock search results for admin data
  const createSearchResults = (searchTerm: string): AdminSearchResult[] => {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Mock facilities
    const facilityResults: AdminSearchResult[] = [
      {
        id: "1",
        type: 'facility' as const,
        title: "Solberghallen",
        subtitle: "Drammen - Kapasitet: 100",
        icon: <Building className="h-5 w-5" />,
        url: "/admin/facilities/1"
      },
      {
        id: "2",
        type: 'facility' as const,
        title: "Drammen Idrettshall",
        subtitle: "Drammen - Kapasitet: 200",
        icon: <Building className="h-5 w-5" />,
        url: "/admin/facilities/2"
      }
    ].filter(f => f.title.toLowerCase().includes(searchLower) || 
                 f.subtitle?.toLowerCase().includes(searchLower));

    // Mock users
    const userResults: AdminSearchResult[] = [
      {
        id: "101",
        type: 'user' as const,
        title: "Amin Ismail",
        subtitle: "amin.ismail@example.com - Admin",
        icon: <Users className="h-5 w-5" />,
        url: "/admin/users/101"
      },
      {
        id: "102",
        type: 'user' as const,
        title: "John Doe",
        subtitle: "john.doe@example.com - User",
        icon: <Users className="h-5 w-5" />,
        url: "/admin/users/102"
      }
    ].filter(u => u.title.toLowerCase().includes(searchLower) || 
                 u.subtitle?.toLowerCase().includes(searchLower));

    // Mock bookings
    const bookingResults: AdminSearchResult[] = [
      {
        id: "201",
        type: 'booking' as const,
        title: "Booking #201",
        subtitle: "Solberghallen - 15.01.2024 14:00",
        icon: <Calendar className="h-5 w-5" />,
        url: "/admin/bookings/201"
      }
    ].filter(b => b.title.toLowerCase().includes(searchLower) || 
                 b.subtitle?.toLowerCase().includes(searchLower));

    // Mock documents
    const documentResults: AdminSearchResult[] = [
      {
        id: "301",
        type: 'document' as const,
        title: "Brukerhåndbok.pdf",
        subtitle: "Systemdokumentasjon",
        icon: <FileText className="h-5 w-5" />,
        url: "/admin/documents/301"
      }
    ].filter(d => d.title.toLowerCase().includes(searchLower) || 
                 d.subtitle?.toLowerCase().includes(searchLower));

    return [...facilityResults, ...userResults, ...bookingResults, ...documentResults].slice(0, 8);
  };

  // Handle search input change
  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    const searchResults = createSearchResults(value);
    setResults(searchResults);
    setIsOpen(value.trim().length > 0);
  };

  // Handle search submission
  const handleSearchSubmit = (): void => {
    if (searchTerm.trim() === "") return;
    
    // In a real app, this would navigate to a search results page
    console.log("Searching for:", searchTerm);
    
    // For now, just show an alert with the number of results
    alert(`Fant ${results.length} resultater for "${searchTerm}"`);
    
    setIsOpen(false);
  };

  // Handle result click
  const handleResultClick = (result: AdminSearchResult): void => {
    // In a real app, this would navigate to the result page
    console.log("Navigating to:", result.url);
    
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
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
      setSearchTerm("");
    }
  };

  // Keyboard shortcut handler
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

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, AdminSearchResult[]>);

  // Get group titles
  const getGroupTitle = (type: string): string => {
    switch (type) {
      case 'facility': return 'Fasiliteter';
      case 'user': return 'Brukere';
      case 'booking': return 'Bookinger';
      case 'document': return 'Dokumenter';
      default: return type;
    }
  };

  return (
    <div className="relative w-full max-w-2xl min-w-[300px]" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Søk i admin..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-16 py-2 w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
        />
        
        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
          <div className="rounded-lg border-0">
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Ingen resultater funnet.
                </div>
              ) : (
                <>
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div key={type} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                        {getGroupTitle(type)}
                      </div>
                      {typeResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 rounded">
                            {result.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                              {result.title}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchField;
