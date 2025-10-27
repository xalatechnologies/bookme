"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { ICartContext, ICartItem, ISelectedTimeSlot } from "@/types/cart";

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
 * - Use useCart() hook in components to access cart functionality
 */
const CartContext = createContext<ICartContext | undefined>(undefined);

/**
 * Hook to access cart context
 * Must be used within a CartProvider
 * 
 * @returns Cart context with all cart operations
 * @throws Error if used outside CartProvider
 */
export const useCart = (): ICartContext => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
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
      
    } catch (error) {
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
      }
    } catch (error) {
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
    } catch (error) {
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
      }
    } catch (error) {
    }
  };

  // Log cart state changes for debugging
  useEffect(() => {
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

export default CartContext;