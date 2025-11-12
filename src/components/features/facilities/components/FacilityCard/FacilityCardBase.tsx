"use client";

import React from "react";
import { MapPin, Users, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useFacilityTypeTranslation } from "@/hooks/shared/useFacilityTypeTranslation";

interface IFacilityCardBaseProps {
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
  readonly children?: React.ReactNode;
}

const FacilityCardBase = (props: IFacilityCardBaseProps): JSX.Element => {
  const { t } = useTranslation(['facility']);
  const translateFacilityType = useFacilityTypeTranslation();
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    id: _id,
    name,
    address,
    type,
    capacity,
    amenities,
    image,
    rating,
    price,
    description,
    children
  } = props;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        
        {/* Type Badge - only render if type is not empty */}
        {type && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-600 text-white">
              {translateFacilityType(type)}
            </Badge>
          </div>
        )}
        
        {/* Children (favorite, share buttons, etc.) */}
        {children}
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          {rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {rating}
              </span>
            </div>
          )}
        </div>
        
        {/* Address */}
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {address}
          </span>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Capacity and Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {capacity} {t('facility:card.people')}
            </span>
          </div>
          {price && (
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {price}
            </span>
          )}
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1">
          {amenities.slice(0, 3).map((amenity, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {amenities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{amenities.length - 3} {t('facility:card.more')}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacilityCardBase;