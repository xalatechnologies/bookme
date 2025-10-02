export interface BookingRules {
  readonly minBookingDuration: number;
  readonly maxBookingDuration: number;
  readonly allowedTimeSlots: readonly string[];
  readonly bookingTypes: readonly string[];
  readonly advanceBookingDays: number;
  readonly cancellationHours: number;
}

export interface AdminInfo {
  readonly contactPersonName: string;
  readonly contactPersonEmail: string;
  readonly specialInstructions: string;
  readonly maintenanceSchedule: readonly MaintenanceSchedule[];
}

export interface MaintenanceSchedule {
  readonly day: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface ZoneLayout {
  readonly coordinates: Coordinates;
  readonly entryPoints: readonly string[];
}

export interface Coordinates {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Zone {
  readonly id: string;
  readonly name: string;
  readonly facilityId: string;
  readonly capacity: number;
  readonly pricePerHour: number;
  readonly description: string;
  readonly area: string;
  readonly isMainZone: boolean;
  readonly parentZoneId?: string;
  readonly subZones: readonly string[];
  readonly equipment: readonly string[];
  readonly amenities: readonly string[];
  readonly bookingRules: BookingRules;
  readonly adminInfo: AdminInfo;
  readonly layout: ZoneLayout;
  readonly accessibility: readonly string[];
  readonly features: readonly string[];
  readonly isActive: boolean;
}

export interface ZoneAvailabilityStatus {
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly isAvailable: boolean;
  readonly conflictReason?: string;
  readonly conflictDetails?: ZoneConflict;
}

export interface ZoneConflict {
  readonly zoneId: string;
  readonly conflictType: 'booking' | 'maintenance' | 'blackout' | 'zone-conflict';
  readonly startTime: Date;
  readonly endTime: Date;
  readonly severity: 'low' | 'medium' | 'high';
  readonly description: string;
  readonly canOverride: boolean;
}

export type BookingStatus = 'draft' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface BookingConflict {
  readonly id: string;
  readonly booking_id: string;
  readonly conflict_type: 'zone-conflict' | 'whole-facility-conflict' | 'sub-zone-conflict' | 'maintenance' | 'blackout';
  readonly conflict_description?: string;
  readonly conflicting_booking_id?: string;
  readonly resolved: boolean;
  readonly resolved_by?: string;
  readonly resolved_at?: string;
  readonly created_at: string;
  readonly conflict_severity: 'low' | 'medium' | 'high';
  readonly resolution_notes?: string;
}
