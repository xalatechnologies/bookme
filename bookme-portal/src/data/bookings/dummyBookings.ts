export interface Booking {
  readonly id: string;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly userId: string;
  readonly userName: string;
  readonly userEmail: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly date: string;
  readonly status: 'confirmed' | 'pending' | 'cancelled';
  readonly totalPrice: number;
  readonly notes?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const dummyBookings: readonly Booking[] = [
  {
    id: "booking-1",
    facilityId: "1",
    facilityName: "Drammen Idrettshall",
    userId: "user-1",
    userName: "Ola Nordmann",
    userEmail: "ola.nordmann@email.com",
    startTime: "18:00",
    endTime: "20:00",
    date: "2024-10-15",
    status: "confirmed",
    totalPrice: 1700,
    notes: "Fotballtrening for ungdomslag",
    createdAt: "2024-10-01T10:30:00Z",
    updatedAt: "2024-10-01T10:30:00Z"
  },
  {
    id: "booking-2",
    facilityId: "2",
    facilityName: "Strømsø Kulturhus",
    userId: "user-2",
    userName: "Kari Hansen",
    userEmail: "kari.hansen@email.com",
    startTime: "19:00",
    endTime: "22:00",
    date: "2024-10-20",
    status: "confirmed",
    totalPrice: 3600,
    notes: "Konsert med lokalt kor",
    createdAt: "2024-09-28T14:15:00Z",
    updatedAt: "2024-09-28T14:15:00Z"
  },
  {
    id: "booking-3",
    facilityId: "3",
    facilityName: "Bragernes Møterom",
    userId: "user-3",
    userName: "Erik Johansen",
    userEmail: "erik.johansen@bedrift.no",
    startTime: "09:00",
    endTime: "12:00",
    date: "2024-10-08",
    status: "confirmed",
    totalPrice: 1350,
    notes: "Styremøte",
    createdAt: "2024-09-25T08:45:00Z",
    updatedAt: "2024-09-25T08:45:00Z"
  },
  {
    id: "booking-4",
    facilityId: "4",
    facilityName: "Spiralen Fotballbane",
    userId: "user-4",
    userName: "Lars Pettersen",
    userEmail: "lars.pettersen@email.com",
    startTime: "17:00",
    endTime: "19:00",
    date: "2024-10-12",
    status: "pending",
    totalPrice: 1300,
    notes: "Fotballkamp mellom lokale lag",
    createdAt: "2024-10-02T16:20:00Z",
    updatedAt: "2024-10-02T16:20:00Z"
  },
  {
    id: "booking-5",
    facilityId: "5",
    facilityName: "Konnerud Svømmehall",
    userId: "user-5",
    userName: "Anne Kristiansen",
    userEmail: "anne.kristiansen@email.com",
    startTime: "07:00",
    endTime: "08:00",
    date: "2024-10-10",
    status: "confirmed",
    totalPrice: 950,
    notes: "Morgensvømming",
    createdAt: "2024-09-30T20:10:00Z",
    updatedAt: "2024-09-30T20:10:00Z"
  },
  {
    id: "booking-6",
    facilityId: "6",
    facilityName: "Åssiden Tennisbane",
    userId: "user-6",
    userName: "Tom Andersen",
    userEmail: "tom.andersen@email.com",
    startTime: "14:00",
    endTime: "16:00",
    date: "2024-10-18",
    status: "confirmed",
    totalPrice: 760,
    notes: "Tenniskamp med venn",
    createdAt: "2024-10-01T12:00:00Z",
    updatedAt: "2024-10-01T12:00:00Z"
  }
] as const;
