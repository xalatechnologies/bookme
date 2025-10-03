"use client";

import type { Zone } from '@/types/booking';

export const dummyZones: readonly Zone[] = [
  {
    id: "zone-1-1",
    name: "Hovedhall",
    facilityId: "1",
    capacity: 200,
    pricePerHour: 850,
    amenities: ["Garderober", "Dusj", "Parkering", "Lyd/lys", "Tribuner"],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  },
  {
    id: "zone-1-2",
    name: "Sidehall",
    facilityId: "1",
    capacity: 50,
    pricePerHour: 450,
    amenities: ["Garderober", "Dusj"],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  },
  {
    id: "zone-2-1",
    name: "Hovedsal",
    facilityId: "2",
    capacity: 150,
    pricePerHour: 1200,
    amenities: ["Scene", "Lyd/lys", "Projektor", "Kjøkken", "Garderober"],
    availability: {
      monday: { start: "09:00", end: "23:00" },
      tuesday: { start: "09:00", end: "23:00" },
      wednesday: { start: "09:00", end: "23:00" },
      thursday: { start: "09:00", end: "23:00" },
      friday: { start: "09:00", end: "24:00" },
      saturday: { start: "10:00", end: "24:00" },
      sunday: { start: "12:00", end: "22:00" }
    }
  },
  {
    id: "zone-2-2",
    name: "Sidescene",
    facilityId: "2",
    capacity: 50,
    pricePerHour: 600,
    amenities: ["Lyd/lys", "Garderober"],
    availability: {
      monday: { start: "09:00", end: "23:00" },
      tuesday: { start: "09:00", end: "23:00" },
      wednesday: { start: "09:00", end: "23:00" },
      thursday: { start: "09:00", end: "23:00" },
      friday: { start: "09:00", end: "24:00" },
      saturday: { start: "10:00", end: "24:00" },
      sunday: { start: "12:00", end: "22:00" }
    }
  },
  {
    id: "zone-3-1",
    name: "Hovedbane",
    facilityId: "3",
    capacity: 100,
    pricePerHour: 750,
    amenities: ["Garderober", "Dusj", "Parkering", "Utstyr"],
    availability: {
      monday: { start: "06:00", end: "23:00" },
      tuesday: { start: "06:00", end: "23:00" },
      wednesday: { start: "06:00", end: "23:00" },
      thursday: { start: "06:00", end: "23:00" },
      friday: { start: "06:00", end: "23:00" },
      saturday: { start: "08:00", end: "22:00" },
      sunday: { start: "08:00", end: "22:00" }
    }
  },
  {
    id: "zone-4-1",
    name: "Hovedrom",
    facilityId: "4",
    capacity: 80,
    pricePerHour: 950,
    amenities: ["Projektor", "Lyd/lys", "Kjøkken", "Parkering"],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  },
  {
    id: "zone-5-1",
    name: "Hovedbasseng",
    facilityId: "5",
    capacity: 60,
    pricePerHour: 1100,
    amenities: ["Garderober", "Dusj", "Redningsutstyr", "Parkering"],
    availability: {
      monday: { start: "06:00", end: "22:00" },
      tuesday: { start: "06:00", end: "22:00" },
      wednesday: { start: "06:00", end: "22:00" },
      thursday: { start: "06:00", end: "22:00" },
      friday: { start: "06:00", end: "22:00" },
      saturday: { start: "08:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  },
  {
    id: "zone-6-1",
    name: "Tennisbane 1",
    facilityId: "6",
    capacity: 20,
    pricePerHour: 380,
    amenities: ["Innendørs", "Profesjonell underlag", "Garderober", "Utstyr utleie"],
    availability: {
      monday: { start: "07:00", end: "23:00" },
      tuesday: { start: "07:00", end: "23:00" },
      wednesday: { start: "07:00", end: "23:00" },
      thursday: { start: "07:00", end: "23:00" },
      friday: { start: "07:00", end: "23:00" },
      saturday: { start: "08:00", end: "22:00" },
      sunday: { start: "09:00", end: "21:00" }
    }
  },
  {
    id: "zone-7-1",
    name: "Hovedbane",
    facilityId: "7",
    capacity: 150,
    pricePerHour: 650,
    amenities: ["Garderober", "Dusj", "Parkering", "Tribuner"],
    availability: {
      monday: { start: "06:00", end: "22:00" },
      tuesday: { start: "06:00", end: "22:00" },
      wednesday: { start: "06:00", end: "22:00" },
      thursday: { start: "06:00", end: "22:00" },
      friday: { start: "06:00", end: "22:00" },
      saturday: { start: "08:00", end: "20:00" },
      sunday: { start: "09:00", end: "19:00" }
    }
  },
  {
    id: "zone-8-1",
    name: "Hovedsal",
    facilityId: "8",
    capacity: 300,
    pricePerHour: 1500,
    amenities: ["Scene", "Lyd/lys", "Projektor", "Kjøkken", "Garderober", "Parkering"],
    availability: {
      monday: { start: "08:00", end: "24:00" },
      tuesday: { start: "08:00", end: "24:00" },
      wednesday: { start: "08:00", end: "24:00" },
      thursday: { start: "08:00", end: "24:00" },
      friday: { start: "08:00", end: "24:00" },
      saturday: { start: "10:00", end: "24:00" },
      sunday: { start: "12:00", end: "22:00" }
    }
  },
  {
    id: "zone-9-1",
    name: "Hovedhall",
    facilityId: "9",
    capacity: 100,
    pricePerHour: 750,
    amenities: ["Garderober", "Dusj", "Parkering", "Lyd/lys"],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  },
  {
    id: "zone-10-1",
    name: "Hovedrom",
    facilityId: "10",
    capacity: 50,
    pricePerHour: 450,
    amenities: ["Projektor", "Lyd/lys", "Kjøkken", "Garderober"],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    }
  }
] as const;

// Helper function to get zones for a specific facility
export const getZonesForFacility = (facilityId: string): readonly Zone[] => {
  return dummyZones.filter(zone => zone.facilityId === facilityId);
};

// Helper function to get all zones
export const getAllZones = (): readonly Zone[] => {
  return dummyZones;
};
