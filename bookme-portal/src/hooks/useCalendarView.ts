"use client";

// External imports
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Internal imports
import { coreFacilities } from '@/data/coreFacilities';
import { dummyZones, getZonesForFacility } from '@/data/zones/dummyZones';
import type { Zone } from '@/types/booking';
import type { Facility } from '@/data/coreFacilities';

interface UseCalendarViewProps {
  readonly facilityType?: string;
  readonly location?: string;
  readonly accessibility?: string;
  readonly capacity?: readonly [number, number];
}

interface FacilityWithZones {
  readonly facility: Facility;
  readonly zones: readonly Zone[];
}

interface UseCalendarViewReturn {
  readonly facilitiesWithZones: readonly FacilityWithZones[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly allZones: readonly Zone[];
  readonly navigate: (path: string) => void;
}

export const useCalendarView = ({
  facilityType,
  location,
  accessibility,
  capacity
}: UseCalendarViewProps): UseCalendarViewReturn => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter facilities based on criteria
  const filteredFacilities = useMemo(() => {
    let filtered = coreFacilities;

    if (facilityType && facilityType !== "all") {
      filtered = filtered.filter(f => f.type === facilityType);
    }
    
    if (location && location !== "all") {
      filtered = filtered.filter(f => f.area === location);
    }
    
    if (accessibility && accessibility !== "all") {
      filtered = filtered.filter(f => 
        f.accessibilityFeatures && f.accessibilityFeatures.includes(accessibility)
      );
    }
    
    if (capacity) {
      filtered = filtered.filter(f => 
        f.capacity >= capacity[0] && f.capacity <= capacity[1]
      );
    }

    return filtered;
  }, [facilityType, location, accessibility, capacity]);

  // Get facilities with their zones
  const facilitiesWithZones = useMemo((): readonly FacilityWithZones[] => {
    return filteredFacilities.map(facility => ({
      facility,
      zones: getZonesForFacility(facility.id)
    })).filter(item => item.zones.length > 0); // Only include facilities that have zones
  }, [filteredFacilities]);

  // Get all zones from filtered facilities
  const allZones = useMemo((): readonly Zone[] => {
    return facilitiesWithZones.flatMap(item => item.zones);
  }, [facilitiesWithZones]);

  // Initialize loading state
  useEffect(() => {
    setIsLoading(false);
    setError(null);
  }, [facilityType, location, accessibility, capacity]);

  return {
    facilitiesWithZones,
    isLoading,
    error,
    allZones,
    navigate
  };
};
