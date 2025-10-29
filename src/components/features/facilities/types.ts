/**
 * Facilities Feature Types
 *
 * Type definitions for facility components and functionality
 */

/**
 * Facility Status
 */
export type FacilityStatus = 'active' | 'inactive' | 'maintenance' | 'pending';

/**
 * Facility Category
 */
export type FacilityCategory = 
  | 'sports_hall'
  | 'meeting_room'
  | 'outdoor_field'
  | 'swimming_pool'
  | 'gym'
  | 'auditorium'
  | 'other';

/**
 * Facility Amenity
 */
export interface Amenity {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly available: boolean;
}

/**
 * Facility Opening Hours
 */
export interface OpeningHours {
  readonly day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  readonly open: string;  // HH:mm format
  readonly close: string; // HH:mm format
  readonly closed: boolean;
}

/**
 * Facility Filter Options
 */
export interface FacilityFilters {
  readonly category?: FacilityCategory | 'all';
  readonly status?: FacilityStatus | 'all';
  readonly search?: string;
  readonly capacity?: { min: number; max: number };
  readonly amenities?: string[];
  readonly priceRange?: { min: number; max: number };
  readonly availability?: 'available' | 'booked' | 'all';
}

/**
 * Facility Sort Options
 */
export type FacilitySortBy = 
  | 'name-asc' 
  | 'name-desc' 
  | 'capacity-asc' 
  | 'capacity-desc' 
  | 'price-asc' 
  | 'price-desc'
  | 'distance'
  | 'popularity';
