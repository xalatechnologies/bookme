"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Share2, MapPin, Users, Star } from "lucide-react";

import type { IFacility } from "@/stores/facilityStore";

// Alias for backward compatibility
type Facility = IFacility;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FacilityDetailHeaderProps {
  readonly facility: Facility;
  readonly onShare: () => void;
  readonly isFavorited: boolean;
  readonly onToggleFavorite: () => void;
}

export const FacilityDetailHeader: React.FC<FacilityDetailHeaderProps> = ({
  facility,
  onShare,
  isFavorited,
  onToggleFavorite
}): JSX.Element => {
  const { t } = useTranslation(['facilities']);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-96">
        {/* Main Image */}
        <div className="lg:col-span-3 relative overflow-hidden rounded-xl">
          <img
            src={facility.images[currentImageIndex] || '/placeholder.svg'}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
          
          {/* Image Navigation Dots */}
          {facility.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {facility.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        <div className="hidden lg:flex flex-col gap-4">
          {facility.images.slice(1, 3).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index + 1)}
              className={`relative overflow-hidden rounded-xl h-full transition-opacity ${
                currentImageIndex === index + 1 ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
              }`}
            >
              <img
                src={image}
                alt={`${facility.name} ${index + 2}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          
          {/* Show more images button if there are more than 3 */}
          {facility.images.length > 3 && (
            <button className="relative overflow-hidden rounded-xl h-full bg-gray-900/80 flex items-center justify-center text-white font-medium hover:bg-gray-900/90 transition-colors">
              +{facility.images.length - 3} {t('facilities:header.more_images')}
            </button>
          )}
        </div>
      </div>

      {/* Facility Info */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          {/* Title and Type */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
                  {facility.type}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{facility.rating}</span>
                  <span className="text-gray-500">({facility.reviewCount} {t('facilities:header.reviews')})</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {facility.name}
              </h1>
            </div>
          </div>

          {/* Location and Capacity */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">{facility.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">{t('facilities:header.capacity_label', { capacity: facility.capacity })}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {facility.description}
          </p>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2">
            {facility.amenities.map((amenity, index) => (
              <Badge 
                key={index}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1"
              >
                {amenity}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 lg:flex-col">
          <Button
            variant="outline"
            size="lg"
            onClick={onToggleFavorite}
            className="flex items-center gap-2"
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            {isFavorited ? t('facilities:header.remove_from_favorites') : t('facilities:header.add_to_favorites')}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-5 w-5" />
            Del
          </Button>
        </div>
      </div>
    </div>
  );
};
