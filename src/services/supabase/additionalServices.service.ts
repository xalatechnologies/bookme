import { supabase } from './client';
import type { Database } from '@/types/database';
import { handleSupabaseError } from './errors';

export type AdditionalService = Database['public']['Tables']['additional_services']['Row'];

export interface UpsertAdditionalServiceInput {
  readonly id?: string;
  readonly facilityId: string;
  readonly orgId: string;
  readonly name: string;
  readonly priceCents: number;
  readonly currency?: string;
  readonly description?: string | null;
  readonly category?: Database['public']['Enums']['service_category'];
  readonly priceType?: Database['public']['Enums']['service_price_type'];
  readonly availability?: Database['public']['Enums']['service_availability'];
  readonly minQuantity?: number;
  readonly maxQuantity?: number | null;
  readonly requiresApproval?: boolean;
}

export const fetchAdditionalServicesByFacility = async (facilityId: string): Promise<AdditionalService[]> => {
  const { data, error } = await supabase
    .from('additional_services')
    .select('*')
    .eq('facility_id', facilityId)
    .order('name', { ascending: true });

  if (error) throw handleSupabaseError(error);
  return data || [];
};

export const createAdditionalService = async (input: UpsertAdditionalServiceInput): Promise<AdditionalService> => {
  const { data, error } = await supabase
    .from('additional_services')
    .insert({
      facility_id: input.facilityId,
      org_id: input.orgId,
      name: input.name,
      price_cents: input.priceCents,
      currency: input.currency || 'NOK',
      description: input.description ?? null,
      category: input.category || 'other',
      price_type: input.priceType || 'per-hour',
      availability: input.availability || 'available',
      min_quantity: input.minQuantity ?? 1,
      max_quantity: input.maxQuantity ?? null,
      requires_approval: input.requiresApproval ?? false,
    })
    .select()
    .single();

  if (error) throw handleSupabaseError(error);
  return data as AdditionalService;
};

export const deleteAdditionalService = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('additional_services')
    .delete()
    .eq('id', id);

  if (error) throw handleSupabaseError(error);
};

