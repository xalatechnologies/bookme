"use client";

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";

import { useFacility } from "@/components/features/facilities/hooks";
import { useZones } from "@/components/features/facilities/hooks";
import { CartProvider } from "@/contexts/CartContext";
import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import { FacilityDetailLayout } from "@/components/features/facilities/components/FacilityDetail/FacilityDetailLayout";
import { FacilityDetailBreadcrumb } from "@/components/features/facilities/components/FacilityDetail/FacilityDetailBreadcrumb";
import { FacilityDetailCalendar } from "@/components/features/facilities/components/FacilityDetail/FacilityDetailCalendar";
import { MobileBookingPanel } from "@/components/features/facilities/components/FacilityDetail/MobileBookingPanel";
import {
  LoadingState,
  ErrorState,
} from "@/components/features/facilities/components/FacilityDetail/FacilityDetailStates";

export const FacilityDetail = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<RecurrencePattern>({
    type: "weekly",
    weekdays: [],
    timeSlots: [],
    interval: 1,
  });
  const { t } = useTranslation("common");

  // Use hooks to fetch data
  const { facility, loading, error, notFound } = useFacility(id || "");
  // Use facility UUID for zones query (not the slug from URL)
  const { zones, loading: zonesLoading } = useZones(facility?.id || "");

  // Handle share functionality
  const handleShare = async (): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: facility?.name || "BookMe Facility",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Optional: Show a toast notification that link was copied
      }
    } catch (error) {
      // Handle share cancellation or other errors silently
      if (error instanceof Error && error.name !== "AbortError") {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {}
      }
    }
  };

  // Handle loading state
  if (loading || zonesLoading) {
    return <LoadingState />;
  }

  // Handle error states
  if (error || notFound || !facility) {
    return (
      <ErrorState error={error || undefined} notFound={notFound || !facility} />
    );
  }

  // Handle pattern changes
  const handlePatternApply = (pattern: RecurrencePattern): void => {
    setCurrentPattern(pattern);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <GlobalHeader />

        {/* Breadcrumb Navigation */}
        <FacilityDetailBreadcrumb facilityName={facility.name} />

        {/* Main Content */}
        <div className="flex-grow pb-20 lg:pb-0">
          <FacilityDetailLayout
            facility={facility}
            zones={zones}
            onShare={handleShare}
            isFavorited={isFavorited}
            onToggleFavorite={() => setIsFavorited(!isFavorited)}
          />

          {/* Calendar is now integrated in the tabs */}
        </div>

        {/* Mobile Booking Panel */}
        <MobileBookingPanel
          facilityName={facility.name}
          facilityId={facility.id}
          capacity={facility.capacity || 0}
          area={`${facility.capacity || 0} ${t("details.people", {
            ns: "facility",
          })}`}
          openingHours="08:00 - 22:00"
        />
      </div>
    </CartProvider>
  );
};

export default FacilityDetail;
