/**
 * Cart Business Logic Service
 *
 * Contains all business logic related to cart operations.
 * NO UI logic, NO component dependencies.
 * Pure business rules and data transformations.
 */

import type { ICartItem } from "@/types/cart";

export interface ICartValidation {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

export interface ICartTotals {
  readonly basePrice: number;
  readonly totalPrice: number;
  readonly vatAmount: number;
  readonly finalPrice: number;
  readonly discountAmount: number;
  readonly itemCount: number;
}

export interface IDiscountRule {
  readonly type: 'percentage' | 'fixed' | 'bulk';
  readonly value: number;
  readonly minItems?: number;
  readonly maxDiscount?: number;
  readonly applicableTypes?: readonly ('one-time' | 'recurring')[];
}

/**
 * Validate a single cart item
 */
export const validateCartItem = (item: Partial<ICartItem>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.facilityId) {
    errors.push('Facility ID is required');
  }

  if (!item.zoneId) {
    errors.push('Zone ID is required');
  }

  if (!item.timeSlots || item.timeSlots.length === 0) {
    errors.push('At least one time slot is required');
  }

  if (!item.purpose || item.purpose.trim().length === 0) {
    errors.push('Booking purpose is required');
  }

  if (!item.attendees || item.attendees < 1) {
    errors.push('Number of attendees must be at least 1');
  }

  if (!item.actorType) {
    errors.push('Actor type is required');
  }

  if (!item.activityType || item.activityType.trim().length === 0) {
    errors.push('Activity type is required');
  }

  if (item.pricing) {
    if (item.pricing.finalPrice < 0) {
      errors.push('Price cannot be negative');
    }
  } else {
    errors.push('Pricing information is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate cart total
 */
export const calculateCartTotal = (
  items: readonly ICartItem[]
): ICartTotals => {
  const basePrice = items.reduce((sum, item) => sum + item.pricing.basePrice, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.pricing.totalPrice, 0);
  const vatAmount = items.reduce((sum, item) => sum + item.pricing.vatAmount, 0);
  const finalPrice = items.reduce((sum, item) => sum + item.pricing.finalPrice, 0);

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountAmount: 0,
    itemCount: items.length,
  };
};

/**
 * Apply discount to cart total
 */
export const applyDiscount = (
  totals: ICartTotals,
  discountRule: IDiscountRule,
  items: readonly ICartItem[]
): ICartTotals => {
  let discountAmount = 0;

  // Check if discount is applicable
  if (discountRule.minItems && items.length < discountRule.minItems) {
    return totals;
  }

  // Filter items by applicable types if specified
  const applicableItems = discountRule.applicableTypes
    ? items.filter(item => discountRule.applicableTypes!.includes(item.bookingType))
    : items;

  const applicableTotal = applicableItems.reduce(
    (sum, item) => sum + item.pricing.totalPrice,
    0
  );

  // Calculate discount based on type
  switch (discountRule.type) {
    case 'percentage':
      discountAmount = (applicableTotal * discountRule.value) / 100;
      break;
    case 'fixed':
      discountAmount = discountRule.value;
      break;
    case 'bulk':
      // Bulk discount: value per item over minItems
      if (discountRule.minItems) {
        const extraItems = Math.max(0, applicableItems.length - discountRule.minItems);
        discountAmount = extraItems * discountRule.value;
      }
      break;
  }

  // Apply max discount cap if specified
  if (discountRule.maxDiscount) {
    discountAmount = Math.min(discountAmount, discountRule.maxDiscount);
  }

  // Ensure discount doesn't exceed total
  discountAmount = Math.min(discountAmount, totals.totalPrice);

  const newTotalPrice = totals.totalPrice - discountAmount;
  const newVatAmount = newTotalPrice * 0.25; // Recalculate VAT on discounted price
  const newFinalPrice = newTotalPrice + newVatAmount;

  return {
    ...totals,
    totalPrice: Math.round(newTotalPrice * 100) / 100,
    vatAmount: Math.round(newVatAmount * 100) / 100,
    finalPrice: Math.round(newFinalPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
  };
};

/**
 * Calculate VAT for cart items
 */
export const calculateVAT = (
  amount: number,
  vatRate: number = 0.25
): { amount: number; vatAmount: number; totalWithVAT: number } => {
  const vatAmount = amount * vatRate;
  const totalWithVAT = amount + vatAmount;

  return {
    amount: Math.round(amount * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    totalWithVAT: Math.round(totalWithVAT * 100) / 100,
  };
};

/**
 * Validate if cart can proceed to checkout
 */
export const canCheckout = (
  items: readonly ICartItem[]
): { canCheckout: boolean; reason?: string } => {
  if (items.length === 0) {
    return {
      canCheckout: false,
      reason: 'Cart is empty. Add items before checkout.',
    };
  }

  // Validate all items
  for (const item of items) {
    const validation = validateCartItem(item);
    if (!validation.isValid) {
      return {
        canCheckout: false,
        reason: `Invalid item in cart: ${validation.errors[0]}`,
      };
    }
  }

  // Check for conflicting time slots
  const conflicts = findTimeSlotConflicts(items);
  if (conflicts.length > 0) {
    return {
      canCheckout: false,
      reason: 'Cart contains conflicting time slots for the same facility.',
    };
  }

  return { canCheckout: true };
};

/**
 * Validate inventory/availability for cart items
 */
export const validateInventory = (
  items: readonly ICartItem[],
  bookedSlots?: ReadonlyMap<string, readonly string[]>
): ICartValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!bookedSlots || bookedSlots.size === 0) {
    return {
      isValid: true,
      errors: [],
      warnings: ['Inventory validation skipped - no booking data available'],
    };
  }

  items.forEach((item, index) => {
    const facilityBookedSlots = bookedSlots.get(item.facilityId);

    if (!facilityBookedSlots) {
      return; // No bookings for this facility
    }

    item.timeSlots.forEach(slot => {
      const slotKey = `${slot.date.toISOString()}_${slot.timeSlot}_${slot.zoneId}`;

      if (facilityBookedSlots.includes(slotKey)) {
        errors.push(
          `Item ${index + 1}: Time slot ${slot.timeSlot} on ${slot.date.toLocaleDateString()} is no longer available`
        );
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Group cart items by facility
 */
export const groupItemsByFacility = (
  items: readonly ICartItem[]
): ReadonlyMap<string, readonly ICartItem[]> => {
  const grouped = new Map<string, ICartItem[]>();

  items.forEach(item => {
    const existing = grouped.get(item.facilityId) || [];
    grouped.set(item.facilityId, [...existing, item]);
  });

  return grouped;
};

/**
 * Find time slot conflicts within cart
 */
export const findTimeSlotConflicts = (
  items: readonly ICartItem[]
): readonly { readonly item1Index: number; readonly item2Index: number; readonly reason: string }[] => {
  const conflicts: { item1Index: number; item2Index: number; reason: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];

      // Only check conflicts for same facility and zone
      if (item1.facilityId !== item2.facilityId || item1.zoneId !== item2.zoneId) {
        continue;
      }

      // Check for overlapping time slots
      for (const slot1 of item1.timeSlots) {
        for (const slot2 of item2.timeSlots) {
          const sameDate = slot1.date.toDateString() === slot2.date.toDateString();
          const sameTime = slot1.timeSlot === slot2.timeSlot;

          if (sameDate && sameTime) {
            conflicts.push({
              item1Index: i,
              item2Index: j,
              reason: `Conflicting time slot: ${slot1.timeSlot} on ${slot1.date.toLocaleDateString()}`,
            });
          }
        }
      }
    }
  }

  return conflicts;
};

/**
 * Calculate price breakdown for display
 */
export const calculatePriceBreakdown = (
  items: readonly ICartItem[]
) => {
  const itemBreakdowns = items.map(item => ({
    id: item.id,
    facilityName: item.facilityName,
    zoneName: item.zoneName,
    basePrice: item.pricing.basePrice,
    totalPrice: item.pricing.totalPrice,
    vatAmount: item.pricing.vatAmount,
    finalPrice: item.pricing.finalPrice,
    timeSlotCount: item.timeSlots.length,
  }));

  const totals = calculateCartTotal(items);

  return {
    items: itemBreakdowns,
    totals,
  };
};

/**
 * Check if cart has recurring bookings
 */
export const hasRecurringBookings = (items: readonly ICartItem[]): boolean => {
  return items.some(item => item.bookingType === 'recurring');
};

/**
 * Calculate estimated total for recurring bookings
 */
export const calculateRecurringTotal = (
  items: readonly ICartItem[],
  occurrences: number = 1
): ICartTotals => {
  const recurringItems = items.filter(item => item.bookingType === 'recurring');
  const baseTotal = calculateCartTotal(recurringItems);

  return {
    basePrice: Math.round(baseTotal.basePrice * occurrences * 100) / 100,
    totalPrice: Math.round(baseTotal.totalPrice * occurrences * 100) / 100,
    vatAmount: Math.round(baseTotal.vatAmount * occurrences * 100) / 100,
    finalPrice: Math.round(baseTotal.finalPrice * occurrences * 100) / 100,
    discountAmount: Math.round(baseTotal.discountAmount * occurrences * 100) / 100,
    itemCount: recurringItems.length,
  };
};

/**
 * Format cart for display
 */
export const formatCartForDisplay = (items: readonly ICartItem[]) => {
  const totals = calculateCartTotal(items);
  const hasRecurring = hasRecurringBookings(items);
  const conflicts = findTimeSlotConflicts(items);
  const checkout = canCheckout(items);

  return {
    items: items.map(item => ({
      ...item,
      formattedCreatedAt: new Date(item.createdAt).toLocaleString('no-NO'),
      formattedUpdatedAt: new Date(item.updatedAt).toLocaleString('no-NO'),
    })),
    totals,
    hasRecurring,
    hasConflicts: conflicts.length > 0,
    conflicts,
    canCheckout: checkout.canCheckout,
    checkoutBlocker: checkout.reason,
  };
};
