import { BaseSupabaseService } from './base.service';
import type { IFacility } from '@/types/facility';

class FacilitiesService extends BaseSupabaseService {
  async getAll() {
    const res = await this.client.from('facilities').select('*');
    return this.handle<readonly IFacility[]>(res);
  }
  
  async getById(id: string) {
    const res = await this.client.from('facilities').select('*').eq('id', id).single();
    return this.handle<IFacility>(res);
  }
  
  async create(facility: Omit<IFacility, 'id' | 'createdAt' | 'updatedAt'>) {
    const res = await this.client.from('facilities').insert(facility).select().single();
    return this.handle<IFacility>(res);
  }
  
  async update(id: string, facility: Partial<IFacility>) {
    const res = await this.client.from('facilities').update(facility).eq('id', id).select().single();
    return this.handle<IFacility>(res);
  }
  
  async delete(id: string) {
    const res = await this.client.from('facilities').delete().eq('id', id);
    return this.handle(res);
  }
}

export const facilitiesService = new FacilitiesService();