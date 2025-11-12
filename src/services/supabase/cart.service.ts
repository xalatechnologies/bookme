/**
 * Cart Service
 *
 * Manages shopping cart functionality for booking facilities.
 *
 * Features:
 * - Add/remove items from cart
 * - Update cart item quantities
 * - Calculate totals with services
 * - Apply discounts and promotions
 * - Cart persistence per user
 * - Cart expiration
 *
 * @module services/supabase/cart
 */

import { supabase } from './client';
import { handleSupabaseError, NotFoundError, ValidationError } from './errors';
import type {
  Facility,
  Zone,
  AdditionalService,
} from './types';

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
  readonly id: string;
  readonly facilityId: string;
  readonly zoneId?: string | null;
  readonly startTime: string;
  readonly endTime: string;
  readonly services?: CartItemService[];
  readonly notes?: string;
  readonly createdAt: string;
}

export interface CartItemService {
  readonly serviceId: string;
  readonly quantity: number;
  readonly priceCents: number;
}

export interface CartItemWithDetails extends CartItem {
  readonly facility?: Facility;
  readonly zone?: Zone | null;
  readonly serviceDetails?: AdditionalService[];
  readonly subtotal: number;
  readonly servicesTotals: number;
  readonly total: number;
}

export interface Cart {
  readonly userId: string;
  readonly items: CartItem[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string;
}

export interface CartSummary {
  readonly itemCount: number;
  readonly subtotal: number;
  readonly servicesTotal: number;
  readonly total: number;
  readonly items: CartItemWithDetails[];
}

export interface AddToCartParams {
  readonly facilityId: string;
  readonly zoneId?: string | null;
  readonly startTime: string;
  readonly endTime: string;
  readonly services?: CartItemService[];
  readonly notes?: string;
}

// ============================================================================
// Cart Service
// ============================================================================

/**
 * Cart Service
 * Uses localStorage for cart persistence (client-side only)
 * For production, consider moving to database table
 */
export class CartService {
  private readonly CART_KEY = 'booknor_cart';
  private readonly CART_EXPIRY_HOURS = 24;

  /**
   * Get user's cart
   *
   * @param userId - User ID
   * @returns User's cart
   */
  async getCart(userId: string): Promise<Cart> {
    try {
      const stored = localStorage.getItem(`${this.CART_KEY}_${userId}`);

      if (!stored) {
        return this.createEmptyCart(userId);
      }

      const cart: Cart = JSON.parse(stored);

      // Check if cart has expired
      if (new Date(cart.expiresAt) < new Date()) {
        await this.clearCart(userId);
        return this.createEmptyCart(userId);
      }

      return cart;
    } catch (error) {
      throw handleSupabaseError(error, 'getCart');
    }
  }

  /**
   * Get cart with detailed item information
   *
   * @param userId - User ID
   * @returns Cart summary with details
   */
  async getCartWithDetails(userId: string): Promise<CartSummary> {
    try {
      const cart = await this.getCart(userId);

      if (cart.items.length === 0) {
        return {
          itemCount: 0,
          subtotal: 0,
          servicesTotal: 0,
          total: 0,
          items: [],
        };
      }

      // Fetch details for each item
      const itemsWithDetails = await Promise.all(
        cart.items.map((item) => this.getCartItemDetails(item))
      );

      // Calculate totals
      const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
      const servicesTotal = itemsWithDetails.reduce(
        (sum, item) => sum + item.servicesTotals,
        0
      );
      const total = subtotal + servicesTotal;

      return {
        itemCount: cart.items.length,
        subtotal,
        servicesTotal,
        total,
        items: itemsWithDetails,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getCartWithDetails');
    }
  }

  /**
   * Add item to cart
   *
   * @param userId - User ID
   * @param params - Item parameters
   * @returns Updated cart
   */
  async addToCart(userId: string, params: AddToCartParams): Promise<Cart> {
    try {
      // Validate item
      await this.validateCartItem(params);

      const cart = await this.getCart(userId);

      const newItem: CartItem = {
        id: this.generateItemId(),
        facilityId: params.facilityId,
        zoneId: params.zoneId,
        startTime: params.startTime,
        endTime: params.endTime,
        services: params.services,
        notes: params.notes,
        createdAt: new Date().toISOString(),
      };

      const updatedCart: Cart = {
        ...cart,
        items: [...cart.items, newItem],
        updatedAt: new Date().toISOString(),
      };

      this.saveCart(userId, updatedCart);
      return updatedCart;
    } catch (error) {
      throw handleSupabaseError(error, 'addToCart');
    }
  }

  /**
   * Remove item from cart
   *
   * @param userId - User ID
   * @param itemId - Cart item ID
   * @returns Updated cart
   */
  async removeFromCart(userId: string, itemId: string): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);

      const updatedCart: Cart = {
        ...cart,
        items: cart.items.filter((item) => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      };

      this.saveCart(userId, updatedCart);
      return updatedCart;
    } catch (error) {
      throw handleSupabaseError(error, 'removeFromCart');
    }
  }

  /**
   * Update cart item
   *
   * @param userId - User ID
   * @param itemId - Cart item ID
   * @param updates - Item updates
   * @returns Updated cart
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updates: Partial<AddToCartParams>
  ): Promise<Cart> {
    try {
      const cart = await this.getCart(userId);

      const itemIndex = cart.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        throw new NotFoundError('Cart item', itemId);
      }

      const updatedItem: CartItem = {
        ...cart.items[itemIndex],
        ...updates,
      };

      const updatedItems = [...cart.items];
      updatedItems[itemIndex] = updatedItem;

      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      this.saveCart(userId, updatedCart);
      return updatedCart;
    } catch (error) {
      throw handleSupabaseError(error, 'updateCartItem');
    }
  }

  /**
   * Clear entire cart
   *
   * @param userId - User ID
   */
  async clearCart(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`${this.CART_KEY}_${userId}`);
    } catch (error) {
      throw handleSupabaseError(error, 'clearCart');
    }
  }

  /**
   * Get cart item count
   *
   * @param userId - User ID
   * @returns Number of items in cart
   */
  async getCartItemCount(userId: string): Promise<number> {
    try {
      const cart = await this.getCart(userId);
      return cart.items.length;
    } catch (error) {
      throw handleSupabaseError(error, 'getCartItemCount');
    }
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  /**
   * Create empty cart
   */
  private createEmptyCart(userId: string): Cart {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.CART_EXPIRY_HOURS * 60 * 60 * 1000
    );

    return {
      userId,
      items: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Save cart to storage
   */
  private saveCart(userId: string, cart: Cart): void {
    localStorage.setItem(`${this.CART_KEY}_${userId}`, JSON.stringify(cart));
  }

  /**
   * Generate unique item ID
   */
  private generateItemId(): string {
    return `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get cart item with details
   */
  private async getCartItemDetails(item: CartItem): Promise<CartItemWithDetails> {
    try {
      // Fetch facility
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', item.facilityId)
        .single();

      if (facilityError) {
        throw handleSupabaseError(facilityError, 'getCartItemDetails:facility');
      }

      // Fetch zone if specified
      let zone = null;
      if (item.zoneId) {
        const { data: zoneData, error: zoneError } = await supabase
          .from('zones')
          .select('*')
          .eq('id', item.zoneId)
          .single();

        if (!zoneError && zoneData) {
          zone = zoneData;
        }
      }

      // Fetch service details
      let serviceDetails: AdditionalService[] = [];
      if (item.services && item.services.length > 0) {
        const serviceIds = item.services.map((s) => s.serviceId);
        const { data: servicesData, error: servicesError } = await supabase
          .from('additional_services')
          .select('*')
          .in('id', serviceIds);

        if (!servicesError && servicesData) {
          serviceDetails = servicesData as AdditionalService[];
        }
      }

      // Calculate pricing
      const hours = this.calculateHours(item.startTime, item.endTime);
      const hourlyRate = zone?.price_per_hour_cents ?? facility?.price_per_hour_cents ?? 0;
      const subtotal = hourlyRate * hours;

      const servicesTotals = item.services?.reduce((sum, service) => {
        return sum + service.priceCents * service.quantity;
      }, 0) ?? 0;

      const total = subtotal + servicesTotals;

      return {
        ...item,
        facility: facility as Facility,
        zone: zone as Zone | null,
        serviceDetails,
        subtotal,
        servicesTotals,
        total,
      };
    } catch (error) {
      throw handleSupabaseError(error, 'getCartItemDetails');
    }
  }

  /**
   * Calculate hours between start and end time
   */
  private calculateHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  }

  /**
   * Validate cart item
   */
  private async validateCartItem(params: AddToCartParams): Promise<void> {
    // Validate times
    const start = new Date(params.startTime);
    const end = new Date(params.endTime);

    if (start >= end) {
      throw new ValidationError('Invalid time range', {
        startTime: ['Start time must be before end time'],
      });
    }

    if (start < new Date()) {
      throw new ValidationError('Invalid start time', {
        startTime: ['Start time cannot be in the past'],
      });
    }

    // Validate facility exists
    const { data: facility, error } = await supabase
      .from('facilities')
      .select('id')
      .eq('id', params.facilityId)
      .single();

    if (error || !facility) {
      throw new NotFoundError('Facility', params.facilityId);
    }

    // Validate zone if specified
    if (params.zoneId) {
      const { data: zone, error: zoneError } = await supabase
        .from('zones')
        .select('id')
        .eq('id', params.zoneId)
        .eq('facility_id', params.facilityId)
        .single();

      if (zoneError || !zone) {
        throw new NotFoundError('Zone', params.zoneId);
      }
    }
  }
}

/**
 * Singleton instance of CartService
 */
export const cartService = new CartService();
