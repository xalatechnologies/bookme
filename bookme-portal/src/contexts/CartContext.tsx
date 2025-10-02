"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

import type { CartItem } from '@/types/cart';

interface CartContextType {
  readonly items: readonly CartItem[];
  readonly totalPrice: number;
  readonly itemCount: number;
  readonly addToCart: (item: Omit<CartItem, 'id'>) => void;
  readonly removeFromCart: (itemId: string) => void;
  readonly updateReservation: (itemId: string, updates: Partial<CartItem>) => void;
  readonly clearCart: () => void;
  readonly getTotalPrice: () => number;
  readonly getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  readonly children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }): JSX.Element => {
  const [items, setItems] = useState<readonly CartItem[]>([]);

  const calculateTotalPrice = useCallback((cartItems: readonly CartItem[]): number => {
    return cartItems.reduce((total, item) => {
      const numberOfSlots = item.timeSlots.length;
      return total + (item.pricePerHour * numberOfSlots);
    }, 0);
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>): void => {
    const newItem: CartItem = {
      ...item,
      id: `${item.facilityId}-${item.zoneId}-${Date.now()}`
    };
    
    setItems(prevItems => {
      const newItems = [...prevItems, newItem];
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string): void => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const updateReservation = useCallback((itemId: string, updates: Partial<CartItem>): void => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const clearCart = useCallback((): void => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback((): number => {
    return calculateTotalPrice(items);
  }, [items, calculateTotalPrice]);

  const getItemCount = useCallback((): number => {
    return items.length;
  }, [items]);

  const totalPrice = calculateTotalPrice(items);
  const itemCount = items.length;

  const value: CartContextType = {
    items,
    totalPrice,
    itemCount,
    addToCart,
    removeFromCart,
    updateReservation,
    clearCart,
    getTotalPrice,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
