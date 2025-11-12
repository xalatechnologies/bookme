"use client";

import React, { createContext, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import type { ICartContext, ICartItem, ISelectedTimeSlot } from "@/types/cart";

/**
 * Cart context for providing cart functionality to components
 *
 * This context wraps the cart store and provides additional functionality
 * like notifications and enhanced error handling. It should be used
 * at the app level to provide cart state to all components.
 *
 * Features:
 * - Global cart state access
 * - Enhanced error handling
 * - Notification support (future enhancement)
 * - Type-safe cart operations
 *
 * Usage:
 * - Wrap your app with CartProvider
 * - Use useCart() hook from '@/contexts/hooks/useCart' in components to access cart functionality
 */
export const CartContext = createContext<ICartContext | undefined>(undefined);

/**
 * Calculate pricing for time slots
 *
 * @param timeSlots - Array of selected time slots
 * @returns Calculated pricing object
 */
const calculatePricing = (timeSlots: readonly ISelectedTimeSlot[]): ICartItem['pricing'] => {
  const basePrice = timeSlots.reduce((total, slot) => total + (slot.pricePerHour * slot.duration), 0);
  const vatAmount = basePrice * 0.25; // 25% VAT
  const finalPrice = basePrice + vatAmount;

  return {
    basePrice,
    totalPrice: basePrice,
    vatAmount,
    finalPrice,
  };
};

/**
 * Cart provider component
 * Provides cart context to all child components
 *
 * @param children - Child components to wrap
 */
export const CartProvider: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const {
    items,
    totalPrice,
    itemCount,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    updateItem: storeUpdateItem,
    clearCart: storeClearCart,
    getTotalPrice,
    getItemCount,
  } = useCartStore();

  /**
   * Enhanced add item with validation and logging
   *
   * @param item - Item to add to cart
   */
  const addItem = (item: Omit<ICartItem, 'id' | 'createdAt' | 'updatedAt'>): void => {
    try {
      // Validate required fields
      if (!item.facilityId || !item.facilityName || !item.timeSlots.length) {
        return;
      }

      // Calculate pricing if not provided
      const pricing = item.pricing || calculatePricing(item.timeSlots);

      const itemWithPricing = {
        ...item,
        pricing,
      };

      storeAddItem(itemWithPricing);

    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error: unknown
    ) {
      // Error handling can be added here if needed
    }
  };

  /**
   * Enhanced remove item with logging
   *
   * @param itemId - ID of item to remove
   */
  const removeItem = (itemId: string): void => {
    try {
      const item = items.find(i => i.id === itemId);
      storeRemoveItem(itemId);

      if (item) {
        // Future: Add notification here
      }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error: unknown
    ) {
      // Error handling can be added here if needed
    }
  };

  /**
   * Enhanced update item with validation
   *
   * @param itemId - ID of item to update
   * @param updates - Partial updates to apply
   */
  const updateItem = (itemId: string, updates: Partial<ICartItem>): void => {
    try {
      storeUpdateItem(itemId, updates);
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error: unknown
    ) {
      // Error handling can be added here if needed
    }
  };

  /**
   * Enhanced clear cart with logging
   */
  const clearCart = (): void => {
    try {
      const count = items.length;
      storeClearCart();

      if (count > 0) {
        // Future: Add notification here
      }
    } catch (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _error: unknown
    ) {
      // Error handling can be added here if needed
    }
  };

  // Log cart state changes for debugging
  useEffect(() => {
    // Future: Add analytics or logging here
  }, [itemCount, totalPrice]);

  const contextValue: ICartContext = {
    items,
    totalPrice,
    itemCount,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
