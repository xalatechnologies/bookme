"use client";

export interface Zone {
  readonly id: string;
  readonly name: string;
  readonly facilityId: string;
  readonly capacity: number;
  readonly pricePerHour: number;
  readonly amenities: readonly string[];
  readonly availability: {
    readonly monday: { readonly start: string; readonly end: string; };
    readonly tuesday: { readonly start: string; readonly end: string; };
    readonly wednesday: { readonly start: string; readonly end: string; };
    readonly thursday: { readonly start: string; readonly end: string; };
    readonly friday: { readonly start: string; readonly end: string; };
    readonly saturday: { readonly start: string; readonly end: string; };
    readonly sunday: { readonly start: string; readonly end: string; };
  };
}

export interface SelectedTimeSlot {
  readonly zoneId: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneName: string;
  readonly pricePerHour: number;
}

export interface BookingConflict {
  readonly id: string;
  readonly type: 'booking' | 'maintenance' | 'event';
  readonly title: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly description?: string;
}

export interface AvailabilityStatus {
  readonly status: 'available' | 'busy' | 'unavailable';
  readonly conflict?: BookingConflict;
}

export interface DragState {
  readonly isDragging: boolean;
  readonly startSlot?: {
    readonly zoneId: string;
    readonly date: Date;
    readonly timeSlot: string;
  };
  readonly previewSlots: readonly SelectedTimeSlot[];
}
