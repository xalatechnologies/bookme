/**
 * Bookings Service - Top-Level API
 *
 * Centralized service for all booking-related operations.
 * Wraps Supabase booking service and provides a clean API for components.
 *
 * @module services/bookings
 */

import { bookingsService as supabaseBookings } from './supabase';
import type { 
  Booking, 
  BookingInsert, 
  BookingUpdate,
  BookingWithDetails,
} from './supabase/types';

/**
 * Bookings Service
 * 
 * Provides high-level API for booking operations.
 * Use this service in components instead of directly accessing Supabase.
 */
export const bookingsService = {
  /**
   * Fetch all bookings for a specific user
   */
  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    return supabaseBookings.getUserBookings(userId);
  },

  /**
   * Fetch all bookings for an organization
   */
  async getOrgBookings(orgId: string): Promise<BookingWithDetails[]> {
    return supabaseBookings.getOrgBookings(orgId);
  },

  /**
   * Fetch bookings for a specific facility
   */
  async getFacilityBookings(
    facilityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    return supabaseBookings.getFacilityBookings(facilityId, startDate, endDate);
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(id: string): Promise<BookingWithDetails> {
    return supabaseBookings.getById(id);
  },

  /**
   * Create a new booking
   */
  async createBooking(data: BookingInsert): Promise<Booking> {
    return supabaseBookings.create(data);
  },

  /**
   * Update an existing booking
   */
  async updateBooking(id: string, data: BookingUpdate): Promise<Booking> {
    return supabaseBookings.update(id, data);
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return supabaseBookings.cancel(id, reason);
  },

  /**
   * Check availability for a time slot
   */
  async checkAvailability(params: {
    facilityId: string;
    zoneId?: string | null;
    startTime: string;
    endTime: string;
  }): Promise<boolean> {
    return supabaseBookings.checkAvailability(params);
  },

  /**
   * Get upcoming bookings for a specific user
   */
  async getUpcomingBookings(userId: string, limit = 10): Promise<BookingWithDetails[]> {
    return supabaseBookings.getUpcoming(userId, limit);
  },

  /**
   * Get past bookings for a specific user
   */
  async getPastBookings(userId: string, limit = 10): Promise<BookingWithDetails[]> {
    return supabaseBookings.getPast(userId, limit);
  },
} as const;

/**
 * Export types for use in components
 */
export type {
  Booking,
  BookingInsert,
  BookingUpdate,
  BookingWithDetails,
  BookingFilters,
  BookingStatus,
} from './supabase/types';
