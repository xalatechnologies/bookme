/**
 * Booking Business Logic Service
 *
 * Contains all business logic related to booking operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { Database } from "@/types/database";

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingStatus = Database['public']['Enums']['booking_status'];
type Facility = Database['public']['Tables']['facilities']['Row'];

/**
 * Actor type for pricing calculations
 */
export type ActorType =
  | 'private-person'
  | 'lag-foreninger'
  | 'paraply'
  | 'private-firma'
  | 'kommunale-enheter';

/**
 * Extended booking with facility information for display and filtering
 */
export interface BookingWithFacility extends Booking {
  readonly facilities?: Pick<Facility, 'name' | 'facility_type' | 'address'>;
}

/**
 * Booking filter configuration
 */
export interface IBookingFilters {
  readonly searchTerm?: string;
  readonly statusFilter?: readonly BookingStatus[];
  readonly facilityIds?: readonly string[];
  readonly dateRange?: {
    readonly startDate: Date;
    readonly endDate: Date;
  };
  readonly userIds?: readonly string[];
  readonly isRecurring?: boolean;
}

/**
 * Booking sort configuration
 */
export interface IBookingSortConfig {
  readonly sortBy: 'starts_at' | 'ends_at' | 'created_at' | 'status' | 'total_cents' | 'facility_name';
  readonly sortOrder: 'asc' | 'desc';
}

/**
 * Booking validation result
 */
export interface BookingValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Price breakdown structure
 */
export interface PriceBreakdown {
  readonly basePrice: number;
  readonly actorDiscount: number;
  readonly actorMultiplier: number;
  readonly subtotal: number;
  readonly vat: number;
  readonly vatRate: number;
  readonly total: number;
  readonly currency: string;
}

/**
 * Booking conflict detection result
 */
export interface BookingConflict {
  readonly bookingId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly facilityId: string;
  readonly zoneId?: string | null;
}

/**
 * Booking statistics
 */
export interface BookingStats {
  readonly totalBookings: number;
  readonly pendingBookings: number;
  readonly confirmedBookings: number;
  readonly cancelledBookings: number;
  readonly completedBookings: number;
  readonly totalRevenue: number;
  readonly averageBookingValue: number;
  readonly utilizationRate: number;
  readonly currency: string;
}

/**
 * Cancellation eligibility result
 */
export interface CancellationEligibility {
  readonly canCancel: boolean;
  readonly reason?: string;
  readonly hoursUntilStart?: number;
}

/**
 * Modification eligibility result
 */
export interface ModificationEligibility {
  readonly canModify: boolean;
  readonly reason?: string;
  readonly hoursUntilStart?: number;
}

/**
 * Filter bookings based on search and filter criteria
 *
 * @param bookings - Array of bookings to filter
 * @param filters - Filter configuration
 * @returns Filtered array of bookings
 */
export const filterBookings = (
  bookings: readonly BookingWithFacility[],
  filters: IBookingFilters
): readonly BookingWithFacility[] => {
  return bookings.filter(booking => {
    // Search filter - searches in facility name, notes, and facility address
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const facilityName = booking.facilities?.name?.toLowerCase() || '';
      const notes = booking.notes?.toLowerCase() || '';
      const address = booking.facilities?.address?.toLowerCase() || '';

      const matchesSearch =
        facilityName.includes(searchLower) ||
        notes.includes(searchLower) ||
        address.includes(searchLower) ||
        booking.id.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      if (!filters.statusFilter.includes(booking.status)) return false;
    }

    // Facility filter
    if (filters.facilityIds && filters.facilityIds.length > 0) {
      if (!filters.facilityIds.includes(booking.facility_id)) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const bookingStart = new Date(booking.starts_at);
      const bookingEnd = new Date(booking.ends_at);
      const { startDate, endDate } = filters.dateRange;

      // Check if booking overlaps with the filter date range
      const overlaps = bookingStart <= endDate && bookingEnd >= startDate;
      if (!overlaps) return false;
    }

    // User filter
    if (filters.userIds && filters.userIds.length > 0) {
      if (!filters.userIds.includes(booking.user_id)) return false;
    }

    // Recurring filter
    if (filters.isRecurring !== undefined) {
      if (booking.is_recurring !== filters.isRecurring) return false;
    }

    return true;
  });
};

/**
 * Sort bookings based on sort configuration
 *
 * @param bookings - Array of bookings to sort
 * @param sortConfig - Sort configuration
 * @returns Sorted array of bookings
 */
export const sortBookings = (
  bookings: readonly BookingWithFacility[],
  sortConfig: IBookingSortConfig
): readonly BookingWithFacility[] => {
  const sorted = [...bookings].sort((a, b) => {
    let comparison = 0;

    switch (sortConfig.sortBy) {
      case 'starts_at':
        comparison = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
        break;
      case 'ends_at':
        comparison = new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime();
        break;
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'total_cents':
        comparison = a.total_cents - b.total_cents;
        break;
      case 'facility_name':
        const nameA = a.facilities?.name || '';
        const nameB = b.facilities?.name || '';
        comparison = nameA.localeCompare(nameB);
        break;
    }

    return sortConfig.sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Validate booking form data
 *
 * @param bookingData - Partial booking data to validate
 * @returns Validation result with errors
 */
export const validateBookingData = (
  bookingData: Partial<Booking>
): BookingValidationResult => {
  const errors: string[] = [];

  // Required fields
  if (!bookingData.facility_id) {
    errors.push('Facility is required');
  }

  if (!bookingData.starts_at) {
    errors.push('Start date and time is required');
  }

  if (!bookingData.ends_at) {
    errors.push('End date and time is required');
  }

  if (!bookingData.user_id) {
    errors.push('User is required');
  }

  if (!bookingData.org_id) {
    errors.push('Organization is required');
  }

  // Date logic validation
  if (bookingData.starts_at && bookingData.ends_at) {
    const startDate = new Date(bookingData.starts_at);
    const endDate = new Date(bookingData.ends_at);
    const now = new Date();

    // Start date must be in the future (allow some grace period of 5 minutes for clock differences)
    const gracePeriod = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (startDate.getTime() < now.getTime() - gracePeriod) {
      errors.push('Start date must be in the future');
    }

    // End date must be after start date
    if (endDate <= startDate) {
      errors.push('End date must be after start date');
    }

    // Booking duration validation (minimum 30 minutes, maximum 24 hours for single booking)
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours < 0.5) {
      errors.push('Booking duration must be at least 30 minutes');
    }

    if (durationHours > 24 && !bookingData.is_recurring) {
      errors.push('Single booking duration cannot exceed 24 hours');
    }
  }

  // Price validation
  if (bookingData.total_cents !== undefined && bookingData.total_cents < 0) {
    errors.push('Total price cannot be negative');
  }

  // Currency validation
  if (bookingData.currency && !['NOK', 'USD', 'EUR'].includes(bookingData.currency)) {
    errors.push('Invalid currency code');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get actor pricing multiplier based on actor type
 *
 * @param actorType - Type of actor making the booking
 * @returns Price multiplier for the actor type
 */
export const getActorMultiplier = (actorType: ActorType): number => {
  switch (actorType) {
    case 'paraply':
      return 0.9; // 10% discount
    case 'private-firma':
      return 1.2; // 20% surcharge
    case 'kommunale-enheter':
      return 0.8; // 20% discount
    case 'lag-foreninger':
      return 0.85; // 15% discount
    case 'private-person':
    default:
      return 1.0; // No adjustment
  }
};

/**
 * Calculate booking price with VAT and discounts
 *
 * @param basePrice - Base price in cents before adjustments
 * @param actorType - Type of actor for pricing adjustments
 * @param currency - Currency code (default: NOK)
 * @returns Complete price breakdown
 */
export const calculateBookingPrice = (
  basePrice: number,
  actorType: ActorType,
  currency: string = 'NOK'
): PriceBreakdown => {
  const actorMultiplier = getActorMultiplier(actorType);
  const actorDiscount = basePrice * (1 - actorMultiplier);
  const subtotal = basePrice * actorMultiplier;

  // VAT rate is 25% in Norway
  const vatRate = 0.25;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  return {
    basePrice,
    actorDiscount,
    actorMultiplier,
    subtotal,
    vat,
    vatRate,
    total,
    currency,
  };
};

/**
 * Check if a booking can be cancelled based on business rules
 *
 * Business rules:
 * - Cannot cancel completed, cancelled, expired, or refunded bookings
 * - Must be at least 24 hours before start time
 * - Paid bookings require special handling (refund process)
 *
 * @param booking - Booking to check
 * @returns Cancellation eligibility result
 */
export const canCancelBooking = (booking: Booking): CancellationEligibility => {
  const now = new Date();
  const startTime = new Date(booking.starts_at);
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check booking status
  const nonCancellableStatuses: BookingStatus[] = ['completed', 'cancelled', 'expired', 'refunded'];
  if (nonCancellableStatuses.includes(booking.status)) {
    return {
      canCancel: false,
      reason: `Cannot cancel ${booking.status} bookings`,
      hoursUntilStart,
    };
  }

  // Check if booking has already started or passed
  if (hoursUntilStart <= 0) {
    return {
      canCancel: false,
      reason: 'Cannot cancel bookings that have already started or passed',
      hoursUntilStart,
    };
  }

  // Check minimum cancellation notice period (24 hours)
  const minimumNoticeHours = 24;
  if (hoursUntilStart < minimumNoticeHours) {
    return {
      canCancel: false,
      reason: `Cancellation requires at least ${minimumNoticeHours} hours notice`,
      hoursUntilStart,
    };
  }

  // All checks passed
  return {
    canCancel: true,
    hoursUntilStart,
  };
};

/**
 * Check if a booking can be modified based on business rules
 *
 * Business rules:
 * - Cannot modify completed, cancelled, expired, or refunded bookings
 * - Must be at least 12 hours before start time
 * - Paid bookings can be modified but may require payment adjustment
 *
 * @param booking - Booking to check
 * @returns Modification eligibility result
 */
export const canModifyBooking = (booking: Booking): ModificationEligibility => {
  const now = new Date();
  const startTime = new Date(booking.starts_at);
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Check booking status
  const nonModifiableStatuses: BookingStatus[] = ['completed', 'cancelled', 'expired', 'refunded'];
  if (nonModifiableStatuses.includes(booking.status)) {
    return {
      canModify: false,
      reason: `Cannot modify ${booking.status} bookings`,
      hoursUntilStart,
    };
  }

  // Check if booking has already started or passed
  if (hoursUntilStart <= 0) {
    return {
      canModify: false,
      reason: 'Cannot modify bookings that have already started or passed',
      hoursUntilStart,
    };
  }

  // Check minimum modification notice period (12 hours)
  const minimumNoticeHours = 12;
  if (hoursUntilStart < minimumNoticeHours) {
    return {
      canModify: false,
      reason: `Modification requires at least ${minimumNoticeHours} hours notice`,
      hoursUntilStart,
    };
  }

  // All checks passed
  return {
    canModify: true,
    hoursUntilStart,
  };
};

/**
 * Detect booking conflicts for a given time slot and facility/zone
 *
 * @param existingBookings - Array of existing bookings to check against
 * @param newStartTime - Start time of new booking (ISO string)
 * @param newEndTime - End time of new booking (ISO string)
 * @param facilityId - Facility ID
 * @param zoneId - Optional zone ID for zone-specific conflicts
 * @param excludeBookingId - Optional booking ID to exclude (for updates)
 * @returns Array of conflicting bookings
 */
export const detectBookingConflicts = (
  existingBookings: readonly Booking[],
  newStartTime: string,
  newEndTime: string,
  facilityId: string,
  zoneId?: string | null,
  excludeBookingId?: string
): readonly BookingConflict[] => {
  const newStart = new Date(newStartTime);
  const newEnd = new Date(newEndTime);

  const conflicts: BookingConflict[] = [];

  for (const booking of existingBookings) {
    // Skip excluded booking (for updates)
    if (excludeBookingId && booking.id === excludeBookingId) {
      continue;
    }

    // Skip cancelled, expired, or refunded bookings
    if (['cancelled', 'expired', 'refunded'].includes(booking.status)) {
      continue;
    }

    // Check facility match
    if (booking.facility_id !== facilityId) {
      continue;
    }

    // Check zone match if zone is specified
    if (zoneId && booking.zone_id !== zoneId) {
      continue;
    }

    // Check time overlap
    const existingStart = new Date(booking.starts_at);
    const existingEnd = new Date(booking.ends_at);

    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      conflicts.push({
        bookingId: booking.id,
        startsAt: booking.starts_at,
        endsAt: booking.ends_at,
        facilityId: booking.facility_id,
        zoneId: booking.zone_id,
      });
    }
  }

  return conflicts;
};

/**
 * Calculate booking statistics from a set of bookings
 *
 * @param bookings - Array of bookings to analyze
 * @param facilityCapacity - Optional total facility capacity for utilization calculation
 * @returns Booking statistics
 */
export const calculateBookingStats = (
  bookings: readonly Booking[],
  facilityCapacity?: number
): BookingStats => {
  const totalBookings = bookings.length;

  // Count by status
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const confirmedBookings = bookings.filter(b =>
    ['awaiting_payment', 'paid'].includes(b.status)
  ).length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Calculate revenue (only from paid and completed bookings)
  const revenueBookings = bookings.filter(b =>
    ['paid', 'completed'].includes(b.status)
  );
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + b.total_cents, 0);

  // Calculate average booking value
  const averageBookingValue = totalBookings > 0
    ? totalRevenue / revenueBookings.length
    : 0;

  // Calculate utilization rate (if capacity provided)
  let utilizationRate = 0;
  if (facilityCapacity && facilityCapacity > 0) {
    // Calculate total booked hours
    const totalBookedHours = bookings.reduce((sum, booking) => {
      const start = new Date(booking.starts_at);
      const end = new Date(booking.ends_at);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    // Assuming capacity is per hour, calculate utilization
    // This is a simplified calculation - real utilization would need time period
    utilizationRate = totalBookedHours > 0 ? totalBookedHours / facilityCapacity : 0;
  }

  // Get currency from first booking or default to NOK
  const currency = bookings[0]?.currency || 'NOK';

  return {
    totalBookings,
    pendingBookings,
    confirmedBookings,
    cancelledBookings,
    completedBookings,
    totalRevenue,
    averageBookingValue,
    utilizationRate,
    currency,
  };
};

/**
 * Get unique booking statuses from a list of bookings
 *
 * @param bookings - Array of bookings
 * @returns Array of unique status values
 */
export const getUniqueBookingStatuses = (
  bookings: readonly Booking[]
): readonly BookingStatus[] => {
  return Array.from(new Set(bookings.map(b => b.status)));
};

/**
 * Get all possible booking statuses
 *
 * @returns Array of all possible booking status values
 */
export const getAllBookingStatuses = (): readonly BookingStatus[] => {
  return [
    'pending',
    'awaiting_payment',
    'paid',
    'cancelled',
    'expired',
    'completed',
    'refunded',
  ];
};

/**
 * Format booking for display
 *
 * @param booking - Booking to format
 * @returns Booking with formatted display fields
 */
export const formatBookingForDisplay = (booking: BookingWithFacility) => {
  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);
  const createdDate = new Date(booking.created_at);

  // Calculate duration
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return {
    ...booking,
    formattedStartDate: startDate.toLocaleDateString('no-NO'),
    formattedStartTime: startDate.toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedEndDate: endDate.toLocaleDateString('no-NO'),
    formattedEndTime: endDate.toLocaleTimeString('no-NO', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    formattedCreatedAt: createdDate.toLocaleDateString('no-NO'),
    durationHours: Math.round(durationHours * 10) / 10, // Round to 1 decimal
    formattedPrice: `${(booking.total_cents / 100).toFixed(2)} ${booking.currency}`,
    facilityName: booking.facilities?.name || 'Unknown Facility',
    hasNotes: Boolean(booking.notes),
  };
};

/**
 * Check if booking is upcoming (starts in the future)
 *
 * @param booking - Booking to check
 * @returns True if booking starts in the future
 */
export const isUpcomingBooking = (booking: Booking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.starts_at);
  return startTime > now;
};

/**
 * Check if booking is currently active (ongoing)
 *
 * @param booking - Booking to check
 * @returns True if booking is currently active
 */
export const isActiveBooking = (booking: Booking): boolean => {
  const now = new Date();
  const startTime = new Date(booking.starts_at);
  const endTime = new Date(booking.ends_at);
  return startTime <= now && endTime >= now;
};

/**
 * Check if booking is past (ended)
 *
 * @param booking - Booking to check
 * @returns True if booking has ended
 */
export const isPastBooking = (booking: Booking): boolean => {
  const now = new Date();
  const endTime = new Date(booking.ends_at);
  return endTime < now;
};
