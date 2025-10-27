"use client";

/**
 * TodaysBookings Component
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Displays today's bookings only
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Uses i18n translations and utility functions
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ITodaysBooking } from "@/types/admin";
import { getStatusIconType } from "@/utils/card-formatters";

interface ITodaysBookingsProps {
  readonly bookings: readonly ITodaysBooking[];
}

/**
 * Get appropriate status icon component
 */
const getStatusIcon = (status: string): React.ReactNode => {
  const iconType = getStatusIconType(status);

  const iconMap: Record<string, React.ReactNode> = {
    confirmed: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    cancelled: <XCircle className="w-4 h-4 text-red-500" />,
    default: <Clock className="w-4 h-4 text-gray-500" />
  };

  return iconMap[iconType] || iconMap.default;
};

/**
 * Get status color classes
 */
const getStatusColor = (status: string): string => {
  const iconType = getStatusIconType(status);

  const colorMap: Record<string, string> = {
    confirmed: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    pending: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300",
    cancelled: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
  };

  return colorMap[iconType] || colorMap.default;
};

/**
 * Get translated status label
 */
const useStatusLabel = (status: string): string => {
  const { t } = useTranslation('booking');

  const statusMap: Record<string, string> = {
    confirmed: t('status.confirmed'),
    pending: t('status.pending'),
    cancelled: t('status.cancelled')
  };

  return statusMap[status] || status;
};

/**
 * TodaysBookings Component
 *
 * Displays a card with today's bookings in the admin dashboard
 */
const TodaysBookings = ({ bookings }: ITodaysBookingsProps): JSX.Element => {
  const { t } = useTranslation('booking');
  const navigate = useNavigate();

  const handleViewAll = (): void => {
    navigate("/admin/bookings");
  };

  const handleBookingClick = (): void => {
    navigate("/admin/bookings");
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('card.todaysBookings')}
          </h3>
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            aria-label={t('card.viewAllBookings')}
          >
            {t('card.viewAllBookings')}
          </button>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('card.noBookingsToday')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t('card.quietDay')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('card.todaysBookings')}
        </h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          aria-label={t('card.viewAllCount', { count: bookings.length })}
        >
          {t('card.viewAllCount', { count: bookings.length })}
        </button>
      </div>

      <div className="space-y-3">
        {bookings.slice(0, 5).map((booking) => {
          const statusLabel = useStatusLabel(booking.status);

          return (
            <div
              key={booking.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              onClick={handleBookingClick}
              role="button"
              tabIndex={0}
              aria-label={t('card.viewBooking', { facility: booking.facility })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBookingClick();
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {booking.facility}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {booking.user}
                    </div>
                    <span>{booking.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaysBookings;
