"use client";

import React, { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";

interface IUserSearchFieldProps {
  readonly children?: never;
}

const UserSearchField = (_props: IUserSearchFieldProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSearch = (): void => {
    if (searchTerm.trim() === "") {
      return;
    }
    
    try {
      // Get facilities from localStorage (simulating API call)
      const facilities = JSON.parse(localStorage.getItem('facilities') || '[]');
      
      // Filter facilities based on search term
      const filteredFacilities = facilities.filter((facility: any) => 
        facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Store search results in localStorage for other components to use
      localStorage.setItem('searchResults', JSON.stringify({
        query: searchTerm,
        results: filteredFacilities,
        timestamp: new Date().toISOString()
      }));
      
      // Navigate to search results page or update current view
      if (filteredFacilities.length > 0) {
        // Update URL to include search query
        const url = new URL(window.location.href);
        url.searchParams.set('search', searchTerm);
        window.history.pushState({}, '', url.toString());
        
        // Trigger a custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('facilitySearch', {
          detail: { query: searchTerm, results: filteredFacilities }
        }));
        
        alert(`Fant ${filteredFacilities.length} lokale(r) for "${searchTerm}"`);
      } else {
        alert(`Ingen lokaler funnet for "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Søket feilet. Prøv igjen.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative">
      <div className={`relative transition-all duration-200 ${
        isFocused ? "w-80" : "w-64"
      }`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Søk etter lokaler..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        
        {/* Keyboard shortcut hint */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>
      
      {/* Search suggestions dropdown (placeholder for future implementation) */}
      {isFocused && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Søkeresultater kommer snart...
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearchField;
