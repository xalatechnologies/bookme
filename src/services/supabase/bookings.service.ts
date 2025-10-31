import { BaseSupabaseService } from './base.service';
import type { IBooking } from '@/types/booking';

class BookingsService extends BaseSupabaseService {
  async getForUser(userId: string): Promise<IBooking[]> {
    const res = await this.client
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });
    return this.handle<IBooking[]>(res);
  }
  
  async getAll(): Promise<IBooking[]> {
    const res = await this.client
      .from('bookings')
      .select('*')
      .order('start_time', { ascending: false });
    return this.handle<IBooking[]>(res);
  }
  
  async getById(id: string): Promise<IBooking> {
    const res = await this.client
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();
    return this.handle<IBooking>(res);
  }
  
  async create(booking: Omit<IBooking, 'id'>): Promise<IBooking> {
    const res = await this.client
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    return this.handle<IBooking>(res);
  }
  
  async update(id: string, updates: Partial<IBooking>): Promise<IBooking> {
    const res = await this.client
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return this.handle<IBooking>(res);
  }
  
  async delete(id: string): Promise<void> {
    const res = await this.client
      .from('bookings')
      .delete()
      .eq('id', id);
    this.handle(res);
    return Promise.resolve();
  }
}

export const bookingsService = new BookingsService();