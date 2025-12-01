"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  Check,
  X,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import { useApprovalsManagement } from "@/hooks/features/approvals";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";

interface IApprovalsPageProps {
  readonly children?: never;
}

interface IApprovalKPICardProps {
  readonly title: string;
  readonly value: number;
  readonly color: "blue" | "orange" | "green" | "red";
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly subtext: string;
  readonly onClick?: () => void;
}

interface IApprovalRowProps {
  readonly booking: BookingWithDetails;
  readonly onApprove: (id: string) => Promise<void>;
  readonly onReject: (id: string) => Promise<void>;
  readonly onViewDetails: (id: string) => void;
  readonly isSelected: boolean;
  readonly onSelect: (id: string, selected: boolean) => void;
  readonly canApprove: boolean;
  readonly canReject: boolean;
}

interface IBookingDetailModalProps {
  readonly booking: BookingWithDetails | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onApprove: (id: string) => Promise<void>;
  readonly onReject: (id: string) => Promise<void>;
  readonly canApprove: boolean;
  readonly canReject: boolean;
}

interface IFilterModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly filters: {
    readonly searchTerm: string;
    readonly dateFrom: string;
    readonly dateTo: string;
    readonly facilityType: string;
  };
  readonly onApplyFilters: (filters: {
    readonly searchTerm: string;
    readonly dateFrom: string;
    readonly dateTo: string;
    readonly facilityType: string;
  }) => void;
}

const ApprovalKPICard = ({
  title,
  value,
  color,
  icon: Icon,
  subtext,
  onClick,
}: IApprovalKPICardProps): JSX.Element => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30",
  };

  return (
    <Card
      className={`${colorClasses[color]} border transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:scale-105" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs opacity-70 mt-1">{subtext}</p>
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
  filters,
  onApplyFilters,
}: IFilterModalProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common", "bookings", "facility"]);
  // Create local filters with default values for optional fields
  const localFiltersWithDefaults = {
    searchTerm: filters.searchTerm || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    facilityType: filters.facilityType || "",
  };
  
  const [localFilters, setLocalFilters] = useState(localFiltersWithDefaults);

  const handleApply = (): void => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = (): void => {
    const resetFilters = {
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
      facilityType: "",
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("bookings:title")}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("bookings:filters.search")}
              </label>
              <Input
                type="text"
                value={localFilters.searchTerm}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, searchTerm: e.target.value })
                }
                placeholder={t("bookings:filters.search")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("bookings:filters.by_date")}
              </label>
              <Input
                type="date"
                value={localFilters.dateFrom}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateFrom: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("bookings:filters.by_date")}
              </label>
              <Input
                type="date"
                value={localFilters.dateTo}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, dateTo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("bookings:filters.by_facility")}
              </label>
              <select
                value={localFilters.facilityType}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, facilityType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">
                  {t("bookings:filters.all")}
                </option>
                <option value="sports_hall">
                  {t("facility:types.sports_hall")}
                </option>
                <option value="gym">{t("facility:types.gym")}</option>
                <option value="meeting_room">
                  {t("facility:types.conference_room")}
                </option>
              </select>
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

const ApprovalRow = ({
  booking,
  onApprove,
  onReject,
  onViewDetails,
  isSelected,
  onSelect,
  canApprove,
  canReject,
}: IApprovalRowProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common", "bookings", "facility"]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleApprove = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await onApprove(booking.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await onReject(booking.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

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
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
        } bg-yellow-50/30 dark:bg-yellow-900/5`}
        onClick={() => onViewDetails(booking.id)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" />

        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {booking.facility?.name || t("bookings:details.unknownVenue")}
                </h4>
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                  {t("common:status.pending")}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {startDate.toLocaleDateString("nb-NO")} •{" "}
                    {startDate.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endDate.toLocaleTimeString("nb-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {durationHours === 1
                      ? t("common:time.hour")
                      : `${durationHours} ${t("common:time.hours")}`}
                  </span>
                </div>

                {booking.facility?.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{booking.facility.address}</span>
                  </div>
                )}

                {booking.notes && (
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <span className="line-clamp-2">{booking.notes}</span>
                  </div>
                )}
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
                title={t("bookings:actions.view_details")}
              >
                <Eye className="w-4 h-4" />
              </Button>

              {canApprove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex items-center justify-center p-2 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                  title={t("bookings:actions.approve")}
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}

              {canReject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                  title={t("bookings:actions.reject")}
                >
                  <X className="w-4 h-4" />
                </Button>
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
  canApprove,
  canReject,
}: IBookingDetailModalProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common", "bookings"]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !booking) return <></>;

  const startDate = new Date(booking.starts_at);
  const endDate = new Date(booking.ends_at);
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10;

  const handleApprove = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      await onApprove(booking.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      await onReject(booking.id);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (cents: number, currency: string): string => {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t("bookings:details.title")}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Facility Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {t("bookings:details.facility_info")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.facility?.name || t("bookings:details.unknownVenue")}
                </p>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {startDate.toLocaleDateString("nb-NO", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {startDate.toLocaleTimeString("nb-NO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {endDate.toLocaleTimeString("nb-NO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({durationHours}{" "}
                      {durationHours === 1
                        ? t("common:time.hour")
                        : t("common:time.hours")})
                    </span>
                  </div>
                  {booking.facility?.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.facility.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {t("bookings:details.booking_details")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("bookings:fields.price")}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(booking.total_cents, booking.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("common:status.pending")}:
                  </span>
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                    {t("common:status.pending")}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("bookings:fields.created_at")}:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.created_at).toLocaleString("nb-NO")}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {t("bookings:details.notesLabel")}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {booking.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {canApprove && (
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t("bookings:actions.approve")}
                </Button>
              )}
              {canReject && (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t("bookings:actions.reject")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApprovalsPage = (_props: IApprovalsPageProps): JSX.Element => {
  const { t } = useTranslation(["admin", "common", "bookings"]);

  // Use the approvals management hook
  const {
    filteredBookings,
    isLoading,
    pendingCount,
    approvedTodayCount,
    rejectedTodayCount,
    filters,
    setSearchTerm,
    setDateRange,
    clearDateRange,
    setFacilityType,
    resetFilters,
    approveBooking,
    rejectBooking,
    batchApprove,
    batchReject,
    canApprove,
    canReject,
  } = useApprovalsManagement();

  // Local UI state
  const [selectedBookingIds, setSelectedBookingIds] = useState<Set<string>>(
    new Set()
  );
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Handlers
  const handleSelectBooking = useCallback((id: string, selected: boolean): void => {
    setSelectedBookingIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((): void => {
    const allSelected =
      filteredBookings.length > 0 &&
      filteredBookings.every((b) => selectedBookingIds.has(b.id));

    if (allSelected) {
      setSelectedBookingIds(new Set());
    } else {
      setSelectedBookingIds(new Set(filteredBookings.map((b) => b.id)));
    }
  }, [filteredBookings, selectedBookingIds]);

  const handleViewDetails = useCallback(
    (id: string): void => {
      const booking = filteredBookings.find((b) => b.id === id);
      if (booking) {
        setSelectedBooking(booking);
        setIsDetailModalOpen(true);
      }
    },
    [filteredBookings]
  );

  const handleApprove = useCallback(
    async (id: string): Promise<void> => {
      const result = await approveBooking(id);
      if (!result.success) {
        console.error("Failed to approve booking:", result.error);
      }
    },
    [approveBooking]
  );

  const handleReject = useCallback(
    async (id: string): Promise<void> => {
      const result = await rejectBooking(id);
      if (!result.success) {
        console.error("Failed to reject booking:", result.error);
      }
    },
    [rejectBooking]
  );

  const handleBulkApprove = useCallback(async (): Promise<void> => {
    const ids = Array.from(selectedBookingIds);
    await batchApprove(ids);
    setSelectedBookingIds(new Set());
  }, [selectedBookingIds, batchApprove]);

  const handleBulkReject = useCallback(async (): Promise<void> => {
    const ids = Array.from(selectedBookingIds);
    await batchReject(ids);
    setSelectedBookingIds(new Set());
  }, [selectedBookingIds, batchReject]);

  const handleApplyFilters = useCallback(
    (newFilters: {
      readonly searchTerm: string;
      readonly dateFrom: string;
      readonly dateTo: string;
      readonly facilityType: string;
    }): void => {
      setSearchTerm(newFilters.searchTerm);
      if (newFilters.dateFrom && newFilters.dateTo) {
        setDateRange(newFilters.dateFrom, newFilters.dateTo);
      } else {
        clearDateRange();
      }
      setFacilityType(newFilters.facilityType);
    },
    [setSearchTerm, setDateRange, clearDateRange, setFacilityType]
  );

  const allSelected = useMemo(
    () =>
      filteredBookings.length > 0 &&
      filteredBookings.every((b) => selectedBookingIds.has(b.id)),
    [filteredBookings, selectedBookingIds]
  );

  const hasPendingSelection = useMemo(() => {
    return Array.from(selectedBookingIds).some((id) => {
      const booking = filteredBookings.find((b) => b.id === id);
      return booking && booking.status === "pending";
    });
  }, [selectedBookingIds, filteredBookings]);

  // Create a safe filter object with default values for optional fields
  const safeFilters = {
    searchTerm: filters.searchTerm || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
    facilityType: filters.facilityType || "",
  };

  return (
    <RequireRole minRole="case_handler">
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t("admin:pages.bookings.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t("admin:pages.bookings.subtitle")}
            </p>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ApprovalKPICard
            title={t("admin:pages.bookings.kpi.pending_approvals")}
            value={pendingCount}
            color="orange"
            icon={AlertCircle}
            subtext={t("admin:pages.bookings.kpi.requires_action")}
          />
          <ApprovalKPICard
            title={t("admin:pages.bookings.kpi.approved_today")}
            value={approvedTodayCount}
            color="green"
            icon={CheckCircle}
            subtext={t("admin:pages.bookings.kpi.processed_today")}
          />
          <ApprovalKPICard
            title={t("admin:pages.bookings.kpi.rejected_today")}
            value={rejectedTodayCount}
            color="red"
            icon={XCircle}
            subtext={t("admin:pages.bookings.kpi.rejected_today_sub")}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <CardTitle className="text-lg">
                {t("bookings:page.admin_title")}
              </CardTitle>

              {/* Search and Filters */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={t("admin:pages.bookings.search_placeholder")}
                      value={filters.searchTerm || ""}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    {t("common:actions.reset")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("admin:pages.bookings.select_all", {
                      count: filteredBookings.length,
                    })}
                  </span>
                </div>

                {selectedBookingIds.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("admin:pages.bookings.selected_count", {
                        count: selectedBookingIds.size,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookingIds.size > 0 && hasPendingSelection && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {t("admin:pages.bookings.bulk_selected", {
                    count: selectedBookingIds.size,
                  })}
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {t("admin:pages.bookings.bulk_approve_all")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t("admin:pages.bookings.bulk_reject_all")}
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Approvals List */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">
                    {t("common:common.loading")}
                  </p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("admin:pages.bookings.empty.no_bookings")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filters.searchTerm
                      ? t("admin:pages.bookings.empty.try_different_criteria")
                      : t("admin:pages.bookings.empty.no_bookings_currently")}
                  </p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <ApprovalRow
                    key={booking.id}
                    booking={booking}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                    isSelected={selectedBookingIds.has(booking.id)}
                    onSelect={handleSelectBooking}
                    canApprove={canApprove(booking)}
                    canReject={canReject(booking)}
                  />
                ))
              )}
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
          canApprove={selectedBooking ? canApprove(selectedBooking) : false}
          canReject={selectedBooking ? canReject(selectedBooking) : false}
        />

        {/* Filter Modal */}
        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          filters={safeFilters}
          onApplyFilters={handleApplyFilters}
        />
      </div>
    </RequireRole>
  );
};

export default ApprovalsPage;
