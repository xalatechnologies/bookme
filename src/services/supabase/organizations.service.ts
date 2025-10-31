import { BaseSupabaseService } from './base.service';
import type { IOrganization } from '@/types/organization';

class OrganizationsService extends BaseSupabaseService {
  async getAll() {
    const res = await this.client.from('organizations').select('*');
    return this.handle<readonly IOrganization[]>(res);
  }
  
  async getById(id: string) {
    const res = await this.client.from('organizations').select('*').eq('id', id).single();
    return this.handle<IOrganization>(res);
  }
  
  async create(organization: Omit<IOrganization, 'id' | 'createdAt' | 'updatedAt'>) {
    const res = await this.client.from('organizations').insert(organization).select().single();
    return this.handle<IOrganization>(res);
  }
  
  async update(id: string, organization: Partial<IOrganization>) {
    const res = await this.client.from('organizations').update(organization).eq('id', id).select().single();
    return this.handle<IOrganization>(res);
  }
  
  async delete(id: string) {
    const res = await this.client.from('organizations').delete().eq('id', id);
    return this.handle(res);
  }
}

export const organizationsService = new OrganizationsService();