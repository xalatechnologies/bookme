"use client";

import React from "react";
import { MapPin, Heart, Share2 } from "lucide-react";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FacilityHeaderProps {
  readonly name: string;
  readonly address: string;
  readonly type: string;
  readonly onShare: () => void;
  readonly isFavorited: boolean;
  readonly onToggleFavorite: () => void;
}

export const FacilityHeader = ({
  name,
  address,
  type,
  onShare,
  isFavorited,
  onToggleFavorite
}: FacilityHeaderProps): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <Badge variant="outline" className="bg-[#1e3a8a] bg-opacity-10 text-[#1e3a8a] border-[#1e3a8a]">
          {type}
        </Badge>
      </div>

      {/* Title with Like and Share buttons */}
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex-1 pr-4">{name}</h1>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFavorite}
            className={`px-3 py-2 h-auto transition-all duration-200 hover:scale-105 ${
              isFavorited
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">
              {isFavorited ? t('actions.liked') : t('actions.like')}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="px-3 py-2 h-auto bg-white border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 hover:scale-105"
          >
            <Share2 className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {t('actions.share')}
            </span>
          </Button>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center text-gray-600">
        <MapPin className="h-5 w-5 mr-2" />
        <span>{address}</span>
      </div>
    </div>
  );
};
