"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Zone } from '@/types/booking';

interface ZoneState {
  readonly zones: readonly Zone[];
  readonly addZone: (zone: Zone) => void;
  readonly updateZone: (zoneId: string, updates: Partial<Zone>) => void;
  readonly deleteZone: (zoneId: string) => void;
  readonly getZonesForFacility: (facilityId: string) => readonly Zone[];
  readonly clearAllZones: () => void;
}

export const useZoneStore = create<ZoneState>()(
  persist(
    (set, get) => ({
      zones: [],

      addZone: (zone: Zone): void => {
        set((state) => ({
          zones: [...state.zones, zone]
        }));
      },

      updateZone: (zoneId: string, updates: Partial<Zone>): void => {
        set((state) => ({
          zones: state.zones.map((zone) =>
            zone.id === zoneId ? { ...zone, ...updates } : zone
          )
        }));
      },

      deleteZone: (zoneId: string): void => {
        set((state) => ({
          zones: state.zones.filter((zone) => zone.id !== zoneId)
        }));
      },

      getZonesForFacility: (facilityId: string): readonly Zone[] => {
        return get().zones.filter((zone) => zone.facilityId === facilityId);
      },

      clearAllZones: (): void => {
        set({ zones: [] });
      }
    }),
    {
      name: 'zone-storage',
      version: 1
    }
  )
);
