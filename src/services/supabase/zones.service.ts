import { BaseSupabaseService } from './base.service';
import type { Zone } from '@/types/booking';

export class ZonesService extends BaseSupabaseService {
  async getAll() {
    const res = await this.client.from('zones').select('*');
    return this.handle<readonly Zone[]>(res);
  }
  
  async getByFacilityId(facilityId: string) {
    const res = await this.client.from('zones').select('*').eq('facility_id', facilityId);
    return this.handle<readonly Zone[]>(res);
  }
  
  async getById(id: string) {
    const res = await this.client.from('zones').select('*').eq('id', id).single();
    return this.handle<Zone>(res);
  }
}

export const zonesService = new ZonesService();