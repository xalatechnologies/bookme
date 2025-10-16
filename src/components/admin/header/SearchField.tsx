"use client";

import React, { useState, useEffect } from "react";
import { Search, Command } from "lucide-react";

interface ISearchFieldProps {
  readonly children?: never;
}

const SearchField = (_props: ISearchFieldProps): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleSearch = (): void => {
    if (searchTerm.trim() === "") {
      return;
    }
    
    try {
      // Get admin data from localStorage (simulating API call)
      const facilities = JSON.parse(localStorage.getItem('adminFacilities') || '[]');
      const users = JSON.parse(localStorage.getItem('adminUsers') || '[]');
      const bookings = JSON.parse(localStorage.getItem('adminBookings') || '[]');
      
      // Filter all admin data based on search term
      const searchResults = {
        facilities: facilities.filter((facility: any) => 
          facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facility.address?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        users: users.filter((user: any) => 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        bookings: bookings.filter((booking: any) => 
          booking.facility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      };
      
      // Store search results in localStorage
      localStorage.setItem('adminSearchResults', JSON.stringify({
        query: searchTerm,
        results: searchResults,
        timestamp: new Date().toISOString()
      }));
      
      // Calculate total results
      const totalResults = searchResults.facilities.length + 
                          searchResults.users.length + 
                          searchResults.bookings.length;
      
      if (totalResults > 0) {
        // Update URL to include search query
        const url = new URL(window.location.href);
        url.searchParams.set('search', searchTerm);
        window.history.pushState({}, '', url.toString());
        
        // Trigger a custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('adminSearch', {
          detail: { query: searchTerm, results: searchResults }
        }));
        
        alert(`Fant ${totalResults} resultater: ${searchResults.facilities.length} lokaler, ${searchResults.users.length} brukere, ${searchResults.bookings.length} bookinger`);
      } else {
        alert(`Ingen resultater funnet for "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Admin search failed:', error);
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
          placeholder="Søk i admin..."
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

export default SearchField;
