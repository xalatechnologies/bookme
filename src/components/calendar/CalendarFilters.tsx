import React, { useState, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import type { IBookingEvent } from '@/types/calendar';

interface CalendarFiltersProps {
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly selectedFacilities: readonly string[];
  readonly onFacilitiesChange: (facilities: readonly string[]) => void;
  readonly selectedStatuses: readonly string[];
  readonly onStatusesChange: (statuses: readonly string[]) => void;
  readonly availableFacilities: readonly string[];
  readonly className?: string;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedFacilities,
  onFacilitiesChange,
  selectedStatuses,
  onStatusesChange,
  availableFacilities,
  className = ''
}): JSX.Element => {
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const handleFacilityToggle = useCallback((facility: string): void => {
    if (selectedFacilities.includes(facility)) {
      onFacilitiesChange(selectedFacilities.filter(f => f !== facility));
    } else {
      onFacilitiesChange([...selectedFacilities, facility]);
    }
  }, [selectedFacilities, onFacilitiesChange]);

  const handleStatusToggle = useCallback((status: string): void => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter(s => s !== status));
    } else {
      onStatusesChange([...selectedStatuses, status]);
    }
  }, [selectedStatuses, onStatusesChange]);

  const clearAllFilters = useCallback((): void => {
    onSearchChange('');
    onFacilitiesChange([]);
    onStatusesChange([]);
  }, [onSearchChange, onFacilitiesChange, onStatusesChange]);

  const hasActiveFilters = searchQuery !== '' || selectedFacilities.length > 0 || selectedStatuses.length > 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Søk i bookinger..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filtrer
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {selectedFacilities.length + selectedStatuses.length + (searchQuery ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filtrer bookinger</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Tøm alle
                  </Button>
                )}
              </div>
              
              {/* Facility Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokaler</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableFacilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <Checkbox
                        id={`facility-${facility}`}
                        checked={selectedFacilities.includes(facility)}
                        onCheckedChange={() => handleFacilityToggle(facility)}
                      />
                      <label
                        htmlFor={`facility-${facility}`}
                        className="text-sm cursor-pointer"
                      >
                        {facility}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="space-y-2">
                  {[
                    { value: 'confirmed', label: 'Bekreftet', color: 'bg-green-100 text-green-800' },
                    { value: 'pending', label: 'Ventende', color: 'bg-yellow-100 text-yellow-800' },
                    { value: 'cancelled', label: 'Avlyst', color: 'bg-red-100 text-red-800' }
                  ].map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={selectedStatuses.includes(status.value)}
                        onCheckedChange={() => handleStatusToggle(status.value)}
                      />
                      <label
                        htmlFor={`status-${status.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {status.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Søk: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-auto p-0 ml-1 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          
          {selectedFacilities.map((facility) => (
            <Badge key={facility} variant="secondary" className="flex items-center gap-1">
              {facility}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFacilityToggle(facility)}
                className="h-auto p-0 ml-1 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
          
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              {status === 'confirmed' ? 'Bekreftet' : 
               status === 'pending' ? 'Ventende' : 'Avlyst'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusToggle(status)}
                className="h-auto p-0 ml-1 hover:bg-transparent"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
