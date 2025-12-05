"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { supabase } from '@/lib/clients/supabase';

import { FacilityFilters } from "@/types/facility";

import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import SearchFilter from "@/components/features/search/components/SearchFilter";
import { FacilityList } from "@/components/features/facilities/components/FacilitySearch/FacilityList";
import { MapView } from "@/components/features/facilities/components/FacilityMap/MapView";
import { useAuth } from "@/contexts/hooks";

export const Index = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState<Date>();
  const [facilityType, setFacilityType] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "map" | "list">("grid");
  const [accessibility, setAccessibility] = useState<string>("all");
  const [capacity, setCapacity] = useState<number[]>([0, 200]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get auth state
  const { user, memberships } = useAuth();
  
  // Check if user has admin role
  const isAdmin = memberships.some(membership => 
    membership.role === 'admin' || membership.role === 'owner'
  );

  // Advanced filter states
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [availableNow, setAvailableNow] = useState<boolean>(false);
  const [hasEquipment, setHasEquipment] = useState<boolean>(false);
  const [hasParking, setHasParking] = useState<boolean>(false);
  const [hasWifi, setHasWifi] = useState<boolean>(false);
  const [allowsPhotography, setAllowsPhotography] = useState<boolean>(false);

  // Redirect authenticated users to their last portal only when they explicitly navigate to root
  // and only if they didn't come from a portal (to allow navigation back to homepage)
  // Also don't redirect if they just logged out
  useEffect(() => {
    // Only redirect if user is authenticated and they're accessing the root path directly
    // Don't redirect if they're already on the main page and just want to stay
    // Also don't redirect if they came from a portal (indicated by referrer or navigation state)
    // Also don't redirect if they just logged out
    if (user && location.pathname === "/" && !location.state?.fromPortal && !location.state?.justLoggedOut) {
      // Load portal preference from database instead of localStorage
      const loadPortalPreference = async () => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data } = await (supabase as any)
            .from('profiles')
            .select('preferred_portal')
            .eq('id', user.id)
            .single();
          
          const lastPortal = data?.preferred_portal;
          
          if (lastPortal === "admin" && isAdmin) {
            // Redirect admin users to admin portal
            navigate("/admin/overview", { replace: true });
          } else if (lastPortal === "user" || !isAdmin) {
            // Redirect regular users or those who last visited user portal to user portal
            navigate("/user", { replace: true });
          } else if (isAdmin) {
            // Default for admin users who have no preference
            navigate("/admin/overview", { replace: true });
          }
        } catch (error) {
          console.error('Failed to load portal preference:', error);
          // Fallback to default behavior
          if (isAdmin) {
            navigate("/admin/overview", { replace: true });
          } else {
            navigate("/user", { replace: true });
          }
        }
      };
      
      void loadPortalPreference();
    }
  }, [user, isAdmin, navigate, location.pathname, location.state]);

  // Initialize state from URL parameters
  useEffect(() => {
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
      setViewMode(urlViewMode as "grid" | "map" | "list");
    }
    if (urlSearchTerm) setSearchTerm(urlSearchTerm);

    // Clear URL parameters after setting state
    if (searchParams.toString()) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Create amenities array from individual boolean states
  const amenities = [...(hasEquipment ? ['av-equipment'] : []), ...(hasParking ? ['parking'] : []), ...(hasWifi ? ['wifi'] : []), ...(allowsPhotography ? ['photography'] : [])];

  // Create filters object with proper handling
  const filters: FacilityFilters = {
    ...(searchTerm && searchTerm.trim() !== "" ? {
      searchTerm: searchTerm.trim()
    } : {}),
    ...(facilityType && facilityType !== "all" ? {
      facilityType
    } : {}),
    ...(selectedLocation && selectedLocation !== "all" ? {
      location: selectedLocation
    } : {}),
    ...(accessibility && accessibility !== "all" ? {
      accessibility
    } : {}),
    ...(capacity && (capacity[0] > 0 || capacity[1] < 200) ? {
      capacity
    } : {}),
    ...(date ? {
      date
    } : {}),
    ...(priceRange && (priceRange[0] > 0 || priceRange[1] < 5000) ? {
      priceRange: {
        min: priceRange[0],
        max: priceRange[1]
      }
    } : {}),
    ...(availableNow ? {
      availableNow
    } : {}),
    ...(amenities.length > 0 ? {
      amenities
    } : {})
  };
  
  const renderContent = () => {
    switch (viewMode) {
      case "map":
        return <MapView facilityType={facilityType} location={selectedLocation} viewMode={viewMode} setViewMode={setViewMode} filters={filters} />;
      case "list":
      case "grid":
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList filters={filters} viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        );
      default:
        return (
          <div className="max-w-7xl mx-auto px-4 my-[12px]">
            <FacilityList filters={filters} viewMode="grid" setViewMode={setViewMode} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col w-full">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 rounded-br-md focus:outline-none focus:ring-2 focus:ring-blue-500" tabIndex={0}>
        Hopp til hovedinnhold
      </a>

      {/* Sticky Header and Search Filter combined */}
      <div className="sticky top-0 z-50 w-full">
        <GlobalHeader />
        <SearchFilter 
          date={date} 
          setDate={setDate} 
          facilityType={facilityType} 
          setFacilityType={setFacilityType} 
          location={selectedLocation} 
          setLocation={setSelectedLocation} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
          accessibility={accessibility} 
          setAccessibility={setAccessibility} 
          capacity={capacity} 
          setCapacity={setCapacity} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          priceRange={priceRange} 
          setPriceRange={setPriceRange} 
          availableNow={availableNow} 
          setAvailableNow={setAvailableNow} 
          hasEquipment={hasEquipment} 
          setHasEquipment={setHasEquipment} 
          hasParking={hasParking} 
          setHasParking={setHasParking} 
          hasWifi={hasWifi} 
          setHasWifi={setHasWifi} 
          allowsPhotography={allowsPhotography} 
          setAllowsPhotography={setAllowsPhotography} 
        />
      </div>

      {/* Main content */}
      <main id="main-content" className="flex-1 w-full">
        {/* Scrollable Content Area */}
        <div className="pt-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
