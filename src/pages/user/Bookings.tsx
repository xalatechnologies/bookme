"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Share2,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  X,
  CalendarPlus,
  RotateCcw,
  Download,
  MoreHorizontal,
  Repeat,
  Users,
  MessageCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { RecurringBookingModal } from "@/components/booking/RecurringBookingModal";
import { GroupBookingFlow } from "@/components/group/GroupBookingFlow";
import { MessageInbox } from "@/components/messaging/MessageInbox";
import { useRecurringBookingStore } from "@/stores/recurringBookingStore";
import { useGroupStore } from "@/stores/groupStore";
import { useMessageStore } from "@/stores/messageStore";

interface IBooking {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly time: string;
  readonly duration: string;
  readonly status: "confirmed" | "pending" | "rejected" | "cancelled";
  readonly location: string;
  readonly price: string;
  readonly description: string;
  readonly purpose?: string;
  readonly contactPerson?: string;
  readonly paymentStatus?: "paid" | "pending" | "failed";
  readonly facilityImage?: string;
  readonly rating?: number;
  readonly canRate?: boolean;
  readonly submittedAt?: string;
  readonly rejectionReason?: string;
  readonly type: "booking" | "request";
  readonly bookingType?: "one-time" | "recurring";
  readonly zoneName?: string;
  readonly attendees?: number;
  readonly activityType?: string;
  readonly actorType?: string;
}

const Bookings = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["all"]);
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [bookingsToDelete, setBookingsToDelete] = useState<string[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // New feature states
  const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
  const [showGroupBookingModal, setShowGroupBookingModal] = useState<boolean>(false);
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState<{
    id: string;
    name: string;
    zoneId: string;
    zoneName: string;
    timeSlots: string[];
    pricePerHour: number;
  } | null>(null);

  // Handle success parameter from checkout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('success') === 'true') {
      toast.success("Booking sendt! Du vil få bekreftelse på e-post når den er godkjent.");
      
      // Trigger re-render to show new bookings from localStorage
      setRefreshTrigger(prev => prev + 1);
      
      // Switch to pending status to show the new booking
      setActiveStatus("pending");
      setSelectedStatuses(["pending"]);
      // Clean up URL
      navigate("/user/bookings", { replace: true });
    }
  }, [location.search, navigate]);

  // Get pending bookings from localStorage
  const getPendingBookings = useCallback((): IBooking[] => {
    try {
      return JSON.parse(localStorage.getItem('pendingBookings') || '[]');
    } catch {
      return [];
    }
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Get processed bookings from localStorage (approved/rejected)
  const getProcessedBookings = useCallback((): IBooking[] => {
    try {
      const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      return processedBookings.map((booking: any) => ({
        id: booking.id,
        facility: booking.facility,
        date: booking.startDate || booking.date,
        time: `${booking.startTime}-${booking.endTime}`,
        duration: booking.duration ? `${booking.duration} timer` : '2 timer',
        status: booking.status === 'approved' ? 'confirmed' : booking.status === 'rejected' ? 'rejected' : 'cancelled',
        location: 'Drammen', // This could be dynamic
        price: booking.price ? `${booking.price.toLocaleString('nb-NO')} kr` : '0 kr',
        description: booking.purpose || 'Booking',
        purpose: booking.purpose,
        contactPerson: booking.bookerName || 'Ukjent',
        paymentStatus: booking.status === 'approved' ? 'paid' : 'pending',
        facilityImage: undefined,
        rejectionReason: booking.status === 'rejected' ? 'Avvist av administrator' : undefined,
        createdAt: booking.requestedAt || new Date().toISOString(),
        updatedAt: booking.processedAt || new Date().toISOString()
      }));
    } catch {
      return [];
    }
  }, [refreshTrigger]);

  // Remove pending booking from localStorage
  const removePendingBooking = useCallback((bookingId: string): void => {
    try {
      const existingPending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = existingPending.filter((booking: IBooking) => booking.id !== bookingId);
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error removing pending booking:', error);
    }
  }, []);

  // Update pending booking status
  const updatePendingBookingStatus = useCallback((bookingId: string, newStatus: 'confirmed' | 'rejected' | 'cancelled'): void => {
    try {
      const existingPending = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = existingPending.map((booking: IBooking) => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error updating pending booking status:', error);
    }
  }, []);


  // Real bookings only - combine pending and processed bookings
  const allBookings: IBooking[] = [
    // Pending bookings from localStorage
    ...getPendingBookings(),
    // Processed bookings from localStorage (approved/rejected)
    ...getProcessedBookings()
  ];

  const statusOptions = [
    { value: "all", label: "Alle", count: allBookings.length, color: "gray" },
    { value: "confirmed", label: "Bekreftet", count: allBookings.filter(b => b.status === "confirmed").length, color: "green" },
    { value: "pending", label: "Ventende", count: allBookings.filter(b => b.status === "pending").length, color: "yellow" },
    { value: "rejected", label: "Avvist", count: allBookings.filter(b => b.status === "rejected").length, color: "red" },
    { value: "cancelled", label: "Avlyst", count: allBookings.filter(b => b.status === "cancelled").length, color: "red" }
  ];

  // Get facilities from actual bookings
  const facilities = useMemo(() => {
    const facilitySet = new Set<string>();
    allBookings.forEach(booking => {
      if (booking.facility) {
        facilitySet.add(booking.facility);
      }
    });
    return Array.from(facilitySet).sort();
  }, [allBookings]);

  const filteredBookings = useMemo(() => {
    let filtered = allBookings;

    // Status filter
    if (activeStatus !== "all") {
      filtered = filtered.filter(booking => booking.status === activeStatus);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(booking => 
        booking.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFrom) {
      filtered = filtered.filter(booking => booking.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(booking => booking.date <= dateTo);
    }

    // Facility filter
    if (selectedFacility && selectedFacility !== "all") {
      filtered = filtered.filter(booking => booking.facility === selectedFacility);
    }

    // Status multiselect filter
    if (selectedStatuses.length > 0 && !selectedStatuses.includes("all")) {
      filtered = filtered.filter(booking => selectedStatuses.includes(booking.status));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "price":
          return parseFloat(a.price.replace(/[^\d]/g, "")) - parseFloat(b.price.replace(/[^\d]/g, ""));
        case "created":
          return new Date(a.submittedAt || a.date).getTime() - new Date(b.submittedAt || b.date).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allBookings, activeStatus, searchQuery, dateFrom, dateTo, selectedFacility, selectedStatuses, sortBy]);

  const handleStatusChange = useCallback((status: string) => {
    setActiveStatus(status);
    setSelectedStatuses(status === "all" ? ["all"] : [status]);
  }, []);

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

  const confirmDelete = useCallback(() => {
    // Remove bookings from localStorage (for pending bookings)
    const pendingBookings = getPendingBookings();
    const updatedPending = pendingBookings.filter(booking => !bookingsToDelete.includes(booking.id));
    localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));
    
    // Clear selected bookings
    setSelectedBookings([]);
    setShowDeleteConfirm(false);
    setBookingsToDelete([]);
    
    // Refresh the component
    setRefreshTrigger(prev => prev + 1);
    
    toast.success(`${bookingsToDelete.length} booking${bookingsToDelete.length > 1 ? 'er' : ''} slettet`);
  }, [bookingsToDelete, getPendingBookings]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setBookingsToDelete([]);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSelectedFacility("all");
    setSelectedStatuses(["all"]);
    setActiveStatus("all");
    setSortBy("date-asc");
  }, []);

  const handleOpenDetails = useCallback((booking: IBooking) => {
    setSelectedBooking(booking);
    setShowDetailsPanel(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetailsPanel(false);
    setSelectedBooking(null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Bekreftet";
      case "pending": return "Ventende";
      case "rejected": return "Avvist";
      case "cancelled": return "Avlyst";
      default: return status;
    }
  };

  const getActionButtons = (booking: IBooking) => {
    const baseActions = [
      {
        icon: Eye,
        label: "Se",
        onClick: () => handleOpenDetails(booking),
        primary: true
      }
    ];

    // Add delete button for all statuses
    const deleteAction = {
      icon: Trash2,
      label: "Slett",
      onClick: () => handleDeleteSingle(booking.id),
      primary: false
    };

    switch (booking.status) {
      case "pending":
        return [
          ...baseActions,
          { icon: Edit, label: "Rediger", onClick: () => console.log("Edit", booking.id) },
          { icon: RotateCcw, label: "Trekk tilbake", onClick: () => console.log("Withdraw", booking.id) },
          deleteAction
        ];
      case "confirmed":
        return [
          ...baseActions,
          { icon: Edit, label: "Endre tidspunkt", onClick: () => console.log("Reschedule", booking.id) },
          { icon: X, label: "Avlys", onClick: () => console.log("Cancel", booking.id) },
          { icon: Share2, label: "Del", onClick: () => console.log("Share", booking.id) },
          { icon: CalendarPlus, label: "Legg til i kalender", onClick: () => console.log("Add to calendar", booking.id) },
          deleteAction
        ];
      case "rejected":
      case "cancelled":
        return [
          ...baseActions,
          { icon: Plus, label: "Send ny forespørsel", onClick: () => console.log("New request", booking.id) },
          deleteAction
        ];
      default:
        return [...baseActions, deleteAction];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bookinger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Samlet oversikt over alle dine bookinger og forespørsler
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => navigate('/user/facilities')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny booking
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowRecurringModal(true)}
            className="flex items-center gap-2"
          >
            <Repeat className="w-4 h-4" />
            Gjentakende
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowGroupBookingModal(true)}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Gruppe
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowMessages(true)}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Meldinger
          </Button>
        </div>
      </header>

      {/* Status Panel */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStatus === option.value
                ? option.color === "green" ? "bg-green-100 text-green-800 border border-green-200"
                : option.color === "yellow" ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : option.color === "red" ? "bg-red-100 text-red-800 border border-red-200"
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

      {/* Filter Line */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Søk på lokale eller aktivitet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Fra dato"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="Til dato"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>

            <Select value={selectedFacility} onValueChange={setSelectedFacility}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Velg lokale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle lokaler</SelectItem>
                {facilities.map((facility) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sorter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Dato (kommende først)</SelectItem>
                <SelectItem value="date-desc">Dato (eldste først)</SelectItem>
                <SelectItem value="price">Pris</SelectItem>
                <SelectItem value="created">Opprettet</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Tøm filtre
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Åpne i kalender
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
              onCheckedChange={handleSelectAll}
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
                Slett valgte
              </Button>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Viser {filteredBookings.length} av {allBookings.length} resultater
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
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(booking.status)}`} />
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Checkbox
                      checked={selectedBookings.includes(booking.id)}
                      onCheckedChange={() => handleBookingSelect(booking.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking.facility}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.description}
                          </p>
                        </div>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(booking.date).toLocaleDateString('nb-NO')}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {booking.time} ({booking.duration})
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.location}
                        </div>
                        <div className="font-medium text-gray-900">
                          {booking.price}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {getActionButtons(booking).map((action, index) => (
                      <Button
                        key={index}
                        variant={action.primary ? "default" : "outline"}
                        size="sm"
                        onClick={action.onClick}
                        className="flex items-center gap-2"
                      >
                        <action.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{action.label}</span>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(booking)}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Details Panel */}
      {showDetailsPanel && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Bookingdetaljer</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetails}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedBooking.facility}</h3>
                  <p className="text-sm text-gray-600">{selectedBooking.description}</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dato:</span>
                    <span>{new Date(selectedBooking.date).toLocaleDateString('nb-NO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tid:</span>
                    <span>{selectedBooking.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Varighet:</span>
                    <span>{selectedBooking.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sted:</span>
                    <span>{selectedBooking.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pris:</span>
                    <span className="font-medium">{selectedBooking.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className={getStatusBadgeColor(selectedBooking.status)}>
                      {getStatusLabel(selectedBooking.status)}
                    </Badge>
                  </div>
                </div>
                
                {selectedBooking.contactPerson && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Kontaktperson</h4>
                    <p className="text-sm text-gray-600">{selectedBooking.contactPerson}</p>
                  </div>
                )}
                
                {selectedBooking.rejectionReason && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Avvisningsgrunn</h4>
                    <p className="text-sm text-gray-600">{selectedBooking.rejectionReason}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    {getActionButtons(selectedBooking).map((action, index) => (
                      <Button
                        key={index}
                        variant={action.primary ? "default" : "outline"}
                        size="sm"
                        onClick={action.onClick}
                        className="flex items-center justify-center gap-1 text-xs"
                      >
                        <action.icon className="w-3 h-3" />
                        <span className="truncate">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Slett booking{bookingsToDelete.length > 1 ? 'er' : ''}
                </h3>
                <p className="text-sm text-gray-600">
                  Er du sikker på at du vil slette {bookingsToDelete.length} booking{bookingsToDelete.length > 1 ? 'er' : ''}?
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Advarsel:</p>
                  <p>Denne handlingen kan ikke angres. Booking{bookingsToDelete.length > 1 ? 'ene' : 'en'} vil bli permanent slettet.</p>
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
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Slett {bookingsToDelete.length > 1 ? 'alle' : 'booking'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Feature Modals */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Gjentakende booking</h2>
                <Button variant="outline" onClick={() => {
                  setShowRecurringModal(false);
                  setSelectedFacilityForBooking(null);
                }}>
                  Lukk
                </Button>
              </div>
            </div>
            <div className="h-full overflow-y-auto p-4">
              <div className="text-center py-12">
                <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Velg lokale først</h3>
                <p className="text-muted-foreground mb-4">
                  For å opprette en gjentakende booking, må du først velge et lokale.
                </p>
                <Button onClick={() => {
                  setShowRecurringModal(false);
                  navigate('/user/facilities');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Utforsk lokaler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGroupBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Gruppebokering</h2>
                <Button variant="outline" onClick={() => {
                  setShowGroupBookingModal(false);
                  setSelectedFacilityForBooking(null);
                }}>
                  Lukk
                </Button>
              </div>
            </div>
            <div className="h-full overflow-y-auto p-4">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Velg lokale først</h3>
                <p className="text-muted-foreground mb-4">
                  For å opprette en gruppebokering, må du først velge et lokale.
                </p>
                <Button onClick={() => {
                  setShowGroupBookingModal(false);
                  navigate('/user/facilities');
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Utforsk lokaler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMessages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Meldinger</h2>
                <Button variant="outline" onClick={() => setShowMessages(false)}>
                  Lukk
                </Button>
              </div>
            </div>
            <div className="h-full overflow-y-auto">
              <MessageInbox
                userId="current-user"
                onThreadSelect={(threadId) => console.log('Select thread:', threadId)}
                onCreateThread={() => console.log('Create thread')}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;
