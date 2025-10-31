import type { IAdditionalService } from '@/services/supabase/additionalServices.service';

export function mapAdditionalServiceFromDb(row: any): IAdditionalService {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    category: row.category,
    facility_types: row.facility_types,
    available: row.available,
  };
}

export function mapAdditionalServiceToDb(service: Partial<IAdditionalService>): any {
  const mapped: any = {};
  
  if (service.name !== undefined) mapped.name = service.name;
  if (service.description !== undefined) mapped.description = service.description;
  if (service.price !== undefined) mapped.price = service.price;
  if (service.category !== undefined) mapped.category = service.category;
  if (service.facility_types !== undefined) mapped.facility_types = service.facility_types;
  if (service.available !== undefined) mapped.available = service.available;
  
  return mapped;
}