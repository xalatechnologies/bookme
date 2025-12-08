/**
 * Index Page Logic Hook
 * 
 * Encapsulates all business logic for the main landing/search page.
 * Handles user redirection, filter management, and state initialization.
 * 
 * Features:
 * - Auto-redirect authenticated users to their portal
 * - URL parameter initialization
 * - Filter state management
 * - Portal preference loading from database
 * 
 * @example
 * ```tsx
 * const {
 *   filters,
 *   date,
 *   setDate,
 *   facilityType,
 *   setFacilityType,
 *   // ... other state
 * } = useIndexPageLogic();
 * 
 * return (
 *   <div>
 *     <SearchFilter {...filters} />
 *     <FacilityList filters={filters} />
 *   </div>
 * );
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/hooks';
import { supabase } from '@/lib/clients/supabase';
import type { FacilityFilters } from '@/types/facility';

export interface IndexPageState {
  // Date and basic filters
  readonly date: Date | undefined;
  readonly setDate: (date: Date | undefined) => void;
  readonly facilityType: string;
  readonly setFacilityType: (type: string) => void;
  readonly selectedLocation: string;
  readonly setSelectedLocation: (location: string) => void;
  readonly viewMode: 'grid' | 'map' | 'list';
  readonly setViewMode: (mode: 'grid' | 'map' | 'list') => void;
  readonly accessibility: string;
  readonly setAccessibility: (accessibility: string) => void;
  readonly capacity: number[];
  readonly setCapacity: (capacity: number[]) => void;
  readonly searchTerm: string;
  readonly setSearchTerm: (term: string) => void;

  // Advanced filters
  readonly priceRange: number[];
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
  readonly setAllowsPhotography: (allows: boolean) => void;

  // Computed
  readonly filters: FacilityFilters;
  readonly isAdmin: boolean;
}

/**
 * Hook for managing Index page state and logic
 */
export const useIndexPageLogic = (): IndexPageState => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get auth state
  const { user, memberships } = useAuth();

  // Check if user has admin role
  const isAdmin = memberships.some(
    membership => membership.role === 'admin' || membership.role === 'owner'
  );

  // Basic filter states
  const [date, setDate] = useState<Date | undefined>();
  const [facilityType, setFacilityType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'list'>('grid');
  const [accessibility, setAccessibility] = useState<string>('all');
  const [capacity, setCapacity] = useState<number[]>([0, 200]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Advanced filter states
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [hasEquipment, setHasEquipment] = useState<boolean>(false);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [hasWifi, setHasWifi] = useState<boolean>(false);
  const [allowsPhotography, setAllowsPhotography] = useState<boolean>(false);

  /**
   * Load portal preference and redirect if needed
   */
  const loadPortalPreferenceAndRedirect = useCallback(async () => {
    if (!user) return;
    if (location.pathname !== '/') return;
    if (location.state?.fromPortal || location.state?.justLoggedOut) return;

    try {
      // Load portal preference from profiles table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('profiles')
        .select('preferred_portal')
        .eq('id', user.id)
        .single();

      const lastPortal = data?.preferred_portal;

      if (lastPortal === 'admin' && isAdmin) {
        navigate('/admin/overview', { replace: true });
      } else if (lastPortal === 'user' || !isAdmin) {
        navigate('/user', { replace: true });
      } else if (isAdmin) {
        navigate('/admin/overview', { replace: true });
      }
    } catch (error) {
      console.error('Failed to load portal preference:', error);
      // Fallback to default behavior
      if (isAdmin) {
        navigate('/admin/overview', { replace: true });
      } else {
        navigate('/user', { replace: true });
      }
    }
  }, [user, isAdmin, navigate, location.pathname, location.state]);

  /**
   * Initialize state from URL parameters
   */
  const initializeFromUrlParams = useCallback(() => {
    const urlFacilityType = searchParams.get('facilityType');
    const urlLocation = searchParams.get('location');
    const urlAccessibility = searchParams.get('accessibility');
    const urlCapacity = searchParams.get('capacity');
    const urlViewMode = searchParams.get('viewMode');
    const urlSearchTerm = searchParams.get('searchTerm');

    if (urlFacilityType) setFacilityType(urlFacilityType);
    if (urlLocation) setSelectedLocation(urlLocation);
    if (urlAccessibility) setAccessibility(urlAccessibility);
    if (urlCapacity) {
      const capacityArray = urlCapacity.split(',').map(Number);
      if (capacityArray.length === 2) setCapacity(capacityArray);
    }
    if (urlViewMode && ['grid', 'map', 'list'].includes(urlViewMode)) {
      setViewMode(urlViewMode as 'grid' | 'map' | 'list');
    }
    if (urlSearchTerm) setSearchTerm(urlSearchTerm);

    // Clear URL parameters after setting state
    if (searchParams.toString()) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Effect: Redirect authenticated users
  useEffect(() => {
    void loadPortalPreferenceAndRedirect();
  }, [loadPortalPreferenceAndRedirect]);

  // Effect: Initialize from URL params
  useEffect(() => {
    initializeFromUrlParams();
  }, []); // Only run once on mount

  // Create amenities array from individual boolean states
  const amenities = [
    ...(hasEquipment ? ['av-equipment'] : []),
    ...(hasParking ? ['parking'] : []),
    ...(hasWifi ? ['wifi'] : []),
    ...(allowsPhotography ? ['photography'] : []),
  ];

  // Create filters object
  const filters: FacilityFilters = {
    ...(searchTerm && searchTerm.trim() !== '' ? { searchTerm: searchTerm.trim() } : {}),
    ...(facilityType && facilityType !== 'all' ? { facilityType } : {}),
    ...(selectedLocation && selectedLocation !== 'all' ? { location: selectedLocation } : {}),
    ...(accessibility && accessibility !== 'all' ? { accessibility } : {}),
    ...(capacity && (capacity[0] > 0 || capacity[1] < 200) ? { capacity } : {}),
    ...(date ? { date } : {}),
    ...(priceRange && (priceRange[0] > 0 || priceRange[1] < 5000)
      ? { priceRange: { min: priceRange[0], max: priceRange[1] } }
      : {}),
    ...(availableNow ? { availableNow } : {}),
    ...(amenities.length > 0 ? { amenities } : {}),
  };

  return {
    // Basic filters
    date,
    setDate,
    facilityType,
    setFacilityType,
    selectedLocation,
    setSelectedLocation,
    viewMode,
    setViewMode,
    accessibility,
    setAccessibility,
    capacity,
    setCapacity,
    searchTerm,
    setSearchTerm,

    // Advanced filters
    priceRange,
    setPriceRange,
    availableNow,
    setAvailableNow,
    hasEquipment,
    setHasEquipment,
    hasParking,
    setHasParking,
    hasWifi,
    setHasWifi,
    allowsPhotography,
    setAllowsPhotography,

    // Computed
    filters,
    isAdmin,
  };
};
