"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Heart, Share2 } from 'lucide-react';

import { useTranslation } from '@/i18n';
import type { IFacility } from '@/stores/facilityStore';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FacilityCardProps {
  readonly facility: IFacility;
  readonly onAddressClick: (e: React.MouseEvent, facility: IFacility) => void;
  readonly viewMode?: "grid" | "list";
}

export const FacilityCard = ({ 
  facility, 
  onAddressClick,
  viewMode = "grid"
}: FacilityCardProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facility.id);

  const handleCardClick = (): void => {
    navigate(`/facilities/${facility.id}`);
  };

  const handleShare = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: facility.name,
          url: `${window.location.origin}/facilities/${facility.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/facilities/${facility.id}`);
        console.log('Link copied to clipboard');
      }
    } catch (error) {
      // Handle share cancellation or other errors silently
      if (error instanceof Error && error.name !== 'AbortError') {
        console.warn('Share failed:', error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/facilities/${facility.id}`);
          console.log('Link copied to clipboard as fallback');
        } catch (clipboardError) {
          console.warn('Clipboard fallback also failed:', clipboardError);
        }
      }
    }
  };

  const handleFavorite = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] border-0 shadow-lg bg-white relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 h-full flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Se detaljer for ${facility.name} på ${facility.address}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={facility.images[0] || '/placeholder.svg'}
          alt={facility.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Overlay buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            aria-label="Legg til favoritter"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            aria-label="Del fasilitet"
          >
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
            {facility.type}
          </Badge>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col p-6">
        {/* Facility Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
          {facility.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-3 mb-5 text-gray-600 hover:text-blue-600 transition-colors group/location">
          <MapPin className="h-5 w-5 text-gray-400 group-hover/location:text-blue-500" />
          <span 
            className="text-base font-medium line-clamp-1 cursor-pointer" 
            onClick={e => onAddressClick(e, facility)}
          >
            {facility.address}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-2">
          {facility.description}
        </p>

        {/* Amenities Tags */}
        {facility.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {facility.amenities.slice(0, 3).map((amenity, index) => (
              <Badge 
                key={index}
                className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 text-sm hover:bg-blue-100 transition-colors"
              >
                {amenity}
              </Badge>
            ))}
            {facility.amenities.length > 3 && (
              <Badge 
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-300 font-medium px-3 py-1 text-sm"
              >
                +{facility.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Dynamic fields based on configuration */}
        <div className="space-y-2 mt-auto">
          {fieldConfigs
            .filter(field => field.visible)
            .map(field => {
              const getFieldValue = (): string | number => {
                if (field.key === 'capacity') return facility.capacity || 0;
                if (field.key === 'area') return facility.area || '';
                if (field.key === 'pricePerHour') return facility.pricePerHour || 0;
                if (field.key === 'rating') return facility.rating || 0;
                if (field.key === 'reviewCount') return facility.reviewCount || 0;
                return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
              };

              const getIcon = (): JSX.Element => {
                if (field.key === 'capacity') return <Users className="h-5 w-5" />;
                if (field.key === 'area') return <MapPin className="h-5 w-5" />;
                if (field.key === 'pricePerHour') return <span className="text-gray-400">💰</span>;
                if (field.key === 'rating') return <span className="text-yellow-500">★</span>;
                if (field.key === 'reviewCount') return <span className="text-gray-400">📝</span>;
                return <span className="text-gray-400">📋</span>;
              };

              const getUnit = (): string => {
                if (field.key === 'capacity') return 'personer';
                if (field.key === 'area') return 'm²';
                if (field.key === 'pricePerHour') return 'kr/time';
                if (field.key === 'rating') return '/5';
                if (field.key === 'reviewCount') return 'anmeldelser';
                return '';
              };

              return (
                <div key={field.id} className="flex items-center gap-3 text-gray-600">
                  {getIcon()}
                  <span className="text-base font-medium">
                    {field.label}: {getFieldValue()}
                    {getUnit() && ` ${getUnit()}`}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className={`absolute inset-0 rounded-xl border-2 border-blue-400 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
    </Card>
  );
};
