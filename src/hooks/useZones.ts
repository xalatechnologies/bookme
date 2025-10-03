"use client";

// External imports
import { useState, useEffect } from 'react';

// Internal imports
import type { Zone } from '@/components/booking/types';
import { getZonesForFacility } from '@/data/zones/dummyZones';

interface ZonesState {
  readonly zones: readonly Zone[];
  readonly loading: boolean;
  readonly error: string | null;
}

export const useZones = (facilityId: string | number): ZonesState => {
  const [state, setState] = useState<ZonesState>({
    zones: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchZones = async (): Promise<void> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get zones for the facility from dummy data
        const facilityIdStr = typeof facilityId === 'number' ? facilityId.toString() : facilityId;
        const dummyZones = getZonesForFacility(facilityIdStr);
        
        // Convert to BookingZone format
        const zones: readonly Zone[] = dummyZones.map(zone => ({
          id: zone.id,
          name: zone.name,
          facilityId: zone.facilityId,
          capacity: zone.capacity,
          pricePerHour: zone.pricePerHour,
          description: `${zone.name} - Kapasitet: ${zone.capacity} personer`,
          area: `${zone.capacity} m²`,
          isMainZone: true,
          subZones: [],
          equipment: [],
          amenities: zone.amenities,
          bookingRules: {
            minBookingDuration: 1,
            maxBookingDuration: 8,
            allowedTimeSlots: ['08:00-09:00', '09:00-10:00', '10:00-11:00'],
            bookingTypes: ['standard'],
            advanceBookingDays: 30,
            cancellationHours: 24
          },
          adminInfo: {
            contactPersonName: 'Admin',
            contactPersonEmail: 'admin@bookme.no',
            specialInstructions: '',
            maintenanceSchedule: []
          },
          layout: {
            coordinates: { x: 0, y: 0, width: 100, height: 100 },
            entryPoints: ['main']
          },
          accessibility: [],
          features: [],
          isActive: true
        }));

        setState({
          zones,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          zones: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    };

    if (facilityId) {
      fetchZones();
    }
  }, [facilityId]);

  return state;
};
