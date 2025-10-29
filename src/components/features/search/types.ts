/**
 * Search Domain Types
 */

export interface ISearchFilters {
  query: string;
  categories: string[];
  facilities: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface ISearchResult {
  id: string;
  type: 'facility' | 'booking' | 'user';
  title: string;
  description: string;
  relevance: number;
}

export type SearchType = 'all' | 'facilities' | 'bookings' | 'users';
