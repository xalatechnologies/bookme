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
} from "lucide-react";

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
  const { t } = useTranslation("common");
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
      className={`${
        colorClasses[color]
      } border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105 ${
        onClick ? "hover:shadow-lg" : ""
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
                className={`text-xs ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                } mt-1`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}% {t("dashboard.trends.since_yesterday")}
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
  const { t } = useTranslation("common");
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
  const { t } = useTranslation("common");
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
        className={`relative cursor-pointer flex-1 transition-all duration-200 shadow-sm hover:shadow-md ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getStatusBorderColor(
                booking.status
              )}`
        } ${
          booking.status === "pending"
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
                  {booking.title}
                </h4>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {booking.startTime}-{booking.endTime} (
                  {booking.duration === 1
                    ? t("common:time.hour_singular")
                    : t("common:time.hours_plural", {
                        count: booking.duration,
                      })}
                  )
                </span>
                <span>
                  {new Date(booking.startDate).toLocaleDateString("nb-NO")}
                </span>
                <span className="flex items-center space-x-1">
                  <span>{booking.purpose}</span>
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
}: IBookingDetailModalProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation("common");
  if (!isOpen || !booking) return <></>;

  const formatDateTime = (_date: string, _time: string): string => {
    const dateObj = new Date(_date);
    const formattedDate = dateObj.toLocaleDateString("nb-NO");
    return `${formattedDate} kl. ${_time}`;
  };

  // Try to locate all occurrences from localStorage if this booking is part of a recurring series
  const occurrences: {
    date: string;
    time: string;
    durationHours: number;
    priceText: string;
  }[] = (() => {
    try {
      const rawPending = JSON.parse(
        localStorage.getItem("pendingBookings") || "[]"
      );
      const rawProcessed = JSON.parse(
        localStorage.getItem("processedBookings") || "[]"
      );
      const all = [...rawPending, ...rawProcessed];

      // Determine grouping key
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentId = (booking as any).parentBookingId as string | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRecurring = (booking as any).isRecurring || !!parentId;
      if (!isRecurring) return [];

      const groupKey =
        parentId ||
        `${booking.facility}|${booking.purpose}|${booking.startTime}-${booking.endTime}`;

      // Filter same group
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const series = all.filter((b: any) => {
        const bParent = b.parentBookingId;
        const bKey =
          bParent ||
          `${b.facility || b.facilityName}|${
            b.purpose || b.description
          }|${(() => {
            if (b.time) return b.time;
            if (b.startTime && b.endTime) return `${b.startTime}-${b.endTime}`;
            if (b.timeSlots && b.timeSlots.length > 0) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sorted = [...b.timeSlots].sort((a: any, c: any) =>
                a.timeSlot.localeCompare(c.timeSlot)
              );
              const s = sorted[0].timeSlot.split("-")[0];
              const e = sorted[sorted.length - 1].timeSlot.split("-")[1];
              return `${s}-${e}`;
            }
            return `${booking.startTime}-${booking.endTime}`;
          })()}`;
        return (
          (bParent && groupKey === bParent) || (!bParent && bKey === groupKey)
        );
      });

      return (
        series
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((b: any) => {
            const date =
              b.date || b.startDate || new Date().toISOString().slice(0, 10);
            const time =
              b.time ||
              (b.startTime && b.endTime
                ? `${b.startTime}-${b.endTime}`
                : (b.timeSlots && b.timeSlots[0]?.timeSlot) ||
                  `${booking.startTime}-${booking.endTime}`);
            const priceText = b.price || "0 kr";
            // Duration may be a string like "1 timer"
            const durationHours =
              typeof b.duration === "string"
                ? parseFloat(
                    b.duration.replace(/[^0-9.,]/g, "").replace(",", ".")
                  ) || 1
                : b.duration
                ? b.duration / 60
                : 1;
            return { date, time, durationHours, priceText };
          })
          .sort(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )
      );
    } catch {
      return [];
    }
  })();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[75vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Booking #{booking.id}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Facility Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Lokaleinformasjon
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.facility}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDateTime(booking.startDate, booking.startTime)} -{" "}
                  {formatDateTime(booking.endDate, booking.endTime)}
                </p>
                {/* Aggregates: periode, total tid, totalpris */}
                {(() => {
                  // Build occurrences list (same as above) to compute totals
                  const occ =
                    occurrences.length > 0
                      ? occurrences
                      : [
                          {
                            date: booking.startDate,
                            time: `${booking.startTime}-${booking.endTime}`,
                            durationHours: booking.duration,
                            priceText: booking.price || "0 kr",
                          },
                        ];
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
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                      <p>Periode: {period}</p>
                      <p>Total tid: {totalHours} timer</p>
                      <p>Totalpris: {totalPrice.toLocaleString("nb-NO")} kr</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Occurrences for recurring series */}
            {occurrences.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Forekomster
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg divide-y">
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
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.bookerName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {booking.bookerEmail}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <strong>Formål:</strong> {booking.purpose}
                </p>
              </div>
            </div>

            {/* History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Historikk
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Søkt:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.requestedAt).toLocaleString("nb-NO")}
                  </span>
                </div>
                {booking.processedBy && booking.processedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Behandlet av:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {booking.processedBy} (
                      {new Date(booking.processedAt).toLocaleString("nb-NO")})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {booking.status === "pending" && (
                <>
                  <Button
                    onClick={() => onApprove(booking.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Godkjenn
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onReject(booking.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Avvis
                  </Button>
                </>
              )}
              <Button
                variant="destructive"
                onClick={() => onDelete(booking.id)}
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
  const { t } = useTranslation("common");
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

  // New feature states

  // Get pending bookings from localStorage (user bookings)
  const getPendingBookings = useCallback((): IBooking[] => {
    try {
      const pendingBookings = JSON.parse(
        localStorage.getItem("pendingBookings") || "[]"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return pendingBookings.map(
        (booking: any, index: number) => {
          // Calculate proper time range from timeSlots if available
          let startTime: string;
          let endTime: string;

          if (booking.timeSlots && booking.timeSlots.length > 0) {
            // Calculate time range from multiple time slots
            const sortedSlots = [...booking.timeSlots].sort(
              (
                a: { readonly timeSlot: string },
                b: { readonly timeSlot: string }
              ) => {
                const timeA = a.timeSlot.split("-")[0];
                const timeB = b.timeSlot.split("-")[0];
                return timeA.localeCompare(timeB);
              }
            );
            startTime = sortedSlots[0].timeSlot.split("-")[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            endTime = lastSlot.timeSlot.split("-")[1];
          } else if (booking.time) {
            // If no timeSlots but has time, try to calculate from duration
            const timeParts = booking.time.split("-");
            if (timeParts.length === 2 && booking.duration) {
              startTime = timeParts[0];
              const durationStr =
                typeof booking.duration === "string"
                  ? booking.duration
                  : String(booking.duration);
              const duration = parseInt(durationStr.replace(/\D/g, ""));
              if (duration > 1) {
                // Calculate end time based on duration
                const [hours, minutes] = startTime.split(":").map(Number);
                const endTimeDate = new Date();
                endTimeDate.setHours(hours + duration, minutes, 0, 0);
                endTime = endTimeDate.toTimeString().slice(0, 5);
              } else {
                endTime = timeParts[1];
              }
            } else {
              startTime = timeParts[0];
              endTime = timeParts[1];
            }
          } else {
            startTime = "10:00";
            endTime = "12:00";
          }

          return {
            id: booking.id || (index + 1).toString(),
            title: `Booking #${booking.id || index + 1} – ${
              booking.facilityName
            }`,
            facility: booking.facilityName,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            facilityId: (booking as any).facilityId || "1",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bookerName: (booking as any).contactPerson || "Ukjent bruker",
            bookerEmail: "bruker@example.com", // This should come from user profile
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            purpose:
              booking.purpose || (booking as any).description || "Booking",
            startDate:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (booking as any).date ||
              (() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })(),
            endDate:
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (booking as any).date ||
              (() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
              })(),
            startTime,
            endTime,
            status: booking.status || "pending",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            requestedAt:
              (booking as any).submittedAt || new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            price: (booking as any).price
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                parseInt((booking as any).price.replace(/\D/g, ""))
              : 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            duration: booking.duration ? parseInt(booking.duration as any) : 2,
            isRecurring: booking.isRecurring,
            parentBookingId: booking.parentBookingId,
          };
        }
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, []);

  // Get approved/rejected bookings from localStorage
  const getProcessedBookings = useCallback((): IBooking[] => {
    try {
      const processedBookings = JSON.parse(
        localStorage.getItem("processedBookings") || "[]"
      );
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return processedBookings.map(
        (booking: any, index: number) => {
          // Derive start/end time
          let startTime: string;
          let endTime: string;
          if (booking.startTime && booking.endTime) {
            startTime = booking.startTime;
            endTime = booking.endTime;
          } else if (booking.time) {
            const timeParts = booking.time.split("-");
            startTime = timeParts[0];
            endTime = timeParts[1];
          } else if (booking.timeSlots && booking.timeSlots.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sorted = [...booking.timeSlots].sort((a: any, b: any) =>
              a.timeSlot.localeCompare(b.timeSlot)
            );
            startTime = sorted[0].timeSlot.split("-")[0];
            endTime = sorted[sorted.length - 1].timeSlot.split("-")[1];
          } else {
            startTime = "10:00";
            endTime = "12:00";
          }

          const startDate =
            booking.date ||
            booking.startDate ||
            (() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, "0");
              const d = String(today.getDate()).padStart(2, "0");
              return `${y}-${m}-${d}`;
            })();

          const endDate = startDate;

          // Normalize price/duration
          const priceNumber =
            typeof booking.price === "string"
              ? parseInt(booking.price.replace(/\D/g, ""))
              : booking.price || 0;
          const durationHours =
            typeof booking.duration === "string"
              ? parseFloat(
                  booking.duration.replace(/[^0-9.,]/g, "").replace(",", ".")
                ) || 1
              : booking.duration
              ? booking.duration
              : 1;

          return {
            id: booking.id || (index + 1).toString(),
            title: `Booking #${booking.id || index + 1} – ${
              booking.facility || booking.facilityName || "Ukjent fasilitet"
            }`,
            facility:
              booking.facility || booking.facilityName || "Ukjent fasilitet",
            facilityId: booking.facilityId || "1",
            bookerName:
              booking.contactPerson || booking.bookerName || "Ukjent bruker",
            bookerEmail: booking.bookerEmail || "bruker@example.com",
            purpose: booking.purpose || booking.description || "Booking",
            startDate,
            endDate,
            startTime,
            endTime,
            status: booking.status || "approved",
            requestedAt:
              booking.submittedAt ||
              booking.requestedAt ||
              new Date().toISOString(),
            processedBy: booking.processedBy,
            processedAt: booking.processedAt,
            price: priceNumber,
            duration: durationHours,
            isRecurring: booking.isRecurring,
            parentBookingId: booking.parentBookingId,
          } as IBooking;
        }
      );
      /* eslint-enable @typescript-eslint/no-explicit-any */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, []);

  // Real bookings only - refresh when trigger changes
  const bookings: readonly IBooking[] = useMemo(
    () => [...getPendingBookings(), ...getProcessedBookings()],
    [getPendingBookings, getProcessedBookings]
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parentId = (b as any).parentBookingId as string | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isRecurring = (b as any).isRecurring || !!parentId;
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
        new Date(b.processedAt || "").toDateString() ===
          new Date().toDateString()
    ).length;
    const rejectedToday = bookings.filter(
      (b) =>
        b.status === "rejected" &&
        new Date(b.processedAt || "").toDateString() ===
          new Date().toDateString()
    ).length;

    return { total, pending, approvedToday, rejectedToday };
  }, [bookings]);

  // Utilities for grouping/series detection used in approve/reject
  const getGroupKeyFromIBooking = (b: IBooking): string => {
    const timeKey = `${b.startTime}-${b.endTime}`;
    return `${b.facility}|${b.purpose}|${timeKey}`;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getGroupKeyFromRaw = (b: any): string => {
    const baseFacility = b.facility || b.facilityName;
    const basePurpose = b.purpose || b.description;
    let timeKey: string;
    if (b.time) {
      timeKey = b.time;
    } else if (b.startTime && b.endTime) {
      timeKey = `${b.startTime}-${b.endTime}`;
    } else if (b.timeSlots && b.timeSlots.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sorted = [...b.timeSlots].sort((a: any, c: any) =>
        a.timeSlot.localeCompare(c.timeSlot)
      );
      const s = sorted[0].timeSlot.split("-")[0];
      const e = sorted[sorted.length - 1].timeSlot.split("-")[1];
      timeKey = `${s}-${e}`;
    } else {
      timeKey = "unknown";
    }
    return `${baseFacility}|${basePurpose}|${timeKey}`;
  };

  const handleApprove = useCallback(
    (id: string): void => {
      try {
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return;

        const pendingBookings = JSON.parse(
          localStorage.getItem("pendingBookings") || "[]"
        );
        const processedBookings = JSON.parse(
          localStorage.getItem("processedBookings") || "[]"
        );

        // Determine series to approve
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parentId = (booking as any).parentBookingId as string | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isRecurring = (booking as any).isRecurring || !!parentId;
        const groupKey = parentId || getGroupKeyFromIBooking(booking);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keep: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const moveToProcessed: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pendingBookings.forEach((b: any) => {
          const bParent = b.parentBookingId as string | undefined;
          const bKey = bParent || getGroupKeyFromRaw(b);
          if (isRecurring ? bKey === groupKey : b.id === id) {
            moveToProcessed.push({
              ...b,
              status: "approved",
              processedBy: "Admin",
              processedAt: new Date().toISOString(),
            });
          } else {
            keep.push(b);
          }
        });

        localStorage.setItem("pendingBookings", JSON.stringify(keep));
        localStorage.setItem(
          "processedBookings",
          JSON.stringify([...processedBookings, ...moveToProcessed])
        );

        // Close modal and refresh the component
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
        setRefreshTrigger((prev) => prev + 1);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // Handle error silently
      }
    },
    [bookings]
  );

  const handleReject = useCallback(
    (id: string): void => {
      try {
        const booking = bookings.find((b) => b.id === id);
        if (!booking) return;

        const pendingBookings = JSON.parse(
          localStorage.getItem("pendingBookings") || "[]"
        );
        const processedBookings = JSON.parse(
          localStorage.getItem("processedBookings") || "[]"
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parentId = (booking as any).parentBookingId as string | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isRecurring = (booking as any).isRecurring || !!parentId;
        const groupKey = parentId || getGroupKeyFromIBooking(booking);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keep: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const moveToProcessed: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pendingBookings.forEach((b: any) => {
          const bParent = b.parentBookingId as string | undefined;
          const bKey = bParent || getGroupKeyFromRaw(b);
          if (isRecurring ? bKey === groupKey : b.id === id) {
            moveToProcessed.push({
              ...b,
              status: "rejected",
              processedBy: "Admin",
              processedAt: new Date().toISOString(),
            });
          } else {
            keep.push(b);
          }
        });

        localStorage.setItem("pendingBookings", JSON.stringify(keep));
        localStorage.setItem(
          "processedBookings",
          JSON.stringify([...processedBookings, ...moveToProcessed])
        );

        // Close modal and refresh the component
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
        setRefreshTrigger((prev) => prev + 1);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
      } catch (error) {}
    },
    [bookings]
  );

  const handleViewDetails = (id: string): void => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (id: string): void => {
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
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
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
                    const title = `${first.title} – ${t(
                      "pages.bookings.recurring"
                    )}`;
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
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md ${
                    workflow.isActive
                      ? "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                      : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        workflow.isActive ? "bg-green-500" : "bg-gray-400"
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
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
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
