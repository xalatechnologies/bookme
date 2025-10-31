import { BaseSupabaseService } from './base.service';

export interface IAdditionalService {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly category: 'equipment' | 'catering' | 'technical' | 'cleaning' | 'staff';
  readonly facility_types: readonly string[];
  readonly available: boolean;
}

export class AdditionalServicesService extends BaseSupabaseService {
  async getAll() {
    const res = await this.client.from('additional_services').select('*');
    return this.handle<readonly IAdditionalService[]>(res);
  }
  
  async getByFacilityType(facilityType: string) {
    const res = await this.client.from('additional_services').select('*').contains('facility_types', [facilityType]);
    return this.handle<readonly IAdditionalService[]>(res);
  }
  
  async getById(id: string) {
    const res = await this.client.from('additional_services').select('*').eq('id', id).single();
    return this.handle<IAdditionalService>(res);
  }
}

export const additionalServicesService = new AdditionalServicesService();