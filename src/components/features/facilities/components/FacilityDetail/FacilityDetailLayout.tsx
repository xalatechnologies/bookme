"use client";

import React from "react";

import type { IFacility } from "@/stores/facilityStore";
import type { Zone } from "@/types/booking";

// Alias for backward compatibility
type Facility = IFacility;

import { AirBnbStyleGallery } from "../FacilityImageGallery/AirBnbStyleGallery";
import { FacilityHeader } from "./FacilityHeader";
import { FacilityInfoTabs } from "./FacilityInfoTabs";
import { FacilityContactInfo } from "./FacilityContactInfo";

interface FacilityDetailLayoutProps {
  readonly facility: Facility;
  readonly zones: readonly Zone[];
  readonly onShare: () => void;
  readonly isFavorited: boolean;
  readonly onToggleFavorite: () => void;
  readonly showBookingInterface?: boolean;
}

export const FacilityDetailLayout = ({
  facility,
  zones,
  onShare,
  isFavorited,
  onToggleFavorite,
  showBookingInterface = false
}: FacilityDetailLayoutProps): JSX.Element => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Full Width Gallery Section */}
      <div className="w-full mb-8">
        <AirBnbStyleGallery images={facility.images} facilityName={facility.name} />
      </div>

      {/* Facility Header - Title, Tags, Address */}
      <div className="mb-8">
        <FacilityHeader 
          name={facility.name} 
          address={facility.address} 
          type={facility.type}
          onShare={onShare} 
          isFavorited={isFavorited} 
          onToggleFavorite={onToggleFavorite} 
        />
      </div>

      {/* Main Content Layout - Full Width */}
      <div className="mb-12">
        <FacilityInfoTabs 
          description={facility.description} 
          capacity={facility.capacity} 
          equipment={[]} 
          zones={zones} 
          amenities={facility.amenities} 
          address={facility.address} 
          area={`${facility.capacity} personer`}
          suitableFor={[]} 
          facilityId={facility.id.toString()} 
          facilityName={facility.name}
          contactInfo={facility}
        />
      </div>
    </div>
  );
};