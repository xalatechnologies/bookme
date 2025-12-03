"use client";

import { create } from "zustand";
import { devtools, persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { ICartItem, ICartState } from "@/types/cart";

/**
 * Custom replacer function for JSON serialization
 * Converts Date objects to ISO strings with a special marker
 */
const replacer = (_key: string, value: unknown): unknown => {
  if (value instanceof Date) {
    return { __type: 'Date', value: value.toISOString() };
  }
  return value;
};

/**
 * Custom reviver function for JSON deserialization
 * Converts ISO strings back to Date objects
 */
const reviver = (_key: string, value: unknown): unknown => {
  if (value && typeof value === 'object' && value !== null && '__type' in value && value.__type === 'Date' && 'value' in value && typeof value.value === 'string') {
    return new Date(value.value);
  }
  return value;
};

/**
 * Cart store using Zustand with persistence
 * 
 * Manages the shopping cart state for facility reservations.
 * Provides full CRUD operations for cart items with automatic
 * price calculation and persistence to localStorage.
 * 
 * Features:
 * - Add/remove/update cart items
 * - Automatic price calculation with VAT
 * - Persistence to localStorage
 * - DevTools support for debugging
 * - Type-safe operations with readonly interfaces
 * 
 * Usage:
 * - Use addItem() to add a new reservation to cart
 * - Use removeItem() to remove a specific item
 * - Use updateItem() to modify existing items
 * - Use clearCart() to empty the entire cart
 * - Use getTotalPrice() and getItemCount() for display
 */
export const useCartStore = create<ICartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        totalPrice: 0,
        itemCount: 0,

        /**
         * Add a new item to the cart
         * Creates a new cart item with unique ID and timestamps
         * 
         * @param item - Cart item data without ID and timestamps
         */
        addItem: (item: Omit<ICartItem, 'id' | 'createdAt' | 'updatedAt'>): void => {
          const now = new Date().toISOString();
          const newItem: ICartItem = {
            ...item,
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            bookingType: item.bookingType || 'one-time', // Default to one-time if not specified
            status: item.status || 'pending', // Default to pending status
            createdAt: now,
            updatedAt: now,
          };

          const currentItems = get().items;
          const newItems = [...currentItems, newItem];
          const totalPrice = calculateTotalPrice(newItems);

          set({
            items: newItems,
            totalPrice,
            itemCount: newItems.length,
          });

        },

        /**
         * Remove an item from the cart
         * Completely removes the specified item
         * 
         * @param itemId - ID of the item to remove
         */
        removeItem: (itemId: string): void => {
          const currentItems = get().items;
          const newItems = currentItems.filter(item => item.id !== itemId);
          const totalPrice = calculateTotalPrice(newItems);

          set({
            items: newItems,
            totalPrice,
            itemCount: newItems.length,
          });

        },

        /**
         * Update an existing cart item
         * Modifies the specified item with new data
         * 
         * @param itemId - ID of the item to update
         * @param updates - Partial data to update
         */
        updateItem: (itemId: string, updates: Partial<ICartItem>): void => {
          const currentItems = get().items;
          const newItems = currentItems.map(item =>
            item.id === itemId
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          );
          const totalPrice = calculateTotalPrice(newItems);

          set({
            items: newItems,
            totalPrice,
            itemCount: newItems.length,
          });

        },

        /**
         * Clear all items from the cart
         * Removes all items and resets counters
         */
        clearCart: (): void => {
          set({
            items: [],
            totalPrice: 0,
            itemCount: 0,
          });

        },

        /**
         * Get total price of all items in cart
         * Calculates the sum of all item prices
         * 
         * @returns Total price including VAT
         */
        getTotalPrice: (): number => {
          return get().totalPrice;
        },

        /**
         * Get total number of items in cart
         * Returns the count of cart items
         * 
         * @returns Number of items in cart
         */
        getItemCount: (): number => {
          return get().itemCount;
        },

        /**
         * Get only recurring items from cart
         * Filters items to return only recurring bookings
         * 
         * @returns Array of recurring cart items
         */
        getRecurringItems: (): readonly ICartItem[] => {
          return get().items.filter(item => item.bookingType === 'recurring');
        },

        /**
         * Get only one-time items from cart
         * Filters items to return only one-time bookings
         * 
         * @returns Array of one-time cart items
         */
        getOneTimeItems: (): readonly ICartItem[] => {
          return get().items.filter(item => item.bookingType === 'one-time');
        },

        /**
         * Get items by type
         * Filters items by booking type
         * 
         * @param type - Booking type to filter by
         * @returns Array of cart items with specified type
         */
        getItemsByType: (type: 'one-time' | 'recurring'): readonly ICartItem[] => {
          return get().items.filter(item => item.bookingType === type);
        },
      }),
      {
        name: "cart-store", // localStorage key
        version: 1, // Version for migration if needed
        storage: createJSONStorage(() => localStorage, { replacer, reviver }),
      }
    ),
    {
      name: "cart-store", // DevTools name
    }
  )
);

/**
 * Calculate total price for cart items
 * Sums up all item prices including VAT
 * 
 * @param items - Array of cart items
 * @returns Total price including VAT
 */
const calculateTotalPrice = (items: readonly ICartItem[]): number => {
  return items.reduce((total, item) => {
    return total + item.pricing.finalPrice;
  }, 0);
};

export type { ICartItem, ICartState };