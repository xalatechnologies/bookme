/**
 * BookingFiltersBar Component
 *
 * Comprehensive filter bar for bookings with search, date range,
 * facility selection, and sorting options.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';
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
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Søk på lokale eller booking ID..."
                value={filters.search || ""}
                onChange={(e) => onSearchChange(e.target.value || undefined)}
                className="pl-10 h-12"
                aria-label="Søk i bookinger"
              />
            </div>
          </div>

          {/* Date Range */}
          <Select
            value={filters.dateRange || 'all'}
            onValueChange={(value) => onDateRangeChange(value as BookingFilters['dateRange'])}
          >
            <SelectTrigger className="w-full lg:w-48 h-12" aria-label="Velg tidsperiode">
              <SelectValue placeholder="Tidsperiode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="today">I dag</SelectItem>
              <SelectItem value="week">Denne uken</SelectItem>
              <SelectItem value="month">Denne måneden</SelectItem>
              <SelectItem value="upcoming">Kommende</SelectItem>
              <SelectItem value="past">Tidligere</SelectItem>
            </SelectContent>
          </Select>

          {/* Facility Filter */}
          {facilities.length > 0 && (
            <Select
              value={filters.facilityId || 'all'}
              onValueChange={(value) => onFacilityChange(value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-full lg:w-48 h-12" aria-label="Velg lokale">
                <SelectValue placeholder="Velg lokale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle lokaler</SelectItem>
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
            <SelectTrigger className="w-full lg:w-48 h-12" aria-label="Sorter bookinger">
              <SelectValue placeholder="Sorter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Dato (kommende først)</SelectItem>
              <SelectItem value="date-desc">Dato (eldste først)</SelectItem>
              <SelectItem value="price-asc">Pris (lav til høy)</SelectItem>
              <SelectItem value="price-desc">Pris (høy til lav)</SelectItem>
              <SelectItem value="created">Opprettet</SelectItem>
            </SelectContent>
          </Select>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex items-center gap-2 h-12 px-4"
              aria-label="Tøm alle filtre"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Tøm filtre</span>
            </Button>

            {onOpenCalendar && (
              <Button
                variant="outline"
                onClick={onOpenCalendar}
                className="flex items-center gap-2 h-12 px-4"
                aria-label="Åpne kalender"
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Kalender</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Indicator */}
        {(filters.search || filters.dateRange !== 'all' || filters.facilityId || filters.sortBy !== 'date-asc') && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Aktive filtre:{' '}
                {[
                  filters.search && 'Søk',
                  filters.dateRange && filters.dateRange !== 'all' && 'Dato',
                  filters.facilityId && 'Lokale',
                  filters.sortBy && filters.sortBy !== 'date-asc' && 'Sortering'
                ].filter(Boolean).join(', ')}
              </span>
              <Button
                variant="link"
                size="sm"
                onClick={onClearFilters}
                className="text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                Tilbakestill alle
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
