"use client";

import { useState, useCallback } from "react";

/**
 * Modal state management hook
 *
 * Provides a consistent interface for managing modal open/close state
 * following the Single Responsibility Principle (SRP) by focusing only
 * on modal state management.
 *
 * @returns {Object} Modal state and control functions
 * @returns {boolean} isOpen - Current modal visibility state
 * @returns {() => void} open - Function to open the modal
 * @returns {() => void} close - Function to close the modal
 * @returns {() => void} toggle - Function to toggle modal state
 *
 * @example
 * const { isOpen, open, close } = useModal();
 *
 * return (
 *   <>
 *     <Button onClick={open}>Open Modal</Button>
 *     <BaseModal isOpen={isOpen} onClose={close} title="Example">
 *       Content here
 *     </BaseModal>
 *   </>
 * );
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle
  } as const;
};

/**
 * Type definitions for useModal hook
 */
export interface UseModalReturn {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}
