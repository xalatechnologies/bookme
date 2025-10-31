/**
 * FilterChip Component
 *
 * Reusable filter chip/badge showing active filter with remove option.
 * Implements Single Responsibility Principle - displays single filter state.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FilterChipProps {
  readonly label: string;
  readonly value: string;
  readonly onRemove: () => void;
  readonly variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  readonly disabled?: boolean;
  readonly namespace?: string;
}

/**
 * Display active filter as a removable chip/badge
 *
 * @example
 * ```tsx
 * <FilterChip
 *   label="Type"
 *   value="Idrettshall"
 *   onRemove={() => clearFilter('type')}
 * />
 * ```
 */
export const FilterChip = ({
  label,
  value,
  onRemove,
  variant = 'secondary',
  disabled = false,
  namespace = 'common'
}: FilterChipProps): JSX.Element => {
  const { t } = useTranslation(namespace);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  return (
    <Badge
      variant={variant}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
    >
      <span className="text-gray-600 font-normal">{label}:</span>
      <span className="font-medium">{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={disabled}
        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
        aria-label={t('aria.remove_filter', { label })}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );
};
