"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Grid3X3,
  List,
  Search,
  ChevronDown,
  SlidersHorizontal,
  BookOpen,
  ArrowRight
} from "lucide-react";
import FacilityCardUser from "@/components/features/facilities/components/FacilityCard/FacilityCardUser";
import FacilityListItemUser from "@/components/features/facilities/components/FacilityCard/FacilityListItemUser";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useUserFavoritesManagement } from "@/hooks/features/favorites";
import { useTranslation } from "react-i18next";

// ============================================================================
// Filter Configuration
// ============================================================================

const UserFavorites = (): JSX.Element => {
  const { t } = useTranslation('user');
  const orgId = useOrganizationId();

  // Use the management hook for all business logic
  const {
    filteredAndSortedFavorites,
    viewMode,
    searchTerm,
    filterConfig,
    sortBy,
    showFilters,
    removingFacility,
    setViewMode,
    setSearchTerm,
    setFilterType,
    setFilterCapacity,
    setFilterPrice,
    setFilterLocation,
    setFilterAvailability,
    setSortBy,
    setShowFilters,
    formatDate
  } = useUserFavoritesManagement(orgId);

  // ============================================================================
  // Filter Options Configuration
  // ============================================================================

  const typeFilters = [
    { value: "all", label: t('pages.favorites.filters.all_types'), color: "gray" },
    { value: "Idrettshall", label: "Idrettshall", color: "blue" },
    { value: "Kulturhus", label: "Kulturhus", color: "purple" },
    { value: "Møterom", label: "Møterom", color: "green" },
    { value: "Fotballbane", label: "Fotballbane", color: "green" },
    { value: "Svømmehall", label: "Svømmehall", color: "blue" },
    { value: "Tennisbane", label: "Tennisbane", color: "orange" }
  ];

  const capacityFilters = [
    { value: "all", label: t('pages.favorites.filters.all_sizes') },
    { value: "0-20", label: t('pages.favorites.filters.capacity_ranges.small') },
    { value: "20-100", label: t('pages.favorites.filters.capacity_ranges.medium') },
    { value: "100+", label: t('pages.favorites.filters.capacity_ranges.large') }
  ];

  const locationFilters = [
    { value: "all", label: t('pages.favorites.filters.all_locations') },
    { value: "Drammen Sentrum", label: "Drammen Sentrum" },
    { value: "Strømsø", label: "Strømsø" },
    { value: "Bragernes", label: "Bragernes" },
    { value: "Spiralen", label: "Spiralen" },
    { value: "Konnerud", label: "Konnerud" },
    { value: "Solbergelva", label: "Solbergelva" },
    { value: "Åssiden", label: "Åssiden" }
  ];

  const availabilityFilters = [
    { value: "all", label: t('pages.favorites.filters.all_availability') },
    { value: "available", label: t('pages.favorites.filters.available_today') },
    { value: "busy", label: t('pages.favorites.filters.partially_busy') },
    { value: "full", label: t('pages.favorites.filters.fully_booked') }
  ];

  const sortOptions = [
    { value: "recently-added", label: t('pages.favorites.sort_options.recently_added') },
    { value: "last-visited", label: t('pages.favorites.sort_options.last_visited') },
    { value: "most-used", label: t('pages.favorites.sort_options.most_used') },
    { value: "highest-rated", label: t('pages.favorites.sort_options.highest_rated') },
    { value: "name", label: t('pages.favorites.sort_options.name') },
    { value: "price-low", label: t('pages.favorites.sort_options.price_low') },
    { value: "price-high", label: t('pages.favorites.sort_options.price_high') }
  ];

  // ============================================================================
  // Render Functions
  // ============================================================================

  const renderGridView = (): JSX.Element => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedFavorites.map((facility) => (
        <div
          key={facility.id}
          className={`transition-all duration-300 ease-in-out ${
            removingFacility === facility.id ? 'opacity-50 scale-95' : ''
          }`}
        >
          <FacilityCardUser
            id={facility.id}
            name={facility.name}
            address={facility.address}
            type={facility.type}
            capacity={facility.capacity}
            image={facility.image}
            description={facility.description}
            availability={facility.availability}
          />
        </div>
      ))}
    </div>
  );

  const renderListView = (): JSX.Element => (
    <div className="space-y-4">
      {filteredAndSortedFavorites.map((facility) => (
        <div
          key={facility.id}
          className={`transition-all duration-300 ease-in-out ${
            removingFacility === facility.id ? 'opacity-50' : ''
          }`}
        >
          <FacilityListItemUser
            id={facility.id}
            name={facility.name}
            address={facility.address}
            type={facility.type}
            capacity={facility.capacity}
            image={facility.image}
            description={facility.description}
            lat={facility.coordinates?.lat}
            lng={facility.coordinates?.lng}
          />
        </div>
      ))}
    </div>
  );

  const hasActiveFilters = searchTerm !== "" ||
                          filterConfig.type !== "all" ||
                          filterConfig.capacity !== "all" ||
                          filterConfig.location !== "all" ||
                          filterConfig.availability !== "all";

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('pages.favorites.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pages.favorites.subtitle')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {t('pages.favorites.saved_count', { count: filteredAndSortedFavorites.length })}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('pages.favorites.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('pages.favorites.sort_by')}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recently-added" | "last-visited" | "most-used" | "highest-rated" | "name" | "price-low" | "price-high")}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t('pages.favorites.filter')}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pages.favorites.filters.type')}
                  </h4>
                  <select
                    value={filterConfig.type}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {typeFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pages.favorites.filters.capacity')}
                  </h4>
                  <select
                    value={filterConfig.capacity}
                    onChange={(e) => setFilterCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {capacityFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pages.favorites.filters.location')}
                  </h4>
                  <select
                    value={filterConfig.location}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {locationFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('pages.favorites.filters.availability')}
                  </h4>
                  <select
                    value={filterConfig.availability}
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {availabilityFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('pages.favorites.filters.price_range', {
                    min: filterConfig.price[0],
                    max: filterConfig.price[1]
                  })}
                </h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filterConfig.price[0]}
                    onChange={(e) => setFilterPrice([parseInt(e.target.value), filterConfig.price[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filterConfig.price[1]}
                    onChange={(e) => setFilterPrice([filterConfig.price[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorites List */}
      {filteredAndSortedFavorites.length > 0 ? (
        viewMode === "grid" ? renderGridView() : renderListView()
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('pages.favorites.empty.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {hasActiveFilters
                ? t('pages.favorites.empty.no_results')
                : t('pages.favorites.empty.no_favorites')
              }
            </p>
            {!hasActiveFilters && (
              <Button onClick={() => window.location.href = '/facilities'}>
                <BookOpen className="h-4 w-4 mr-2" />
                {t('pages.favorites.empty.explore_facilities')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserFavorites;
