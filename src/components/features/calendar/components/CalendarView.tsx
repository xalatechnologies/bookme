"use client";

// External libraries
import React, { useState, useCallback } from "react";
import { isSameDay } from 'date-fns';
import { useTranslation } from "react-i18next";

// Internal libraries/utilities
import type { ISelectedTimeSlot } from '@/components/features/bookings/types';
import type { AvailabilityStatus } from '@/types/booking';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useSlotSelection } from '@/hooks/useSlotSelection';
import { Card } from '@/components/ui/card';
import { ViewHeader } from "@/components/features/search/components/ViewHeader";
import { Accordion } from "@/components/ui/accordion";

// Sibling imports
import { FacilityAccordionContent } from "./FacilityCalendar/FacilityAccordionContent";

interface CalendarViewProps {
  readonly date?: Date;
  readonly facilityType: string;
  readonly location: string;
  readonly accessibility: string;
  readonly capacity: readonly number[];
  readonly viewMode: "grid" | "map" | "calendar" | "list";
  readonly setViewMode: (mode: "grid" | "map" | "calendar" | "list") => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  date,
  facilityType,
  location,
  accessibility,
  capacity,
  viewMode,
  setViewMode,
}): JSX.Element => {
  const { t } = useTranslation('calendar');
  // Fix the capacity type issue by ensuring it's properly typed as a tuple
  const capacityRange: [number, number] | undefined = capacity && Array.isArray(capacity) && capacity.length === 2
    ? [capacity[0], capacity[1]]
    : undefined;

  const {
    facilitiesWithZones,
    isLoading,
    error,
    allZones,
    navigate
  } = useCalendarView({
    facilityType: facilityType !== "all" ? facilityType : undefined,
    location: location !== "all" ? location : undefined,
    accessibility: accessibility !== "all" ? accessibility : undefined,
    capacity: capacityRange
  });

  // Use slot selection hook for managing selected slots
  const {
    selectedSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    isSlotSelected
  } = useSlotSelection();

  // Mock availability status function - in a real app this would fetch from API
  const getAvailabilityStatus = useCallback((zoneId: string, date: Date, timeSlot: string): AvailabilityStatus => {
    // Simple mock logic - make some slots busy for demonstration
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const hash = `${zoneId}-${dateStr}-${timeSlot}`.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    // Make about 20% of slots busy
    if (Math.abs(hash) % 5 === 0) {
      return {
        status: 'busy',
        conflict: {
          id: `conflict-${hash}`,
          type: 'booking',
          title: t('slot_selection.existing_booking'),
          startTime: timeSlot.split('-')[0],
          endTime: timeSlot.split('-')[1],
          description: t('slot_selection.time_not_available')
        }
      };
    }

    // Make weekend evenings unavailable
    const dayOfWeek = date.getDay();
    const hour = parseInt(timeSlot.split(':')[0]);
    if ((dayOfWeek === 0 || dayOfWeek === 6) && hour >= 20) {
      return { status: 'unavailable' };
    }

    return { status: 'available' };
  }, []);

  // Enhanced slot click handler that fills in missing data
  const handleEnhancedSlotClick = useCallback((zoneId: string, date: Date, timeSlot: string, availability: string): void => {
    if (availability !== 'available') return;

    const zone = allZones.find(z => z.id === zoneId);
    const facility = facilitiesWithZones.find(f => f.zones.some(z => z.id === zoneId))?.facility;

    if (!zone || !facility) return;

    // Create enhanced slot with complete data including id and duration
    const isAlreadySelected = selectedSlots.some(slot =>
      slot.zoneId === zoneId &&
      isSameDay(slot.date, date) &&
      slot.timeSlot === timeSlot
    );

    if (isAlreadySelected) {
      // Remove slot
      handleSlotClick(zoneId, date, timeSlot, availability);
    } else {
      // Add slot with complete data
      // Use local date components to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`;

      const enhancedSlot: ISelectedTimeSlot = {
        id: `${facility.id}-${zoneId}-${dayString}-${timeSlot}`,
        zoneId,
        date,
        timeSlot,
        facilityId: facility.id,
        facilityName: facility.name,
        zoneName: zone.name,
        pricePerHour: zone.pricePerHour,
        duration: 60 // Default 1 hour in minutes
      };

      handleBulkSlotSelection([enhancedSlot]);
    }
  }, [allZones, facilitiesWithZones, selectedSlots, handleSlotClick, handleBulkSlotSelection]);

  // Enhanced bulk slot selection handler
  const handleEnhancedBulkSlotSelection = useCallback((slots: readonly ISelectedTimeSlot[]): void => {
    const enhancedSlots = slots.map(slot => {
      const zone = allZones.find(z => z.id === slot.zoneId);
      const facility = facilitiesWithZones.find(f => f.zones.some(z => z.id === slot.zoneId))?.facility;

      // Use local date components for ID generation
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const day = String(slotDate.getDate()).padStart(2, '0');
      const dayString = `${year}-${month}-${day}`;

      return {
        ...slot,
        id: slot.id || `${facility?.id || slot.facilityId}-${slot.zoneId}-${dayString}-${slot.timeSlot}`,
        facilityId: facility?.id || slot.facilityId,
        facilityName: facility?.name || slot.facilityName || '',
        zoneName: zone?.name || slot.zoneName || '',
        pricePerHour: zone?.pricePerHour || slot.pricePerHour,
        duration: slot.duration || 60 // Default to 60 minutes if not specified
      };
    });

    handleBulkSlotSelection(enhancedSlots);
  }, [allZones, facilitiesWithZones, handleBulkSlotSelection]);

  // Cast viewMode for ViewHeader compatibility
  const viewHeaderMode = viewMode === "calendar" ? "list" : viewMode;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 my-[12px]">
        <ViewHeader
          facilityCount={0}
          isLoading={true}
          viewMode={viewHeaderMode}
          setViewMode={(mode) => setViewMode(mode === "list" && viewMode === "calendar" ? "calendar" : mode)}
        />
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('messages.loading_calendar')}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 my-[12px]">
        <ViewHeader
          facilityCount={0}
          isLoading={false}
          viewMode={viewHeaderMode}
          setViewMode={(mode) => setViewMode(mode === "list" && viewMode === "calendar" ? "calendar" : mode)}
        />
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('messages.loading_error')}</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 my-[12px]">
        <ViewHeader
          facilityCount={facilitiesWithZones.length}
          isLoading={isLoading}
          viewMode={viewHeaderMode}
          setViewMode={(mode) => setViewMode(mode === "list" && viewMode === "calendar" ? "calendar" : mode)}
        />
      </div>

      {facilitiesWithZones.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('slot_selection.no_facilities')}</h3>
              <p className="text-gray-600">{t('slot_selection.adjust_search')}</p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="w-full">
          {/* Selected Slots Summary */}
          {selectedSlots.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{t('slot_selection.selected_slots')}: {selectedSlots.length}</h4>
                    <p className="text-sm text-gray-600">
                      {t('slot_selection.total_price')}: {selectedSlots.reduce((sum, slot) => sum + slot.pricePerHour, 0)} kr
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      {t('slot_selection.remove_all')}
                    </button>
                    <button
                      onClick={() => navigate('/checkout')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                    >
                      {t('slot_selection.go_to_order')}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Full Width Calendar Section - Like facilities page */}
          <div className="w-full">
            <Accordion
              type="multiple"
              defaultValue={[`facility-${facilitiesWithZones[0]?.facility.id}`]}
              className="w-full"
            >
              {facilitiesWithZones.map(({ facility }) => (
                <FacilityAccordionContent
                  key={facility.id}
                  facility={facility}
                  selectedSlots={selectedSlots}
                  onSlotClick={handleEnhancedSlotClick}
                  onBulkSlotSelection={handleEnhancedBulkSlotSelection}
                  getAvailabilityStatus={getAvailabilityStatus}
                  isSlotSelected={isSlotSelected}
                  onClearSlots={clearSelection}
                  onRemoveSlot={(zoneId: string, date: Date, timeSlot: string) => {
                    handleEnhancedSlotClick(zoneId, date, timeSlot, 'available');
                  }}
                />
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
};
