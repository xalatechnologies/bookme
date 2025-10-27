/**
 * BookingFiltersBar Component
 *
 * Comprehensive filter bar for bookings with search, date range,
 * facility selection, and sorting options.
 * Refactored to use i18n and reusable components following SOLID principles.
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SearchInput } from '@/components/common/filters';
import type { BookingFilters } from '@/hooks/bookings';

export interface BookingFiltersBarProps {
  readonly filters: BookingFilters;
  readonly facilities?: readonly string[];
  readonly onSearchChange: (search: string | undefined) => void;
  readonly onDateRangeChange: (range: BookingFilters['dateRange']) => void;
  readonly onFacilityChange: (facilityId: string | undefined) => void;
  readonly onSortChange: (sortBy: BookingFilters['sortBy']) => void;
  readonly onClearFilters: () => void;
  readonly onOpenCalendar?: () => void;
}

/**
 * BookingFiltersBar component provides comprehensive filtering options
 *
 * @example
 * ```tsx
 * <BookingFiltersBar
 *   filters={filters}
 *   facilities={facilityList}
 *   onSearchChange={setSearchQuery}
 *   onDateRangeChange={setDateRangeFilter}
 *   onFacilityChange={setFacilityFilter}
 *   onSortChange={setSortBy}
 *   onClearFilters={resetFilters}
 *   onOpenCalendar={() => navigate('/calendar')}
 * />
 * ```
 */
export const BookingFiltersBar = ({
  filters,
  facilities = [],
  onSearchChange,
  onDateRangeChange,
  onFacilityChange,
  onSortChange,
  onClearFilters,
  onOpenCalendar,
}: BookingFiltersBarProps): JSX.Element => {
  const { t } = useTranslation('common');

  // Date range options
  const dateRangeOptions = useMemo(() => [
    { value: 'all', label: t('dateRange.all', 'Alle') },
    { value: 'today', label: t('dateRange.today', 'I dag') },
    { value: 'week', label: t('dateRange.week', 'Denne uken') },
    { value: 'month', label: t('dateRange.month', 'Denne måneden') },
    { value: 'upcoming', label: t('dateRange.upcoming', 'Kommende') },
    { value: 'past', label: t('dateRange.past', 'Tidligere') }
  ], [t]);

  // Sort options
  const sortOptions = useMemo(() => [
    { value: 'date-asc', label: t('sort.date_asc', 'Dato (kommende først)') },
    { value: 'date-desc', label: t('sort.date_desc', 'Dato (eldste først)') },
    { value: 'price-asc', label: t('sort.price_asc', 'Pris (lav til høy)') },
    { value: 'price-desc', label: t('sort.price_desc', 'Pris (høy til lav)') },
    { value: 'created', label: t('sort.created_desc', 'Opprettet') }
  ], [t]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.dateRange && filters.dateRange !== 'all') count++;
    if (filters.facilityId) count++;
    if (filters.sortBy && filters.sortBy !== 'date-asc') count++;
    return count;
  }, [filters]);

  // Active filter labels
  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.search) labels.push(t('actions.search', 'Søk'));
    if (filters.dateRange && filters.dateRange !== 'all') labels.push(t('common.date', 'Dato'));
    if (filters.facilityId) labels.push(t('filters.facility', 'Lokale'));
    if (filters.sortBy && filters.sortBy !== 'date-asc') labels.push(t('actions.sort', 'Sortering'));
    return labels;
  }, [filters, t]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <SearchInput
              value={filters.search || ''}
              onChange={(value) => onSearchChange(value || undefined)}
              placeholder={t('search.search_bookings', 'Søk på lokale eller booking ID...')}
              ariaLabel={t('aria.search_input', 'Søk i bookinger')}
              showClearButton
            />
          </div>

          {/* Date Range */}
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(value) => onDateRangeChange(value as BookingFilters['dateRange'])}
          >
            <SelectTrigger className="w-full lg:w-48 h-12" aria-label={t('filters.date_period', 'Velg tidsperiode')}>
              <SelectValue placeholder={t('filters.date_period', 'Tidsperiode')} />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Facility Filter */}
          {facilities.length > 0 && (
            <Select
              value={filters.facilityId || 'all'}
              onValueChange={(value) => onFacilityChange(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-full lg:w-48 h-12" aria-label={t('filters.select_facility', 'Velg lokale')}>
                <SelectValue placeholder={t('filters.select_facility', 'Velg lokale')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('filters.all_facilities', 'Alle lokaler')}</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort */}
          <Select
            value={filters.sortBy || 'date-asc'}
            onValueChange={(value) => onSortChange(value as BookingFilters['sortBy'])}
          >
            <SelectTrigger className="w-full lg:w-48 h-12" aria-label={t('aria.sort_dropdown', 'Sorter bookinger')}>
              <SelectValue placeholder={t('filters.sort_by', 'Sorter')} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex items-center gap-2 h-12 px-4"
              aria-label={t('filters.clear', 'Tøm alle filtre')}
            >
              <span className="hidden sm:inline">{t('filters.clear', 'Tøm filtre')}</span>
              <span className="sm:hidden">{t('filters.clear', 'Tøm')}</span>
            </Button>

            {onOpenCalendar && (
              <Button
                variant="outline"
                onClick={onOpenCalendar}
                className="flex items-center gap-2 h-12 px-4"
                aria-label={t('aria.calendar', 'Åpne kalender')}
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.calendar', 'Kalender')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Indicator */}
        {activeFiltersCount > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {t('filters.active_filters', 'Aktive filtre')}: {activeFilterLabels.join(', ')}
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={onClearFilters}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                {t('filters.clearAll', 'Tilbakestill alle')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
