"use client";

import React from "react";

import { FacilityFilters } from "@/types/facility";

import { InfiniteScrollFacilities } from "./InfiniteScrollFacilities";

import { Database } from "@/types/database";

type Facility = Database['public']['Tables']['facilities']['Row'];

interface FacilityListProps {
  readonly filters: FacilityFilters;
  readonly viewMode: "grid" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
  readonly facilities: Facility[];
  readonly isLoading: boolean;
}

export const FacilityList: React.FC<FacilityListProps> = ({
  filters,
  viewMode,
  setViewMode,
  facilities,
  isLoading
}): JSX.Element => {
  return (
    <InfiniteScrollFacilities
      filters={filters}
      viewMode={viewMode}
      setViewMode={setViewMode}
      facilities={facilities}
      isLoading={isLoading}
    />
  );
};

