/**
 * Cart Feature Constants
 */

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export const PAYMENT_METHODS = {
  CARD: 'card',
  INVOICE: 'invoice',
  VIPPS: 'vipps',
} as const;

export const CHECKOUT_STEPS = {
  CART: 'cart',
  DETAILS: 'details',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation',
} as const;

// ============================================================================
// LOCALIZATION
// ============================================================================

export const I18N_NAMESPACE = 'cart' as const;

export const CART_I18N_KEYS = {
  TITLE: 'title',
  EMPTY_CART: 'emptyCart',
  CHECKOUT: 'checkout.title',
  ACTIONS: {
    REMOVE: 'actions.remove',
    CLEAR: 'actions.clear',
    PROCEED: 'actions.proceed',
    COMPLETE: 'actions.complete',
  },
  PAYMENT: {
    CARD: 'payment.card',
    INVOICE: 'payment.invoice',
    VIPPS: 'payment.vipps',
  },
  MESSAGES: {
    CHECKOUT_SUCCESS: 'messages.checkoutSuccess',
    CHECKOUT_ERROR: 'messages.checkoutError',
  },
} as const;

// ============================================================================
// RBAC
// ============================================================================

export const CART_PERMISSIONS = {
  VIEW_CART: ['user', 'facility_manager', 'admin'],
  CHECKOUT: ['user', 'facility_manager', 'admin'],
  CHECKOUT_ON_BEHALF: ['facility_manager', 'admin'],
} as const;

export function hasCartPermission(
  userRoles: string[],
  requiredPermission: keyof typeof CART_PERMISSIONS
): boolean {
  const allowedRoles = CART_PERMISSIONS[requiredPermission];
  return userRoles.some(role => allowedRoles.includes(role as never));
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

export const CART_DESIGN = {
  ITEM: {
    BASE: 'flex items-center gap-4 p-4 border-b hover:bg-gray-50',
    IMAGE: 'w-20 h-20 rounded object-cover',
  },
  SUMMARY: {
    BASE: 'bg-gray-50 rounded-lg p-6 sticky top-4',
    ROW: 'flex justify-between py-2',
    TOTAL: 'text-xl font-bold border-t pt-4 mt-4',
  },
} as const;

// ============================================================================
// ANIMATIONS
// ============================================================================

export const CART_ANIMATIONS = {
  DURATION: {
    ITEM_REMOVE: 300,
  },
  TRANSITIONS: {
    ITEM: 'transition-all duration-300 ease-in-out',
  },
  VARIANTS: {
    ITEM_EXIT: {
      initial: { opacity: 1, height: 'auto' },
      exit: { opacity: 0, height: 0 },
    },
  },
} as const;

// ============================================================================
// PERFORMANCE
// ============================================================================

export const CART_PERFORMANCE = {
  DEBOUNCE: {
    QUANTITY_UPDATE: 500,
  },
  LOCAL_STORAGE_KEY: 'bookme_cart',
} as const;
