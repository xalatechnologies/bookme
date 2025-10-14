"use client";

import React from "react";

import { FacilityFilters } from "@/types/facility";

import { InfiniteScrollFacilities } from "./InfiniteScrollFacilities";

interface FacilityListProps {
  readonly filters: FacilityFilters;
  readonly viewMode: "grid" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const FacilityList: React.FC<FacilityListProps> = ({
  filters,
  viewMode,
  setViewMode
}): JSX.Element => {
  return (
    <InfiniteScrollFacilities 
      filters={filters} 
      viewMode={viewMode}
      setViewMode={setViewMode}
    />
  );
};

