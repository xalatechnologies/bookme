"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Form actions props interface
 */
export interface IFormActionsProps {
  readonly onSubmit?: () => void;
  readonly onCancel?: () => void;
  readonly submitLabel?: string;
  readonly cancelLabel?: string;
  readonly isSubmitting?: boolean;
  readonly isValid?: boolean;
  readonly showCancel?: boolean;
  readonly submitVariant?: 'default' | 'outline' | 'destructive';
  readonly className?: string;
}

/**
 * Reusable form actions component
 *
 * Provides consistent action buttons for forms
 * Follows Single Responsibility Principle - only handles form actions
 *
 * Features:
 * - i18n support
 * - Loading states
 * - Validation states
 * - Accessibility compliant
 *
 * @param props - Form actions props
 */
export const FormActions: React.FC<IFormActionsProps> = ({
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  isValid = true,
  showCancel = true,
  submitVariant = 'default',
  className = '',
}): JSX.Element => {
  const { t } = useTranslation('common');

  return (
    <div className={`flex justify-end space-x-2 pt-4 ${className}`}>
      {showCancel && onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label={cancelLabel || t('actions.cancel')}
        >
          {cancelLabel || t('actions.cancel')}
        </Button>
      )}

      {onSubmit && (
        <Button
          type={onSubmit ? 'button' : 'submit'}
          variant={submitVariant}
          onClick={onSubmit}
          disabled={isSubmitting || !isValid}
          aria-label={submitLabel || t('actions.submit')}
          className="min-w-32"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('actions.loading')}
            </>
          ) : (
            submitLabel || t('actions.submit')
          )}
        </Button>
      )}
    </div>
  );
};
