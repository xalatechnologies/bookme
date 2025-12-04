/**
 * Facility Rules Types
 * 
 * Type definitions for facility rules
 */

export type FacilityRuleType = 'booking' | 'safety' | 'general' | 'cancellation';

export interface FacilityRule {
  id: string;
  facility_id: string;
  rule_text: string;
  rule_type: FacilityRuleType;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type FacilityRuleInsert = Omit<FacilityRule, 'id' | 'created_at' | 'updated_at'>;
export type FacilityRuleUpdate = Partial<Omit<FacilityRule, 'id' | 'facility_id' | 'created_at' | 'updated_at'>>;

/**
 * Rule type labels for display
 */
export const RULE_TYPE_LABELS: Record<FacilityRuleType, string> = {
  booking: 'Booking',
  safety: 'Sikkerhet',
  general: 'Generelt',
  cancellation: 'Kansellering',
};

/**
 * Default facility rules
 * These are shown when a facility has no custom rules
 */
export const DEFAULT_FACILITY_RULES: Omit<FacilityRule, 'id' | 'facility_id' | 'created_at' | 'updated_at'>[] = [
  {
    rule_text: 'Røyking er ikke tillatt',
    rule_type: 'safety',
    is_required: true,
    sort_order: 0,
  },
  {
    rule_text: 'Rydding er påkrevd etter bruk',
    rule_type: 'general',
    is_required: true,
    sort_order: 1,
  },
  {
    rule_text: 'Støy etter 22:00 er ikke tillatt',
    rule_type: 'general',
    is_required: true,
    sort_order: 2,
  },
  {
    rule_text: 'Gratis kansellering inntil 24 timer før oppstart',
    rule_type: 'cancellation',
    is_required: false,
    sort_order: 3,
  },
];
