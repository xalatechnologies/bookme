/**
 * SearchInput Component
 *
 * Reusable search input with icon, clear button, and i18n support.
 * Implements Single Responsibility Principle - handles only search input UI.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly showClearButton?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly namespace?: string;
}

/**
 * Reusable search input component with clear functionality
 *
 * @example
 * ```tsx
 * <SearchInput
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search facilities..."
 *   showClearButton
 * />
 * ```
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  showClearButton = true,
  disabled = false,
  className = '',
  namespace = 'common'
}: SearchInputProps): JSX.Element => {
  const { t } = useTranslation(namespace as any);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const defaultPlaceholder = t('search.placeholder', 'Søk...');
  const defaultAriaLabel = t('aria.search_input', 'Søkefelt');

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
        aria-hidden="true"
      />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || defaultPlaceholder}
        disabled={disabled}
        className="pl-10 pr-10 h-12"
        aria-label={ariaLabel || defaultAriaLabel}
      />
      {showClearButton && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
          aria-label={t('search.clear_search', 'Tøm søk')}
        >
          <X className="h-4 w-4 text-gray-400" />
        </Button>
      )}
    </div>
  );
};
