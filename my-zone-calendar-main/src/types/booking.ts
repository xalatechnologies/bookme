export type SlotStatus = 
  | 'available' 
  | 'booked' 
  | 'reserved' 
  | 'selected' 
  | 'unavailable' 
  | 'conflict';

export interface TimeSlot {
  id: string;
  time: string;
  hour: number;
  status: SlotStatus;
}

export interface DaySchedule {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  slots: TimeSlot[];
}

export interface Zone {
  id: string;
  name: string;
  size: string;
  color: 'a' | 'b' | 'c';
}

export interface BookingDetails {
  purpose: string;
  date: Date;
  startTime: string;
  endTime: string;
  showPurposeInCalendar: boolean;
  numberOfPeople: number;
  activityType: string;
  description: string;
}

export interface SelectedSlot {
  zoneId: string;
  zoneName: string;
  date: Date;
  time: string;
  hour: number;
  bookingDetails?: BookingDetails;
  seasonBookingGroupId?: string;
}

export interface SeasonBookingData {
  isSeasonBooking: boolean;
  endDate?: Date;
  weekdays?: number[];
  repetitionInterval?: number;
}

export interface ConflictCheckResult {
  availableSlots: SelectedSlot[];
  unavailableSlots: SelectedSlot[];
  hasConflicts: boolean;
}

export interface BookingStep {
  id: number;
  label: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

export type PriceGroup = 
  | 'non-commercial'
  | 'commercial'
  | 'municipal';

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface BookingCheckoutData {
  priceGroup: PriceGroup | null;
  additionalServices: AdditionalService[];
  termsAccepted: boolean;
}
