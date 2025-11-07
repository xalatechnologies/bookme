"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { useFacilityTypeTranslation } from "@/hooks/shared/useFacilityTypeTranslation";
import { useAmenityTranslation } from "@/hooks/shared/useAmenityTranslation";

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
  const { t } = useTranslation(['facility']);
  const translateFacilityType = useFacilityTypeTranslation();
  const translateAmenity = useAmenityTranslation();
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
    // Use slug if available, fallback to id
    const facilityPath = (props as any).slug || id;
    navigate(`/facilities/${facilityPath}`);
  };

  const handleBookNow = (): void => {
    // Track usage when booking
    incrementUsage(id);
    updateLastVisited(id);
    // Use slug if available, fallback to id
    const facilityPath = (props as any).slug || id;
    navigate(`/facilities/${facilityPath}/book`);
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
    // Use slug if available, fallback to id
    const facilityPath = (props as any).slug || id;
    if (navigator.share) {
      navigator.share({
        title: name,
        text: t('facility:share.check_out', { name, type, capacity }),
        url: window.location.origin + `/facilities/${facilityPath}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/facilities/${facilityPath}`);
    }
  };

  const getAvailabilityBadge = (): JSX.Element => {
    const availabilityConfig = {
      available: {
        label: t('facility:availability.available_today'),
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      busy: {
        label: t('facility:availability.fully_booked_weekend'),
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock
      },
      full: {
        label: t('facility:availability.fully_booked'),
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
          
          {/* Type Badge - only render if type is not empty */}
          {type && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-blue-600 text-white text-xs">
                {translateFacilityType(type)}
              </Badge>
            </div>
          )}
          
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
                  {capacity} {t('facility:card.people')}
                </span>
              </div>

              {/* Amenities Tags */}
              <div className="flex flex-wrap gap-1">
                {amenities && Array.isArray(amenities) && amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {translateAmenity(amenity)}
                  </Badge>
                ))}
                {amenities && Array.isArray(amenities) && amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{amenities.length - 3} {t('facility:card.more')}
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
                {t('facility:buttons.view_details')}
              </Button>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleBookNow}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {t('facility:buttons.book_now')}
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
                  address,
                  location: { lat: coordinates.lat, lng: coordinates.lng },
                  amenities: [...amenities], // Convert readonly array to mutable array
                  accessibility_features: null,
                  area_description: null,
                  capacity: 0,
                  city: null,
                  contact_email: null,
                  contact_phone: null,
                  country: null,
                  created_at: "",
                  description: null,
                  facility_type: "",
                  images: null,
                  org_id: "",
                  postal_code: null,
                  rating: 0,
                  review_count: 0,
                  slug: "",
                  status: "",
                  updated_at: "",
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