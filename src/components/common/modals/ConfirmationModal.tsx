"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/common/modals/BaseModal";

interface ConfirmationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title?: string;
  readonly message?: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText
}): JSX.Element => {
  const { t } = useTranslation('common');

  const handleConfirm = (): void => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('actions.delete')}
      size="sm"
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            {cancelText || t('actions.cancel')}
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            {confirmText || t('actions.confirm')}
          </Button>
        </>
      }
    >
      <p className="text-gray-700 dark:text-gray-300">
        {message || (t('actions.delete') + ' ' + (t('common.attachment') as string).toLowerCase() + '?')}
      </p>
    </BaseModal>
  );
};