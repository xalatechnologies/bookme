"use client";

import React, { useState, useEffect } from "react";

import { FacilityFilters } from "@/types/facility";
import { useFacilityStore } from "@/stores/facilityStore";

import { FacilityCard } from "./facility/FacilityCard";
import { FacilityListItem } from "./facility/FacilityListItem";
import { ViewHeader } from "./search/ViewHeader";

interface InfiniteScrollFacilitiesProps {
  readonly filters: FacilityFilters;
  readonly viewMode: "grid" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const InfiniteScrollFacilities: React.FC<InfiniteScrollFacilitiesProps> = ({
  filters,
  viewMode,
  setViewMode
}): JSX.Element => {
  const { getPublishedFacilities } = useFacilityStore();
  const [filteredFacilities, setFilteredFacilities] = useState(() => getPublishedFacilities());

  // Apply filters
  useEffect(() => {
    const facilities = getPublishedFacilities();
    let filtered = [...facilities];

    if (filters.searchTerm) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        facility.description.toLowerCase().includes(filters.searchTerm!.toLowerCase())
      );
    }

    if (filters.facilityType && filters.facilityType !== 'all') {
      filtered = filtered.filter(facility =>
        facility.type.toLowerCase() === filters.facilityType!.toLowerCase()
      );
    }

    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(facility =>
        facility.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.capacity && (filters.capacity[0] > 0 || filters.capacity[1] < 200)) {
      filtered = filtered.filter(facility =>
        facility.capacity >= filters.capacity![0] && facility.capacity <= filters.capacity![1]
      );
    }

    setFilteredFacilities(filtered);
  }, [filters, getPublishedFacilities]);

  const handleAddressClick = (e: React.MouseEvent, facility: { readonly address: string }): void => {
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      {/* ViewHeader component */}
      <ViewHeader 
        facilityCount={filteredFacilities.length}
        isLoading={false}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Facilities Grid/List */}
      {filteredFacilities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            Ingen fasiliteter funnet
          </div>
          <p className="text-sm text-muted-foreground">
            Prøv å justere søkekriteriene dine
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFacilities.map((facility) => (
            <FacilityCard
              key={facility.id}
              facility={facility}
              onAddressClick={handleAddressClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFacilities.map((facility) => (
            <FacilityListItem
              key={facility.id}
              facility={facility}
              onAddressClick={handleAddressClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
