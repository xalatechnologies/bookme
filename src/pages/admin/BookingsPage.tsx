"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { LocalizedSelect } from "@/components/common/LocalizedSelect";
import {
  Search,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  Trash2,
  Settings,
  Plus,
  Repeat,
} from "lucide-react";
import { useOrgBookings, useUpdateBooking } from "@/services/supabase/bookings.service";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useAuth } from "@/contexts/hooks";
import type { TimeSlot as LocalStorageTimeSlot } from "@/types/localStorage";
import type { RawBookingData } from "@/types/bookingsPage";
import type { Database } from "@/types/database";

type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

interface IBooking {
  readonly id: string;
  readonly title: string;
  readonly facility: string;
  readonly facilityId: string;
  readonly bookerName: string;
  readonly bookerEmail: string;
  readonly purpose: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly status: "pending" | "approved" | "rejected" | "cancelled";
  readonly requestedAt: string;
  readonly processedBy?: string;
  readonly processedAt?: string;
  readonly price: number;
  readonly duration: number; // in hours
  // Recurring metadata (optional)
  readonly isRecurring?: boolean;
  readonly parentBookingId?: string;
}

interface IBookingKPICardProps {
  readonly title: string;
  readonly value: number;
  readonly color: "blue" | "orange" | "green" | "red" | "gray";
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly subtext: string;
  readonly onClick?: () => void;
  readonly trend?: {
    readonly value: number;
    readonly isPositive: boolean;
  };
}

interface IBookingRowProps {
  readonly booking: IBooking;
  readonly onApprove: (id: string) => void;
  readonly onReject: (id: string) => void;
  readonly onViewDetails: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly isSelected: boolean;
  readonly onSelect: (id: string, selected: boolean) => void;
}

interface IBookingDetailModalProps {
  readonly booking: IBooking | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onApprove: (id: string) => void;
  readonly onReject: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly groupedRecurring?: Map<string, IBooking[]>; // Make this prop optional
}

// Parse Norwegian-formatted currency text like "3 562,5 kr" → 3562.5
const parseNOK = (text: string | number | undefined | null): number => {
  if (typeof text === "number") return text;
  if (!text) return 0;
  const cleaned = String(text)
    .replace(/[^0-9,.\s]/g, "") // keep digits, comma, dot, spaces
    .replace(/\s+/g, "") // remove spaces (thousand separators)
    .replace(/\.(?=\d{3}(?:\D|$))/g, "") // remove dot thousand separators
    .replace(",", "."); // convert decimal comma to dot
  const val = parseFloat(cleaned);
  return Number.isFinite(val) ? val : 0;
};

interface IFilterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onApplyFilters: (filters: IFilterState) => void;
}

interface IFilterState {
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly facilityType: string;
  readonly handler: string;
  readonly duration: string;
}

const BookingKPICard = ({
  title,
  value,
  color,
  icon: Icon,
  subtext,
  onClick,
  trend,
}: IBookingKPICardProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30",
    gray: "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/30",
  };

  return (
    <Card
      className={`${colorClasses[color]
        } border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105 ${onClick ? "hover:shadow-lg" : ""
        }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70 mt-1">{subtext}</p>
            {trend && (
              <p
                className={`text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"
                  } mt-1`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% {t("pages.dashboard.trends.since_yesterday")}
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 opacity-60 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

const FilterModal = ({
  isOpen,
  onClose,
  onApplyFilters,
}: IFilterModalProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const [filters, setFilters] = useState<IFilterState>({
    dateFrom: "",
    dateTo: "",
    facilityType: "",
    handler: "",
    duration: "",
  });

  const handleApply = (): void => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = (): void => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      facilityType: "",
      handler: "",
      duration: "",
    });
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("pages.bookings.filters.advanced_title")}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("pages.bookings.filters.date_from")}
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("pages.bookings.filters.date_to")}
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("pages.bookings.filters.facility_type")}
              </label>
              <LocalizedSelect
                entityType="facility_type"
                value={filters.facilityType}
                onValueChange={(val) =>
                  setFilters({ ...filters, facilityType: val })
                }
                includeAll={true}
                allValue=""
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("pages.bookings.filters.handler")}
              </label>
              <select
                value={filters.handler}
                onChange={(e) =>
                  setFilters({ ...filters, handler: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">
                  {t("pages.bookings.filters.all_handlers")}
                </option>
                <option value="admin">
                  {t("pages.bookings.filters.admin")}
                </option>
                <option value="saksbehandler">
                  {t("pages.bookings.filters.case_worker")}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("pages.bookings.filters.duration")}
              </label>
              <LocalizedSelect
                entityType="duration"
                value={filters.duration}
                onValueChange={(val) =>
                  setFilters({ ...filters, duration: val })
                }
                includeAll={true}
                allValue=""
                className="w-full"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={handleReset}>
              {t("common:actions.reset")}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t("common:actions.cancel")}
            </Button>
            <Button onClick={handleApply}>
              {t("common:actions.applyFilters")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingRow = ({
  booking,
  onApprove,
  onReject,
  onViewDetails,
  onDelete,
  isSelected,
  onSelect,
}: IBookingRowProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const getStatusBadge = (status: IBooking["status"]): JSX.Element => {
    const statusConfig = {
      pending: {
        label: t("common:status.pending"),
        className:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      },
      approved: {
        label: t("common:status.approved"),
        className:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      },
      rejected: {
        label: t("common:status.rejected"),
        className:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      },
      cancelled: {
        label: t("common:status.cancelled"),
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBorderColor = (status: IBooking["status"]): string => {
    const borderColors = {
      pending: "hover:border-orange-300 dark:hover:border-orange-600",
      approved: "hover:border-green-300 dark:hover:border-green-600",
      rejected: "hover:border-red-300 dark:hover:border-red-600",
      cancelled: "hover:border-gray-300 dark:hover:border-gray-600",
    };
    return borderColors[status];
  };

  return (
    <div className="flex items-start gap-4">
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(booking.id, !!checked)}
          className="mt-1"
        />
      </div>

      <Card
        className={`relative cursor-pointer flex-1 transition-all duration-200 shadow-sm hover:shadow-md ${isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getStatusBorderColor(
            booking.status
          )}`
          } ${booking.status === "pending"
            ? "bg-yellow-50/30 dark:bg-yellow-900/5"
            : ""
          }`}
        onClick={() => onViewDetails(booking.id)}
      >
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${(() => {
            if (booking.status === "approved") return "bg-green-500";
            if (booking.status === "rejected") return "bg-red-500";
            if (booking.status === "pending") return "bg-yellow-500";
            return "bg-gray-500";
          })()}`}
        />

        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {booking.facility}
                </h4>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {new Date(booking.startDate).toLocaleDateString("nb-NO")}
                </span>
                <span>
                  {booking.startTime}-{booking.endTime} (
                  {booking.duration === 1 ? "1 time" : `${booking.duration} timer`}
                  )
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(booking.id);
                }}
                className="flex items-center justify-center p-2"
                title={t("pages.bookings.actions.view_details")}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(booking.id);
                }}
                className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                title={t("common:actions.delete")}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              {booking.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApprove(booking.id);
                    }}
                    className="flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                    title={t("pages.bookings.actions.approve")}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReject(booking.id);
                    }}
                    className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title={t("pages.bookings.actions.reject")}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BookingDetailModal = ({
  booking,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  groupedRecurring, // Add this prop
}: IBookingDetailModalProps): JSX.Element => {
  if (!isOpen || !booking) return <></>;



  // Try to locate all occurrences from the grouped recurring bookings if this booking is part of a recurring series
  const occurrences: {
    date: string;
    time: string;
    durationHours: number;
    priceText: string;
  }[] = (() => {
    try {
      // Check if this booking is part of a recurring group
      const isRecurring = booking.isRecurring || booking.parentBookingId;
      if (!isRecurring || !groupedRecurring) return [];

      // Find the group this booking belongs to
      let groupItems: IBooking[] | undefined;
      for (const [, items] of groupedRecurring.entries()) {
        if (items.some((item: IBooking) => item.id === booking.id)) {
          groupItems = items;
          break;
        }
      }

      // If we found the group, build occurrences from the actual booking data
      if (groupItems) {
        return groupItems
          .map((b: IBooking) => {
            const date: string = b.startDate;
            const time: string = `${b.startTime}-${b.endTime}`;
            const durationHours: number = b.duration;
            const priceText: string = `${b.price} kr`;
            return { date, time, durationHours, priceText };
          })
          .sort(
            (a: { date: string }, b: { date: string }) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      }

      // No group found - return empty array
      // Note: All booking data now comes from the database via useBookings hook
      // localStorage fallback has been removed
      return [];
    } catch {
      return [];
    }
  })();

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };



  // Generate human-readable title
  const generateTitle = (): string => {
    if (booking.isRecurring && occurrences.length > 1) {
      return `Seriebooking: ${booking.purpose} (${occurrences.length} forekomster)`;
    }

    // Try to use purpose if it's meaningful
    if (booking.purpose && booking.purpose !== 'Booking') {
      return `${booking.purpose} i ${booking.facility}`;
    }

    // Fallback to facility + date
    return `${booking.facility} – ${formatDate(booking.startDate)}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {generateTitle()}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary Bar */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Lokale</p>
                <p className="text-gray-900 dark:text-white font-medium truncate">{booking.facility}</p>
              </div>
              {occurrences.length > 1 && (
                <div>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Forekomster</p>
                  <p className="text-gray-900 dark:text-white font-medium">{occurrences.length}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Detaljer
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {occurrences.length > 1 ? (
                  // For recurring bookings
                  (() => {
                    const occ = occurrences;
                    const totalHours = occ.reduce(
                      (sum, o) => sum + (o.durationHours || 0),
                      0
                    );
                    const totalPrice = occ.reduce(
                      (sum, o) => sum + parseNOK(o.priceText),
                      0
                    );
                    const dates = occ.map((o) => o.date).sort();
                    const period = `${new Date(dates[0]).toLocaleDateString(
                      "nb-NO"
                    )} – ${new Date(dates[dates.length - 1]).toLocaleDateString(
                      "nb-NO"
                    )}`;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Periode</p>
                          <p className="font-medium text-gray-900 dark:text-white">{period}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total tid</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {totalHours === 1 ? "1 time" : `${totalHours} timer`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Totalpris</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {totalPrice.toLocaleString("nb-NO")} kr
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {booking.status}
                          </p>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // For single bookings
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Dato</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatDate(booking.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tid</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.startTime}-{booking.endTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Varighet</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.duration === 1 ? "1 time" : `${booking.duration} timer`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pris</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {booking.price.toLocaleString("nb-NO")} kr
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {booking.status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Occurrences for recurring series */}
            {occurrences.length > 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Forekomster ({occurrences.length})
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg divide-y max-h-60 overflow-y-auto">
                  {occurrences.map((o, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between text-sm"
                    >
                      <div className="text-gray-700 dark:text-gray-200">
                        {new Date(o.date).toLocaleDateString("nb-NO", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        <span className="mx-2">•</span>
                        {o.time}
                      </div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {o.durationHours} t<span className="mx-2">•</span>
                        {/* Ensure decimal comma and thousands spacing are respected */}
                        {(() => {
                          const value = parseNOK(o.priceText);
                          // If total series price slipped in, show per-occurrence price when a series total is present
                          return `${value.toLocaleString("nb-NO")} kr`;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booker Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Booker
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Navn</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.bookerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">E-post</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.bookerEmail}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Formål</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.purpose}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Historikk
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Opprettet:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(booking.requestedAt).toLocaleString("nb-NO")}
                    </span>
                  </div>
                  {booking.processedBy && booking.processedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Behandlet av:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {booking.processedBy}
                      </span>
                    </div>
                  )}
                  {booking.processedBy && booking.processedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Behandlet dato:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(booking.processedAt).toLocaleString("nb-NO")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                {booking.status === "pending" && (
                  <>
                    <Button
                      onClick={() => onApprove(booking.id)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 text-sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Godkjenn
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => onReject(booking.id)}
                      className="rounded-full px-4 py-2 text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Avvis
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => onDelete(booking.id)}
                className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-4 py-2 text-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slett
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsPage = (): JSX.Element => {
  const { t } = useTranslation(["admin", "common"]);
  const { user: currentUser } = useAuth(); // Get current user
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(
    new Set()
  );
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  // Used in useMemo dependency array to trigger re-fetch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [appliedFilters, setAppliedFilters] = useState<IFilterState>({
    dateFrom: "",
    dateTo: "",
    facilityType: "",
    handler: "",
    duration: "",
  });

  // Get organization ID
  const orgId = useOrganizationId();

  // Supabase hooks
  const { data: supabaseBookings = [], isLoading, error } = useOrgBookings(orgId);
  const updateBookingMutation = useUpdateBooking();

  // Transform Supabase bookings to IBooking format
  const transformBookings = useCallback((): IBooking[] => {
    if (isLoading || error) return [];

    return supabaseBookings.map((booking) => {
      // Extract date and time information
      const startDate = new Date(booking.starts_at);
      const endDate = new Date(booking.ends_at);

      // Format time as HH:MM
      const formatTime = (date: Date): string => {
        return date.toTimeString().slice(0, 5);
      };

      // Calculate duration in hours
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      // Map Supabase status to IBooking status
      let status: "pending" | "approved" | "rejected" | "cancelled" = "pending";
      if (booking.status === "paid" || booking.status === "completed") {
        status = "approved";
      } else if (booking.status === "cancelled" || booking.status === "expired" || booking.status === "refunded") {
        // For UI purposes, map cancelled/expired/refunded to rejected
        status = "rejected";
      } else if (booking.status === "awaiting_payment") {
        status = "pending";
      } else {
        status = "pending";
      }

      return {
        id: booking.id,
        title: booking.facility?.name || 'Unknown Facility',
        facility: booking.facility?.name || 'Unknown Facility',
        facilityId: booking.facility_id,
        bookerName: booking.user_profile?.display_name || booking.user_id, // Use display name if available, fallback to user_id
        bookerEmail: booking.user_profile?.email || `${booking.user_id}@example.com`, // Use actual email if available
        purpose: booking.notes || "Booking", // Use notes field for purpose if available
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        startTime: formatTime(startDate),
        endTime: formatTime(endDate),
        status,
        requestedAt: booking.created_at,
        processedBy: booking.processed_by || undefined, // Only show processed_by if it exists, don't fallback to user info
        processedAt: booking.processed_at || undefined, // Only show processed_at if it exists
        price: booking.total_cents / 100, // Convert cents to currency units
        duration: durationHours,
        isRecurring: booking.is_recurring,
        parentBookingId: booking.recurring_booking_id || undefined,
      };
    });
  }, [supabaseBookings, isLoading, error]);

  // Real bookings only - refresh when trigger changes
  const bookings: readonly IBooking[] = useMemo(
    () => transformBookings(),
    [transformBookings]
  );

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((booking) => booking.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.title.toLowerCase().includes(query) ||
          booking.facility.toLowerCase().includes(query) ||
          booking.bookerName.toLowerCase().includes(query) ||
          booking.bookerEmail.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookings, activeTab, searchQuery]);

  // Group recurring vs single (similar to user Bookings)
  const { groupedRecurring, singletonBookings } = useMemo(() => {
    const groups = new Map<string, IBooking[]>();
    const singles: IBooking[] = [];

    const getFallbackGroupKey = (b: IBooking): string | null => {
      // Group potential recurring items by stable attributes (no date)
      // facility + purpose + time window
      const timeKey = `${b.startTime}-${b.endTime}`;
      return `${b.facility}|${b.purpose}|${timeKey}`;
    };

    // Build group map
    filteredBookings.forEach((b) => {
      const parentId = b.parentBookingId;
      const isRecurring = b.isRecurring || !!parentId;
      const key = parentId ?? (isRecurring ? getFallbackGroupKey(b) : null);

      if (key) {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(b);
      } else {
        singles.push(b);
      }
    });

    // Anything that ended up in a group of size 1 should be treated as single
    const normalizedGroups = new Map<string, IBooking[]>();
    groups.forEach((items, key) => {
      if (items.length <= 1) {
        singles.push(items[0]);
      } else {
        normalizedGroups.set(
          key,
          items.sort(
            (a, b) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
        );
      }
    });

    return { groupedRecurring: normalizedGroups, singletonBookings: singles };
  }, [filteredBookings]);

  const kpiData = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const approvedToday = bookings.filter(
      (b) =>
        b.status === "approved" &&
        new Date(b.processedAt || b.requestedAt || "").toDateString() ===
        new Date().toDateString()
    ).length;
    const rejectedToday = bookings.filter(
      (b) =>
        b.status === "rejected" &&
        new Date(b.processedAt || b.requestedAt || "").toDateString() ===
        new Date().toDateString()
    ).length;

    return { total, pending, approvedToday, rejectedToday };
  }, [bookings]);

  // Utilities for grouping/series detection used in approve/reject


  const handleApprove = useCallback(
    (id: string): void => {
      try {
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return;

        // Get current user's display name or ID for processed_by field
        const processedBy = currentUser?.user_metadata?.display_name || currentUser?.id || 'Unknown Admin';

        // Update booking status in Supabase
        updateBookingMutation.mutate(
          {
            id,
            updates: {
              status: "paid", // Using "paid" as the approved status
              updated_at: new Date().toISOString(),
              processed_by: processedBy, // Add processed_by field
              processed_at: new Date().toISOString(), // Add processed_at field
            } as BookingUpdate,
          }
        );

        // Close modal immediately
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error("Error approving booking:", error);
      }
    },
    [bookings, updateBookingMutation, currentUser]
  );

  const handleReject = useCallback(
    (id: string): void => {
      try {
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return;

        // Get current user's display name or ID for processed_by field
        const processedBy = currentUser?.user_metadata?.display_name || currentUser?.id || 'Unknown Admin';

        // Update booking status in Supabase
        updateBookingMutation.mutate(
          {
            id,
            updates: {
              status: "cancelled", // Using "cancelled" as the rejected status
              updated_at: new Date().toISOString(),
              processed_by: processedBy, // Add processed_by field
              processed_at: new Date().toISOString(), // Add processed_at field
            } as BookingUpdate,
          }
        );

        // Close modal immediately
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error("Error rejecting booking:", error);
      }
    },
    [bookings, updateBookingMutation, currentUser]
  );

  const handleViewDetails = (id: string): void => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
    }
  };

   
  const handleDelete = (_id: string): void => {
    // TODO: Implement deletion logic
  };

  const handleSelectBooking = (id: string, selected: boolean): void => {
    const newSelected = new Set(selectedBookings);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedBookings(newSelected);
  };

  const handleBulkApprove = (): void => {
    const selectedIds = Array.from(selectedBookings);
    selectedIds.forEach((id) => handleApprove(id));
    setSelectedBookings(new Set());
  };

  const handleBulkReject = (): void => {
    const selectedIds = Array.from(selectedBookings);
    selectedIds.forEach((id) => handleReject(id));
    setSelectedBookings(new Set());
  };

  const handleBulkDelete = (): void => {
    const selectedIds = Array.from(selectedBookings);
    selectedIds.forEach((id) => handleDelete(id));
    setSelectedBookings(new Set());
  };

  const handleRecurringGroupSelect = useCallback(
    (groupId: string, items: IBooking[]) => {
      const itemIds = items.map((item) => item.id);
      setSelectedBookings((prev) => {
        const hasAllItems = itemIds.every((id) => prev.has(id));
        if (hasAllItems) {
          // Remove all items from this group
          const newSelected = new Set(prev);
          itemIds.forEach((id) => newSelected.delete(id));
          return newSelected;
        } else {
          // Add all items from this group
          const newSelected = new Set(prev);
          itemIds.forEach((id) => newSelected.add(id));
          return newSelected;
        }
      });
    },
    []
  );

  const tabs = [
    { id: "all", label: t("pages.bookings.tabs.all"), count: bookings.length },
    {
      id: "pending",
      label: t("pages.bookings.tabs.pending"),
      count: bookings.filter((b) => b.status === "pending").length,
    },
    {
      id: "approved",
      label: t("pages.bookings.tabs.approved"),
      count: bookings.filter((b) => b.status === "approved").length,
    },
    {
      id: "rejected",
      label: t("pages.bookings.tabs.rejected"),
      count: bookings.filter((b) => b.status === "rejected").length,
    },
  ] as const;

  return (
    <RequireRole minRole="staff">
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("pages.bookings.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("pages.bookings.subtitle")}
            </p>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BookingKPICard
            title={t("pages.bookings.kpi.total_bookings")}
            value={kpiData.total}
            color="blue"
            icon={Calendar}
            subtext={t("pages.bookings.kpi.active_last_30")}
            onClick={() => setActiveTab("all")}
          />
          <BookingKPICard
            title={t("pages.bookings.kpi.pending_approvals")}
            value={kpiData.pending}
            color="orange"
            icon={AlertCircle}
            subtext={t("pages.bookings.kpi.requires_action")}
            onClick={() => setActiveTab("pending")}
          />
          <BookingKPICard
            title={t("pages.bookings.kpi.approved_today")}
            value={kpiData.approvedToday}
            color="green"
            icon={CheckCircle}
            subtext={t("pages.bookings.kpi.processed_today")}
            onClick={() => setActiveTab("approved")}
          />
          <BookingKPICard
            title={t("pages.bookings.kpi.rejected_today")}
            value={kpiData.rejectedToday}
            color="red"
            icon={XCircle}
            subtext={t("pages.bookings.kpi.rejected_today_sub")}
            onClick={() => setActiveTab("rejected")}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Search and Filters */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("pages.bookings.search_placeholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterModalOpen(true)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {t("common:actions.filter")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={(() => {
                      const allBookings = [...groupedRecurring.values()]
                        .flat()
                        .concat(singletonBookings);
                      return (
                        allBookings.length > 0 &&
                        allBookings.every((booking) =>
                          selectedBookings.has(booking.id)
                        )
                      );
                    })()}
                    onCheckedChange={(checked) => {
                      const allBookings = [...groupedRecurring.values()]
                        .flat()
                        .concat(singletonBookings);
                      if (checked) {
                        const allIds = allBookings.map((booking) => booking.id);
                        setSelectedBookings(new Set(allIds));
                      } else {
                        setSelectedBookings(new Set());
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("pages.bookings.select_all", {
                      count: (() => {
                        const allBookings = [...groupedRecurring.values()]
                          .flat()
                          .concat(singletonBookings);
                        return allBookings.length;
                      })(),
                    })}
                  </span>
                </div>

                {selectedBookings.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("pages.bookings.selected_count", {
                        count: selectedBookings.size,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookings.size > 0 &&
              (() => {
                const selectedIds = Array.from(selectedBookings);
                const selectedBookingsData = bookings.filter((b) =>
                  selectedIds.includes(b.id)
                );
                const hasPending = selectedBookingsData.some(
                  (b) => b.status === "pending"
                );
                const hasApprovedOrRejected = selectedBookingsData.some(
                  (b) => b.status === "approved" || b.status === "rejected"
                );

                return (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {t("pages.bookings.bulk_selected", {
                        count: selectedBookings.size,
                      })}
                    </span>
                    <div className="flex space-x-2">
                      {hasPending && (
                        <>
                          <Button
                            size="sm"
                            onClick={handleBulkApprove}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t("pages.bookings.bulk_approve_all")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleBulkReject}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t("pages.bookings.bulk_reject_all")}
                          </Button>
                        </>
                      )}
                      {hasApprovedOrRejected && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleBulkDelete}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t("pages.bookings.bulk_delete_all")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
          </CardHeader>

          <CardContent>
            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("pages.bookings.empty.no_bookings")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery
                      ? t("pages.bookings.empty.try_different_criteria")
                      : t("pages.bookings.empty.no_bookings_currently")}
                  </p>
                </div>
              ) : (
                <>
                  {/* Recurring groups */}
                  {[...groupedRecurring.entries()].map(([groupId, items]) => {
                    const first = items[0];
                    // Extract facility name from the title
                    const facilityName = first.facility;
                    const title = (
                      <div className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span>{facilityName}</span>
                      </div>
                    );
                    const dates = items.map((i) => i.startDate).sort();
                    const period = `${new Date(dates[0]).toLocaleDateString(
                      "nb-NO"
                    )} – ${new Date(dates[dates.length - 1]).toLocaleDateString(
                      "nb-NO"
                    )}`;
                    const uniqueStatuses = Array.from(
                      new Set(items.map((i) => i.status))
                    );
                    let badgeColor = "bg-yellow-100 text-yellow-800";
                    let badgeText = t("common:status.pending");
                    if (uniqueStatuses.length === 1) {
                      if (uniqueStatuses[0] === "approved") {
                        badgeColor = "bg-green-100 text-green-800";
                        badgeText = t("common:status.approved");
                      } else if (uniqueStatuses[0] === "rejected") {
                        badgeColor = "bg-red-100 text-red-800";
                        badgeText = t("common:status.rejected");
                      }
                    } else {
                      // Mixed statuses
                      if (uniqueStatuses.includes("pending")) {
                        badgeColor = "bg-yellow-100 text-yellow-800";
                        badgeText = t("pages.bookings.status_mixed_pending");
                      } else {
                        badgeColor = "bg-blue-100 text-blue-800";
                        badgeText = t("pages.bookings.status_mixed_approved");
                      }
                    }
                    return (
                      <div
                        key={`group-${groupId}`}
                        className="flex items-start gap-4"
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={(() => {
                              const itemIds = items.map((item) => item.id);
                              const hasAllItems = itemIds.every((id) =>
                                selectedBookings.has(id)
                              );
                              return hasAllItems;
                            })()}
                            onCheckedChange={() => {
                              handleRecurringGroupSelect(groupId, items);
                            }}
                            className="mt-1"
                          />
                        </div>

                        <Card
                          className="relative cursor-pointer flex-1"
                          onClick={() => handleViewDetails(first.id)}
                        >
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${(() => {
                              if (uniqueStatuses.length === 1) {
                                if (uniqueStatuses[0] === "approved")
                                  return "bg-green-500";
                                if (uniqueStatuses[0] === "rejected")
                                  return "bg-red-500";
                                if (uniqueStatuses[0] === "pending")
                                  return "bg-yellow-500";
                                return "bg-gray-500";
                              } else {
                                if (uniqueStatuses.includes("pending"))
                                  return "bg-yellow-500";
                                return "bg-blue-500";
                              }
                            })()}`}
                          />

                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {title}
                                  </h3>
                                  <Badge className={badgeColor}>
                                    {badgeText}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <div className="flex flex-wrap gap-4">
                                    <span>
                                      {t("pages.bookings.occurrences_count", {
                                        count: items.length,
                                      })}
                                    </span>
                                    <span>
                                      {t("pages.bookings.period")}: {period}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(first.id);
                                  }}
                                  className="flex items-center justify-center p-2"
                                  title={t(
                                    "pages.bookings.actions.view_details"
                                  )}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const itemIds = items.map(
                                      (item) => item.id
                                    );
                                    itemIds.forEach((id) => handleDelete(id));
                                  }}
                                  className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title={t("common:actions.delete")}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                {uniqueStatuses.includes("pending") && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const itemIds = items.map(
                                          (item) => item.id
                                        );
                                        itemIds.forEach((id) =>
                                          handleApprove(id)
                                        );
                                      }}
                                      className="flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title={t(
                                        "pages.bookings.actions.approve"
                                      )}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const itemIds = items.map(
                                          (item) => item.id
                                        );
                                        itemIds.forEach((id) =>
                                          handleReject(id)
                                        );
                                      }}
                                      className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title={t("pages.bookings.actions.reject")}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}

                  {/* Single bookings */}
                  {singletonBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDelete}
                      isSelected={selectedBookings.has(booking.id)}
                      onSelect={handleSelectBooking}
                    />
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {t("pages.bookings.workflows.title")}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("pages.bookings.workflows.subtitle")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {t("pages.bookings.workflows.description")}
                </p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("pages.bookings.workflows.create_new")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: t("pages.bookings.workflows.examples.schools_name"),
                  description: t(
                    "pages.bookings.workflows.examples.schools_desc"
                  ),
                  status: t("pages.bookings.workflows.status_active"),
                  isActive: true,
                },
                {
                  name: t("pages.bookings.workflows.examples.sports_name"),
                  description: t(
                    "pages.bookings.workflows.examples.sports_desc"
                  ),
                  status: t("pages.bookings.workflows.status_active"),
                  isActive: true,
                },
                {
                  name: t("pages.bookings.workflows.examples.commercial_name"),
                  description: t(
                    "pages.bookings.workflows.examples.commercial_desc"
                  ),
                  status: t("pages.bookings.workflows.status_active"),
                  isActive: true,
                },
              ].map((workflow, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md ${workflow.isActive
                    ? "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${workflow.isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {workflow.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workflow.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={
                        workflow.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-3300"
                      }
                    >
                      {workflow.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      {t("common:actions.edit")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Detail Modal */}
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedBooking(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          groupedRecurring={groupedRecurring}
        />

        {/* Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={setAppliedFilters}
        />
      </div>
    </RequireRole>
  );
};

export default BookingsPage;
