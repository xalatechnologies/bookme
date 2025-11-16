"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useBookingListPage } from "@/hooks/bookings";
import { useCancelBooking, useDeleteBooking } from "@/services/supabase/bookings.service";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";
import type { Database } from "@/types/database";
import type { RecurringBookingGroup } from "@/hooks/bookings";
import {
  BookingCard,
  BookingDetailsPanel,
  BookingFiltersBar,
  RecurringBookingGroup as RecurringBookingGroupComponent,
  RecurringBookingGroupDetails,
} from "@/components/features/bookings";

type BookingStatus = Database['public']['Enums']['booking_status'];

const Bookings = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['booking', 'common', 'user']);
  const cancelBookingMutation = useCancelBooking();
  const deleteBookingMutation = useDeleteBooking();
  // We'll need to implement permanent deletion differently since I don't see a direct hook for it
  // For now, we'll keep the existing functionality but modify the logic

  // Use our custom hook for all booking logic
  const {
    filteredBookings,
    stats,
    recurringGroups,
    standaloneBookings,
    hasRecurringBookings,
    isLoading,
    isError,
    filters,
    setStatusFilter,
    setFacilityFilter,
    setDateRangeFilter,
    setSearchQuery,
    setSortBy,
    resetFilters,
    refetch,
    viewMode,
    setViewMode
  } = useBookingListPage();

  // Local UI state
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [bookingsToDelete, setBookingsToDelete] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showRecurringGroupDetails, setShowRecurringGroupDetails] = useState<boolean>(false);
  const [selectedRecurringGroup, setSelectedRecurringGroup] = useState<RecurringBookingGroup | null>(null);

  // Handle checkout success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      toast.success(t('booking:toast.booking_submitted'));
      setStatusFilter('pending');
      navigate("/user/bookings", { replace: true });
    }
  }, [location.search, navigate, setStatusFilter, t]);

  // Status options with counts from stats
  const statusOptions = [
    { value: "all" as const, label: t('booking:page.all_status'), count: stats.total, color: "gray" },
    { value: "paid" as const, label: t('booking:status.paid'), count: stats.paid, color: "green" },
    { value: "pending" as const, label: t('booking:status.pending'), count: stats.pending, color: "yellow" },
    { value: "cancelled" as const, label: t('booking:status.cancelled'), count: stats.cancelled, color: "red" },
    { value: "completed" as const, label: t('booking:status.completed'), count: stats.completed, color: "blue" },
  ];

  // Get unique facilities from bookings
  const facilities = useMemo(() => {
    const facilitySet = new Set<string>();
    filteredBookings.forEach(booking => {
      if (booking.facility?.name) {
        facilitySet.add(booking.facility.name);
      }
    });
    return Array.from(facilitySet).sort();
  }, [filteredBookings]);

  const handleStatusChange = useCallback((status: BookingStatus | 'all') => {
    setStatusFilter(status);
  }, [setStatusFilter]);

  const handleBookingSelect = useCallback((bookingId: string) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedBookings.length === filteredBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(filteredBookings.map(b => b.id));
    }
  }, [selectedBookings.length, filteredBookings]);

  const handleDeleteSelected = useCallback(() => {
    setBookingsToDelete(selectedBookings);
    setShowDeleteConfirm(true);
  }, [selectedBookings]);

  const handleDeleteSingle = useCallback((bookingId: string) => {
    setBookingsToDelete([bookingId]);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      // Check if the bookings are already cancelled
      const bookingsToProcess = filteredBookings.filter(booking => 
        bookingsToDelete.includes(booking.id)
      );
      
      const alreadyCancelled = bookingsToProcess.filter(booking => 
        booking.status === 'cancelled'
      );
      
      if (alreadyCancelled.length > 0) {
        // If any bookings are already cancelled, permanently delete them
        await Promise.all(
          alreadyCancelled.map(booking => deleteBookingMutation.mutateAsync(booking.id))
        );
        
        // Also cancel any remaining non-cancelled bookings
        const nonCancelled = bookingsToProcess.filter(booking => 
          booking.status !== 'cancelled'
        );
        
        if (nonCancelled.length > 0) {
          await Promise.all(
            nonCancelled.map(booking => cancelBookingMutation.mutateAsync({ id: booking.id }))
          );
        }

        setSelectedBookings([]);
        setShowDeleteConfirm(false);
        setBookingsToDelete([]);

        const message = bookingsToDelete.length === 1
          ? t('booking:delete_confirm.success_single')
          : t('booking:delete_confirm.success_multiple', { count: bookingsToDelete.length });
        toast.success(message);
        refetch();
      } else {
        // Cancel all selected bookings (first step)
        await Promise.all(
          bookingsToDelete.map(id => cancelBookingMutation.mutateAsync({ id }))
        );

        setSelectedBookings([]);
        setShowDeleteConfirm(false);
        setBookingsToDelete([]);

        const message = bookingsToDelete.length === 1
          ? t('booking:delete_confirm.success_single')
          : t('booking:delete_confirm.success_multiple', { count: bookingsToDelete.length });
        toast.success(message);
        refetch();
      }
    } catch (error) {
      console.error('Delete/cancel error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`${t('booking:messages.error.cancel_failed')} ${errorMessage}`);
    }
  }, [bookingsToDelete, cancelBookingMutation, deleteBookingMutation, refetch, t, filteredBookings]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setBookingsToDelete([]);
  }, []);

  const handleOpenDetails = useCallback((booking: BookingWithDetails) => {
    setSelectedBooking(booking);
    setShowDetailsPanel(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetailsPanel(false);
    setSelectedBooking(null);
  }, []);

  const handleCancelBooking = useCallback(async (booking: BookingWithDetails) => {
    try {
      if (booking.status === 'cancelled') {
        // If already cancelled, permanently delete the booking
        await deleteBookingMutation.mutateAsync(booking.id);
        toast.success(t('booking:messages.success.deleted' as any));
      } else {
        // Otherwise, cancel the booking
        await cancelBookingMutation.mutateAsync({ id: booking.id });
        toast.success(t('booking:messages.success.cancelled' as any));
      }
      handleCloseDetails();
      refetch();
    } catch (error) {
      console.error('Cancel/delete error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`${t('booking:messages.error.cancel_failed' as any)} ${errorMessage}`);
    }
  }, [cancelBookingMutation, deleteBookingMutation, handleCloseDetails, refetch, t]);

  const handleShareBooking = useCallback((booking: BookingWithDetails) => {
    const shareText = `Booking: ${booking.facility?.name}\nDato: ${new Date(booking.starts_at).toLocaleDateString('nb-NO')}`;

    if (navigator.share) {
      navigator.share({
        title: `Booking: ${booking.facility?.name}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        toast.success(t('booking:toast.info_copied'));
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('booking:toast.info_copied'));
    }
  }, [t]);

  const handleAddToCalendar = useCallback((booking: BookingWithDetails) => {
    // Create ICS file for calendar
    const startDate = new Date(booking.starts_at);
    const endDate = new Date(booking.ends_at);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Booknor//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@booknor.no
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:Booking: ${booking.facility?.name}
LOCATION:${booking.zone?.name || booking.facility?.name}
DESCRIPTION:Booking av ${booking.facility?.name}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking-${booking.id}.ics`;
    link.click();

    toast.success(t('booking:toast.calendar_added'));
  }, [t]);

  const handleOpenRecurringGroupDetails = useCallback((group: RecurringBookingGroup) => {
    setSelectedRecurringGroup(group);
    setShowRecurringGroupDetails(true);
  }, []);

  const handleCloseRecurringGroupDetails = useCallback(() => {
    setShowRecurringGroupDetails(false);
    setSelectedRecurringGroup(null);
  }, []);

  const handleCancelRecurringGroup = useCallback(async (groupId: string) => {
    // TODO: Implement cancel recurring group functionality
    toast.info(t('booking:toast.recurring_coming_soon'));
    handleCloseRecurringGroupDetails();
  }, [handleCloseRecurringGroupDetails, t]);

  // Ensure we always show recurring bookings as groups
  const displayRecurringGroups = hasRecurringBookings && recurringGroups.length > 0;
  const displayStandaloneBookings = standaloneBookings.length > 0 || !hasRecurringBookings;

  // Set view mode to grouped by default if there are recurring bookings
  useEffect(() => {
    if (hasRecurringBookings && viewMode !== 'grouped') {
      setViewMode('grouped');
    }
  }, [hasRecurringBookings, viewMode, setViewMode]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('booking:page.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('booking:page.error_loading')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('booking:page.error_message')}
            </p>
            <Button onClick={() => refetch()}>
              {t('booking:page.try_again')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('booking:page.user_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('booking:page.user_subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => navigate('/facilities')}
            className="flex items-center gap-2 h-12"
          >
            <Plus className="w-4 h-4" />
            {t('user:dashboard.new_booking' as any)}
          </Button>
        </div>
      </header>

      {/* Status Panel */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              filters.status === option.value
                ? option.color === "green" ? "bg-green-100 text-green-800 border border-green-200"
                : option.color === "yellow" ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : option.color === "red" ? "bg-red-100 text-red-800 border border-red-200"
                : option.color === "blue" ? "bg-blue-100 text-blue-800 border border-blue-200"
                : "bg-gray-100 text-gray-800 border border-gray-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {option.label}
            <Badge variant="secondary" className="text-xs">
              {option.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <BookingFiltersBar
        filters={filters}
        facilities={facilities}
        onSearchChange={setSearchQuery}
        onDateRangeChange={setDateRangeFilter}
        onFacilityChange={setFacilityFilter}
        onSortChange={setSortBy}
        onClearFilters={resetFilters}
        onOpenCalendar={() => navigate('/user/calendar')}
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
              onCheckedChange={handleSelectAll}
              aria-label={t('booking:page.select_all', { count: filteredBookings.length })}
            />
            <span className="text-sm text-gray-600">
              {t('booking:page.select_all', { count: filteredBookings.length })}
            </span>
          </div>

          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {t('booking:page.selected_count', { count: selectedBookings.length })}
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('booking:button_labels.cancel_selected' as any)}
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {t('booking:page.showing_count', { count: filteredBookings.length, total: stats.total })}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('booking:page.no_match')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('booking:page.no_match_message')}
              </p>
              <Button onClick={() => navigate('/facilities')}>
                {t('booking:page.explore_facilities')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Recurring groups - Always show when there are recurring bookings */}
            {displayRecurringGroups && recurringGroups.map(group => (
              <RecurringBookingGroupComponent
                key={group.recurringId}
                group={group}
                onViewDetails={() => handleOpenRecurringGroupDetails(group)}
              />
            ))}

            {/* Standalone bookings */}
            {displayStandaloneBookings && standaloneBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                selected={selectedBookings.includes(booking.id)}
                onSelect={handleBookingSelect}
                onViewDetails={handleOpenDetails}
                onDelete={handleDeleteSingle}
                showCheckbox
              />
            ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {bookingsToDelete.length === 1
                    ? t('booking:delete_confirm.title_single')
                    : t('booking:delete_confirm.title_multiple')}
                </h3>
                <p className="text-sm text-gray-600">
                  {(() => {
                    // Check if any of the bookings to delete are already cancelled
                    const bookingsToProcess = filteredBookings.filter(booking => 
                      bookingsToDelete.includes(booking.id)
                    );
                    
                    const alreadyCancelled = bookingsToProcess.filter(booking => 
                      booking.status === 'cancelled'
                    );
                    
                    if (alreadyCancelled.length > 0) {
                      // Show permanent deletion message
                      return bookingsToDelete.length === 1
                        ? t('booking:actions.delete_permanently_message_single' as any)
                        : t('booking:actions.delete_permanently_message_multiple' as any, { count: alreadyCancelled.length });
                    } else {
                      // Show cancellation message
                      return bookingsToDelete.length === 1
                        ? t('booking:delete_confirm.message_single')
                        : t('booking:delete_confirm.message_multiple', { count: bookingsToDelete.length });
                    }
                  })()}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">{t('booking:terms.warning_title')}</p>
                  <p>{t('booking:terms.warning_text')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="flex items-center gap-2"
                type="button"
              >
                <X className="w-4 h-4" />
                {t('booking:button_labels.cancel' as any)}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={cancelBookingMutation.isPending || deleteBookingMutation.isPending}
                className="flex items-center gap-2"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
                {cancelBookingMutation.isPending || deleteBookingMutation.isPending
                  ? t('booking:delete_confirm.canceling')
                  : (bookingsToDelete.length > 1
                    ? t('booking:delete_confirm.cancel_all')
                    : (() => {
                        // Check if any of the bookings to delete are already cancelled
                        const bookingsToProcess = filteredBookings.filter(booking => 
                          bookingsToDelete.includes(booking.id)
                        );
                        
                        const alreadyCancelled = bookingsToProcess.filter(booking => 
                          booking.status === 'cancelled'
                        );
                        
                        return alreadyCancelled.length > 0
                          ? t('booking:actions.delete_permanently' as any)
                          : t('booking:button_labels.cancel_booking' as any);
                      })())}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetailsPanel && selectedBooking && (
        <BookingDetailsPanel
          booking={selectedBooking}
          onClose={handleCloseDetails}
          onCancel={handleCancelBooking}
          onShare={handleShareBooking}
          onAddToCalendar={handleAddToCalendar}
        />
      )}

      {/* Recurring Group Details Panel */}
      {showRecurringGroupDetails && selectedRecurringGroup && (
        <RecurringBookingGroupDetails
          group={selectedRecurringGroup}
          onClose={handleCloseRecurringGroupDetails}
          onCancelGroup={handleCancelRecurringGroup}
        />
      )}
    </div>
  );
};

export default Bookings;
