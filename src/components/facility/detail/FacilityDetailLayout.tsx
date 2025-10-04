"use client";

import React from "react";

import type { IFacility } from "@/stores/facilityStore";
import type { Zone } from "@/components/booking/types";

// Alias for backward compatibility
type Facility = IFacility;

import { AirBnbStyleGallery } from "../AirBnbStyleGallery";
import { FacilityHeader } from "../FacilityHeader";
import { FacilityInfoTabs } from "./FacilityInfoTabs";
import { FacilityContactInfo } from "../FacilityContactInfo";

interface FacilityDetailLayoutProps {
  readonly facility: Facility;
  readonly zones: readonly Zone[];
  readonly onShare: () => void;
  readonly isFavorited: boolean;
  readonly onToggleFavorite: () => void;
}

export const FacilityDetailLayout = ({
  facility,
  zones,
  onShare,
  isFavorited,
  onToggleFavorite
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

      {/* Main Content Layout - 70% / 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-12">
        {/* Left Column - Tabs Content (70%) */}
        <div className="lg:col-span-7 space-y-6">
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
          />
        </div>

        {/* Right Column - Contact Info Sidebar (30%) */}
        <div className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-6">
            <FacilityContactInfo 
              facilityName={facility.name} 
              address={facility.address} 
              openingHours={facility.openingHours || "08:00 - 22:00"}
              contactEmail={facility.contactEmail}
              emergencyContact={facility.emergencyContact}
            />
          </div>
        </div>
      </div>
    </div>
  );
};