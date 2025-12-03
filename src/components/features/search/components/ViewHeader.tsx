"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { ViewModeToggle } from "./ViewModeToggle";

interface ViewHeaderProps {
  readonly facilityCount: number;
  readonly isLoading: boolean;
  readonly viewMode: "grid" | "map" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  facilityCount,
  isLoading,
  viewMode,
  setViewMode
}): JSX.Element => {
  const { t } = useTranslation('common');
  
  const getViewLabel = (): string => {
    switch (viewMode) {
      case "grid":
        return t('viewModes.grid');
      case "list":
        return t('viewModes.list');
      case "map":
        return t('viewModes.map');
      default:
        return t('viewModes.grid');
    }
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            {isLoading ? "..." : facilityCount}
          </span>
          <span className="text-lg sm:text-xl font-semibold text-gray-700">{t('facilities.count')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm sm:text-base md:text-lg px-3 sm:px-4 md:px-6 py-2 sm:py-3 font-medium text-gray-600 bg-gray-100 rounded-full">
            {isLoading ? t('facilities.loading') : getViewLabel()}
          </div>
        </div>
      </div>
      
      {/* View mode toggle aligned with the results label */}
      <div className="flex-shrink-0 w-full sm:w-auto">
        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>
    </div>
  );
};

