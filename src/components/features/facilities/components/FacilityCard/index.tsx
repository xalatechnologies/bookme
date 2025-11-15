"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Heart, Share2 } from "lucide-react";

import { useTranslation } from "react-i18next";
import type { Database } from "@/types/database";
import { useFieldConfigStore } from "@/stores/fieldConfigStore";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getFieldUnit,
  generateShareUrl,
  copyToClipboard,
} from "@/components/features/facilities/utils/formatters";
import { useAmenityTranslation } from "@/hooks/shared";
import { useFacilityTypeTranslation } from "@/hooks/shared/useFacilityTypeTranslation";
import { useAuth } from "@/contexts/hooks/useAuth";

// Import the favorites store
import { useFavoritesStore } from "@/stores/favoritesStore";

type Facility = Database['public']['Tables']['facilities']['Row'];

interface FacilityCardProps {
  readonly facility: Facility;
  readonly onAddressClick: (e: React.MouseEvent, facility: Facility) => void;
  readonly viewMode?: "grid" | "list";
}

/**
 * FacilityCard Component
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Displays facility information only
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Uses i18n translations for text content
 */
export const FacilityCard = ({
  facility,
  onAddressClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewMode: _viewMode = "grid",
}: FacilityCardProps): JSX.Element => {
  const { t } = useTranslation(["facility", "common"]);
  const { user } = useAuth();
  const translateAmenity = useAmenityTranslation();
  const translateFacilityType = useFacilityTypeTranslation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Use the favorites store instead of local state
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const isFavorited = isFavorite(facility.id);

  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facility.id);

  const handleCardClick = (): void => {
    // Use slug for SEO-friendly URLs, fallback to id for backward compatibility
    const facilityPath = facility.slug || facility.id;
    navigate(`/facilities/${facilityPath}`);
  };

  const handleShare = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    try {
      const facilityPath = facility.slug || facility.id;
      const shareUrl = generateShareUrl(`/facilities/${facilityPath}`);

      if (navigator.share) {
        await navigator.share({
          title: facility.name,
          url: shareUrl,
        });
      } else {
        await copyToClipboard(shareUrl);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          const facilityPath = facility.slug || facility.id;
          const shareUrl = generateShareUrl(`/facilities/${facilityPath}`);
          await copyToClipboard(shareUrl);
        } catch (clipboardError) {
          console.error("Failed to share or copy:", clipboardError);
        }
      }
    }
  };

  const handleFavorite = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    if (user) {
      await toggleFavorite(facility.id);
    }
  };

  const getFieldValue = (fieldKey: string): string | number => {
    const valueMap: Record<string, string | number> = {
      capacity: facility.capacity || 0,
      rating: facility.rating || 0,
      reviewCount: facility.review_count || 0,
    };
    return valueMap[fieldKey] || "";
  };

  const getFieldIcon = (fieldKey: string): JSX.Element => {
    const iconMap: Record<string, JSX.Element> = {
      capacity: <Users className="h-5 w-5" />,
      area: <MapPin className="h-5 w-5" />,
      pricePerHour: <span className="text-gray-400">💰</span>,
      rating: <span className="text-yellow-500">★</span>,
      reviewCount: <span className="text-gray-400">📝</span>,
    };
    return iconMap[fieldKey] || <span className="text-gray-400">📋</span>;
  };

  const translationKeys = {
    people: t("facility:card.people"),
    squareMeters: t("facility:card.squareMeters"),
    pricePerHour: t("facility:card.pricePerHour"),
    outOf5: t("facility:card.outOf5"),
    reviewCount: t("facility:card.reviewCount"),
    yes: t("facility:card.yes"),
    no: t("facility:card.no"),
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] border-0 shadow-lg bg-white relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 h-full flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={t("facility:card.viewDetailsFor", {
        name: facility.name,
        address: facility.address,
      })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <img
          src={(facility.images && Array.isArray(facility.images) && facility.images.length > 0 ? facility.images[0] as string : "/placeholder.svg")}
          alt={facility.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        {/* Overlay buttons - only show favorite button when user is logged in */}
        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 flex gap-1 sm:gap-2">
          {user && (
            <button
              onClick={handleFavorite}
              className="p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
              aria-label={t("facility:card.addToFavorites")}
            >
              <Heart
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            aria-label={t("facility:card.shareFacility")}
          >
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
          </button>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
          <Badge className="bg-blue-600 text-white font-medium px-2 py-1 text-xs sm:text-sm">
            {translateFacilityType(facility.facility_type || '')}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6">
        {/* Facility Name */}
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 line-clamp-2">
          {facility.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 text-gray-600 hover:text-blue-600 transition-colors group/location">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover/location:text-blue-500 flex-shrink-0" />
          <span
            className="text-sm sm:text-base font-medium line-clamp-1 cursor-pointer"
            onClick={(e) => onAddressClick(e, facility)}
          >
            {facility.address}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 line-clamp-2">
          {facility.description}
        </p>

        {/* Amenities Tags */}
        {facility.amenities && Array.isArray(facility.amenities) && facility.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-5">
            {facility.amenities.slice(0, 3).map((amenity, index) => (
              <Badge
                key={index}
                className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-2 py-1 text-xs sm:text-sm hover:bg-blue-100 transition-colors"
              >
                {translateAmenity(amenity as string)}
              </Badge>
            ))}
            {facility.amenities.length > 3 && (
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-600 border-gray-300 font-medium px-2 py-1 text-xs sm:text-sm"
              >
                +{facility.amenities.length - 3}{" "}
                {t("facility:card.moreAmenities")}
              </Badge>
            )}
          </div>
        )}

        {/* Dynamic fields based on configuration */}
        <div className="space-y-2 mt-auto">
          {fieldConfigs
            .filter((field) => field.visible)
            .map((field) => {
              const value = getFieldValue(field.key);
              const unit = getFieldUnit(field.key, translationKeys);
              const booleanValue =
                typeof field.value === "boolean"
                  ? field.value
                    ? translationKeys.yes
                    : translationKeys.no
                  : "";

              return (
                <div
                  key={field.id}
                  className="flex items-center gap-2 sm:gap-3 text-gray-600"
                >
                  {getFieldIcon(field.key)}
                  <span className="text-sm sm:text-base font-medium">
                    {t(field.label as any)}: {value || booleanValue}
                    {unit && ` ${unit}`}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div
        className={`absolute inset-0 rounded-xl border-2 border-blue-400 transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </Card>
  );
};