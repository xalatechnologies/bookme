import type { Zone } from '@/types/booking';

export function mapZoneFromDb(row: any): Zone {
  return {
    id: row.id,
    name: row.name,
    facilityId: row.facility_id,
    capacity: row.capacity,
    pricePerHour: row.price_per_hour,
    area: row.area,
    description: row.description,
    amenities: row.amenities,
    availability: row.availability,
  };
}

export function mapZoneToDb(zone: Partial<Zone>): any {
  const mapped: any = {};
  
  if (zone.name !== undefined) mapped.name = zone.name;
  if (zone.facilityId !== undefined) mapped.facility_id = zone.facilityId;
  if (zone.capacity !== undefined) mapped.capacity = zone.capacity;
  if (zone.pricePerHour !== undefined) mapped.price_per_hour = zone.pricePerHour;
  if (zone.area !== undefined) mapped.area = zone.area;
  if (zone.description !== undefined) mapped.description = zone.description;
  if (zone.amenities !== undefined) mapped.amenities = zone.amenities;
  if (zone.availability !== undefined) mapped.availability = zone.availability;
  
  return mapped;
}