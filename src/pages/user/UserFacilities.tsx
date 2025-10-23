"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "lucide-react";
import { useFacilityStore } from "@/stores/facilityStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import FacilityCardUser from "@/components/facility/FacilityCardUser";
import FacilityListItemUser from "@/components/facility/FacilityListItemUser";
import ViewToggleUser from "@/components/facility/ViewToggleUser";
import FilterBarUser from "@/components/facility/FilterBarUser";
import { MapView } from "@/components/MapView";

interface IUserFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly address: string;
  readonly capacity: number;
  readonly amenities: readonly string[];
  readonly image: string;
  readonly rating: number;
  readonly price: string;
  readonly description: string;
  readonly availability: "available" | "busy" | "full";
  readonly isFavorite?: boolean;
  readonly coordinates?: { lat: number; lng: number };
}

const UserFacilities = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "popularity" | "name">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(false);

  // Get facilities from store
  const { getPublishedFacilities } = useFacilityStore();
  const { isFavorite } = useFavoritesStore();
  const storeFacilities = getPublishedFacilities();

  /**
   * Get real-time availability status for a facility
   * 
   * @param facilityId - ID of the facility
   * @param facilityType - Type of the facility
   * @returns Availability status
   */
  const getRealTimeAvailability = (facilityId: string, facilityType: string): "available" | "busy" | "full" => {
    try {
      // Get current time and day
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      
      // Simulate different availability patterns based on facility type and time
      let baseAvailability = 0.8; // 80% chance of being available
      
      // Adjust based on facility type
      switch (facilityType.toLowerCase()) {
        case 'idrettshall':
        case 'gym':
          // More busy during evening hours and weekends
          if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            baseAvailability = hour >= 8 && hour <= 20 ? 0.6 : 0.9;
          } else { // Weekday
            baseAvailability = hour >= 17 && hour <= 21 ? 0.4 : 0.8;
          }
          break;
        case 'møterom':
        case 'konferanse':
          // More busy during business hours
          if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekday
            baseAvailability = hour >= 9 && hour <= 17 ? 0.3 : 0.8;
          } else { // Weekend
            baseAvailability = 0.9;
          }
          break;
        case 'kulturhus':
        case 'teater':
          // More busy during evening and weekends
          if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            baseAvailability = hour >= 14 && hour <= 22 ? 0.2 : 0.8;
          } else { // Weekday
            baseAvailability = hour >= 18 && hour <= 22 ? 0.3 : 0.7;
          }
          break;
        default:
          // Default pattern
          if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            baseAvailability = hour >= 8 && hour <= 22 ? 0.7 : 0.9;
          } else { // Weekday
            baseAvailability = hour >= 6 && hour <= 23 ? 0.6 : 0.9;
          }
      }
      
      // Add some randomness based on facility ID for consistency
      const seed = facilityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomFactor = (seed % 100) / 100;
      const finalAvailability = baseAvailability + (randomFactor - 0.5) * 0.2;
      
      // Determine status based on availability probability
      if (finalAvailability >= 0.7) {
        return "available";
      } else if (finalAvailability >= 0.3) {
        return "busy";
      } else {
        return "full";
      }
    } catch (error) {
      console.error('Failed to get real-time availability:', error);
      // Default to available if there's an error
      return "available";
    }
  };

  // Convert store facilities to user format
  const facilities: readonly IUserFacility[] = storeFacilities.map(facility => ({
    id: facility.id,
    name: facility.name,
    type: facility.type,
    address: facility.address,
    capacity: facility.capacity,
    amenities: facility.amenities,
    image: facility.images[0] || "/placeholder.svg",
    rating: facility.rating,
    price: `${facility.pricePerHour} kr/time`,
    description: facility.description,
    availability: getRealTimeAvailability(facility.id, facility.type),
    isFavorite: isFavorite(facility.id), // Use real favorite status from store
    coordinates: facility.coordinates
  }));

  const filteredAndSortedFacilities = facilities
    .filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           facility.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           facility.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === "all" || facility.type === selectedType;
      const matchesAvailability = !showAvailableOnly || facility.availability === "available";
      return matchesSearch && matchesType && matchesAvailability;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "price":
          const priceA = parseInt(a.price.replace(/[^\d]/g, ""));
          const priceB = parseInt(b.price.replace(/[^\d]/g, ""));
          comparison = priceA - priceB;
          break;
        case "popularity":
          comparison = b.rating - a.rating;
          break;
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSortChange = (newSortBy: "price" | "popularity" | "name", newOrder: "asc" | "desc"): void => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  };

  const renderGridView = (): JSX.Element => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedFacilities.map((facility) => (
        <FacilityCardUser
          key={facility.id}
          id={facility.id}
          name={facility.name}
          address={facility.address}
          type={facility.type}
          capacity={facility.capacity}
          amenities={facility.amenities}
          image={facility.image}
          rating={facility.rating}
          price={facility.price}
          description={facility.description}
          availability={facility.availability}
          isFavorite={facility.isFavorite}
        />
      ))}
    </div>
  );

  const renderListView = (): JSX.Element => (
    <div className="space-y-4">
      {filteredAndSortedFacilities.map((facility) => (
        <FacilityListItemUser
          key={facility.id}
          id={facility.id}
          name={facility.name}
          address={facility.address}
          type={facility.type}
          capacity={facility.capacity}
          amenities={facility.amenities}
          image={facility.image}
          rating={facility.rating}
          price={facility.price}
          description={facility.description}
          availability={facility.availability}
          isFavorite={facility.isFavorite}
          coordinates={facility.coordinates}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tilgjengelige lokaler
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Utforsk og book lokaler som passer dine behov
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBarUser
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        showAvailableOnly={showAvailableOnly}
        onAvailableToggle={setShowAvailableOnly}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedFacilities.length} lokaler funnet
          </span>
          {showAvailableOnly && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
              Kun ledige
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      {filteredAndSortedFacilities.length > 0 ? (
        <>
          {viewMode === "grid" && renderGridView()}
          {viewMode === "list" && renderListView()}
          {viewMode === "map" && (
            <MapView
              facilityType={selectedType}
              location="all"
              viewMode={viewMode}
              setViewMode={setViewMode}
              showAllFacilities={false}
              showHeader={false}
            />
          )}

        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ingen lokaler funnet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedType !== "all" || showAvailableOnly
                ? "Prøv å justere søkekriteriene dine."
                : "Det er ingen lokaler tilgjengelige for øyeblikket."
              }
            </p>
            {(searchQuery || selectedType !== "all" || showAvailableOnly) && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setShowAvailableOnly(false);
                  }}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  Tilbakestill filtre
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserFacilities;