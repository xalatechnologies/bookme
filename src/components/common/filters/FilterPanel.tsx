/**
 * FilterPanel Component
 *
 * Reusable panel container for filters with collapsible support.
 * Implements Open/Closed Principle - extensible through children.
 */

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface FilterPanelProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly isCollapsible?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onClearFilters?: () => void;
  readonly activeFiltersCount?: number;
  readonly showClearButton?: boolean;
  readonly className?: string;
  readonly namespace?: string;
}

/**
 * Container component for filter controls
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   title="Filtre"
 *   onClearFilters={clearAllFilters}
 *   activeFiltersCount={3}
 *   isCollapsible
 * >
 *   <SearchInput value={query} onChange={setQuery} />
 *   <Select>...</Select>
 * </FilterPanel>
 * ```
 */
export const FilterPanel = ({
  children,
  title,
  isCollapsible = false,
  defaultExpanded = true,
  onClearFilters,
  activeFiltersCount = 0,
  showClearButton = true,
  className = '',
  namespace = 'common'
}: FilterPanelProps): JSX.Element => {
  const { t } = useTranslation(namespace);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleClear = useCallback(() => {
    onClearFilters?.();
  }, [onClearFilters]);

  const defaultTitle = t('filters.title', 'Filtre');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900">
              {title || defaultTitle}
            </h3>
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showClearButton && activeFiltersCount > 0 && onClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                aria-label={t('filters.clear', 'Tøm filtre')}
              >
                <X className="h-4 w-4 mr-1" />
                {t('filters.clear', 'Tøm filtre')}
              </Button>
            )}

            {isCollapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="h-8 w-8 p-0"
                aria-label={isExpanded ? t('actions.collapse', 'Kollaps') : t('actions.expand', 'Utvid')}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {children}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
