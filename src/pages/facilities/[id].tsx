"use client";

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/i18n";
import type { RecurrencePattern } from "@/utils/recurrenceEngine";

import { useFacility } from "@/hooks/useFacility";
import { useZones } from "@/hooks/useZones";
import { CartProvider } from "@/contexts/CartContext";
import { GlobalHeader } from "@/components/GlobalHeader";
import { FacilityDetailLayout } from "@/components/facility/detail/FacilityDetailLayout";
import { FacilityDetailBreadcrumb } from "@/components/facility/detail/FacilityDetailBreadcrumb";
import { FacilityDetailCalendar } from "@/components/facility/detail/FacilityDetailCalendar";
import { MobileBookingPanel } from "@/components/facility/detail/MobileBookingPanel";
import { LoadingState, ErrorState } from "@/components/facility/detail/FacilityDetailStates";

export const FacilityDetail = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<RecurrencePattern>({
    type: 'weekly',
    weekdays: [],
    timeSlots: [],
    interval: 1
  });
  const { t } = useTranslation();

  // Use hooks to fetch data
  const { facility, loading, error, notFound } = useFacility(id || '');
  const { zones, loading: zonesLoading } = useZones(id || '');

  // Handle share functionality
  const handleShare = async (): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: facility?.name || 'BookMe Facility',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Optional: Show a toast notification that link was copied
      }
    } catch (error) {
      // Handle share cancellation or other errors silently
      if (error instanceof Error && error.name !== 'AbortError') {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {
        }
      }
    }
  };

  // Handle loading state
  if (loading || zonesLoading) {
    return <LoadingState />;
  }

  // Handle error states
  if (error || notFound || !facility) {
    return <ErrorState error={error || undefined} notFound={notFound || !facility} />;
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
          capacity={facility.capacity} 
          area={`${facility.capacity} personer`}
          openingHours="08:00 - 22:00" 
        />
      </div>
    </CartProvider>
  );
};

