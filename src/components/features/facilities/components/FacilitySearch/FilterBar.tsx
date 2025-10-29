"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ViewToggleUser from "@/components/features/facilities/components/FacilitySearch/ViewToggle";

interface IFilterBarUserProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly selectedType: string;
  readonly onTypeChange: (type: string) => void;
  readonly sortBy: "price" | "popularity" | "name";
  readonly sortOrder: "asc" | "desc";
  readonly onSortChange: (sortBy: "price" | "popularity" | "name", order: "asc" | "desc") => void;
  readonly showAvailableOnly: boolean;
  readonly onAvailableToggle: (show: boolean) => void;
  readonly viewMode: "grid" | "list" | "map";
  readonly onViewChange: (view: "grid" | "list" | "map") => void;
}

const FilterBarUser = (props: IFilterBarUserProps): JSX.Element => {
  const { t } = useTranslation(['facility']);
  const {
    searchQuery,
    onSearchChange,
    selectedType,
    onTypeChange,
    sortBy,
    sortOrder,
    onSortChange,
    showAvailableOnly,
    onAvailableToggle,
    viewMode,
    onViewChange
  } = props;

  const [showFilters, setShowFilters] = useState<boolean>(false);

  const facilityTypes = [
    { value: "all", label: t('facility:facility_types.all_types') },
    { value: "sports_hall", label: t('facility:facility_types.sports_hall') },
    { value: "cultural_center", label: t('facility:facility_types.cultural_center') },
    { value: "meeting_room", label: t('facility:facility_types.meeting_room') },
    { value: "fitness_center", label: t('facility:facility_types.fitness_center') },
    { value: "outdoor", label: t('facility:facility_types.outdoor') }
  ];

  const handleSortClick = (newSortBy: "price" | "popularity" | "name"): void => {
    if (sortBy === newSortBy) {
      onSortChange(newSortBy, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(newSortBy, "asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t('facility:search.placeholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('facility:search.filter')}
            {(selectedType !== "all" || showAvailableOnly) && (
              <Badge variant="secondary" className="ml-1">
                {(selectedType !== "all" ? 1 : 0) + (showAvailableOnly ? 1 : 0)}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleSortClick("name")}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${sortBy === "name" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              {t('facility:search.sort_name')}
              {sortBy === "name" && (
                sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
            <Button
              onClick={() => handleSortClick("price")}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${sortBy === "price" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              {t('facility:search.sort_price')}
              {sortBy === "price" && (
                sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
            <Button
              onClick={() => handleSortClick("popularity")}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${sortBy === "popularity" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
            >
              {t('facility:search.sort_popularity')}
              {sortBy === "popularity" && (
                sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </Button>
            
            {/* View Toggle */}
            <ViewToggleUser
              currentView={viewMode}
              onViewChange={onViewChange}
            />
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('facility:search.type_label')}</h4>
                <div className="flex flex-wrap gap-2">
                  {facilityTypes.map(type => (
                    <Button
                      key={type.value}
                      onClick={() => onTypeChange(type.value)}
                      variant={selectedType === type.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs"
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('facility:search.availability_label')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onAvailableToggle(!showAvailableOnly)}
                    variant={showAvailableOnly ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                  >
                    {t('facility:search.available_now')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FilterBarUser;