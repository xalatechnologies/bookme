"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Command, Building, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchResult {
  readonly id: string;
  readonly type: 'facility' | 'location' | 'category';
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: React.ReactNode;
  readonly url: string;
  readonly image?: string;
}

interface IUserSearchFieldProps {
  readonly children?: never;
}

const UserSearchField = (_props: IUserSearchFieldProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [results, setResults] = useState<UserSearchResult[]>([]);
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

  // Create mock search results for user data
  const createSearchResults = (searchTerm: string): UserSearchResult[] => {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Mock facilities
    const facilityResults: UserSearchResult[] = [
      {
        id: "1",
        type: 'facility' as const,
        title: "Solberghallen",
        subtitle: "Drammen - Kapasitet: 100",
        icon: <Building className="h-5 w-5" />,
        url: "/facilities/1",
        image: "/placeholder-facility-1.jpg"
      },
      {
        id: "2",
        type: 'facility' as const,
        title: "Drammen Idrettshall",
        subtitle: "Drammen - Kapasitet: 200",
        icon: <Building className="h-5 w-5" />,
        url: "/facilities/2",
        image: "/placeholder-facility-2.jpg"
      },
      {
        id: "3",
        type: 'facility' as const,
        title: "Nedre Eikerhallen",
        subtitle: "Nedre Eiker - Kapasitet: 150",
        icon: <Building className="h-5 w-5" />,
        url: "/facilities/3",
        image: "/placeholder-facility-3.jpg"
      }
    ].filter(f => f.title.toLowerCase().includes(searchLower) || 
                 f.subtitle?.toLowerCase().includes(searchLower));

    // Mock locations
    const locationResults: UserSearchResult[] = [
      {
        id: "loc-1",
        type: 'location' as const,
        title: "Drammen",
        subtitle: "3 lokaler tilgjengelig",
        icon: <MapPin className="h-5 w-5" />,
        url: "/facilities?location=drammen"
      },
      {
        id: "loc-2",
        type: 'location' as const,
        title: "Nedre Eiker",
        subtitle: "1 lokale tilgjengelig",
        icon: <MapPin className="h-5 w-5" />,
        url: "/facilities?location=nedre-eiker"
      }
    ].filter(l => l.title.toLowerCase().includes(searchLower));

    // Mock categories
    const categoryResults: UserSearchResult[] = [
      {
        id: "cat-1",
        type: 'category' as const,
        title: "Fotballbaner",
        subtitle: "5 lokaler tilgjengelig",
        icon: <Users className="h-5 w-5" />,
        url: "/facilities?category=fotballbaner"
      },
      {
        id: "cat-2",
        type: 'category' as const,
        title: "Gym",
        subtitle: "2 lokaler tilgjengelig",
        icon: <Users className="h-5 w-5" />,
        url: "/facilities?category=gym"
      }
    ].filter(c => c.title.toLowerCase().includes(searchLower));

    return [...facilityResults, ...locationResults, ...categoryResults].slice(0, 6);
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
  const handleResultClick = (result: UserSearchResult): void => {
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
  }, {} as Record<string, UserSearchResult[]>);

  // Get group titles
  const getGroupTitle = (type: string): string => {
    switch (type) {
      case 'facility': return 'Fasiliteter';
      case 'location': return 'Lokasjoner';
      case 'category': return 'Kategorier';
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
          placeholder="Søk etter lokaler..."
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
                          {result.image ? (
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 overflow-hidden flex-shrink-0 rounded">
                              <img 
                                src={result.image} 
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 rounded">
                              {result.icon}
                            </div>
                          )}
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

export default UserSearchField;
