"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { FacilityFilters } from "@/types/facility";

import { GlobalHeader } from "@/components/GlobalHeader";
import SearchFilter from "@/components/SearchFilter";
import { FacilityList } from "@/components/FacilityList";
import { MapView } from "@/components/MapView";

export const Index = (): JSX.Element => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState<Date>();
  const [facilityType, setFacilityType] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [accessibility, setAccessibility] = useState<string>("all");
  const [capacity, setCapacity] = useState<number[]>([0, 200]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Advanced filter states
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [hasEquipment, setHasEquipment] = useState<boolean>(false);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [hasWifi, setHasWifi] = useState<boolean>(false);
  const [allowsPhotography, setAllowsPhotography] = useState<boolean>(false);

  // Initialize state from URL parameters
  useEffect(() => {
    const urlFacilityType = searchParams.get('facilityType');
    const urlLocation = searchParams.get('location');
    const urlAccessibility = searchParams.get('accessibility');
    const urlCapacity = searchParams.get('capacity');
    const urlViewMode = searchParams.get('viewMode');
    const urlSearchTerm = searchParams.get('searchTerm');
    if (urlFacilityType) setFacilityType(urlFacilityType);
    if (urlLocation) setLocation(urlLocation);
    if (urlAccessibility) setAccessibility(urlAccessibility);
    if (urlCapacity) {
      const capacityArray = urlCapacity.split(',').map(Number);
      if (capacityArray.length === 2) setCapacity(capacityArray);
    }
    if (urlViewMode && ['grid', 'map', 'list'].includes(urlViewMode)) {
      setViewMode(urlViewMode as "grid" | "map" | "list");
    }
    if (urlSearchTerm) setSearchTerm(urlSearchTerm);

    // Clear URL parameters after setting state
    if (searchParams.toString()) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Create amenities array from individual boolean states
  const amenities = [...(hasEquipment ? ['av-equipment'] : []), ...(hasParking ? ['parking'] : []), ...(hasWifi ? ['wifi'] : []), ...(allowsPhotography ? ['photography'] : [])];

  // Create filters object with proper handling
  const filters: FacilityFilters = {
    ...(searchTerm && searchTerm.trim() !== "" ? {
      searchTerm: searchTerm.trim()
    } : {}),
    ...(facilityType && facilityType !== "all" ? {
      facilityType
    } : {}),
    ...(location && location !== "all" ? {
      location
    } : {}),
    ...(accessibility && accessibility !== "all" ? {
      accessibility
    } : {}),
    ...(capacity && (capacity[0] > 0 || capacity[1] < 200) ? {
      capacity
    } : {}),
    ...(date ? {
      date
    } : {}),
    ...(priceRange && (priceRange[0] > 0 || priceRange[1] < 5000) ? {
      priceRange: {
        min: priceRange[0],
        max: priceRange[1]
      }
    } : {}),
    ...(availableNow ? {
      availableNow
    } : {}),
    ...(amenities.length > 0 ? {
      amenities
    } : {})
  };
  
  const renderContent = () => {
    switch (viewMode) {
      case "map":
        return <MapView facilityType={facilityType} location={location} viewMode={viewMode} setViewMode={setViewMode} />;
      case "list":
      case "grid":
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList filters={filters} viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList filters={filters} viewMode="grid" setViewMode={setViewMode} />
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
          location={location} 
          setLocation={setLocation} 
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
