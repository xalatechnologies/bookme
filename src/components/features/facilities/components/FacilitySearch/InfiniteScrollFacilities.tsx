"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { FacilityFilters } from "@/types/facility";
import { usePublishedFacilities } from "@/services/supabase/facilities.service";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import type { Database } from "@/types/database";

import { FacilityCard } from "../FacilityCard";
import { FacilityListItem } from "../FacilityCard/FacilityListItem";
import { ViewHeader } from "@/components/features/search/components/ViewHeader";

type Facility = Database['public']['Tables']['facilities']['Row'];

interface InfiniteScrollFacilitiesProps {
  readonly filters: FacilityFilters;
  readonly viewMode: "grid" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
}

export const InfiniteScrollFacilities: React.FC<InfiniteScrollFacilitiesProps> = ({
  filters,
  viewMode,
  setViewMode
}): JSX.Element => {
  const { t } = useTranslation('common');
  const orgId = useOrganizationId();
  const { data: facilities = [], isLoading } = usePublishedFacilities(orgId);

  // Apply filters using useMemo for performance
  const filteredFacilities = useMemo(() => {
    let filtered = [...facilities];

    if (filters.searchTerm) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
        (facility.description && facility.description.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
      );
    }

    if (filters.facilityType && filters.facilityType !== 'all') {
      filtered = filtered.filter(facility =>
        facility.facility_type?.toLowerCase() === filters.facilityType!.toLowerCase()
      );
    }

    if (filters.location && filters.location !== 'all') {
      filtered = filtered.filter(facility =>
        (facility.address && facility.address.toLowerCase().includes(filters.location!.toLowerCase())) ||
        (facility.area && facility.area.toLowerCase().includes(filters.location!.toLowerCase()))
      );
    }

    if (filters.capacity && (filters.capacity[0] > 0 || filters.capacity[1] < 200)) {
      filtered = filtered.filter(facility =>
        facility.capacity && facility.capacity >= filters.capacity![0] && facility.capacity <= filters.capacity![1]
      );
    }

    return filtered;
  }, [facilities, filters]);

  const handleAddressClick = (e: React.MouseEvent, facility: { readonly address: string }): void => {
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
              facility={facility as any}
              onAddressClick={handleAddressClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFacilities.map((facility) => (
            <FacilityListItem
              key={facility.id}
              facility={facility as any}
              onAddressClick={handleAddressClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
