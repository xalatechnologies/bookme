/**
 * LocalizedSelect Component
 * 
 * Select component that automatically fetches and displays localized options
 * from the database based on entity type.
 * 
 * @example
 * ```tsx
 * <LocalizedSelect
 *   entityType="facility_type"
 *   value={selectedType}
 *   onValueChange={setSelectedType}
 *   placeholder="Select facility type"
 * />
 * ```
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalizedDbValue } from '@/hooks/useLocalizedDbValue';
import { Loader2 } from 'lucide-react';

export interface LocalizedSelectProps {
  readonly entityType: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly includeAll?: boolean;
  readonly allValue?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly ariaLabel?: string;
}

export const LocalizedSelect: React.FC<LocalizedSelectProps> = ({
  entityType,
  value,
  onValueChange,
  placeholder,
  includeAll = false,
  allValue = 'all',
  disabled = false,
  className = '',
  ariaLabel,
}): JSX.Element => {
  const { t } = useTranslation('common');
  const { options, loading, error } = useLocalizedDbValue(entityType);

  // Filter out 'all' option if not needed, or ensure it's included
  const filteredOptions = includeAll
    ? options
    : options.filter(opt => opt.value !== allValue);

  if (error) {
    console.error(`LocalizedSelect error for ${entityType}:`, error);
  }

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={className}
        aria-label={ariaLabel || `Select ${entityType}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('common.loading', 'Loading...')}</span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder || t('common.select_option', 'Select an option')} />
        )}
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
            {option.description && (
              <span className="text-xs text-gray-500 ml-2">
                ({option.description})
              </span>
            )}
          </SelectItem>
        ))}
        {filteredOptions.length === 0 && !loading && (
          <SelectItem value="__empty" disabled>
            {t('common.no_options', 'No options available')}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};
