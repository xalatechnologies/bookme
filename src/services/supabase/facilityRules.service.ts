/**
 * Facility Rules Service
 * 
 * Service for managing facility rules in Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/clients/supabase';

// Types
export type FacilityRule = {
  id: string;
  facility_id: string;
  rule_text: string;
  rule_type: 'booking' | 'safety' | 'general' | 'cancellation';
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type FacilityRuleInsert = Omit<FacilityRule, 'id' | 'created_at' | 'updated_at'>;
export type FacilityRuleUpdate = Partial<Omit<FacilityRule, 'id' | 'facility_id' | 'created_at' | 'updated_at'>>;

/**
 * Fetch all rules for a facility
 */
export const useFacilityRules = (facilityId: string, enabled = true) => {
  return useQuery({
    queryKey: ['facility-rules', facilityId],
    queryFn: async () => {
      // Don't fetch if no facility ID
      if (!facilityId) {
        return [];
      }

      const { data, error } = await supabase
        .from('facility_rules' as any)
        .select('*')
        .eq('facility_id', facilityId)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching facility rules:', error);
        throw error;
      }
      return (data || []) as unknown as FacilityRule[];
    },
    enabled: enabled && !!facilityId,
  });
};

/**
 * Create a new facility rule
 */
export const useCreateFacilityRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rule: FacilityRuleInsert) => {
      const { data, error } = await supabase
        .from('facility_rules' as any)
        .insert([rule as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating facility rule:', error);
        throw error;
      }
      return data as unknown as FacilityRule;
    },
    onSuccess: (data) => {
      // Invalidate and refetch rules for this facility
      queryClient.invalidateQueries({ queryKey: ['facility-rules', data.facility_id] });
    },
  });
};

/**
 * Update a facility rule
 */
export const useUpdateFacilityRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FacilityRuleUpdate }) => {
      const { data, error } = await supabase
        .from('facility_rules' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating facility rule:', error);
        throw error;
      }
      return data as unknown as FacilityRule;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facility-rules', data.facility_id] });
    },
  });
};

/**
 * Delete a facility rule
 */
export const useDeleteFacilityRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, facilityId }: { id: string; facilityId: string }) => {
      const { error } = await supabase
        .from('facility_rules' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facility-rules', data.facilityId] });
    },
  });
};

/**
 * Reorder facility rules
 */
export const useReorderFacilityRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, rules }: { facilityId: string; rules: { id: string; sort_order: number }[] }) => {
      // Update all rules with new sort orders
      const updates = rules.map(rule =>
        supabase
          .from('facility_rules' as any)
          .update({ sort_order: rule.sort_order } as any)
          .eq('id', rule.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw errors[0].error;
      }

      return { facilityId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facility-rules', data.facilityId] });
    },
  });
};
