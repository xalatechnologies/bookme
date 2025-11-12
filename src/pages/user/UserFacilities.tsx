"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import FacilityCardUser from "@/components/features/facilities/components/FacilityCard/FacilityCardUser";
import FacilityListItemUser from "@/components/features/facilities/components/FacilityCard/FacilityListItemUser";
import FilterBarUser from "@/components/features/facilities/components/FacilitySearch/FilterBar";
import { MapView } from "@/components/features/facilities/components/FacilityMap/MapView";
import { useTranslation } from "react-i18next";
import { useUserFacilitiesManagement } from "@/hooks/features/facilities/useUserFacilitiesManagement";
import type { IUserFacility } from "@/hooks/features/facilities/useUserFacilitiesManagement";

/**
 * User Facilities Page Component
 *
 * Displays published facilities for end users with:
 * - Grid, list, and map view modes
 * - Search and filtering capabilities
 * - Real-time availability indicators
 * - Sorting options
 * - Favorites integration
 *
 * Clean Architecture: Pure presentation component, all logic in hook
 */
const UserFacilities = (): JSX.Element => {
  const { t } = useTranslation(['user', 'common']);

  // Get all data and actions from the hook
  const {
    filteredFacilities,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    sortBy,
    sortOrder,
    handleSortChange,
    showAvailableOnly,
    setShowAvailableOnly,
    viewMode,
    setViewMode,
    resetFilters,
    resultsCount,
  } = useUserFacilitiesManagement();

  /**
   * Render grid view of facilities
   */
  const renderGridView = (): JSX.Element => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFacilities.map((facility: IUserFacility) => (
        <FacilityCardUser
          key={facility.id}
          id={facility.id}
          name={facility.name}
          address={facility.address}
          type={facility.type}
          capacity={facility.capacity}
          amenities={facility.amenities}
          image={facility.image}
          rating={facility.rating}
          price={facility.price}
          description={facility.description}
          availability={facility.availability}
          isFavorite={facility.isFavorite}
        />
      ))}
    </div>
  );

  /**
   * Render list view of facilities
   */
  const renderListView = (): JSX.Element => (
    <div className="space-y-4">
      {filteredFacilities.map((facility: IUserFacility) => (
        <FacilityListItemUser
          key={facility.id}
          id={facility.id}
          name={facility.name}
          address={facility.address}
          type={facility.type}
          capacity={facility.capacity}
          amenities={facility.amenities}
          image={facility.image}
          rating={facility.rating}
          price={facility.price}
          description={facility.description}
          availability={facility.availability}
          isFavorite={facility.isFavorite}
          coordinates={facility.coordinates}
        />
      ))}
    </div>
  );

  /**
   * Render map view of facilities
   */
  const renderMapView = (): JSX.Element => (
    <MapView
      facilityType={selectedType}
      location="all"
      viewMode={viewMode}
      setViewMode={setViewMode}
      showAllFacilities={false}
      showHeader={false}
    />
  );

  /**
   * Render empty state when no facilities match filters
   */
  const renderEmptyState = (): JSX.Element => (
    <Card>
      <CardContent className="p-8 text-center">
        <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('pages.facilities.empty.title')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {searchQuery || selectedType !== "all" || showAvailableOnly
            ? t('pages.facilities.empty.no_results')
            : t('pages.facilities.empty.no_facilities')
          }
        </p>
        {(searchQuery || selectedType !== "all" || showAvailableOnly) && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
            >
              {t('pages.facilities.empty.reset_filters')}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('pages.facilities.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('pages.facilities.subtitle')}
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('common:loading' as string)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('pages.facilities.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('pages.facilities.subtitle')}
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBarUser
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        showAvailableOnly={showAvailableOnly}
        onAvailableToggle={setShowAvailableOnly}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Results Count & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('pages.facilities.results_count', { count: resultsCount })}
          </span>
          {showAvailableOnly && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              {t('pages.facilities.available_only')}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      {resultsCount > 0 ? (
        <>
          {viewMode === "grid" && renderGridView()}
          {viewMode === "list" && renderListView()}
          {viewMode === "map" && renderMapView()}
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default UserFacilities;
