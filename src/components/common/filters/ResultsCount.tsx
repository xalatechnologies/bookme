/**
 * ResultsCount Component
 *
 * Display count of filtered/search results with i18n support.
 * Implements Single Responsibility Principle - shows only results count.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ResultsCountProps {
  readonly count: number;
  readonly total?: number;
  readonly isFiltered?: boolean;
  readonly namespace?: string;
  readonly className?: string;
}

/**
 * Display results count with optional total and filtering indicator
 *
 * @example
 * ```tsx
 * <ResultsCount
 *   count={filteredItems.length}
 *   total={allItems.length}
 *   isFiltered={hasActiveFilters}
 * />
 * ```
 */
export const ResultsCount = ({
  count,
  total,
  isFiltered = false,
  namespace = 'common',
  className = ''
}: ResultsCountProps): JSX.Element => {
  const { t } = useTranslation(namespace);

  const getText = (): string => {
    if (count === 0) {
      return t('search.no_results', 'Ingen resultater funnet');
    }

    if (total !== undefined && isFiltered) {
      return t('filters.results_filtered', {
        count,
        total,
        defaultValue: '{{count}} av {{total}} resultater'
      });
    }

    return t('filters.results_count', {
      count,
      defaultValue: '{{count}} resultater'
    });
  };

  return (
    <div className={`text-sm text-gray-600 ${className}`}>
      <span>{getText()}</span>
    </div>
  );
};
