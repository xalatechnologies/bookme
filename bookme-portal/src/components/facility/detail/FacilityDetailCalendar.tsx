"use client";

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSameDay } from 'date-fns';

import { useTranslation } from '@/i18n';
import type { Zone as BookingZone } from '@/components/booking/types';
import type { Zone } from '@/types/booking';
import type { RecurrencePattern } from '@/utils/recurrenceEngine';
import type { SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';
import { useSlotSelection } from '@/hooks/useSlotSelection';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/shared/Calendar';

interface FacilityDetailCalendarProps {
  readonly zones: readonly BookingZone[];
  readonly facilityId: string;
  readonly facilityName: string;
  readonly timeSlotDuration?: number;
  readonly currentPattern?: RecurrencePattern;
  readonly onPatternChange?: (pattern: RecurrencePattern) => void;
  readonly onPatternApply?: (pattern: RecurrencePattern) => void;
}

export const FacilityDetailCalendar: React.FC<FacilityDetailCalendarProps> = ({
  zones,
  facilityId,
  facilityName,
  timeSlotDuration = 1,
  currentPattern,
  onPatternChange,
  onPatternApply
}): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const {
    selectedSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    isSlotSelected
  } = useSlotSelection();

  // Convert BookingZone[] to our Zone type
  const bookingZones: Zone[] = zones.map(zone => ({
    id: zone.id,
    name: zone.name,
    facilityId: facilityId,
    capacity: zone.capacity,
    pricePerHour: zone.pricePerHour,
    amenities: zone.amenities || [],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  }));

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

    const zone = bookingZones.find(z => z.id === zoneId);
    
    if (!zone) return;

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
        facilityId: facilityId,
        facilityName: facilityName,
        zoneName: zone.name,
        pricePerHour: zone.pricePerHour
      };
      
      handleBulkSlotSelection([enhancedSlot]);
    }
  }, [bookingZones, selectedSlots, handleSlotClick, handleBulkSlotSelection, facilityId, facilityName]);

  // Enhanced bulk slot selection handler
  const handleEnhancedBulkSlotSelection = useCallback((slots: readonly SelectedTimeSlot[]): void => {
    const enhancedSlots = slots.map(slot => {
      const zone = bookingZones.find(z => z.id === slot.zoneId);
      
      return {
        ...slot,
        facilityId: facilityId,
        facilityName: facilityName,
        zoneName: zone?.name || slot.zoneName,
        pricePerHour: zone?.pricePerHour || slot.pricePerHour
      };
    });
    
    handleBulkSlotSelection(enhancedSlots);
  }, [bookingZones, handleBulkSlotSelection, facilityId, facilityName]);

  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Book {facilityName}</h2>
          <p className="text-gray-600">Velg dato og tidspunkt for din booking</p>
        </div>

        {/* Selected Slots Summary */}
        {selectedSlots.length > 0 && (
          <Card className="p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">Valgte tidspunkt: {selectedSlots.length}</h4>
                <p className="text-sm text-gray-600">
                  Total pris: {selectedSlots.reduce((sum, slot) => sum + slot.pricePerHour, 0)} kr
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm"
                >
                  Fjern alle
                </Button>
                <Button
                  onClick={() => navigate('/checkout')}
                  className="px-4 py-2"
                >
                  Gå til bestilling
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Full Calendar */}
        <Calendar
          zones={bookingZones}
          selectedSlots={selectedSlots}
          onSlotClick={handleEnhancedSlotClick}
          onBulkSlotSelection={handleEnhancedBulkSlotSelection}
          getAvailabilityStatus={getAvailabilityStatus}
          isSlotSelected={isSlotSelected}
          timeSlotDuration={timeSlotDuration}
          showZoneSelector={bookingZones.length > 1}
          compact={false}
        />
      </div>
    </div>
  );
};
