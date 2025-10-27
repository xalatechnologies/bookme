"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Command, Building, Users, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminSearch } from "@/hooks/useAdminSearch";

interface ISearchFieldProps {
  readonly children?: never;
}

const SearchField = (_props: ISearchFieldProps): JSX.Element => {
  const { t } = useTranslation('common');
  const {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick,
    handleKeyDown,
  } = useAdminSearch();

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  // Get group titles with i18n
  const getGroupTitle = (type: string): string => {
    switch (type) {
      case 'facility':
        return t('search.group_facilities');
      case 'user':
        return t('search.group_users');
      case 'booking':
        return t('search.group_bookings');
      case 'document':
        return t('search.group_documents');
      default:
        return type;
    }
  };

  // Get icon component based on icon type
  const getIcon = (iconType: string): React.ReactNode => {
    switch (iconType) {
      case 'building':
        return <Building className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  return (
    <div
      className="relative w-full max-w-2xl min-w-[300px]"
      ref={searchRef}
    >
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('search.search_admin')}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchTerm.trim() && results.length > 0) {
              // Handled by hook
            }
          }}
          className="pl-10 pr-16 py-2 w-full border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
          aria-label={t('aria.search_input')}
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
                  {t('search.no_results')}
                </div>
              ) : (
                <>
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div
                      key={type}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                        {getGroupTitle(type)}
                      </div>
                      {typeResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleResultClick(result);
                            }
                          }}
                        >
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 rounded">
                            {getIcon(result.iconType)}
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
