import type { Database } from '@/types/database';

// Original facility type from database
export type Facility = Database['public']['Tables']['facilities']['Row'];

// Facility with coordinates extracted from geography column
export type FacilityWithCoords = {
  id: string;
  org_id: string | null;
  name: string;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  location_geog?: unknown; // The original geography data (optional)
  lat: number | null;
  lng: number | null;
  location_geojson?: { type: string; coordinates: [number, number] } | null; // Optional
  created_at: string;
  updated_at: string | null;
  description: string | null;
  facility_type: string;
  images: unknown;
  capacity: number;
  rating: number | null;
  review_count: number;
  status: string;
  slug: string;
  contact_email: string | null;
  contact_phone: string | null;
  accessibility_features: unknown;
  area_description: string | null;
  amenities: unknown;
};

// Type for location coordinates
export interface LocationCoordinates {
  lat: number;
  lng: number;
}

// Type for facility filters
export interface FacilityFilters {
  facilityType?: string;
  location?: string;
}