/**
 * Centralized exports for UI component variants
 *
 * This file provides a single entry point for importing CVA variants.
 * Separating variants from components helps avoid react-refresh/only-export-components errors.
 *
 * @example
 * ```tsx
 * import { buttonVariants, badgeVariants } from '@/components/ui/variants';
 * ```
 */

export { badgeVariants } from './badgeVariants';
export { buttonVariants } from './buttonVariants';
export { toggleVariants } from './toggleVariants';
