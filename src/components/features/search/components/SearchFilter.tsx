import React, { useEffect, useState } from "react";
import { MapPin, Users, Building, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableAccessibility, setAvailableAccessibility] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data for now - will be replaced with real data later
  useEffect(() => {
    setAvailableTypes(['Idrettshall', 'Kulturhus', 'Møterom', 'Fotballbane', 'Svømmehall', 'Tennisbane']);
    setAvailableAreas(['Drammen Sentrum', 'Strømsø', 'Bragernes', 'Spiralen', 'Konnerud', 'Åssiden']);
    setAvailableAccessibility(['wheelchair', 'hearing-loop', 'visual-aids']);
    setLoading(false);
  }, []);

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
              <span className="text-sm font-medium">Filtrer</span>
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
                    <SelectValue placeholder="Alle typer" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">Alle typer</SelectItem>
                  {availableTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-sm md:text-base">{type}</SelectItem>
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
                    <SelectValue placeholder="Alle områder" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">Alle områder</SelectItem>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area} className="text-sm md:text-base">{area}</SelectItem>
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
                    <SelectValue placeholder="Alle størrelser" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">Alle størrelser</SelectItem>
                  <SelectItem value="small" className="text-sm md:text-base">Liten (1-20)</SelectItem>
                  <SelectItem value="medium" className="text-sm md:text-base">Middels (21-50)</SelectItem>
                  <SelectItem value="large" className="text-sm md:text-base">Stor (51-100)</SelectItem>
                  <SelectItem value="extra-large" className="text-sm md:text-base">Ekstra stor (100+)</SelectItem>
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
                    <SelectValue placeholder="Alle" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="all" className="text-sm md:text-base">Alle</SelectItem>
                  {availableAccessibility.map((feature) => (
                    <SelectItem key={feature} value={feature} className="text-sm md:text-base">
                      {feature === 'wheelchair' ? 'Rullestoltilpasset' : 
                       feature === 'hearing-loop' ? 'Teleslynge' : 
                       feature === 'visual-aids' ? 'Synshjelpemidler' : feature}
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
