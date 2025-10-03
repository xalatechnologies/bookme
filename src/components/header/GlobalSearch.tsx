"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Building, Clock, Users } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { coreFacilities } from "@/data/coreFacilities";

import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface SearchResult {
  readonly id: string;
  readonly type: 'facility' | 'location' | 'category' | 'recent';
  readonly title: string;
  readonly subtitle?: string;
  readonly icon: React.ReactNode;
  readonly url: string;
  readonly image?: string;
  readonly searchParams?: Record<string, string>;
}

interface GlobalSearchProps {
  readonly onResultClick?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onResultClick }): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

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

  // Create search results from facilities and other data
  const createSearchResults = (searchTerm: string): SearchResult[] => {
    if (!searchTerm.trim()) return [];

    const searchLower = searchTerm.toLowerCase().trim();
    
    const facilityResults: SearchResult[] = coreFacilities
      .filter(facility => {
        const matchesName = facility.name.toLowerCase().includes(searchLower);
        const matchesDescription = facility.description?.toLowerCase().includes(searchLower);
        const matchesType = facility.type.toLowerCase().includes(searchLower);
        const matchesLocation = facility.location.toLowerCase().includes(searchLower);
        const matchesAmenities = facility.amenities?.some(amenity => 
          amenity.toLowerCase().includes(searchLower)
        );
        
        return matchesName || matchesDescription || matchesType || matchesLocation || matchesAmenities;
      })
      .slice(0, 6) // Limit facility results
      .map(facility => ({
        id: facility.id.toString(),
        type: 'facility' as const,
        title: facility.name,
        subtitle: `${facility.location} - Kapasitet: ${facility.capacity}`,
        icon: <Building className="h-5 w-5" />,
        url: `/facilities/${facility.id}`,
        image: facility.images[0]
      }));

    // Add location results (unique locations from facilities)
    const uniqueLocations = Array.from(new Set(coreFacilities.map(f => f.location)))
      .filter(location => location.toLowerCase().includes(searchLower))
      .slice(0, 3)
      .map(location => ({
        id: `location-${location}`,
        type: 'location' as const,
        title: location,
        subtitle: `${coreFacilities.filter(f => f.location === location).length} lokaler tilgjengelig`,
        icon: <MapPin className="h-5 w-5" />,
        url: '/',
        searchParams: { location: location.toLowerCase().replace(/\s+/g, '-') }
      }));

    // Add category results (unique types from facilities)
    const uniqueTypes = Array.from(new Set(coreFacilities.map(f => f.type)))
      .filter(type => type.toLowerCase().includes(searchLower))
      .slice(0, 3)
      .map(type => ({
        id: `category-${type}`,
        type: 'category' as const,
        title: type,
        subtitle: `${coreFacilities.filter(f => f.type === type).length} lokaler tilgjengelig`,
        icon: <Users className="h-5 w-5" />,
        url: '/',
        searchParams: { facilityType: type.toLowerCase().replace(/\s+/g, '-') }
      }));

    return [...facilityResults, ...uniqueLocations, ...uniqueTypes];
  };

  // Handle search input change
  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    const searchResults = createSearchResults(value);
    setResults(searchResults);
    setIsOpen(value.trim().length > 0 && searchResults.length > 0);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult): void => {
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
    setSearchTerm("");
    onResultClick?.();
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Get group titles
  const getGroupTitle = (type: string): string => {
    switch (type) {
      case 'facility': return 'Fasiliteter';
      case 'location': return 'Lokasjoner';
      case 'category': return 'Kategorier';
      case 'recent': return 'Nylig søkt';
      default: return type;
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Søk etter fasiliteter..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <Command className="rounded-lg border-0">
            <CommandList className="max-h-96">
              {results.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  Ingen resultater funnet.
                </CommandEmpty>
              ) : (
                <>
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <CommandGroup
                      key={type}
                      heading={getGroupTitle(type)}
                      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500"
                    >
                      {typeResults.map((result) => (
                        <CommandItem
                          key={result.id}
                          value={result.title}
                          onSelect={() => handleResultClick(result)}
                          className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50"
                        >
                          {result.image ? (
                            <div className="w-12 h-12 bg-gray-100 overflow-hidden flex-shrink-0 rounded">
                              <img 
                                src={result.image} 
                                alt={result.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 flex items-center justify-center flex-shrink-0 rounded">
                              {result.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate text-base">
                              {result.title}
                            </div>
                            {result.subtitle && (
                              <div className="text-base text-gray-500 truncate mt-1">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};

