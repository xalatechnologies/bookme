export type TBookingStatus = "confirmed" | "pending" | "cancelled";

export interface IBookingEvent {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly title: string;
  readonly start: string;   // ISO
  readonly end: string;     // ISO
  readonly status: TBookingStatus;
  readonly priceNok?: number;
  readonly tags?: readonly string[];
}

export interface ICalendarQuery {
  readonly from: string; // ISO, start of current view
  readonly to: string;   // ISO, end of current view
  readonly facilityIds?: readonly string[];
  readonly statuses?: readonly TBookingStatus[];
  readonly text?: string;
}
