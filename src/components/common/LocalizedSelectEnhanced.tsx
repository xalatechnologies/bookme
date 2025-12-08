/**
 * Enhanced LocalizedSelect Component
 *
 * Advanced select component with:
 * - Search/filter functionality
 * - Grouped options support
 * - Multi-select capability
 * - Loading states
 * - Error handling
 * - Accessibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LocalizedSelectEnhanced
 *   entityType="facility_type"
 *   value={selectedType}
 *   onValueChange={setSelectedType}
 * />
 *
 * // With search
 * <LocalizedSelectEnhanced
 *   entityType="location"
 *   value={selectedLocation}
 *   onValueChange={setSelectedLocation}
 *   searchable
 * />
 *
 * // Multi-select
 * <LocalizedMultiSelect
 *   entityType="accessibility"
 *   value={selectedFeatures}
 *   onValueChange={setSelectedFeatures}
 * />
 * ```
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Loader2, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { useLocalizedDbValueEnhanced } from '@/hooks/shared/useLocalizedDbValueEnhanced';
import type {
  LocalizedEntityType,
  LocalizedSelectProps,
  LocalizedMultiSelectProps,
  LocalizedOption,
} from '@/types/localization';

// ============================================================================
// Single Select Component
// ============================================================================

export const LocalizedSelectEnhanced: React.FC<LocalizedSelectProps> = ({
  entityType,
  value,
  onValueChange,
  placeholder,
  includeAll = false,
  allValue = 'all',
  disabled = false,
  className = '',
  ariaLabel,
  searchable = false,
}): JSX.Element => {
  const { t } = useTranslation('common');
  const [searchTerm] = useState('');

  const { options, loading, error } =
    useLocalizedDbValueEnhanced(entityType, {
      searchEnabled: searchable,
    });

  // Filter options based on search term (client-side)
  const filteredOptions = useMemo(() => {
    let opts = includeAll ? options : options.filter((opt) => opt.value !== allValue);

    if (searchTerm && !searchable) {
      // Client-side search fallback
      const term = searchTerm.toLowerCase();
      opts = opts.filter(
        (opt) =>
          opt.label.toLowerCase().includes(term) ||
          opt.description?.toLowerCase().includes(term)
      );
    }

    return opts;
  }, [options, searchTerm, includeAll, allValue, searchable]);

  // Handle error
  if (error) {
    console.error(`LocalizedSelectEnhanced error for ${entityType}:`, error);
  }

  // Searchable select with Combobox pattern
  if (searchable) {
    return <SearchableSelect
      entityType={entityType}
      value={value}
      onValueChange={onValueChange}
      options={filteredOptions}
      loading={loading}
      disabled={disabled}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      className={className}
    />;
  }

  // Standard select
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || loading}>
      <SelectTrigger
        className={cn('min-h-12', className)}
        aria-label={ariaLabel || `Select ${entityType}`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('loading', 'Loading...')}</span>
          </div>
        ) : (
          <SelectValue
            placeholder={placeholder || t('select_option', 'Select an option')}
          />
        )}
      </SelectTrigger>
      <SelectContent>
        {filteredOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex flex-col">
              <span>{option.label}</span>
              {option.description && (
                <span className="text-xs text-gray-500">{option.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
        {filteredOptions.length === 0 && !loading && (
          <SelectItem value="__empty" disabled>
            {t('no_options', 'No options available')}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

// ============================================================================
// Searchable Select Component (Combobox pattern)
// ============================================================================

interface SearchableSelectProps {
  readonly entityType: LocalizedEntityType;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: readonly LocalizedOption[];
  readonly loading: boolean;
  readonly disabled: boolean;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onValueChange,
  options,
  loading,
  disabled,
  placeholder,
  ariaLabel,
  className,
}): JSX.Element => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;

    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Get selected option label
  const selectedLabel = useMemo(() => {
    return options.find((opt) => opt.value === value)?.label || '';
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled || loading || false}
          className={cn(
            'min-h-12 w-full justify-between text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('loading', 'Loading...')}</span>
            </div>
          ) : (
            <>
              {selectedLabel || placeholder || t('select_option', 'Select an option')}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={t('search', 'Search...')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>{t('no_results', 'No results found.')}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500">
                        {option.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ============================================================================
// Multi-Select Component
// ============================================================================

export const LocalizedMultiSelect: React.FC<LocalizedMultiSelectProps> = ({
  entityType,
  value,
  onValueChange,
  placeholder,
  includeAll = false,
  allValue = 'all',
  disabled = false,
  className = '',
  ariaLabel,
  searchable = false,
  maxSelections,
}): JSX.Element => {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { options, loading, error } = useLocalizedDbValueEnhanced(entityType, {
    searchEnabled: searchable,
  });

  // Filter options
  const filteredOptions = useMemo(() => {
    let opts = includeAll ? options : options.filter((opt) => opt.value !== allValue);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      opts = opts.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          opt.description?.toLowerCase().includes(query)
      );
    }

    return opts;
  }, [options, searchQuery, includeAll, allValue]);

  // Handle selection
  const handleSelect = useCallback(
    (optionValue: string) => {
      const isSelected = value.includes(optionValue);

      if (isSelected) {
        onValueChange(value.filter((v) => v !== optionValue));
      } else {
        if (maxSelections && value.length >= maxSelections) {
          // Max selections reached
          return;
        }
        onValueChange([...value, optionValue]);
      }
    },
    [value, onValueChange, maxSelections]
  );

  // Handle remove
  const handleRemove = useCallback(
    (optionValue: string) => {
      onValueChange(value.filter((v) => v !== optionValue));
    },
    [value, onValueChange]
  );

  // Get selected labels
  const selectedLabels = useMemo(() => {
    return value
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean) as string[];
  }, [value, options]);

  // Handle error
  if (error) {
    console.error(`LocalizedMultiSelect error for ${entityType}:`, error);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel || `Select ${entityType}`}
          disabled={disabled || loading}
          className={cn(
            'min-h-12 w-full justify-between text-left font-normal',
            className
          )}
        >
          <div className="flex flex-1 flex-wrap gap-1">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('loading', 'Loading...')}</span>
              </div>
            ) : value.length > 0 ? (
              selectedLabels.map((label, index) => (
                <Badge
                  key={value[index]}
                  variant="secondary"
                  className="mr-1 rounded-sm px-2 py-0.5 text-xs"
                >
                  {label}
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(value[index]);
                    }}
                    variant="ghost"
                    size="icon"
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 p-0 h-auto w-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">
                {placeholder || t('select_options', 'Select options')}
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder={t('search', 'Search...')}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>{t('no_results', 'No results found.')}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isMaxReached =
                  !!(maxSelections && maxSelections > 0 && value.length >= maxSelections && !isSelected);

                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={isMaxReached}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-gray-500">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
          {maxSelections && (
            <div className="border-t p-2 text-center text-xs text-muted-foreground">
              {value.length}/{maxSelections} selected
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// Export default for backward compatibility
export default LocalizedSelectEnhanced;
