"use client";

import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Modal size variants
 */
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';

/**
 * Base modal props interface
 */
interface BaseModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly size?: ModalSize;
  readonly showCloseButton?: boolean;
  readonly closeOnOverlayClick?: boolean;
  readonly className?: string;
  readonly titleIcon?: React.ReactNode;
}

/**
 * Size class mappings for modal widths
 */
const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl"
};

/**
 * BaseModal component
 *
 * A reusable modal component that follows the Open/Closed Principle (OCP)
 * by providing a consistent base structure that can be extended without modification.
 *
 * Features:
 * - Configurable sizing (sm, md, lg, xl, 2xl, 4xl)
 * - Optional header icon
 * - Optional description
 * - Customizable action buttons in footer
 * - Accessibility compliant with ARIA labels
 * - Keyboard navigation support (ESC to close)
 * - Internationalization support via react-i18next
 *
 * @example
 * <BaseModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Confirm Action"
 *   size="md"
 *   actions={
 *     <>
 *       <Button variant="outline" onClick={onClose}>Cancel</Button>
 *       <Button onClick={onConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </BaseModal>
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  titleIcon
}): JSX.Element => {
  const { t } = useTranslation('common');

  const handleOpenChange = (open: boolean): void => {
    if (!open && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] overflow-y-auto",
          className
        )}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {titleIcon && <span className="flex-shrink-0">{titleIcon}</span>}
              <span>{title}</span>
            </DialogTitle>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t('aria.close_modal')}
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
          {description && (
            <DialogDescription id="modal-description">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {children}
        </div>

        {actions && (
          <DialogFooter className="flex justify-end space-x-2">
            {actions}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Type exports for consuming components
 */
export type { BaseModalProps, ModalSize };
