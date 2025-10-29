/**
 * Mock Type Definitions for Tests
 * Provides type-safe mock data structures for testing
 */

import type { BookingWithDetails } from '@/services/supabase/bookings.service';
import type { Database } from '@/types/supabase';

// Type for partial Facility objects used in tests
export interface MockFacility extends Partial<Database['public']['Tables']['facilities']['Row']> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly zone_id?: string;
  readonly capacity?: number;
  readonly hourly_rate?: number;
  readonly status?: string;
}

// Type for Supabase response envelope
export interface SupabaseResponse<T> {
  readonly data: T[] | T | null;
  readonly error: { readonly message: string } | null;
}

// Type for mock Supabase client methods
export interface MockSupabaseBuilder {
  readonly select: jest.Mock;
  readonly eq: jest.Mock;
  readonly gte?: jest.Mock;
  readonly lte?: jest.Mock;
  readonly in?: jest.Mock;
  readonly insert?: jest.Mock;
  readonly update?: jest.Mock;
  readonly delete?: jest.Mock;
  readonly order?: jest.Mock;
  readonly single?: jest.Mock;
  readonly maybeSingle?: jest.Mock;
}

// Type for complete mock BookingWithDetails for tests
export type TestBooking = Partial<BookingWithDetails>;

// Type for mock favorites
export interface MockFavorite
  extends Partial<Database['public']['Tables']['user_favorites']['Row']> {
  readonly id: string;
  readonly user_id: string;
  readonly facility_id: string;
  readonly created_at: string;
  readonly facility?: MockFacility;
}
