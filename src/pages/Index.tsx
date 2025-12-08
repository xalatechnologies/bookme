"use client";

import React from "react";

import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import SearchFilter from "@/components/features/search/components/SearchFilter";
import { FacilityList } from "@/components/features/facilities/components/FacilitySearch/FacilityList";
import { MapView } from "@/components/features/facilities/components/FacilityMap/MapView";
import { useFacilitySearchLogic } from "@/hooks/features/search/useFacilitySearchLogic";

export const Index = (): JSX.Element => {
  // Use the hook to manage all page logic including data fetching
  const {
    // State
    date,
    setDate,
    facilityType,
    setFacilityType,
    selectedLocation,
    setSelectedLocation,
    viewMode,
    setViewMode,
    accessibility,
    setAccessibility,
    capacity,
    setCapacity,
    searchTerm,
    setSearchTerm,
    priceRange,
    setPriceRange,
    availableNow,
    setAvailableNow,
    hasEquipment,
    setHasEquipment,
    hasParking,
    setHasParking,
    hasWifi,
    setHasWifi,
    allowsPhotography,
    setAllowsPhotography,

    // Computed
    filters,
    facilities,
    isLoading
  } = useFacilitySearchLogic();

  const renderContent = () => {
    switch (viewMode) {
      case "map":
        return <MapView facilityType={facilityType} location={selectedLocation} viewMode={viewMode} setViewMode={setViewMode} filters={filters} />;
      case "list":
      case "grid":
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList
              filters={filters}
              viewMode={viewMode}
              setViewMode={setViewMode}
              facilities={facilities}
              isLoading={isLoading}
            />
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList
              filters={filters}
              viewMode="grid"
              setViewMode={setViewMode}
              facilities={facilities}
              isLoading={isLoading}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col w-full">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500" tabIndex={0}>
        Hopp til hovedinnhold
      </a>

      {/* Sticky Header and Search Filter combined */}
      <div className="sticky top-0 z-50 w-full">
        <GlobalHeader />
        <SearchFilter
          date={date}
          setDate={setDate}
          facilityType={facilityType}
          setFacilityType={setFacilityType}
          location={selectedLocation}
          setLocation={setSelectedLocation}
          viewMode={viewMode}
          setViewMode={setViewMode}
          accessibility={accessibility}
          setAccessibility={setAccessibility}
          capacity={capacity}
          setCapacity={setCapacity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          availableNow={availableNow}
          setAvailableNow={setAvailableNow}
          hasEquipment={hasEquipment}
          setHasEquipment={setHasEquipment}
          hasParking={hasParking}
          setHasParking={setHasParking}
          hasWifi={hasWifi}
          setHasWifi={setHasWifi}
          allowsPhotography={allowsPhotography}
          setAllowsPhotography={setAllowsPhotography}
        />
      </div>

      {/* Main content */}
      <main id="main-content" className="flex-1 w-full">
        {/* Scrollable Content Area */}
        <div className="pt-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
