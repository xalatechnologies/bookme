/**
 * Localization Type Definitions
 *
 * Comprehensive type definitions for the database-driven localization system.
 * These types ensure type safety across the application when working with
 * localized database values.
 */

// ============================================================================
// Entity Types Enum
// ============================================================================

/**
 * All available entity types in the localized_db_values table
 */
export type LocalizedEntityType =
  | 'facility_type'
  | 'booking_status'
  | 'booking_type'
  | 'ticket_status'
  | 'ticket_priority'
  | 'ticket_category'
  | 'message_type'
  | 'duration'
  | 'payment_method'
  | 'payment_status'
  | 'filter_category'
  | 'year'
  | 'common_label'
  | 'time_slot'
  | 'capacity_range'
  | 'location'
  | 'accessibility'
  | 'recurrence_pattern'
  | 'day_of_week';

// ============================================================================
// Specific Entity Key Types
// ============================================================================

export type FacilityTypeKey = 'idrettshall' | 'kulturhus' | 'møterom' | 'hall';

export type BookingStatusKey =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'completed'
  | 'refunded';

export type BookingTypeKey = 'regular' | 'recurring' | 'group';

export type TicketStatusKey =
  | 'open'
  | 'in-progress'
  | 'waiting-user'
  | 'resolved'
  | 'closed';

export type TicketPriorityKey = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategoryKey =
  | 'booking'
  | 'technical'
  | 'billing'
  | 'feedback'
  | 'other';

export type MessageTypeKey = 'all' | 'system' | 'booking' | 'news';

export type PaymentMethodKey = 'all' | 'visa' | 'mastercard' | 'invoice';

export type PaymentStatusKey =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded';

export type FilterCategoryKey = 'all' | 'active' | 'upcoming' | 'past';

export type TimeSlotKey = 'morning' | 'afternoon' | 'evening' | 'all_day';

export type CapacityRangeKey = 'small' | 'medium' | 'large' | 'extra-large';

export type LocationKey =
  | 'drammen_sentrum'
  | 'stromsø'
  | 'bragernes'
  | 'austad'
  | 'konnerud';

export type AccessibilityKey =
  | 'wheelchair'
  | 'elevator'
  | 'ramp'
  | 'hearing_loop'
  | 'accessible_toilet';

export type RecurrencePatternKey =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly';

export type DayOfWeekKey = '0' | '1' | '2' | '3' | '4' | '5' | '6';

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Core structure of a localized database value
 */
export interface LocalizedDbValue {
  readonly id: string;
  readonly entity_type: LocalizedEntityType;
  readonly entity_key: string;
  readonly language_code: string;
  readonly label: string;
  readonly description: string | null;
  readonly sort_order: number | null;
  readonly is_active: boolean;
  readonly metadata: Record<string, unknown> | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Simplified structure for display options (used in selects)
 */
export interface LocalizedOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly sort_order?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Grouped options for hierarchical selects
 */
export interface LocalizedOptionGroup {
  readonly label: string;
  readonly options: readonly LocalizedOption[];
}

// ============================================================================
// Metadata Interfaces (for specific entity types with metadata)
// ============================================================================

/**
 * Metadata for duration entity type
 */
export interface DurationMetadata {
  readonly hours: number | null;
}

/**
 * Metadata for time_slot entity type
 */
export interface TimeSlotMetadata {
  readonly start: string; // HH:MM format
  readonly end: string; // HH:MM format
}

/**
 * Metadata for capacity_range entity type
 */
export interface CapacityRangeMetadata {
  readonly min: number;
  readonly max: number;
}

/**
 * Metadata for day_of_week entity type
 */
export interface DayOfWeekMetadata {
  readonly day_number: number; // 0-6
}

/**
 * Union type for all metadata types
 */
export type LocalizedMetadata =
  | DurationMetadata
  | TimeSlotMetadata
  | CapacityRangeMetadata
  | DayOfWeekMetadata
  | Record<string, unknown>;

// ============================================================================
// Function Return Types (for database functions)
// ============================================================================

/**
 * Return type for get_localized_values_by_type function
 */
export interface GetLocalizedValuesByTypeResult {
  readonly entity_key: string;
  readonly label: string;
  readonly description: string | null;
  readonly sort_order: number | null;
  readonly metadata: Record<string, unknown> | null;
}

/**
 * Return type for search_localized_values function
 */
export interface SearchLocalizedValuesResult
  extends GetLocalizedValuesByTypeResult {
  readonly relevance: number;
}

/**
 * Return type for get_available_entity_types function
 */
export interface GetAvailableEntityTypesResult {
  readonly entity_type: LocalizedEntityType;
  readonly value_count: number;
  readonly languages: readonly string[];
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useLocalizedDbValue hook
 */
export interface UseLocalizedDbValueResult {
  readonly options: readonly LocalizedOption[];
  readonly loading: boolean;
  readonly error: Error | null;
  readonly getValue: (entityKey: string) => string;
  readonly getOptions: () => readonly LocalizedOption[];
  readonly refresh: () => Promise<void>;
}

/**
 * Return type for useLocalizedDbValues hook (React Query version)
 */
export interface LocalizedDbValueQueryData {
  readonly entity_key: string;
  readonly label: string;
  readonly description: string | null;
  readonly sort_order: number | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for LocalizedSelect component
 */
export interface LocalizedSelectProps {
  readonly entityType: LocalizedEntityType;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly includeAll?: boolean;
  readonly allValue?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly searchable?: boolean;
  readonly grouped?: boolean;
}

/**
 * Props for LocalizedMultiSelect component
 */
export interface LocalizedMultiSelectProps
  extends Omit<LocalizedSelectProps, 'value' | 'onValueChange'> {
  readonly value: readonly string[];
  readonly onValueChange: (value: readonly string[]) => void;
  readonly maxSelections?: number;
}

// ============================================================================
// Admin/Management Types
// ============================================================================

/**
 * Form data for creating/editing localized values
 */
export interface LocalizedValueFormData {
  readonly entity_type: LocalizedEntityType;
  readonly entity_key: string;
  readonly language_code: string;
  readonly label: string;
  readonly description?: string;
  readonly sort_order?: number;
  readonly is_active?: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Bulk import structure
 */
export interface LocalizedValueBulkImport {
  readonly values: readonly LocalizedValueFormData[];
  readonly overwrite?: boolean;
}

/**
 * Export structure
 */
export interface LocalizedValueExport {
  readonly entity_type?: LocalizedEntityType;
  readonly language_code?: string;
  readonly format: 'json' | 'csv' | 'excel';
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache structure for localized values
 */
export interface LocalizedValueCache {
  readonly [entityType: string]: {
    readonly [language: string]: readonly LocalizedOption[];
  };
}

/**
 * Cache entry with timestamp
 */
export interface LocalizedValueCacheEntry {
  readonly data: readonly LocalizedOption[];
  readonly timestamp: number;
  readonly expiresAt: number;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Language code type (ISO 639-1)
 */
export type LanguageCode = 'en' | 'no' | string;

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter options for querying localized values
 */
export interface LocalizedValueFilter {
  readonly entity_type?: LocalizedEntityType;
  readonly entity_keys?: readonly string[];
  readonly language_code?: LanguageCode;
  readonly is_active?: boolean;
  readonly search?: string;
  readonly sort_by?: 'label' | 'sort_order' | 'created_at';
  readonly sort_direction?: SortDirection;
  readonly limit?: number;
  readonly offset?: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid LocalizedEntityType
 */
export function isLocalizedEntityType(
  value: string
): value is LocalizedEntityType {
  const validTypes: readonly string[] = [
    'facility_type',
    'booking_status',
    'booking_type',
    'ticket_status',
    'ticket_priority',
    'ticket_category',
    'message_type',
    'duration',
    'payment_method',
    'payment_status',
    'filter_category',
    'year',
    'common_label',
    'time_slot',
    'capacity_range',
    'location',
    'accessibility',
    'recurrence_pattern',
    'day_of_week',
  ];
  return validTypes.includes(value);
}

/**
 * Type guard to check if metadata is DurationMetadata
 */
export function isDurationMetadata(
  metadata: unknown
): metadata is DurationMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'hours' in metadata &&
    (typeof (metadata as DurationMetadata).hours === 'number' ||
      (metadata as DurationMetadata).hours === null)
  );
}

/**
 * Type guard to check if metadata is TimeSlotMetadata
 */
export function isTimeSlotMetadata(
  metadata: unknown
): metadata is TimeSlotMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'start' in metadata &&
    'end' in metadata &&
    typeof (metadata as TimeSlotMetadata).start === 'string' &&
    typeof (metadata as TimeSlotMetadata).end === 'string'
  );
}

/**
 * Type guard to check if metadata is CapacityRangeMetadata
 */
export function isCapacityRangeMetadata(
  metadata: unknown
): metadata is CapacityRangeMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'min' in metadata &&
    'max' in metadata &&
    typeof (metadata as CapacityRangeMetadata).min === 'number' &&
    typeof (metadata as CapacityRangeMetadata).max === 'number'
  );
}
