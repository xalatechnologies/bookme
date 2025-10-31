import type { IFacility } from '@/types/facility';

export function mapFacilityFromDb(row: any): IFacility {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    type: row.type ?? '',
    location: row.location ?? '',
    address: row.address ?? '',
    capacity: row.capacity ?? 0,
    pricePerHour: row.price_per_hour ?? 0,
    amenities: row.amenities ?? [],
    images: row.images ?? [],
    availability: row.availability ?? {
      monday: { start: '00:00', end: '23:59' },
      tuesday: { start: '00:00', end: '23:59' },
      wednesday: { start: '00:00', end: '23:59' },
      thursday: { start: '00:00', end: '23:59' },
      friday: { start: '00:00', end: '23:59' },
      saturday: { start: '00:00', end: '23:59' },
      sunday: { start: '00:00', end: '23:59' },
    },
    coordinates: row.coordinates ?? { lat: 0, lng: 0 },
    rating: row.rating ?? 0,
    reviewCount: row.review_count ?? 0,
    area: row.area ?? '',
    accessibilityFeatures: row.accessibility_features ?? [],
    status: row.status ?? 'draft',
    owner: row.owner ?? '',
    lastUpdated: row.last_updated ?? '',
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    updatedBy: row.updated_by ?? '',
    rules: row.rules ?? '',
    contactEmail: row.contact_email ?? '',
    openingHours: row.opening_hours ?? '',
    openingHoursStart: row.opening_hours_start ?? '',
    openingHoursEnd: row.opening_hours_end ?? '',
    emergencyContact: row.emergency_contact ?? '',
  };
}

export function mapFacilityToDb(facility: Partial<IFacility>): any {
  const mapped: any = {};
  
  if (facility.name !== undefined) mapped.name = facility.name;
  if (facility.description !== undefined) mapped.description = facility.description;
  if (facility.type !== undefined) mapped.type = facility.type;
  if (facility.location !== undefined) mapped.location = facility.location;
  if (facility.address !== undefined) mapped.address = facility.address;
  if (facility.capacity !== undefined) mapped.capacity = facility.capacity;
  if (facility.pricePerHour !== undefined) mapped.price_per_hour = facility.pricePerHour;
  if (facility.amenities !== undefined) mapped.amenities = facility.amenities;
  if (facility.images !== undefined) mapped.images = facility.images;
  if (facility.availability !== undefined) mapped.availability = facility.availability;
  if (facility.coordinates !== undefined) mapped.coordinates = facility.coordinates;
  if (facility.rating !== undefined) mapped.rating = facility.rating;
  if (facility.reviewCount !== undefined) mapped.review_count = facility.reviewCount;
  if (facility.area !== undefined) mapped.area = facility.area;
  if (facility.accessibilityFeatures !== undefined) mapped.accessibility_features = facility.accessibilityFeatures;
  if (facility.status !== undefined) mapped.status = facility.status;
  if (facility.owner !== undefined) mapped.owner = facility.owner;
  if (facility.lastUpdated !== undefined) mapped.last_updated = facility.lastUpdated;
  if (facility.createdAt !== undefined) mapped.created_at = facility.createdAt;
  if (facility.updatedAt !== undefined) mapped.updated_at = facility.updatedAt;
  if (facility.updatedBy !== undefined) mapped.updated_by = facility.updatedBy;
  if (facility.rules !== undefined) mapped.rules = facility.rules;
  if (facility.contactEmail !== undefined) mapped.contact_email = facility.contactEmail;
  if (facility.openingHours !== undefined) mapped.opening_hours = facility.openingHours;
  if (facility.openingHoursStart !== undefined) mapped.opening_hours_start = facility.openingHoursStart;
  if (facility.openingHoursEnd !== undefined) mapped.opening_hours_end = facility.openingHoursEnd;
  if (facility.emergencyContact !== undefined) mapped.emergency_contact = facility.emergencyContact;
  
  return mapped;
}