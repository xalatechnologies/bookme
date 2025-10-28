import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Users, Building, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useLocalizedDbValues } from "@/hooks/useLocalizedDbValues";

interface SearchFilterProps {
  readonly date?: Date;
  readonly setDate: (date?: Date) => void;
  readonly facilityType: string;
  readonly setFacilityType: (type: string) => void;
  readonly location: string;
  readonly setLocation: (location: string) => void;
  readonly viewMode: "grid" | "map" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "list") => void;
  readonly accessibility: string;
  readonly setAccessibility: (accessibility: string) => void;
  readonly capacity: readonly number[];
  readonly setCapacity: (capacity: number[]) => void;
  readonly searchTerm: string;
  readonly setSearchTerm: (term: string) => void;
  readonly priceRange: readonly number[];
  readonly setPriceRange: (range: number[]) => void;
  readonly availableNow: boolean;
  readonly setAvailableNow: (available: boolean) => void;
  readonly hasEquipment: boolean;
  readonly setHasEquipment: (hasEquipment: boolean) => void;
  readonly hasParking: boolean;
  readonly setHasParking: (hasParking: boolean) => void;
  readonly hasWifi: boolean;
  readonly setHasWifi: (hasWifi: boolean) => void;
  readonly allowsPhotography: boolean;
  readonly setAllowsPhotography: (allowsPhotography: boolean) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  facilityType,
  setFacilityType,
  location,
  setLocation,
  accessibility,
  setAccessibility,
  capacity,
  setCapacity
}) => {
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch localized values from database
  const { data: facilityTypes, isLoading: loadingTypes } = useLocalizedDbValues('facility_type');
  const { data: locations, isLoading: loadingLocations } = useLocalizedDbValues('location');
  const { data: accessibilityFeatures, isLoading: loadingAccessibility } = useLocalizedDbValues('accessibility');
  const { data: capacityRanges } = useLocalizedDbValues('capacity_range');

  const loading = loadingTypes || loadingLocations || loadingAccessibility;

  // Map database values to arrays for backward compatibility
  const availableTypes = useMemo(() => 
    facilityTypes?.map(item => item.entity_key) || [], 
    [facilityTypes]
  );
  const availableAreas = useMemo(() => 
    locations?.map(item => item.entity_key) || [], 
    [locations]
  );
  const availableAccessibility = useMemo(() => 
    accessibilityFeatures?.map(item => item.entity_key) || [], 
    [accessibilityFeatures]
  );

  // Helper to find label by entity_key
  const getLabel = (items: ReturnType<typeof useLocalizedDbValues>['data'], key: string): string => {
    return items?.find(item => item.entity_key === key)?.label || key;
  };

  const handleCapacityChange = (value: string) => {
    switch (value) {
      case "small":
        setCapacity([0, 20]);
        break;
      case "medium":
        setCapacity([21, 50]);
        break;
      case "large":
        setCapacity([51, 100]);
        break;
      case "extra-large":
        setCapacity([101, 200]);
        break;
      default:
        setCapacity([0, 200]);
    }
  };

  const getCapacityValue = () => {
    const [min, max] = capacity;
    if (min === 0 && max === 20) return "small";
    if (min === 21 && max === 50) return "medium";
    if (min === 51 && max === 100) return "large";
    if (min === 101 && max === 200) return "extra-large";
    return "all";
  };

  return (
    <div className="bg-gradient-to-r from-slate-600/90 to-slate-700/90 backdrop-blur-sm w-full shadow-lg border-b border-slate-500/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden py-3">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-10 bg-white/95 hover:bg-white text-gray-700 border-gray-300 justify-between"
          >
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">{t('searchFilters.filter')}</span>
            </div>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Filter Content - Collapsible on mobile */}
        <div className={`${isExpanded ? 'block' : 'hidden'} md:block py-3`}>
          <div className="flex flex-col md:flex-row gap-3 items-stretch w-full">
            {/* Facility type */}
            <div className="flex-1">
              <Select value={facilityType} onValueChange={setFacilityType} disabled={loading}>
                <SelectTrigger className="h-10 md:h-12 w-full border-gray-300 hover:border-blue-500 text-sm md:text-base rounded-lg bg-white/95 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center text-left">
                    <Building className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue placeholder={t('searchFilters.facilityTypes.all')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">{t('searchFilters.facilityTypes.all')}</SelectItem>
                  {facilityTypes?.map((type) => (
                    <SelectItem key={type.entity_key} value={type.entity_key} className="text-sm md:text-base">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="flex-1">
              <Select value={location} onValueChange={setLocation} disabled={loading}>
                <SelectTrigger className="h-10 md:h-12 w-full border-gray-300 hover:border-blue-500 text-sm md:text-base rounded-lg bg-white/95 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center text-left">
                    <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue placeholder={t('searchFilters.locations.all')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">{t('searchFilters.locations.all')}</SelectItem>
                  {locations?.map((location) => (
                    <SelectItem key={location.entity_key} value={location.entity_key} className="text-sm md:text-base">
                      {location.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="flex-1">
              <Select value={getCapacityValue()} onValueChange={handleCapacityChange}>
                <SelectTrigger className="h-10 md:h-12 w-full border-gray-300 hover:border-blue-500 text-sm md:text-base rounded-lg bg-white/95 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center text-left">
                    <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue placeholder={t('searchFilters.capacity.all')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">{t('searchFilters.capacity.all')}</SelectItem>
                  {capacityRanges?.map((range) => (
                    <SelectItem key={range.entity_key} value={range.entity_key} className="text-sm md:text-base">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Accessibility */}
            <div className="flex-1">
              <Select value={accessibility} onValueChange={setAccessibility} disabled={loading}>
                <SelectTrigger className="h-10 md:h-12 w-full border-gray-300 hover:border-blue-500 text-sm md:text-base rounded-lg bg-white/95 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center text-left">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4 flex-shrink-0">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <SelectValue placeholder={t('searchFilters.accessibility.all')} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">{t('searchFilters.accessibility.all')}</SelectItem>
                  {accessibilityFeatures?.map((feature) => (
                    <SelectItem key={feature.entity_key} value={feature.entity_key} className="text-sm md:text-base">
                      {feature.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
