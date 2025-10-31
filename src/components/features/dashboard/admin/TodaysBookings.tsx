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
import { Clock, User } from "lucide-react";
import { ITodaysBooking } from "@/types/admin";
import { StatusBadge } from "@/components/common/status/StatusBadge";

interface ITodaysBookingsProps {
  readonly bookings: readonly ITodaysBooking[];
}

/**
 * TodaysBookings Component
 *
 * Displays a card with today's bookings in the admin dashboard
 */
export const TodaysBookings = ({
  bookings,
}: ITodaysBookingsProps): JSX.Element => {
  const { t } = useTranslation("booking");
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
            {t("card.todaysBookings")}
          </h3>
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            aria-label={t("card.viewAllBookings")}
          >
            {t("card.viewAllBookings")}
          </button>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("card.noBookingsToday")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("card.quietDay")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("card.todaysBookings")}
        </h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          aria-label={t("card.viewAllCount", { count: bookings.length })}
        >
          {t("card.viewAllCount", { count: bookings.length })}
        </button>
      </div>

      <div className="space-y-3">
        {bookings.slice(0, 5).map((booking) => (
          <div
            key={booking.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={handleBookingClick}
            role="button"
            tabIndex={0}
            aria-label={t("card.viewBooking", { facility: booking.facility })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
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
                  <StatusBadge
                    status={booking.status}
                    translationKey={`booking:status.${booking.status}`}
                    showIcon={false}
                    size="sm"
                  />
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
