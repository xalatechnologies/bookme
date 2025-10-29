/**
 * Cart Feature Types
 *
 * Type definitions for cart and checkout functionality
 */

export type PaymentMethod = 'card' | 'invoice' | 'vipps';

export type CheckoutStep = 'cart' | 'details' | 'payment' | 'confirmation';

export interface ICartItem {
  readonly id: string;
  readonly bookingData: unknown; // Reference to booking data
  readonly facilityName: string;
  readonly date: Date;
  readonly timeSlot: string;
  readonly price: number;
}

export interface ICheckoutDetails {
  readonly email: string;
  readonly phone: string;
  readonly notes?: string;
  readonly paymentMethod: PaymentMethod;
}

export interface IOrderSummary {
  readonly subtotal: number;
  readonly vat: number;
  readonly total: number;
  readonly itemCount: number;
}
