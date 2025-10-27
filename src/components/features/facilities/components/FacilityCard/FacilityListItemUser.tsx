"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Share2, 
  Calendar, 
  Eye,
  MapPin,
  Users,
  Star,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { FacilityMiniMap } from "@/components/features/facilities/components/FacilityMap/FacilityMiniMap";
import { useFavoritesStore } from "@/stores/favoritesStore";

interface IFacilityListItemUserProps {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly type: string;
  readonly capacity: number;
  readonly amenities: readonly string[];
  readonly image: string;
  readonly rating?: number;
  readonly price?: string;
  readonly description?: string;
  readonly availability?: "available" | "busy" | "full";
  readonly isFavorite?: boolean;
  readonly coordinates?: { lat: number; lng: number };
}

const FacilityListItemUser = (props: IFacilityListItemUserProps): JSX.Element => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  // Use favorites store instead of local state
  const { isFavorite, toggleFavorite, incrementUsage, updateLastVisited } = useFavoritesStore();

  const {
    id,
    name,
    address,
    type,
    capacity,
    amenities,
    image,
    rating,
    price,
    description,
    availability = "available",
    coordinates
  } = props;

  const handleViewDetails = (): void => {
    // Track usage and last visited when viewing details
    incrementUsage(id);
    updateLastVisited(id);
    navigate(`/facilities/${id}`);
  };

  const handleBookNow = (): void => {
    // Track usage when booking
    incrementUsage(id);
    updateLastVisited(id);
    navigate(`/facilities/${id}/book`);
  };

  const handleToggleFavorite = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(id);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleShare = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `Sjekk ut ${name} på BookMe`,
        url: window.location.origin + `/facilities/${id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/facilities/${id}`);
    }
  };

  const getAvailabilityBadge = (): JSX.Element => {
    const availabilityConfig = {
      available: { 
        label: "Ledig i dag", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      busy: { 
        label: "Fullbooket i helgen", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock
      },
      full: { 
        label: "Fullbooket", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle
      }
    };
    
    const config = availabilityConfig[availability];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex min-h-[128px]">
        {/* Image Section */}
        <div className="relative w-48 min-h-[128px] bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          
          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-600 text-white text-xs">
              {type}
            </Badge>
          </div>
          
          {/* Favorite Button */}
          <Button
            size="sm"
            variant="secondary"
            className={`absolute top-2 right-2 w-7 h-7 p-0 bg-white/90 hover:bg-white transition-all z-30 ${
              isAnimating ? "scale-110" : ""
            }`}
            onClick={handleToggleFavorite}
          >
            <Heart 
              className={`h-3 w-3 transition-colors ${
                isFavorite(id)
                  ? "text-red-500 fill-current" 
                  : "text-gray-600 hover:text-red-500"
              }`} 
            />
          </Button>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col min-w-0"> {/* Added min-w-0 to prevent overflow issues */}
          <div className="flex items-start justify-between mb-2 flex-shrink-0">
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow issues */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {name}
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {address}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
              {rating && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {rating}
                  </span>
                </div>
              )}
              {getAvailabilityBadge()}
            </div>
          </div>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-shrink-0">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {capacity} personer
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{amenities.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {price && (
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {price}
                </span>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-1" />
                Se detaljer
              </Button>
              
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleBookNow}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Book nå
              </Button>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        {coordinates && coordinates.lat && coordinates.lng && (
          <div className="w-32 min-h-[128px] flex-shrink-0 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="w-full h-full">
              <FacilityMiniMap
                facility={{
                  id,
                  name,
                  description: description || "",
                  type,
                  location: address,
                  address,
                  capacity,
                  pricePerHour: parseInt(price?.replace(/[^\d]/g, "") || "0") || 0,
                  amenities,
                  images: [image],
                  availability: {
                    monday: { start: "08:00", end: "22:00" },
                    tuesday: { start: "08:00", end: "22:00" },
                    wednesday: { start: "08:00", end: "22:00" },
                    thursday: { start: "08:00", end: "22:00" },
                    friday: { start: "08:00", end: "22:00" },
                    saturday: { start: "08:00", end: "22:00" },
                    sunday: { start: "08:00", end: "22:00" }
                  },
                  coordinates: { lat: coordinates.lat, lng: coordinates.lng },
                  rating: rating || 0,
                  reviewCount: 0,
                  status: "published",
                  owner: "",
                  lastUpdated: "",
                  createdAt: "",
                  updatedAt: ""
                }}
                mapboxToken="pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityListItemUser;