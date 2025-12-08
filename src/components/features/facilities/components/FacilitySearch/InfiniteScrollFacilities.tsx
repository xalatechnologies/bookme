"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { FacilityFilters } from "@/types/facility";
import { Database } from "@/types/database";

import { FacilityCard } from "../FacilityCard";
import { FacilityListItem } from "../FacilityCard/FacilityListItem";
import { ViewHeader } from "@/components/features/search/components/ViewHeader";

type Facility = Database['public']['Tables']['facilities']['Row'];

interface InfiniteScrollFacilitiesProps {
  readonly filters: FacilityFilters;
  readonly viewMode: "grid" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
  readonly facilities: Facility[];
  readonly isLoading: boolean;
}

export const InfiniteScrollFacilities: React.FC<InfiniteScrollFacilitiesProps> = ({
  filters,
  viewMode,
  setViewMode,
  facilities,
  isLoading
}): JSX.Element => {
  const { t } = useTranslation('common');

  // Facilities are now passed in as props, already filtered by the parent hook
  const filteredFacilities = facilities;

  const handleAddressClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      {/* ViewHeader component */}
      <ViewHeader
        facilityCount={filteredFacilities.length}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Facilities Grid/List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">
            {t('facilities.loading')}
          </div>
        </div>
      ) : filteredFacilities.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">
            {t('facilities.noFacilitiesFound')}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('facilities.adjustCriteria')}
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
