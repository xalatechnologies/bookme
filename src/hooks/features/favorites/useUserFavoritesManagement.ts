"use client";

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { usePublishedFacilities } from '@/services/supabase/facilities.service';
import { useTranslation } from 'react-i18next';

// ============================================================================
// Type Definitions
// ============================================================================

interface IFavoriteFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly address: string;
  readonly capacity: number;
  readonly price: string;
  readonly image: string;
  readonly rating: number;
  readonly addedAt: string;
  readonly lastVisited?: string;
  readonly usageCount?: number;
  readonly amenities: readonly string[];
  readonly description: string;
  readonly availability: "available" | "busy" | "full";
  readonly location: string;
  readonly pricePerHour: number;
  readonly isFavorite?: boolean;
  readonly coordinates?: { lat: number; lng: number };
}

interface IFilterConfig {
  readonly type: string;
  readonly capacity: string;
  readonly price: readonly [number, number];
  readonly location: string;
  readonly availability: string;
}

type SortOption =
  | "recently-added"
  | "last-visited"
  | "most-used"
  | "highest-rated"
  | "name"
  | "price-low"
  | "price-high";

type ViewMode = "grid" | "list";

interface IUseUserFavoritesManagementReturn {
  // Data
  readonly favorites: readonly IFavoriteFacility[];
  readonly filteredAndSortedFavorites: readonly IFavoriteFacility[];
  readonly isLoading: boolean;

  // View State
  readonly viewMode: ViewMode;
  readonly searchTerm: string;
  readonly filterConfig: IFilterConfig;
  readonly sortBy: SortOption;
  readonly showFilters: boolean;
  readonly removingFacility: string | null;

  // Actions
  readonly setViewMode: (mode: ViewMode) => void;
  readonly setSearchTerm: (term: string) => void;
  readonly setFilterType: (type: string) => void;
  readonly setFilterCapacity: (capacity: string) => void;
  readonly setFilterPrice: (price: readonly [number, number]) => void;
  readonly setFilterLocation: (location: string) => void;
  readonly setFilterAvailability: (availability: string) => void;
  readonly setSortBy: (sort: SortOption) => void;
  readonly setShowFilters: (show: boolean) => void;
  readonly handleRemoveFavorite: (facilityId: string) => Promise<void>;
  readonly handleViewFacility: (facilityId: string) => void;
  readonly handleBookNow: (facilityId: string) => void;

  // Utility
  readonly formatDate: (dateString: string) => string;
}

// ============================================================================
// Pure Business Logic Functions
// ============================================================================

/**
 * Calculate real-time availability for a facility based on time and day
 * In production, this would be an API call
 */
const getRealTimeAvailability = (facilityId: string): "available" | "busy" | "full" => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Simulate availability based on time and day
  if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
    if (hour >= 8 && hour <= 22) {
      return Math.random() > 0.3 ? "available" : "busy";
    } else {
      return "full";
    }
  } else { // Weekday
    if (hour >= 6 && hour <= 23) {
      return Math.random() > 0.2 ? "available" : "busy";
    } else {
      return "full";
    }
  }
};

/**
 * Transform facilities data to favorite facilities format
 */
const transformToFavorites = (
  facilities: readonly any[],
  favoriteEntries: readonly any[]
): readonly IFavoriteFacility[] => {
  return facilities
    .filter(facility => favoriteEntries.some(fav => fav.facilityId === facility.id))
    .map(facility => {
      const favoriteEntry = favoriteEntries.find(fav => fav.facilityId === facility.id)!;
      return {
        id: facility.id,
        name: facility.name,
        type: facility.facility_type || '',
        address: facility.address || facility.area || '',
        capacity: facility.capacity || 0,
        price: `${(facility.price_per_hour_cents || 0) / 100} kr/time`,
        pricePerHour: (facility.price_per_hour_cents || 0) / 100,
        image: (facility.images as any)?.[0] || "/placeholder.svg",
        rating: facility.rating || 0,
        addedAt: favoriteEntry.addedAt,
        lastVisited: favoriteEntry.lastVisited,
        usageCount: favoriteEntry.usageCount,
        amenities: facility.amenities || [],
        description: facility.description || '',
        availability: getRealTimeAvailability(facility.id) as const,
        location: facility.area || facility.address || '',
        isFavorite: true,
        coordinates: facility.coordinates
      };
    });
};

/**
 * Filter favorites based on all filter criteria
 */
const filterFavorites = (
  favorites: readonly IFavoriteFacility[],
  searchTerm: string,
  filterConfig: IFilterConfig
): readonly IFavoriteFacility[] => {
  return favorites.filter(favorite => {
    const matchesSearch = favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterConfig.type === "all" || favorite.type === filterConfig.type;

    const matchesCapacity = filterConfig.capacity === "all" ||
      (filterConfig.capacity === "0-20" && favorite.capacity <= 20) ||
      (filterConfig.capacity === "20-100" && favorite.capacity > 20 && favorite.capacity <= 100) ||
      (filterConfig.capacity === "100+" && favorite.capacity > 100);

    const matchesPrice = favorite.pricePerHour >= filterConfig.price[0] &&
                        favorite.pricePerHour <= filterConfig.price[1];

    const matchesLocation = filterConfig.location === "all" ||
                           favorite.location === filterConfig.location;

    const matchesAvailability = filterConfig.availability === "all" ||
                               favorite.availability === filterConfig.availability;

    return matchesSearch && matchesType && matchesCapacity &&
           matchesPrice && matchesLocation && matchesAvailability;
  });
};

/**
 * Sort favorites based on selected sort option
 */
const sortFavorites = (
  favorites: readonly IFavoriteFacility[],
  sortBy: SortOption
): readonly IFavoriteFacility[] => {
  return [...favorites].sort((a, b) => {
    switch (sortBy) {
      case "recently-added":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case "last-visited":
        return new Date(b.lastVisited || b.addedAt).getTime() -
               new Date(a.lastVisited || a.addedAt).getTime();
      case "most-used":
        return (b.usageCount || 0) - (a.usageCount || 0);
      case "highest-rated":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return a.pricePerHour - b.pricePerHour;
      case "price-high":
        return b.pricePerHour - a.pricePerHour;
      default:
        return 0;
    }
  });
};

/**
 * Format date string to human-readable format
 */
const createDateFormatter = (t: any) => (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return t('pages.favorites.date_formats.yesterday');
  if (diffDays < 7) return t('pages.favorites.date_formats.days_ago', { count: diffDays });
  if (diffDays < 30) return t('pages.favorites.date_formats.weeks_ago', { count: Math.ceil(diffDays / 7) });

  return date.toLocaleDateString('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ============================================================================
// Storage Management
// ============================================================================

const VIEW_MODE_STORAGE_KEY = 'favorites-view-mode';

/**
 * Load view mode from localStorage
 */
const loadViewModeFromStorage = (): ViewMode => {
  try {
    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved === "grid" || saved === "list") {
      return saved;
    }
  } catch (error) {
    console.error('Error loading view mode:', error);
  }
  return "grid";
};

/**
 * Save view mode to localStorage
 */
const saveViewModeToStorage = (mode: ViewMode): void => {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch (error) {
    console.error('Error saving view mode:', error);
  }
};

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Hook for managing user favorites page state and business logic
 *
 * Provides comprehensive state management for:
 * - Favorites data loading and transformation
 * - Filtering (search, type, capacity, price, location, availability)
 * - Sorting (7 different sort options)
 * - View mode persistence
 * - Favorite actions (remove, view, book)
 */
export const useUserFavoritesManagement = (orgId: string): IUseUserFavoritesManagementReturn => {
  const { t } = useTranslation('user');

  // ============================================================================
  // State Management
  // ============================================================================

  const [viewMode, setViewModeState] = useState<ViewMode>("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCapacity, setFilterCapacity] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<readonly [number, number]>([0, 1000]);
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recently-added");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [removingFacility, setRemovingFacility] = useState<string | null>(null);

  // ============================================================================
  // Data Loading
  // ============================================================================

  const { data: facilities = [], isLoading: facilitiesLoading } = usePublishedFacilities(orgId);
  const { favorites: favoriteEntries, removeFavorite } = useFavoritesStore();

  // Load view mode from localStorage on mount
  useEffect(() => {
    const savedMode = loadViewModeFromStorage();
    setViewModeState(savedMode);
  }, []);

  // ============================================================================
  // Computed Values
  // ============================================================================

  // Transform facilities to favorites format
  const favorites = useMemo(
    () => transformToFavorites(facilities, favoriteEntries),
    [facilities, favoriteEntries]
  );

  // Create filter config object
  const filterConfig = useMemo<IFilterConfig>(
    () => ({
      type: filterType,
      capacity: filterCapacity,
      price: filterPrice,
      location: filterLocation,
      availability: filterAvailability
    }),
    [filterType, filterCapacity, filterPrice, filterLocation, filterAvailability]
  );

  // Apply filters and sorting
  const filteredAndSortedFavorites = useMemo(() => {
    const filtered = filterFavorites(favorites, searchTerm, filterConfig);
    return sortFavorites(filtered, sortBy);
  }, [favorites, searchTerm, filterConfig, sortBy]);

  // ============================================================================
  // Action Handlers
  // ============================================================================

  /**
   * Set view mode and persist to storage
   */
  const setViewMode = useCallback((mode: ViewMode): void => {
    setViewModeState(mode);
    saveViewModeToStorage(mode);
  }, []);

  /**
   * Remove a facility from favorites
   */
  const handleRemoveFavorite = useCallback(async (facilityId: string): Promise<void> => {
    setRemovingFacility(facilityId);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    removeFavorite(facilityId);
    setRemovingFacility(null);
  }, [removeFavorite]);

  /**
   * Handle viewing facility details
   * Tracks usage and updates last visited timestamp
   */
  const handleViewFacility = useCallback((facilityId: string): void => {
    const { incrementUsage, updateLastVisited } = useFavoritesStore.getState();
    incrementUsage(facilityId);
    updateLastVisited(facilityId);
    window.location.href = `/facilities/${facilityId}`;
  }, []);

  /**
   * Handle booking a facility
   * Tracks usage and updates last visited timestamp
   */
  const handleBookNow = useCallback((facilityId: string): void => {
    const { incrementUsage, updateLastVisited } = useFavoritesStore.getState();
    incrementUsage(facilityId);
    updateLastVisited(facilityId);
    window.location.href = `/facilities/${facilityId}/book`;
  }, []);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const formatDate = useMemo(() => createDateFormatter(t), [t]);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    // Data
    favorites,
    filteredAndSortedFavorites,
    isLoading: facilitiesLoading,

    // View State
    viewMode,
    searchTerm,
    filterConfig,
    sortBy,
    showFilters,
    removingFacility,

    // Actions
    setViewMode,
    setSearchTerm,
    setFilterType,
    setFilterCapacity,
    setFilterPrice,
    setFilterLocation,
    setFilterAvailability,
    setSortBy,
    setShowFilters,
    handleRemoveFavorite,
    handleViewFacility,
    handleBookNow,

    // Utility
    formatDate
  };
};
