/**
 * Booking group interface for managing group bookings and member collaboration
 * 
 * Supports group creation, member management, invitations, and shared booking functionality
 * with role-based access control and collaborative features.
 */
export interface BookingGroup {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly ownerId: string;
  readonly members: readonly {
    readonly userId: string;
    readonly name: string;
    readonly email: string;
    readonly role: 'owner' | 'admin' | 'member';
    readonly joinedAt: string;
  }[];
  readonly invitations: readonly {
    readonly email: string;
    readonly status: 'pending' | 'accepted' | 'declined';
    readonly invitedAt: string;
    readonly invitedBy: string;
  }[];
  readonly bookings: readonly string[]; // booking IDs
  readonly settings: {
    readonly allowMemberBookings: boolean;
    readonly requireApproval: boolean;
    readonly maxBookingsPerMember: number;
    readonly notificationPreferences: {
      readonly newBookings: boolean;
      readonly cancellations: boolean;
      readonly memberChanges: boolean;
    };
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Group member interface for detailed member information
 */
export interface GroupMember {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'owner' | 'admin' | 'member';
  readonly joinedAt: string;
  readonly lastActiveAt?: string;
  readonly bookingCount: number;
  readonly isActive: boolean;
}

/**
 * Group invitation interface for managing invitations
 */
export interface GroupInvitation {
  readonly id: string;
  readonly groupId: string;
  readonly email: string;
  readonly invitedBy: string;
  readonly invitedByName: string;
  readonly status: 'pending' | 'accepted' | 'declined' | 'expired';
  readonly invitedAt: string;
  readonly expiresAt: string;
  readonly acceptedAt?: string;
  readonly declinedAt?: string;
}

/**
 * Group booking interface for shared bookings within groups
 */
export interface GroupBooking {
  readonly id: string;
  readonly groupId: string;
  readonly bookingId: string; // Reference to the actual booking
  readonly createdBy: string;
  readonly createdByName: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly purpose: string;
  readonly attendees: number;
  readonly status: 'pending' | 'confirmed' | 'cancelled';
  readonly costSharing: {
    readonly totalCost: number;
    readonly costPerMember: number;
    readonly members: readonly {
      readonly userId: string;
      readonly name: string;
      readonly share: number;
      readonly paid: boolean;
    }[];
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Group creation data interface
 */
export interface CreateGroupData {
  readonly name: string;
  readonly description: string;
  readonly ownerId: string;
  readonly settings: {
    readonly allowMemberBookings: boolean;
    readonly requireApproval: boolean;
    readonly maxBookingsPerMember: number;
    readonly notificationPreferences: {
      readonly newBookings: boolean;
      readonly cancellations: boolean;
      readonly memberChanges: boolean;
    };
  };
}

/**
 * Group update data interface
 */
export interface UpdateGroupData {
  readonly name?: string;
  readonly description?: string;
  readonly settings?: {
    readonly allowMemberBookings?: boolean;
    readonly requireApproval?: boolean;
    readonly maxBookingsPerMember?: number;
    readonly notificationPreferences?: {
      readonly newBookings?: boolean;
      readonly cancellations?: boolean;
      readonly memberChanges?: boolean;
    };
  };
}

/**
 * Group member addition data interface
 */
export interface AddMemberData {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly role: 'admin' | 'member';
}

/**
 * Group invitation data interface
 */
export interface InviteMemberData {
  readonly email: string;
  readonly invitedBy: string;
  readonly invitedByName: string;
}

/**
 * Group booking creation data interface
 */
export interface CreateGroupBookingData {
  readonly groupId: string;
  readonly createdBy: string;
  readonly createdByName: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly purpose: string;
  readonly attendees: number;
  readonly costSharing: {
    readonly totalCost: number;
    readonly costPerMember: number;
    readonly members: readonly {
      readonly userId: string;
      readonly name: string;
      readonly share: number;
      readonly paid: boolean;
    }[];
  };
}

/**
 * Group statistics interface for analytics
 */
export interface GroupStatistics {
  readonly totalMembers: number;
  readonly activeMembers: number;
  readonly totalBookings: number;
  readonly confirmedBookings: number;
  readonly pendingBookings: number;
  readonly cancelledBookings: number;
  readonly totalCost: number;
  readonly averageCostPerBooking: number;
  readonly mostActiveMember: {
    readonly userId: string;
    readonly name: string;
    readonly bookingCount: number;
  };
  readonly recentActivity: readonly {
    readonly type: 'booking_created' | 'booking_cancelled' | 'member_joined' | 'member_left';
    readonly description: string;
    readonly timestamp: string;
    readonly userId: string;
    readonly userName: string;
  }[];
}

