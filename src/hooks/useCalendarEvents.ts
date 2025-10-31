import { useQuery } from '@tanstack/react-query';
import { bookingsService } from '@/services/supabase/bookings.service';
import type { IBookingEvent } from '@/types/calendar';

// Convert booking data to calendar events
const convertBookingToEvent = (booking: any): IBookingEvent => {
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
    } else if (booking.start_date) {
      bookingDate = new Date(booking.start_date);
    } else {
      bookingDate = new Date();
    }
    
    // Validate date
    if (isNaN(bookingDate.getTime())) {
      bookingDate = new Date();
    }
  
    // Parse time - handle different formats (prioritize time over start_time/end_time)
    let startTime: string, endTime: string;
    if (booking.time && booking.time.includes('-')) {
      [startTime, endTime] = booking.time.split('-').map((t: string) => t.trim());
    } else if (booking.time) {
      // Handle single time format
      startTime = booking.time;
      endTime = booking.time;
    } else if (booking.start_time && booking.end_time) {
      startTime = booking.start_time;
      endTime = booking.end_time;
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
    } else if (typeof booking.total_price === 'number') {
      priceNok = booking.total_price;
    } else {
      priceNok = 0;
    }
    
    const event: IBookingEvent = {
      id: booking.id,
      facilityId: booking.facility_id || booking.facilityId || booking.id,
      facilityName: booking.facility_name || booking.facilityName || booking.facility || 'Ukjent lokale',
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
      facilityId: booking.facility_id || booking.facilityId || booking.id || 'unknown',
      facilityName: booking.facility_name || booking.facilityName || booking.facility || 'Ukjent lokale',
      title: booking.description || booking.purpose || 'Booking',
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      status: 'cancelled',
      priceNok: 0,
      tags: ['error']
    };
  }
};

export const useCalendarEvents = (userId?: string) => {
  return useQuery({
    queryKey: ['calendar-events', userId],
    queryFn: async () => {
      // If userId is provided, get user's bookings, otherwise get all bookings
      const bookings = userId 
        ? await bookingsService.getForUser(userId)
        : await bookingsService.getAll();
      
      // Convert bookings to calendar events
      return bookings.map(convertBookingToEvent);
    },
    enabled: true,
  });
};

export const useFacilityCalendarEvents = (facilityId: string) => {
  return useQuery({
    queryKey: ['calendar-events', 'facility', facilityId],
    queryFn: async () => {
      // Get all bookings for this facility
      const allBookings = await bookingsService.getAll();
      const facilityBookings = allBookings.filter(booking => booking.facility_id === facilityId);
      
      // Convert bookings to calendar events
      return facilityBookings.map(convertBookingToEvent);
    },
    enabled: !!facilityId,
  });
};