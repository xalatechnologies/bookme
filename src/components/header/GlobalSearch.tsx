"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Search, Building, MapPin, Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

interface GlobalSearchProps {
  readonly onResultClick?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onResultClick,
}): JSX.Element => {
  const { t } = useTranslation('common');
  const {
    searchTerm,
    isOpen,
    results,
    searchRef,
    inputRef,
    handleSearchChange,
    handleResultClick: handleResult,
    setIsOpen,
  } = useGlobalSearch(onResultClick);

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
      case 'location':
        return t('search.group_locations');
      case 'category':
        return t('search.group_categories');
      case 'recent':
        return t('search.recent_searches');
      default:
        return type;
    }
  };

  // Get icon component based on icon type
  const getIcon = (iconType: string): React.ReactNode => {
    switch (iconType) {
      case 'building':
        return <Building className="h-5 w-5" />;
      case 'location':
        return <MapPin className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  return (
    <div
      className="relative w-full max-w-2xl min-w-[350px]"
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
          placeholder={t('search.search_facilities')}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (searchTerm.trim() && results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          aria-label={t('aria.search_input')}
        />
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-hidden">
          <div className="rounded-lg border-0">
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  {t('search.no_results')}
                </div>
              ) : (
                <>
                  {Object.entries(groupedResults).map(([type, typeResults]) => (
                    <div
                      key={type}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        {getGroupTitle(type)}
                      </div>
                      {typeResults.map((result) => (
                        <div
                          key={result.id}
                          onClick={() => handleResult(result)}
                          className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleResult(result);
                            }
                          }}
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
                              {getIcon(result.iconType)}
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
