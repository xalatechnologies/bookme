"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Heart, Share2 } from "lucide-react";

import type { IFacility } from '@/stores/facilityStore';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FacilityMiniMap } from "@/components/map/FacilityMiniMap";

interface FacilityListItemProps {
  readonly facility: IFacility;
  readonly onAddressClick: (e: React.MouseEvent, facility: IFacility) => void;
}

export const FacilityListItem: React.FC<FacilityListItemProps> = ({
  facility,
  onAddressClick
}): JSX.Element => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facility.id);

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
      className="group overflow-hidden hover:shadow-xl transition-all duration-500 hover:translate-y-[-2px] border border-slate-200/60 shadow-md bg-white cursor-pointer mb-3 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" 
      onClick={() => navigate(`/facilities/${facility.id}`)} 
      role="button" 
      tabIndex={0} 
      aria-label={`Se detaljer for ${facility.name} på ${facility.address}`} 
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/facilities/${facility.id}`);
        }
      }}
    >
      <CardContent className="p-0">
        <div className="grid grid-cols-12">
          {/* Image Section - 3 columns */}
          <div className="col-span-3 relative">
            <div className="relative h-full overflow-hidden">
              <img
                src={facility.images[0] || '/placeholder.svg'}
                alt={facility.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
                  {facility.type}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Main Content - 6 columns */}
          <div className="col-span-6 p-6 flex flex-col justify-between">
            {/* Top section */}
            <div>
              {/* Facility Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {facility.name}
              </h3>

              {/* Location */}
              <div className="flex items-center gap-3 mb-4 text-gray-600 hover:text-blue-600 transition-colors group/location">
                <MapPin className="h-5 w-5 text-gray-400 group-hover/location:text-blue-500" />
                <span 
                  className="text-base font-medium cursor-pointer" 
                  onClick={e => onAddressClick(e, facility)}
                >
                  {facility.address}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 text-base leading-relaxed mb-4">
                {facility.description}
              </p>

              {/* Amenities Tags */}
              {facility.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {facility.amenities.slice(0, 4).map((amenity, index) => (
                    <Badge 
                      key={index}
                      className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 text-sm hover:bg-blue-100 transition-colors"
                    >
                      {amenity}
                    </Badge>
                  ))}
                  {facility.amenities.length > 4 && (
                    <Badge 
                      variant="outline"
                      className="bg-gray-50 text-gray-600 border-gray-300 font-medium px-3 py-1 text-sm"
                    >
                      +{facility.amenities.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Bottom section */}
            <div className="flex items-center justify-between">
              {/* Dynamic fields based on configuration */}
              <div className="flex items-center gap-4 text-gray-600">
                {fieldConfigs
                  .filter(field => field.visible)
                  .slice(0, 2) // Show max 2 fields in list view
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
                      <div key={field.id} className="flex items-center gap-2">
                        {getIcon()}
                        <span className="font-medium text-base">
                          {getFieldValue()}
                          {getUnit() && ` ${getUnit()}`}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Action Buttons - aligned to the right */}
              <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                <button
                  onClick={handleFavorite}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                  aria-label={isFavorited ? "Fjern fra favoritter" : "Legg til favoritter"}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="h-9 w-9 p-0 hover:bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
                  aria-label="Del lokale"
                >
                  <Share2 className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Map Section - 3 columns */}
          <div className="col-span-3 bg-gray-100 relative overflow-hidden">
            <FacilityMiniMap 
              facility={facility}
              mapboxToken="pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

