"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Clock, User, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ITodaysBooking } from "@/types/admin";

interface ITodaysBookingsProps {
  readonly bookings: readonly ITodaysBooking[];
}

const TodaysBookings = ({ bookings }: ITodaysBookingsProps): JSX.Element => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  const handleViewAll = (): void => {
    navigate("/admin/bookings");
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dagens bookinger
          </h3>
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Se alle
          </button>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Ingen bookinger i dag
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Det er en rolig dag!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dagens bookinger
        </h3>
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Se alle ({bookings.length})
        </button>
      </div>
      
      <div className="space-y-3">
        {bookings.slice(0, 5).map((booking) => (
          <div
            key={booking.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={() => navigate("/admin/bookings")}
            role="button"
            tabIndex={0}
            aria-label={`Se booking ${booking.facility}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate("/admin/bookings");
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
                    {booking.status === "confirmed" ? "Bekreftet" : 
                     booking.status === "pending" ? "Venter" : "Avbrutt"}
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
        ))}
      </div>
    </div>
  );
};

export default TodaysBookings;
