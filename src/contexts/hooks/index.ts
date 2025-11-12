/**
 * Centralized exports for all context hooks
 *
 * This file provides a single entry point for importing hooks from various contexts.
 * Import hooks from this file instead of directly from context files to ensure
 * proper separation of concerns and avoid react-refresh/only-export-components errors.
 *
 * @example
 * ```tsx
 * import { useAuth, useCart, useUserProfile, useLanguage } from '@/contexts/hooks';
 * ```
 */

export { useAuth, useRequireAuth } from './useAuth';
export { useCart } from './useCart';
export { useUserProfile } from './useUserProfile';
export { useLanguage } from './useLanguage';

// Re-export providers for convenience
export { AuthProvider } from '../AuthContext';
export { CartProvider } from '../CartContext';
export { UserProfileProvider } from '../UserProfileContext';
export { LanguageProvider } from '../LanguageContext';
