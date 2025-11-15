"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Calendar,
  Eye,
  MapPin,
  Users
} from "lucide-react";
import FacilityMiniMap from "@/components/features/facilities/components/FacilityMap/FacilityMiniMap";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useFacilityTypeTranslation } from "@/hooks/shared/useFacilityTypeTranslation";
import { useAuth } from "@/contexts/hooks/useAuth";

interface IFacilityListItemUserProps {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly type: string;
  readonly capacity: number;
  readonly image: string;
  readonly description?: string;
  readonly lat?: number | null;
  readonly lng?: number | null;
  readonly slug?: string;
}

const FacilityListItemUser = (props: IFacilityListItemUserProps): JSX.Element => {
  const { t } = useTranslation(['facility']);
  const { user } = useAuth();
  const translateFacilityType = useFacilityTypeTranslation();
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
    image,
    description,
    lat,
    lng
  } = props;

  const handleViewDetails = (): void => {
    // Track usage and last visited when viewing details
    incrementUsage(id);
    updateLastVisited(id);
    // Use slug if available, fallback to id
    const facilityPath = props.slug || id;
    navigate(`/facilities/${facilityPath}`);
  };

  const handleBookNow = (): void => {
    // Track usage when booking
    incrementUsage(id);
    updateLastVisited(id);
    // Use slug if available, fallback to id
    const facilityPath = props.slug || id;
    navigate(`/facilities/${facilityPath}/book`);
  };

  const handleToggleFavorite = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsAnimating(true);
    toggleFavorite(id);

    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleShare = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _e: React.MouseEvent
  ): void => {
    // Use slug if available, fallback to id
    const facilityPath = props.slug || id;
    if (navigator.share) {
      navigator.share({
        title: name,
        text: t('facility:share.check_out', { name, type, capacity }),
        url: window.location.origin + `/facilities/${facilityPath}`
      }).catch(() => {
        // Share was cancelled or failed - ignore silently
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/facilities/${facilityPath}`).catch(() => {
        // Clipboard write failed - ignore silently
      });
    }
  };

  // Check if we have valid coordinates or address using numeric checks
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const hasAddress = !!address;

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
          {user && (
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
          )}
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
              {/* Rating - Removed as requested */}
              {/* Availability Badge - Removed as requested */}
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

              {/* Amenities Tags - Removed as requested */}
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Price - Removed as requested */}
              
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
        {(hasCoords || hasAddress) && (
          <div className="relative w-48 min-h-[128px] flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
            <FacilityMiniMap
              address={address}
              lat={lat ?? undefined}
              lng={lng ?? undefined}
              // Removed fixed width and height to allow the map to fill its container
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityListItemUser;