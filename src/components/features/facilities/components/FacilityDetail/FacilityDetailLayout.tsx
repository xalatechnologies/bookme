"use client";

import React from "react";

import type { Database } from "@/types/database";
import type { Zone } from "@/services/supabase/types";

// Use Supabase facility type
type Facility = Database['public']['Tables']['facilities']['Row'];

import GalleryHeader from "./GalleryHeader";
import { FacilityInfoTabs } from "./FacilityInfoTabs";

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
  onToggleFavorite,
}: FacilityDetailLayoutProps): JSX.Element => {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl">
      <GalleryHeader
        title={facility.name}
        venueType={facility.facility_type || ''}
        address={facility.address || ''}
        images={(facility.images as string[] | null) || []}
        isFavorited={isFavorited}
        onShare={onShare}
        onToggleFavorite={onToggleFavorite}
      />
      
      {/* Main Content Layout - Full Width */}
      <div className="grid grid-cols-1 gap-8 mb-12">
        <div className="space-y-6">
          <FacilityInfoTabs
            description={facility.description || ''}
            capacity={facility.capacity || 0}
            equipment={[]}
            zones={zones.map(zone => ({
              id: zone.id,
              name: zone.name,
              facilityId: zone.facility_id,
              capacity: zone.capacity,
              pricePerHour: zone.price_per_hour_cents / 100,
              area: zone.area_sqm || undefined,
              description: zone.description || undefined,
              amenities: (zone.amenities as string[] | undefined) || [],
              availability: {
                monday: { start: "08:00", end: "22:00" },
                tuesday: { start: "08:00", end: "22:00" },
                wednesday: { start: "08:00", end: "22:00" },
                thursday: { start: "08:00", end: "22:00" },
                friday: { start: "08:00", end: "22:00" },
                saturday: { start: "08:00", end: "22:00" },
                sunday: { start: "08:00", end: "22:00" }
              }
            }))}
            amenities={(facility.amenities as string[] | null) || []}
            area={`${facility.capacity || 0} personer`}
            suitableFor={[]}
            facilityId={facility.id}
            facilityName={facility.name}
          address={facility.address || ''}
          latitude={facility.lat}
          longitude={facility.lng}
            showBookingInterface={true}
            contactEmail={facility.contact_email}
            contactPhone={facility.contact_phone}
          />
        </div>
      </div>
    </div>
  );
};