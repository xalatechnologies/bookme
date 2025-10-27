"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useCancelBooking } from "@/services/supabase/bookings.service";
import type { BookingWithDetails } from "@/services/supabase/bookings.service";
import type { Database } from "@/types/database";
import {
  BookingCard,
  BookingDetailsPanel,
  BookingFiltersBar,
  RecurringBookingGroup,
} from "@/components/bookings";

type BookingStatus = Database['public']['Enums']['booking_status'];

const Bookings = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const cancelBookingMutation = useCancelBooking();

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
  } = useBookingListPage();

  // Local UI state
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [bookingsToDelete, setBookingsToDelete] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  // Handle checkout success parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      toast.success("Booking sendt! Du vil få bekreftelse på e-post når den er godkjent.");
      setStatusFilter('pending');
      navigate("/user/bookings", { replace: true });
    }
  }, [location.search, navigate, setStatusFilter]);

  // Status options with counts from stats
  const statusOptions = [
    { value: "all" as const, label: "Alle", count: stats.total, color: "gray" },
    { value: "paid" as const, label: "Bekreftet", count: stats.paid, color: "green" },
    { value: "pending" as const, label: "Ventende", count: stats.pending, color: "yellow" },
    { value: "cancelled" as const, label: "Avlyst", count: stats.cancelled, color: "red" },
    { value: "completed" as const, label: "Fullført", count: stats.completed, color: "blue" },
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
      // Cancel all selected bookings
      await Promise.all(
        bookingsToDelete.map(id => cancelBookingMutation.mutateAsync(id))
      );

      setSelectedBookings([]);
      setShowDeleteConfirm(false);
      setBookingsToDelete([]);

      toast.success(`${bookingsToDelete.length} booking${bookingsToDelete.length > 1 ? 'er' : ''} avlyst`);
      refetch();
    } catch (error) {
      toast.error("Kunne ikke avlyse booking(er)");
    }
  }, [bookingsToDelete, cancelBookingMutation, refetch]);

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
      await cancelBookingMutation.mutateAsync(booking.id);
      toast.success("Booking avlyst");
      handleCloseDetails();
      refetch();
    } catch (error) {
      toast.error("Kunne ikke avlyse booking");
    }
  }, [cancelBookingMutation, handleCloseDetails, refetch]);

  const handleShareBooking = useCallback((booking: BookingWithDetails) => {
    const shareText = `Booking: ${booking.facility?.name}\nDato: ${new Date(booking.starts_at).toLocaleDateString('nb-NO')}`;

    if (navigator.share) {
      navigator.share({
        title: `Booking: ${booking.facility?.name}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(shareText);
        toast.success('Booking-info kopiert til utklippstavle!');
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Booking-info kopiert til utklippstavle!');
    }
  }, []);

  const handleAddToCalendar = useCallback((booking: BookingWithDetails) => {
    // Create ICS file for calendar
    const startDate = new Date(booking.starts_at);
    const endDate = new Date(booking.ends_at);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BookMe//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@bookme.no
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

    toast.success('Booking lagt til i kalender!');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laster bookinger...</p>
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
              Kunne ikke laste bookinger
            </h3>
            <p className="text-gray-600 mb-4">
              Det oppstod en feil ved lasting av dine bookinger.
            </p>
            <Button onClick={() => refetch()}>
              Prøv igjen
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
            Bookinger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Samlet oversikt over alle dine bookinger
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => navigate('/user/facilities')}
            className="flex items-center gap-2 h-12"
          >
            <Plus className="w-4 h-4" />
            Ny booking
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
              aria-label="Velg alle bookinger"
            />
            <span className="text-sm text-gray-600">
              Velg alle ({filteredBookings.length})
            </span>
          </div>

          {selectedBookings.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedBookings.length} valgt
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Avlys valgte
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Viser {filteredBookings.length} av {stats.total} bookinger
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ingen bookinger matcher filteret
              </h3>
              <p className="text-gray-600 mb-4">
                Prøv å justere søkekriteriene eller utforsk tilgjengelige lokaler.
              </p>
              <Button onClick={() => navigate('/user/facilities')}>
                Utforsk lokaler
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Recurring groups */}
            {hasRecurringBookings && recurringGroups.map(group => (
              <RecurringBookingGroup
                key={group.recurringId}
                group={group}
                onViewDetails={(groupId) => {
                  // TODO: Implement recurring group details view
                  toast.info('Visning av gjentakende booking kommer snart!');
                }}
              />
            ))}

            {/* Standalone bookings */}
            {standaloneBookings.map((booking) => (
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
                  Avlys booking{bookingsToDelete.length > 1 ? 'er' : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  Er du sikker på at du vil avlyse {bookingsToDelete.length} booking{bookingsToDelete.length > 1 ? 'er' : ''}?
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Advarsel:</p>
                  <p>Denne handlingen kan ikke angres.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={cancelBookingMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {cancelBookingMutation.isPending ? 'Avlyser...' : `Avlys ${bookingsToDelete.length > 1 ? 'alle' : 'booking'}`}
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
    </div>
  );
};

export default Bookings;
