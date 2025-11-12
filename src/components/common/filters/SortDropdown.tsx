/**
 * SortDropdown Component
 *
 * Reusable dropdown for sorting options with i18n support.
 * Implements Single Responsibility Principle - handles only sort selection UI.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export interface SortOption {
  readonly value: string;
  readonly label: string;
  readonly translationKey?: string;
}

export interface SortDropdownProps {
  readonly value: string;
  readonly options: readonly SortOption[];
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly namespace?: string;
}

/**
 * Reusable dropdown for sorting selection
 *
 * @example
 * ```tsx
 * <SortDropdown
 *   value={sortBy}
 *   options={[
 *     { value: 'name-asc', label: 'Name (A-Z)', translationKey: 'sort.name_asc' },
 *     { value: 'price-asc', label: 'Price (Low to High)', translationKey: 'sort.price_asc' }
 *   ]}
 *   onChange={setSortBy}
 * />
 * ```
 */
export const SortDropdown = ({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  disabled = false,
  className = '',
  namespace = 'common'
}: SortDropdownProps): JSX.Element => {
  const { t } = useTranslation(namespace as any);

  const defaultPlaceholder = t('filters.sort_by', 'Sorter etter');
  const defaultAriaLabel = t('aria.sort_dropdown', 'Sorteringsvalg');

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={`h-12 ${className}`}
        aria-label={ariaLabel || defaultAriaLabel}
      >
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-gray-500" />
          <SelectValue placeholder={placeholder || defaultPlaceholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.translationKey ? t(option.translationKey, option.label) : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
