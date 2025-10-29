/**
 * Card Formatting Utilities
 *
 * SOLID Principle: Single Responsibility
 * Each function has one clear purpose - formatting specific data types
 *
 * These utilities provide consistent formatting across all card components
 */

import type { Database } from '@/types/database';

type BookingStatus = Database['public']['Enums']['booking_status'];

/**
 * Date and Time Formatting
 */
export const formatDate = (dateString: string, locale: string = 'nb-NO'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatTime = (dateString: string, locale: string = 'nb-NO'): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDuration = (startsAt: string, endsAt: string, translations: { hour: string; hours: string }): string => {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours === 1 ? `1 ${translations.hour}` : `${hours} ${translations.hours}`;
};

/**
 * Price Formatting
 */
export const formatPrice = (cents: number, locale: string = 'nb-NO', currency: string = 'NOK'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(cents / 100);
};

/**
 * Booking Status Utilities
 */
export const getStatusColor = (status: BookingStatus): string => {
  const colorMap: Record<BookingStatus, string> = {
    paid: "bg-green-500",
    completed: "bg-blue-500",
    pending: "bg-yellow-500",
    awaiting_payment: "bg-orange-500",
    cancelled: "bg-red-500",
    expired: "bg-gray-500",
    refunded: "bg-purple-500"
  };
  return colorMap[status] || "bg-gray-500";
};

export const getStatusBadgeColor = (status: BookingStatus): string => {
  const colorMap: Record<BookingStatus, string> = {
    paid: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    awaiting_payment: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    refunded: "bg-purple-100 text-purple-800"
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
};

/**
 * Field Unit Utilities
 */
export interface FacilityFieldUnit {
  readonly key: string;
  readonly unit: string;
}

export const getFieldUnit = (fieldKey: string, translations: Record<string, string>): string => {
  const unitMap: Record<string, string> = {
    capacity: translations.people || 'personer',
    area: translations.squareMeters || 'm²',
    pricePerHour: translations.pricePerHour || 'kr/time',
    rating: translations.outOf5 || '/5',
    reviewCount: translations.reviewCount || 'anmeldelser'
  };
  return unitMap[fieldKey] || '';
};

/**
 * Truncation and Display Utilities
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * URL and Share Utilities
 */
export const generateShareUrl = (path: string): string => {
  return `${window.location.origin}${path}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Status Icon Utilities (for React components)
 */
export type StatusIconType = 'confirmed' | 'pending' | 'cancelled' | 'default';

export const getStatusIconType = (status: string): StatusIconType => {
  switch (status) {
    case 'confirmed':
    case 'paid':
      return 'confirmed';
    case 'pending':
    case 'awaiting_payment':
      return 'pending';
    case 'cancelled':
    case 'expired':
      return 'cancelled';
    default:
      return 'default';
  }
};
