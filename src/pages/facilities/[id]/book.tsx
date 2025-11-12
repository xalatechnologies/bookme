"use client";

// External libraries
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Internal libraries/utilities
import { useTranslation } from "react-i18next";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import { useFacility } from "@/components/features/facilities/hooks";
import { useZones } from "@/components/features/facilities/hooks";
import { CartProvider } from "@/contexts/CartContext";
import type { Database, Json } from "@/types/database";
import { GlobalHeader } from "@/components/layouts/PublicLayout/GlobalHeader";
import { FacilityDetailLayout } from "@/components/features/facilities/components/FacilityDetail/FacilityDetailLayout";
import { FacilityDetailBreadcrumb } from "@/components/features/facilities/components/FacilityDetail/FacilityDetailBreadcrumb";
import {
  LoadingState,
  ErrorState,
} from "@/components/features/facilities/components/FacilityDetail/FacilityDetailStates";

/**
 * Facility booking page
 *
 * This page allows users to book a specific facility. It displays
 * the facility details and provides a booking interface similar
 * to the facility detail page but focused on booking.
 *
 * Features:
 * - Facility information display
 * - Booking calendar interface
 * - Zone selection
 * - Booking form
 * - Price calculation
 * - Cart integration
 *
 * @returns JSX.Element
 */
export const FacilityBooking = (): JSX.Element => {
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
  const { zones, loading: zonesLoading } = useZones(id || "");

  /**
   * Handle share functionality
   *
   * Shares the facility booking page using native share API
   * or falls back to clipboard copy.
   */
  const handleShare = async (): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: facility?.name || "Booknor Facility",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(window.location.href);
        } catch (clipboardError) {}
      }
    }
  };

  /**
   * Handle pattern changes for recurring bookings
   *
   * @param pattern - New recurrence pattern
   */
  const handlePatternApply = (pattern: RecurrencePattern): void => {
    setCurrentPattern(pattern);
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

  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <GlobalHeader />

        {/* Breadcrumb Navigation */}
        <FacilityDetailBreadcrumb
          facilityName={facility.name}
          showBookingPage={true}
        />

        {/* Main Content */}
        <div className="flex-grow pb-20 lg:pb-0">
          <FacilityDetailLayout
            facility={facility}
            zones={zones.map(zone => ({
              id: zone.id,
              name: zone.name,
              facility_id: facility.id,
              capacity: zone.capacity,
              price_per_hour_cents: zone.pricePerHour * 100,
              area_sqm: zone.area || null,
              description: zone.description || null,
              amenities: zone.amenities as Json,
              status: 'active',
              org_id: facility.org_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }))}
            onShare={handleShare}
            isFavorited={isFavorited}
            onToggleFavorite={() => setIsFavorited(!isFavorited)}
            showBookingInterface={true}
          />
        </div>
      </div>
    </CartProvider>
  );
};

export default FacilityBooking;
