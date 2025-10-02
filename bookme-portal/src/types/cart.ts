export interface TimeSlot {
  readonly date: Date;
  readonly timeSlot: string;
  readonly zoneId: string;
  readonly duration: number;
}

export interface CartItem {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly duration: number;
  readonly pricePerHour: number;
  readonly purpose: string;
  readonly organizationType: string;
  readonly timeSlots: readonly TimeSlot[];
}

export interface CartState {
  readonly items: readonly CartItem[];
  readonly totalPrice: number;
  readonly itemCount: number;
}
