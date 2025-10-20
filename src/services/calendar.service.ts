import type { IBookingEvent, ICalendarQuery } from "@/types/calendar";

// Convert booking data to calendar events
const convertBookingToEvent = (booking: {
  readonly id: string;
  readonly facilityName: string;
  readonly time: string;
  readonly duration?: number;
  readonly timeSlots?: readonly { readonly date: string; readonly timeSlot: string }[];
  readonly status: string;
  readonly purpose?: string;
  readonly facility?: string;
  readonly facilityId?: string;
  readonly price?: string | number;
  readonly description?: string;
}): IBookingEvent => {
  try {
    // Parse date - handle different formats (prioritize date over startDate)
    let bookingDate: Date;
    if (booking.date) {
      // Handle date string more carefully to avoid timezone issues
      if (typeof booking.date === 'string') {
        // If it's a date string in YYYY-MM-DD format, parse it as local date
        if (booking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = booking.date.split('-').map(Number);
          bookingDate = new Date(year, month - 1, day); // month is 0-indexed
        } else {
          bookingDate = new Date(booking.date);
        }
      } else {
        bookingDate = new Date(booking.date);
      }
    } else if (booking.startDate) {
      bookingDate = new Date(booking.startDate);
    } else {
      bookingDate = new Date();
    }
    
    // Validate date
    if (isNaN(bookingDate.getTime())) {
      bookingDate = new Date();
    }
  
  // Parse time - handle different formats (prioritize time over startTime/endTime)
  let startTime: string, endTime: string;
  if (booking.time && booking.time.includes('-')) {
    [startTime, endTime] = booking.time.split('-').map(t => t.trim());
  } else if (booking.time) {
    // Handle single time format
    startTime = booking.time;
    endTime = booking.time;
  } else if (booking.startTime && booking.endTime) {
    startTime = booking.startTime;
    endTime = booking.endTime;
  } else {
    startTime = '12:00';
    endTime = '13:00';
  }
  
  // Ensure times are in HH:MM format
  if (!startTime.includes(':')) {
    startTime = '12:00';
  }
  if (!endTime.includes(':')) {
    endTime = '13:00';
  }
  
  // Create start and end datetime
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startDateTime = new Date(bookingDate);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date(bookingDate);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  // Extract price as number - handle both string and number types
  let priceNok = 0;
  if (typeof booking.price === 'string') {
    priceNok = parseInt(booking.price.replace(/\D/g, '') || '0');
  } else if (typeof booking.price === 'number') {
    priceNok = booking.price;
  } else {
    priceNok = 0;
  }
  
    const event = {
      id: booking.id,
      facilityId: booking.facilityId || booking.id,
      facilityName: booking.facility || booking.facilityName || 'Ukjent lokale',
      title: booking.description || booking.purpose || 'Booking',
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      status: booking.status === 'confirmed' || booking.status === 'approved' ? 'confirmed' : 
              booking.status === 'pending' ? 'pending' : 
              booking.status === 'rejected' || booking.status === 'cancelled' ? 'cancelled' : 'cancelled',
      priceNok: priceNok,
      tags: [booking.facility?.toLowerCase() || 'booking']
    };
    
    return event;
  } catch (error) {
    // Return a fallback event
    return {
      id: booking.id || 'unknown',
      facilityId: booking.facilityId || booking.id || 'unknown',
      facilityName: booking.facility || booking.facilityName || 'Ukjent lokale',
      title: booking.description || booking.purpose || 'Booking',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      status: 'cancelled' as const,
      priceNok: 0,
      tags: ['error']
    };
  }
};

// Convert recurring occurrence to calendar event
const convertRecurringOccurrenceToEvent = (occurrence: any, parentBooking: any): IBookingEvent => {
  try {
    const startTime = occurrence.timeSlot.split('-')[0];
    const endTime = occurrence.timeSlot.split('-')[1];
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(occurrence.date);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(occurrence.date);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    return {
      id: occurrence.id,
      facilityId: occurrence.facilityId,
      facilityName: parentBooking.facility || parentBooking.facilityName || 'Ukjent lokale',
      title: parentBooking.description || parentBooking.purpose || 'Gjentakende booking',
      start: startDateTime.toISOString(),
      end: endDateTime.toISOString(),
      status: parentBooking.status === 'confirmed' || parentBooking.status === 'approved' ? 'confirmed' : 
              parentBooking.status === 'pending' ? 'pending' : 
              parentBooking.status === 'rejected' || parentBooking.status === 'cancelled' ? 'cancelled' : 'cancelled',
      priceNok: parentBooking.pricePerHour || 0,
      tags: ['recurring', parentBooking.facility?.toLowerCase() || 'booking']
    };
  } catch (error) {
    console.error('Error converting recurring occurrence to event:', error);
    return {
      id: occurrence.id || 'unknown',
      facilityId: occurrence.facilityId || 'unknown',
      facilityName: parentBooking.facility || parentBooking.facilityName || 'Ukjent lokale',
      title: parentBooking.description || parentBooking.purpose || 'Gjentakende booking',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      status: 'cancelled' as const,
      priceNok: 0,
      tags: ['error']
    };
  }
};

export const calendarService = {
  async list(params: ICalendarQuery): Promise<readonly IBookingEvent[]> {
    // Get bookings from localStorage
    const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
    const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
    
    // Combine all bookings
    const allBookings = [...pendingBookings, ...processedBookings];
    
    
    // Convert bookings to calendar events
    const events: IBookingEvent[] = [];
    
    for (const booking of allBookings) {
      // Convert booking to calendar event (all bookings are now stored as individual occurrences)
      const event = convertBookingToEvent(booking);
      events.push(event);
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Filter based on query parameters
    let filtered = events;
    
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
    
    // Filter by date range
    if (params.from && params.to) {
      const fromDate = new Date(params.from);
      const toDate = new Date(params.to);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= fromDate && eventDate <= toDate;
      });
    }
    
    return filtered;
  },
} as const;
