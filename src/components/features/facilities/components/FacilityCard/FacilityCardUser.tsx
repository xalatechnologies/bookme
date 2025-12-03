"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  Heart,
  Calendar,
  Eye} from "lucide-react";
import FacilityCardBase from "./FacilityCardBase";
import { useFacilityActions } from "@/hooks/features/facilities";
import { useAuth } from "@/contexts/hooks/useAuth";

interface IFacilityCardUserProps {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly type: string;
  readonly capacity: number;
  readonly image: string;
  readonly description?: string;
  readonly availability?: "available" | "busy" | "full";
  readonly slug?: string;
}

const FacilityCardUser = (props: IFacilityCardUserProps): JSX.Element => {
  const { t } = useTranslation(['facility']);
  const { user } = useAuth();

  const {
    id,
    name,
    address,
    type,
    capacity,
    image,
    description,
    slug
  } = props;

  // Use facility actions hook
  const {
    isAnimating,
    isFacilityFavorite,
    handleViewDetails,
    handleBookNow,
    handleToggleFavorite,
  } = useFacilityActions({
    id,
    name,
    type,
    capacity,
    slug
  });



  return (
    <FacilityCardBase
      id={id}
      name={name}
      address={address}
      type={type}
      capacity={capacity}
      amenities={[]} // Empty array to remove amenities
      image={image}
      rating={undefined}
      price={undefined}
      description={description}
    >
      {/* Top Right Actions - Positioned above hover overlay for accessibility */}
      <div className="absolute top-3 right-3 flex flex-col space-y-2 z-20">
        {user && (
          <Button
            size="sm"
            variant="secondary"
            className={`w-8 h-8 p-0 bg-white/90 hover:bg-white transition-all z-30 ${isAnimating ? "scale-110" : ""
              }`}
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${isFacilityFavorite
                ? "text-red-500 fill-current"
                : "text-gray-600 hover:text-red-500"
                }`}
            />
          </Button>
        )}
      </div>

      {/* Action Buttons Overlay - Lower z-index to not interfere with top actions */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 z-10">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            onClick={handleViewDetails}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('facility:buttons.view_details')}
          </Button>

          <PrimaryButton
            size="sm"
            onClick={handleBookNow}
          >
            <Calendar className="h-4 w-4 mr-1" />
            {t('facility:buttons.book_now')}
          </PrimaryButton>
        </div>
      </div>
    </FacilityCardBase>
  );
};

export default FacilityCardUser;