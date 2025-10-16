"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  MapPin, 
  Users, 
  Calendar,
  Star,
  Eye,
  Trash2,
  Grid3X3,
  List,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import FacilityCardUser from "@/components/facility/FacilityCardUser";
import FacilityListItemUser from "@/components/facility/FacilityListItemUser";
import { useFacilityStore } from "@/stores/facilityStore";
import { useFavoritesStore } from "@/stores/favoritesStore";

interface IFavoriteFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly address: string;
  readonly capacity: number;
  readonly price: string;
  readonly image: string;
  readonly rating: number;
  readonly addedAt: string;
  readonly lastVisited?: string;
  readonly usageCount?: number;
  readonly amenities: readonly string[];
  readonly description: string;
  readonly availability: "available" | "busy" | "full";
  readonly location: string;
  readonly pricePerHour: number;
  readonly isFavorite?: boolean;
  readonly coordinates?: { lat: number; lng: number };
}

const UserFavorites = (): JSX.Element => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCapacity, setFilterCapacity] = useState<string>("all");
  const [filterPrice, setFilterPrice] = useState<[number, number]>([0, 1000]);
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recently-added");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [removingFacility, setRemovingFacility] = useState<string | null>(null);

  // Real-time availability check function
  const getRealTimeAvailability = (facilityId: string): "available" | "busy" | "full" => {
    // In a real app, this would call an API to check current availability
    // For now, we'll simulate with some logic based on facility ID and time
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Simulate availability based on time and day
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      if (hour >= 8 && hour <= 22) {
        return Math.random() > 0.3 ? "available" : "busy";
      } else {
        return "full";
      }
    } else { // Weekday
      if (hour >= 6 && hour <= 23) {
        return Math.random() > 0.2 ? "available" : "busy";
      } else {
        return "full";
      }
    }
  };

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("favorites-view-mode");
    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = (mode: "grid" | "list"): void => {
    setViewMode(mode);
    localStorage.setItem("favorites-view-mode", mode);
  };

  // Get facilities and favorites from stores
  const { getPublishedFacilities } = useFacilityStore();
  const { favorites: favoriteEntries, removeFavorite } = useFavoritesStore();
  const storeFacilities = getPublishedFacilities();

  // Get only facilities that are actually favorited
  const favorites: readonly IFavoriteFacility[] = storeFacilities
    .filter(facility => favoriteEntries.some(fav => fav.facilityId === facility.id))
    .map(facility => {
      const favoriteEntry = favoriteEntries.find(fav => fav.facilityId === facility.id)!;
      return {
        id: facility.id,
        name: facility.name,
        type: facility.type,
        address: facility.address,
        capacity: facility.capacity,
        price: `${facility.pricePerHour} kr/time`,
        pricePerHour: facility.pricePerHour,
        image: facility.images[0] || "/placeholder.svg",
        rating: facility.rating,
        addedAt: favoriteEntry.addedAt,
        lastVisited: favoriteEntry.lastVisited,
        usageCount: favoriteEntry.usageCount,
        amenities: facility.amenities,
        description: facility.description,
        availability: getRealTimeAvailability(facility.id) as const,
        location: facility.location,
        isFavorite: true,
        coordinates: facility.coordinates
      };
    });

  const typeFilters = [
    { value: "all", label: "Alle typer", color: "gray" },
    { value: "Idrettshall", label: "Idrettshall", color: "blue" },
    { value: "Kulturhus", label: "Kulturhus", color: "purple" },
    { value: "Møterom", label: "Møterom", color: "green" },
    { value: "Fotballbane", label: "Fotballbane", color: "green" },
    { value: "Svømmehall", label: "Svømmehall", color: "blue" },
    { value: "Tennisbane", label: "Tennisbane", color: "orange" }
  ];

  const capacityFilters = [
    { value: "all", label: "Alle størrelser" },
    { value: "0-20", label: "0–20 personer" },
    { value: "20-100", label: "20–100 personer" },
    { value: "100+", label: "100+ personer" }
  ];

  const locationFilters = [
    { value: "all", label: "Alle steder" },
    { value: "Drammen Sentrum", label: "Drammen Sentrum" },
    { value: "Strømsø", label: "Strømsø" },
    { value: "Bragernes", label: "Bragernes" },
    { value: "Spiralen", label: "Spiralen" },
    { value: "Konnerud", label: "Konnerud" },
    { value: "Solbergelva", label: "Solbergelva" },
    { value: "Åssiden", label: "Åssiden" }
  ];

  const availabilityFilters = [
    { value: "all", label: "Alle" },
    { value: "available", label: "Ledig i dag" },
    { value: "busy", label: "Delvis opptatt" },
    { value: "full", label: "Fullbooket" }
  ];

  const sortOptions = [
    { value: "recently-added", label: "Sist lagt til" },
    { value: "last-visited", label: "Sist besøkt" },
    { value: "most-used", label: "Mest brukt" },
    { value: "highest-rated", label: "Høyest vurdert" },
    { value: "name", label: "Navn A–Å" },
    { value: "price-low", label: "Pris lav–høy" },
    { value: "price-high", label: "Pris høy–lav" }
  ];

  const filteredAndSortedFavorites = favorites
    .filter(favorite => {
      const matchesSearch = favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || favorite.type === filterType;
      
      const matchesCapacity = filterCapacity === "all" || 
        (filterCapacity === "0-20" && favorite.capacity <= 20) ||
        (filterCapacity === "20-100" && favorite.capacity > 20 && favorite.capacity <= 100) ||
        (filterCapacity === "100+" && favorite.capacity > 100);
      
      const matchesPrice = favorite.pricePerHour >= filterPrice[0] && favorite.pricePerHour <= filterPrice[1];
      
      const matchesLocation = filterLocation === "all" || favorite.location === filterLocation;
      
      const matchesAvailability = filterAvailability === "all" || favorite.availability === filterAvailability;
      
      return matchesSearch && matchesType && matchesCapacity && matchesPrice && matchesLocation && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recently-added":
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "last-visited":
          return new Date(b.lastVisited || b.addedAt).getTime() - new Date(a.lastVisited || a.addedAt).getTime();
        case "most-used":
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "highest-rated":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.pricePerHour - b.pricePerHour;
        case "price-high":
          return b.pricePerHour - a.pricePerHour;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "i går";
    if (diffDays < 7) return `${diffDays} dager siden`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} uker siden`;
    
    return date.toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const handleRemoveFavorite = async (facilityId: string): Promise<void> => {
    setRemovingFacility(facilityId);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Remove from favorites store
    removeFavorite(facilityId);
    setRemovingFacility(null);
  };

  const handleViewFacility = (facilityId: string): void => {
    // Track usage and last visited when viewing details
    const { incrementUsage, updateLastVisited } = useFavoritesStore.getState();
    incrementUsage(facilityId);
    updateLastVisited(facilityId);
    // Navigate to facility detail page
    window.location.href = `/facilities/${facilityId}`;
  };

  const handleBookNow = (facilityId: string): void => {
    // Track usage when booking
    const { incrementUsage, updateLastVisited } = useFavoritesStore.getState();
    incrementUsage(facilityId);
    updateLastVisited(facilityId);
    // Navigate to booking page
    window.location.href = `/facilities/${facilityId}/book`;
  };

  const handleQuickView = (facilityId: string): void => {
    // Open quick view modal
    const facility = favorites.find(f => f.id === facilityId);
    if (facility) {
      // Create a simple modal for quick view
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${facility.name}</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Type:</strong> ${facility.type}</p>
            <p><strong>Kapasitet:</strong> ${facility.capacity} personer</p>
            <p><strong>Pris:</strong> ${facility.price}</p>
            <p><strong>Adresse:</strong> ${facility.address}</p>
            <p><strong>Tilgjengelighet:</strong> ${facility.availability === 'available' ? 'Ledig' : facility.availability === 'busy' ? 'Delvis opptatt' : 'Fullbooket'}</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button onclick="window.location.href='/facilities/${facilityId}'" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Se detaljer
            </button>
            <button onclick="window.location.href='/facilities/${facilityId}/book'" class="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Book nå
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
  };


  const renderGridView = (): JSX.Element => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedFavorites.map((facility) => (
        <div 
          key={facility.id} 
          className={`transition-all duration-300 ease-in-out ${
            removingFacility === facility.id ? 'opacity-50 scale-95' : ''
          }`}
        >
          <FacilityCardUser
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
          
          {/* Additional info for favorites */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center">
            Lagt til {formatDate(facility.addedAt)}
            {facility.usageCount && facility.usageCount > 0 && (
              <span className="ml-2">• {facility.usageCount} besøk</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = (): JSX.Element => (
    <div className="space-y-4">
      {filteredAndSortedFavorites.map((facility) => (
        <div 
          key={facility.id} 
          className={`transition-all duration-300 ease-in-out ${
            removingFacility === facility.id ? 'opacity-50' : ''
          }`}
        >
          <FacilityListItemUser
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
          
          {/* Additional info for favorites */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 text-center">
            Lagt til {formatDate(facility.addedAt)}
            {facility.usageCount && facility.usageCount > 0 && (
              <span className="ml-2">• {facility.usageCount} besøk</span>
            )}
            {facility.lastVisited && (
              <span className="ml-2">• Sist besøkt {formatDate(facility.lastVisited)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Favoritter
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Her finner du lokalene du liker best. Du kan enkelt se tilgjengelighet, sammenligne priser og booke direkte.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {filteredAndSortedFavorites.length} lagrede lokaler
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Søk i favoritter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sortér etter:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => handleViewModeChange("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => handleViewModeChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</h4>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {typeFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kapasitet</h4>
                  <select
                    value={filterCapacity}
                    onChange={(e) => setFilterCapacity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {capacityFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lokasjon</h4>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {locationFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tilgjengelighet</h4>
                  <select
                    value={filterAvailability}
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
                  >
                    {availabilityFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Range */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pris per time: {filterPrice[0]}–{filterPrice[1]} kr
                </h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filterPrice[0]}
                    onChange={(e) => setFilterPrice([parseInt(e.target.value), filterPrice[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filterPrice[1]}
                    onChange={(e) => setFilterPrice([filterPrice[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorites List */}
      {filteredAndSortedFavorites.length > 0 ? (
        viewMode === "grid" ? renderGridView() : renderListView()
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Du har ingen favoritter ennå
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterType !== "all" || filterCapacity !== "all" || filterLocation !== "all" || filterAvailability !== "all"
                ? "Ingen favoritter matcher søkekriteriene dine."
                : "Gå til Lokaler for å finne dine favoritter!"
              }
            </p>
            {!searchTerm && filterType === "all" && filterCapacity === "all" && filterLocation === "all" && filterAvailability === "all" && (
              <Button onClick={() => window.location.href = '/user/facilities'}>
                <BookOpen className="h-4 w-4 mr-2" />
                Utforsk lokaler
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserFavorites;