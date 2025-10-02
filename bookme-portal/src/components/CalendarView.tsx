"use client";

// External imports
import React, { useState, useCallback } from "react";
import { isSameDay } from 'date-fns';

// Internal imports
import type { SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';
import { useCalendarView } from '@/hooks/useCalendarView';
import { useSlotSelection } from '@/hooks/useSlotSelection';

// Sibling imports
import { Card } from './ui/card';
import { ViewHeader } from "./search/ViewHeader";
import { Accordion } from "./ui/accordion";
import { FacilityAccordionContent } from "./calendar/FacilityAccordionContent";

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
    const dateStr = date.toISOString().split('T')[0];
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
          title: 'Eksisterende booking',
          startTime: timeSlot.split('-')[0],
          endTime: timeSlot.split('-')[1],
          description: 'Dette tidspunktet er allerede booket'
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

    // Create enhanced slot with complete data
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
      const enhancedSlot: SelectedTimeSlot = {
        zoneId,
        date,
        timeSlot,
        facilityId: facility.id,
        facilityName: facility.name,
        zoneName: zone.name,
        pricePerHour: zone.pricePerHour
      };
      
      handleBulkSlotSelection([enhancedSlot]);
    }
  }, [allZones, facilitiesWithZones, selectedSlots, handleSlotClick, handleBulkSlotSelection]);

  // Enhanced bulk slot selection handler
  const handleEnhancedBulkSlotSelection = useCallback((slots: readonly SelectedTimeSlot[]): void => {
    const enhancedSlots = slots.map(slot => {
      const zone = allZones.find(z => z.id === slot.zoneId);
      const facility = facilitiesWithZones.find(f => f.zones.some(z => z.id === slot.zoneId))?.facility;
      
      return {
        ...slot,
        facilityId: facility?.id || slot.facilityId,
        facilityName: facility?.name || slot.facilityName,
        zoneName: zone?.name || slot.zoneName,
        pricePerHour: zone?.pricePerHour || slot.pricePerHour
      };
    });
    
    handleBulkSlotSelection(enhancedSlots);
  }, [allZones, facilitiesWithZones, handleBulkSlotSelection]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 my-[12px]">
        <ViewHeader 
          facilityCount={0}
          isLoading={true}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Laster kalender...</p>
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
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Feil ved lasting av kalender</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 my-[12px]">
      <ViewHeader 
        facilityCount={facilitiesWithZones.length}
        isLoading={isLoading}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {facilitiesWithZones.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ingen fasiliteter funnet</h3>
            <p className="text-gray-600">Prøv å justere søkekriteriene dine</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selected Slots Summary */}
          {selectedSlots.length > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Valgte tidspunkt: {selectedSlots.length}</h4>
                  <p className="text-sm text-gray-600">
                    Total pris: {selectedSlots.reduce((sum, slot) => sum + slot.pricePerHour, 0)} kr
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Fjern alle
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                  >
                    Gå til bestilling
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Accordion for each facility */}
          <Accordion 
            type="multiple" 
            defaultValue={[`facility-${facilitiesWithZones[0]?.facility.id}`]} 
            className="w-full space-y-4"
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
      )}
    </div>
  );
};

