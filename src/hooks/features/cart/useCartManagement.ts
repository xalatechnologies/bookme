/**
 * Cart Management Hook
 *
 * Connects UI components to cart business logic and data services.
 * Provides a clean interface for cart management operations including
 * item management, price calculations, discount application, and checkout validation.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useMemo, useCallback } from 'react';
import { useCartUIStore, type TCartView, type TCartSortBy, type TCheckoutStep } from '@/stores/cartUIStore';
import {
  validateCartItem,
  calculateCartTotal,
  applyDiscount,
  calculateVAT,
  canCheckout,
  validateInventory,
  groupItemsByFacility,
  findTimeSlotConflicts,
  calculatePriceBreakdown,
  hasRecurringBookings,
  calculateRecurringTotal,
  formatCartForDisplay,
  type ICartValidation,
  type ICartTotals,
  type IDiscountRule,
} from '@/services/business/cart.business.service';
import type { ICartItem } from '@/types/cart';

export interface IUseCartManagementReturn {
  // Data (would be fetched from API in real implementation)
  readonly items: readonly ICartItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;

  // Totals
  readonly totals: ICartTotals;
  readonly priceBreakdown: ReturnType<typeof calculatePriceBreakdown>;
  readonly hasRecurringBookings: boolean;

  // Validation
  readonly checkoutValidation: { canCheckout: boolean; reason?: string };
  readonly conflicts: readonly {
    readonly item1Index: number;
    readonly item2Index: number;
    readonly reason: string;
  }[];

  // UI State
  readonly view: TCartView;
  readonly showFilters: boolean;
  readonly searchTerm: string;
  readonly facilityFilter: readonly string[];
  readonly dateFilter: string | null;
  readonly sortBy: TCartSortBy;
  readonly sortOrder: string;
  readonly selectedItemIds: readonly string[];
  readonly checkoutStep: TCheckoutStep;
  readonly modals: {
    readonly checkout: boolean;
    readonly remove: boolean;
    readonly clear: boolean;
  };
  readonly activeItemId: string | null;

  // UI Actions
  readonly setView: (view: TCartView) => void;
  readonly toggleFilters: () => void;
  readonly setSearchTerm: (term: string) => void;
  readonly toggleFacilityFilter: (facility: string) => void;
  readonly setDateFilter: (date: string | null) => void;
  readonly toggleSort: (sortBy: TCartSortBy) => void;
  readonly toggleItemSelection: (id: string) => void;
  readonly selectAllItems: () => void;
  readonly clearSelection: () => void;
  readonly resetFilters: () => void;
  readonly setCheckoutStep: (step: TCheckoutStep) => void;
  readonly nextCheckoutStep: () => void;
  readonly previousCheckoutStep: () => void;
  readonly resetCheckout: () => void;
  readonly openModal: (modal: 'checkout' | 'remove' | 'clear', itemId?: string) => void;
  readonly closeModal: (modal: 'checkout' | 'remove' | 'clear') => void;
  readonly closeAllModals: () => void;
  readonly setActiveItemId: (id: string | null) => void;

  // Business Operations
  readonly validateCartItem: (item: Partial<ICartItem>) => { isValid: boolean; errors: string[] };
  readonly calculateCartTotal: () => ICartTotals;
  readonly applyDiscount: (discountRule: IDiscountRule) => ICartTotals;
  readonly calculateVAT: (amount: number, vatRate?: number) => {
    amount: number;
    vatAmount: number;
    totalWithVAT: number;
  };
  readonly validateInventory: (
    bookedSlots?: ReadonlyMap<string, readonly string[]>
  ) => ICartValidation;
  readonly groupItemsByFacility: () => ReadonlyMap<string, readonly ICartItem[]>;
  readonly calculateRecurringTotal: (occurrences: number) => ICartTotals;
  readonly formatCartForDisplay: () => ReturnType<typeof formatCartForDisplay>;
}

/**
 * Hook for managing shopping cart with business logic separation
 *
 * Provides comprehensive cart management functionality including:
 * - Data fetching and caching (would use React Query in real implementation)
 * - UI state management via Zustand store
 * - Business logic validation and operations
 * - Price calculations with VAT
 * - Discount application
 * - Checkout validation
 * - Conflict detection
 * - Recurring booking support
 *
 * @returns Complete cart management interface
 *
 * @example
 * ```tsx
 * function ShoppingCart() {
 *   const {
 *     items,
 *     totals,
 *     checkoutValidation,
 *     conflicts,
 *     applyDiscount,
 *     validateInventory,
 *     openModal,
 *   } = useCartManagement();
 *
 *   const handleCheckout = () => {
 *     if (!checkoutValidation.canCheckout) {
 *       toast.error(checkoutValidation.reason);
 *       return;
 *     }
 *
 *     const inventoryCheck = validateInventory(bookedSlots);
 *     if (!inventoryCheck.isValid) {
 *       toast.error(inventoryCheck.errors[0]);
 *       return;
 *     }
 *
 *     openModal('checkout');
 *   };
 *
 *   const handleApplyDiscount = () => {
 *     const discountedTotals = applyDiscount({
 *       type: 'percentage',
 *       value: 10,
 *     });
 *     console.log('Discounted price:', discountedTotals.finalPrice);
 *   };
 *
 *   return (
 *     <div>
 *       <CartItemList items={items} />
 *       {conflicts.length > 0 && <ConflictWarning conflicts={conflicts} />}
 *       <CartTotals totals={totals} />
 *       <CheckoutButton onClick={handleCheckout} />
 *     </div>
 *   );
 * }
 * ```
 */
export const useCartManagement = (items: readonly ICartItem[] = []): IUseCartManagementReturn => {
  // In a real implementation, data would be fetched here
  // const { data: items = [], isLoading, error } = useCartItems(userId);
  const isLoading = false;
  const error = null;

  // UI state layer - Zustand store for UI-specific state
  const {
    view,
    showFilters,
    searchTerm,
    facilityFilter,
    dateFilter,
    sortBy,
    sortOrder,
    selectedItemIds,
    checkoutStep,
    modals,
    activeItemId,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleFacilityFilter,
    setDateFilter,
    toggleSort,
    toggleItemSelection,
    selectAllItems: selectAll,
    clearSelection,
    resetFilters,
    setCheckoutStep,
    nextCheckoutStep,
    previousCheckoutStep,
    resetCheckout,
    openModal,
    closeModal,
    closeAllModals,
    setActiveItemId,
  } = useCartUIStore();

  // Business logic layer - calculations
  const totals = useMemo(() => calculateCartTotal(items), [items]);

  const priceBreakdown = useMemo(() => calculatePriceBreakdown(items), [items]);

  const hasRecurringBookingsValue = useMemo(() => hasRecurringBookings(items), [items]);

  const checkoutValidation = useMemo(() => canCheckout(items), [items]);

  const conflicts = useMemo(() => findTimeSlotConflicts(items), [items]);

  // Business operations - wrapped with useCallback for stability
  const calculateCartTotalCallback = useCallback((): ICartTotals => {
    return calculateCartTotal(items);
  }, [items]);

  const applyDiscountCallback = useCallback(
    (discountRule: IDiscountRule): ICartTotals => {
      return applyDiscount(totals, discountRule, items);
    },
    [totals, items]
  );

  const calculateVATCallback = useCallback(
    (amount: number, vatRate: number = 0.25) => {
      return calculateVAT(amount, vatRate);
    },
    []
  );

  const validateInventoryCallback = useCallback(
    (bookedSlots?: ReadonlyMap<string, readonly string[]>): ICartValidation => {
      return validateInventory(items, bookedSlots);
    },
    [items]
  );

  const groupItemsByFacilityCallback = useCallback((): ReadonlyMap<
    string,
    readonly ICartItem[]
  > => {
    return groupItemsByFacility(items);
  }, [items]);

  const calculateRecurringTotalCallback = useCallback(
    (occurrences: number = 1): ICartTotals => {
      return calculateRecurringTotal(items, occurrences);
    },
    [items]
  );

  const formatCartForDisplayCallback = useCallback((): ReturnType<
    typeof formatCartForDisplay
  > => {
    return formatCartForDisplay(items);
  }, [items]);

  const selectAllItems = useCallback(() => {
    selectAll(items.map((i) => i.id));
  }, [items, selectAll]);

  return {
    // Data
    items,
    isLoading,
    error,

    // Totals
    totals,
    priceBreakdown,
    hasRecurringBookings: hasRecurringBookingsValue,

    // Validation
    checkoutValidation,
    conflicts,

    // UI State
    view,
    showFilters,
    searchTerm,
    facilityFilter,
    dateFilter,
    sortBy,
    sortOrder,
    selectedItemIds,
    checkoutStep,
    modals,
    activeItemId,

    // UI Actions
    setView,
    toggleFilters,
    setSearchTerm,
    toggleFacilityFilter,
    setDateFilter,
    toggleSort,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    resetFilters,
    setCheckoutStep,
    nextCheckoutStep,
    previousCheckoutStep,
    resetCheckout,
    openModal,
    closeModal,
    closeAllModals,
    setActiveItemId,

    // Business Operations
    validateCartItem,
    calculateCartTotal: calculateCartTotalCallback,
    applyDiscount: applyDiscountCallback,
    calculateVAT: calculateVATCallback,
    validateInventory: validateInventoryCallback,
    groupItemsByFacility: groupItemsByFacilityCallback,
    calculateRecurringTotal: calculateRecurringTotalCallback,
    formatCartForDisplay: formatCartForDisplayCallback,
  };
};
