import type { IBooking } from '@/types/booking';

export function mapBookingFromDb(row: any): IBooking {
  return {
    id: row.id,
    facility_id: row.facility_id,
    user_id: row.user_id,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
  };
}

export function mapBookingToDb(booking: Partial<IBooking>): any {
  const mapped: any = {};
  
  if (booking.facility_id !== undefined) mapped.facility_id = booking.facility_id;
  if (booking.user_id !== undefined) mapped.user_id = booking.user_id;
  if (booking.start_time !== undefined) mapped.start_time = booking.start_time;
  if (booking.end_time !== undefined) mapped.end_time = booking.end_time;
  if (booking.status !== undefined) mapped.status = booking.status;
  
  return mapped;
}