import type { IBookingEvent, ICalendarQuery } from "@/types/calendar";

// Mock service - replace with actual HTTP calls
export const calendarService = {
  async list(params: ICalendarQuery): Promise<readonly IBookingEvent[]> {
    // Mock data for development
    const mockEvents: IBookingEvent[] = [
      {
        id: "1",
        facilityId: "facility-1",
        facilityName: "Drammenshallen",
        title: "Fotballtrening",
        start: "2024-01-20T10:00:00.000Z",
        end: "2024-01-20T12:00:00.000Z",
        status: "confirmed",
        priceNok: 2400,
        tags: ["sport", "fotball"]
      },
      {
        id: "2",
        facilityId: "facility-2",
        facilityName: "Kulturhuset",
        title: "Konsert",
        start: "2024-01-22T18:00:00.000Z",
        end: "2024-01-22T20:00:00.000Z",
        status: "pending",
        priceNok: 1200,
        tags: ["kultur", "musikk"]
      },
      {
        id: "3",
        facilityId: "facility-3",
        facilityName: "Idrettshallen",
        title: "Basketball",
        start: "2024-01-25T14:00:00.000Z",
        end: "2024-01-25T16:00:00.000Z",
        status: "cancelled",
        priceNok: 1800,
        tags: ["sport", "basketball"]
      }
    ];

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter based on query parameters
    let filtered = mockEvents;
    
    if (params.facilityIds && params.facilityIds.length > 0) {
      filtered = filtered.filter(event => params.facilityIds!.includes(event.facilityId));
    }
    
    if (params.statuses && params.statuses.length > 0) {
      filtered = filtered.filter(event => params.statuses!.includes(event.status));
    }
    
    if (params.text) {
      const searchText = params.text.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchText) ||
        event.facilityName.toLowerCase().includes(searchText)
      );
    }
    
    return filtered;
  },
} as const;
