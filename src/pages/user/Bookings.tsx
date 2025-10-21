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
  Share,
  Star,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  X,
  CalendarPlus,
  RotateCcw,
  Download,
  Repeat,
  Users
} from "lucide-react";
import { toast } from "react-toastify";
import { RecurringBookingModal } from "@/components/booking/RecurringBookingModal";
import { GroupBookingFlow } from "@/components/group/GroupBookingFlow";
import { useRecurringBookingStore } from "@/stores/recurringBookingStore";
import { useGroupStore } from "@/stores/groupStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<IBooking | null>(null);
  const [editFormData, setEditFormData] = useState<{
    date: string;
    time: string;
    duration: string;
    attendees: number;
    notes: string;
  }>({
    date: '',
    time: '',
    duration: '',
    attendees: 1,
    notes: ''
  });
  
  // New feature states
  const [showRecurringModal, setShowRecurringModal] = useState<boolean>(false);
  const [showGroupBookingModal, setShowGroupBookingModal] = useState<boolean>(false);
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
      const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      return pendingBookings.map((booking: {
        readonly id: string;
        readonly facilityName: string;
        readonly time: string;
        readonly duration?: number;
        readonly timeSlots?: readonly { readonly date: string; readonly timeSlot: string }[];
        readonly status: string;
        readonly purpose?: string;
        readonly attendees?: number;
        readonly activityType?: string;
        readonly actorType?: string;
        readonly additionalInfo?: string;
        readonly createdAt: string;
      }) => {
        // Prefer explicit time coming from Checkout; otherwise derive from a single slot
        let bookingTime: string;
        if (booking.time && booking.time.trim().length > 0) {
          bookingTime = booking.time;
        } else if (booking.timeSlots && booking.timeSlots.length > 0) {
          if (booking.timeSlots.length === 1) {
            bookingTime = booking.timeSlots[0].timeSlot;
          } else {
            const sortedSlots = [...booking.timeSlots].sort((a: { readonly timeSlot: string }, b: { readonly timeSlot: string }) => {
              const timeA = a.timeSlot.split('-')[0];
              const timeB = b.timeSlot.split('-')[0];
              return timeA.localeCompare(timeB);
            });
            const startTime = sortedSlots[0].timeSlot.split('-')[0];
            const lastSlot = sortedSlots[sortedSlots.length - 1];
            const endTime = lastSlot.timeSlot.split('-')[1];
            bookingTime = `${startTime}-${endTime}`;
          }
        } else {
          bookingTime = '20:00-21:00';
        }

        // Normalize duration to hours text
        let durationText: string | undefined = (booking as any).duration as any;
        if (!durationText) {
          if (booking.timeSlots && booking.timeSlots.length > 0) {
            const totalMinutes = booking.timeSlots.reduce((sum: number, s: any) => sum + (s as any).duration ?? 60, 0 as number);
            const hours = totalMinutes / 60;
            durationText = hours === 1 ? '1 time' : `${hours} timer`;
          } else {
            durationText = '1 time';
          }
        } else if (typeof (durationText as unknown) === 'number') {
          const hours = (durationText as unknown as number) / 60;
          durationText = hours === 1 ? '1 time' : `${hours} timer`;
        }

        return {
          ...booking,
          time: bookingTime,
          duration: durationText
        };
      });
    } catch {
      return [];
    }
  }, [refreshTrigger]); // Re-run when refreshTrigger changes

  // Get processed bookings from localStorage (approved/rejected)
  const getProcessedBookings = useCallback((): IBooking[] => {
    try {
      const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      return processedBookings.map((booking: {
        readonly id: string;
        readonly facilityName: string;
        readonly time: string;
        readonly duration?: number;
        readonly timeSlots?: readonly { readonly date: string; readonly timeSlot: string }[];
        readonly status: string;
        readonly purpose?: string;
        readonly attendees?: number;
        readonly activityType?: string;
        readonly actorType?: string;
        readonly additionalInfo?: string;
        readonly createdAt: string;
        readonly date?: string;
        readonly startDate?: string;
      }) => {
        // Always trust data coming from Checkout/localStorage; do not recompute
        const today = new Date();
        const fallbackDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const bookingDate = booking.date ?? booking.startDate ?? fallbackDate;

        const bookingTime = booking.time
          ?? (booking.timeSlots && booking.timeSlots.length > 0 ? booking.timeSlots[0].timeSlot : '20:00-21:00');

        // Normalize duration: prefer stored duration; else derive from slots; fallback 1 time
        let durationText: string | undefined = (booking as any).duration as any;
        if (!durationText) {
          if (booking.timeSlots && booking.timeSlots.length > 0) {
            const totalMinutes = booking.timeSlots.reduce((sum: number, s: any) => sum + ((s as any).duration ?? 60), 0);
            const hours = totalMinutes / 60;
            durationText = hours === 1 ? '1 time' : `${hours} timer`;
          } else {
            durationText = '1 time';
          }
        } else if (typeof (durationText as unknown) === 'number') {
          const hours = (durationText as unknown as number) / 60;
          durationText = hours === 1 ? '1 time' : `${hours} timer`;
        }

        return {
          id: booking.id,
          facility: (booking as any).facility ?? (booking as any).facilityName,
          date: bookingDate,
          time: bookingTime,
          duration: durationText,
          status: booking.status === 'approved' ? 'confirmed' : booking.status === 'rejected' ? 'rejected' : 'cancelled',
          location: 'Drammen',
          price: (booking as any).price || '0 kr',
          description: booking.purpose || 'Booking',
          purpose: booking.purpose,
          contactPerson: (booking as any).bookerName || 'Ukjent',
          paymentStatus: booking.status === 'approved' ? 'paid' : 'pending',
          facilityImage: undefined,
          rejectionReason: booking.status === 'rejected' ? 'Avvist av administrator' : undefined,
          createdAt: (booking as any).requestedAt || new Date().toISOString(),
          updatedAt: (booking as any).processedAt || new Date().toISOString(),
          isRecurring: (booking as any).isRecurring,
          parentBookingId: (booking as any).parentBookingId
        };
      });
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

  // Group recurring bookings by parentBookingId for display (keep grouped even when confirmed)
  const { groupedRecurring, singletonBookings } = useMemo(() => {
    const groups = new Map<string, IBooking[]>();
    const singles: IBooking[] = [];
    for (const b of filteredBookings) {
      const recurring = ((b as any).isRecurring || (b as any).parentBookingId) && (b as any).parentBookingId;
      if (recurring) {
        const key = String((b as any).parentBookingId);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(b);
      } else {
        singles.push(b);
      }
    }
    return { groupedRecurring: groups, singletonBookings: singles };
  }, [filteredBookings]);

  const [showRecurringGroupId, setShowRecurringGroupId] = useState<string | null>(null);

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

  const handleRecurringGroupSelect = useCallback((groupId: string, items: IBooking[]) => {
    const itemIds = items.map(item => item.id);
    setSelectedBookings(prev => {
      const hasAllItems = itemIds.every(id => prev.includes(id));
      if (hasAllItems) {
        // Remove all items from this group
        return prev.filter(id => !itemIds.includes(id));
      } else {
        // Add all items from this group
        return [...prev, ...itemIds.filter(id => !prev.includes(id))];
      }
    });
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
    
    // Remove bookings from localStorage (for processed bookings)
    const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
    const updatedProcessed = processedBookings.filter((booking: any) => !bookingsToDelete.includes(booking.id));
    localStorage.setItem('processedBookings', JSON.stringify(updatedProcessed));
    
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
    // Only show "Se" and "Slett" buttons directly on the card
    return [
      {
        icon: Eye,
        label: "Se",
        onClick: () => handleOpenDetails(booking),
        primary: true
      },
      {
        icon: Trash2,
        label: "Slett",
        onClick: () => handleDeleteSingle(booking.id),
        primary: false
      }
    ];
  };

  const handleEditBooking = (booking: IBooking): void => {
    setEditingBooking(booking);
    setEditFormData({
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      attendees: booking.attendees || 1,
      notes: booking.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = (): void => {
    if (!editingBooking) return;
    
    // Update the booking with new data
    const updatedBooking: IBooking = {
      ...editingBooking,
      date: editFormData.date,
      time: editFormData.time,
      duration: editFormData.duration,
      attendees: editFormData.attendees,
      notes: editFormData.notes
    };
    
    // Here you would typically call an API to update the booking
    // For now, we'll just show a success message
    toast.success('Booking oppdatert!');
    
    // Close modal and reset state
    setEditModalOpen(false);
    setEditingBooking(null);
    setEditFormData({
      date: '',
      time: '',
      duration: '',
      attendees: 1,
      notes: ''
    });
  };

  const handleWithdrawBooking = (booking: IBooking): void => {
    if (window.confirm('Er du sikker på at du vil trekke tilbake denne bookingen?')) {
      // Here you would typically call an API to withdraw the booking
      // For now, we'll just show a success message
      toast.success('Booking trukket tilbake!');
    }
  };

  const handleRescheduleBooking = (booking: IBooking): void => {
    // Open edit modal with reschedule context
    setEditingBooking(booking);
    setEditFormData({
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      attendees: booking.attendees || 1,
      notes: booking.notes || ''
    });
    setEditModalOpen(true);
  };

  const handleCancelBooking = (booking: IBooking): void => {
    if (window.confirm('Er du sikker på at du vil avlyse denne bookingen?')) {
      // Here you would typically call an API to cancel the booking
      // For now, we'll just show a success message
      toast.success('Booking avlyst!');
    }
  };

  const handleShareBooking = (booking: IBooking): void => {
    const shareData = {
      title: `Booking: ${booking.facility}`,
      text: `Jeg har booket ${booking.facility} på ${booking.date} kl. ${booking.time}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        toast.success('Booking-lenke kopiert til utklippstavle!');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      toast.success('Booking-lenke kopiert til utklippstavle!');
    }
  };

  const handleAddToCalendar = (booking: IBooking): void => {
    const startDate = new Date(`${booking.date}T${booking.time}`);
    const endDate = new Date(startDate.getTime() + (parseInt(booking.duration) * 60 * 60 * 1000));
    
    const calendarData = {
      title: `Booking: ${booking.facility}`,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location: booking.location,
      description: `Booking av ${booking.facility}`
    };
    
    // Create ICS file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BookMe//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@bookme.no
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${calendarData.title}
LOCATION:${calendarData.location}
DESCRIPTION:${calendarData.description}
END:VEVENT
END:VCALENDAR`;
    
    // Download ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `booking-${booking.id}.ics`;
    link.click();
    
    toast.success('Booking lagt til i kalender!');
  };

  const handleNewRequest = (booking: IBooking): void => {
    // Navigate to facility booking page
    navigate(`/facilities/${booking.facilityId || 'unknown'}/book`);
  };

  const getAdditionalActions = (booking: IBooking) => {
    // Additional actions that will be shown in the details panel
    switch (booking.status) {
      case "pending":
        return [
          { icon: Edit, label: "Rediger", onClick: () => handleEditBooking(booking) },
          { icon: RotateCcw, label: "Trekk tilbake", onClick: () => handleWithdrawBooking(booking) }
        ];
      case "confirmed":
        return [
          { icon: Edit, label: "Endre tidspunkt", onClick: () => handleRescheduleBooking(booking) },
          { icon: X, label: "Avlys", onClick: () => handleCancelBooking(booking) },
          { icon: Share2, label: "Del", onClick: () => handleShareBooking(booking) },
          { icon: CalendarPlus, label: "Legg til i kalender", onClick: () => handleAddToCalendar(booking) }
        ];
      case "rejected":
      case "cancelled":
        return [
          { icon: Plus, label: "Send ny forespørsel", onClick: () => handleNewRequest(booking) }
        ];
      default:
        return [];
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
                className="flex items-center gap-2 h-10 px-4"
              >
                <X className="w-4 h-4" />
                Tøm filtre
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/user/calendar')}
                className="flex items-center gap-2 h-10 px-4"
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

      {/* Results with grouped recurring bookings */}
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
            {/* Grouped recurring */}
          {[...groupedRecurring.entries()].map(([groupId, items]) => {
            const first = items[0];
            const title = first.facility ?? 'Gjentakende booking';
            const times = (() => {
              const t = (first as any).time ?? ((first as any).timeSlots?.[0]?.timeSlot ?? '');
              return t || '20:00-21:00';
            })();
            const dates = items
              .map(i => i.date)
              .sort();
            const period = `${new Date(dates[0]).toLocaleDateString('nb-NO')} – ${new Date(dates[dates.length-1]).toLocaleDateString('nb-NO')}`;
            
            // Determine group status based on individual items
            const uniqueStatuses = Array.from(new Set(items.map(i => i.status)));
            let groupStatus = 'pending';
            if (uniqueStatuses.length === 1) {
              groupStatus = uniqueStatuses[0];
            } else if (uniqueStatuses.includes('confirmed')) {
              groupStatus = 'confirmed';
            }
            
            return (
              <div key={`group-${groupId}`} className="flex items-start gap-4">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                  checked={(() => {
                    const itemIds = items.map(item => item.id);
                    const hasAllItems = itemIds.every(id => selectedBookings.includes(id));
                    return hasAllItems;
                  })()}
                  onCheckedChange={(checked) => {
                    handleRecurringGroupSelect(groupId, items);
                  }}
                  className="mt-1"
                />
                </div>
                
                <Card className="relative cursor-pointer flex-1" onClick={() => setShowRecurringGroupId(groupId)}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(groupStatus)}`} />
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{title} – Gjentakende</h3>
                          <Badge className={getStatusBadgeColor(groupStatus)}>{getStatusLabel(groupStatus)}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex flex-wrap gap-4">
                            <span>{times}</span>
                            <span>{items.length} forekomster</span>
                            <span>Periode: {period}</span>
                          </div>
                        </div>
                      </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRecurringGroupId(groupId);
                        }}
                        className="flex items-center justify-center p-2"
                        title="Vis detaljer"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle delete for recurring booking group
                          const groupItems = items;
                          const bookingIds = groupItems.map(item => item.id);
                          setBookingsToDelete(bookingIds);
                          setShowDeleteConfirm(true);
                        }}
                        className="flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Slett"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Non-recurring or standalone bookings */}
          {singletonBookings.map((booking) => (
            <div key={booking.id} className="flex items-start gap-4">
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                checked={selectedBookings.includes(booking.id)}
                onCheckedChange={(checked) => {
                  handleBookingSelect(booking.id);
                }}
                className="mt-1"
              />
              </div>
              
              <Card className="relative cursor-pointer flex-1" onClick={() => {
                setSelectedBooking(booking);
                setShowDetailsPanel(true);
              }}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(booking.status)}`} />
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {booking.facility}
                        </h3>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <div className="flex flex-wrap gap-4">
                          <span>{booking.time} ({booking.duration})</span>
                          <span>{(() => {
                            // Handle date display more carefully to avoid timezone issues
                            if (booking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                              // If it's a YYYY-MM-DD string, parse it as local date
                              const [year, month, day] = booking.date.split('-').map(Number);
                              const localDate = new Date(year, month - 1, day);
                              return localDate.toLocaleDateString('nb-NO');
                            } else {
                              // Fallback to original method
                              return new Date(booking.date).toLocaleDateString('nb-NO');
                            }
                          })()}</span>
                          <span>{booking.location}</span>
                          <span className="font-medium text-gray-900">{booking.price}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {getActionButtons(booking).map((action, index) => (
                        <Button
                          key={index}
                          variant={action.primary ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                          }}
                          className={`flex items-center justify-center p-2 ${
                            action.label === "Slett" ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""
                          }`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </Button>
                      ))}
                    </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        ))}
          </>
        )}
      </div>

      {/* Details Panel */}
      {showDetailsPanel && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={handleCloseDetails}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
                    <span>{(() => {
                      // Handle date display more carefully to avoid timezone issues
                      if (selectedBooking.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        // If it's a YYYY-MM-DD string, parse it as local date
                        const [year, month, day] = selectedBooking.date.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day);
                        return localDate.toLocaleDateString('nb-NO');
                      } else {
                        // Fallback to original method
                        return new Date(selectedBooking.date).toLocaleDateString('nb-NO');
                      }
                    })()}</span>
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
                  <h4 className="font-medium text-gray-900 mb-3">Handlinger</h4>
                  
                  {/* Additional actions */}
                  {getAdditionalActions(selectedBooking).length > 0 && (
                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        {getAdditionalActions(selectedBooking).map((action, index) => (
                          <Button
                            key={`additional-${index}`}
                            variant="outline"
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Group Modal */}
      {showRecurringGroupId && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setShowRecurringGroupId(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(() => {
              try {
                if (!showRecurringGroupId || !groupedRecurring.has(showRecurringGroupId)) {
                  return (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Bookinggruppe ikke funnet</p>
                      <Button variant="outline" onClick={() => setShowRecurringGroupId(null)} className="mt-4">
                        Lukk
                      </Button>
                    </div>
                  );
                }
                
                const items = [...(groupedRecurring.get(showRecurringGroupId) || [])].sort((a,b)=> a.date.localeCompare(b.date));
                
                // Safety check - if no items, return empty
                if (items.length === 0) {
                  return (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">Ingen bookinger funnet</p>
                      <Button variant="outline" onClick={() => setShowRecurringGroupId(null)} className="mt-4">
                        Lukk
                      </Button>
                    </div>
                  );
                }
              
              const first = items[0];
              const last = items[items.length - 1];
              const title = first?.facility ?? 'Gjentakende booking';
              const timeStr = (first as any)?.time ?? ((first as any)?.timeSlots?.[0]?.timeSlot ?? '');
              const period = first && last ? `${new Date(first.date).toLocaleDateString('nb-NO')} – ${new Date(last.date).toLocaleDateString('nb-NO')}` : 'Ukjent periode';
              const sumGross = items.reduce((sum, it) => {
                const raw = String((it as any).price ?? '').replace(/[^0-9,\.]/g, '').replace(',', '.');
                const val = parseFloat(raw) || 0;
                return sum + val;
              }, 0);
              const base = sumGross / 1.25;
              const vat = sumGross - base;
              const fmt = (n: number) => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).format(n);
              return (
                <>
                  <div className="p-4 border-b flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{title}</h2>
                      <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-4">
                        <span>Tid: {timeStr || '20:00-21:00'}</span>
                        <span>Forekomster: {items.length}</span>
                        <span>Periode: {period}</span>
                      </div>
                    </div>
                    {/* Close button fjernet i header for å unngå duplikat */}
                  </div>
                  {/* Body */}
                  <div className="p-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-12 px-3 py-2 text-xs font-medium text-gray-500">
                      <div className="col-span-5 md:col-span-6">Dato</div>
                      <div className="col-span-4 md:col-span-4">Tid</div>
                      <div className="col-span-3 md:col-span-2 text-right">Pris</div>
                    </div>
                    <div className="divide-y rounded-md border">
                      {items.map(it => (
                        <div key={it.id} className="grid grid-cols-12 items-center px-3 py-3 text-sm">
                          <div className="col-span-5 md:col-span-6 flex items-center gap-2 text-gray-800">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{new Date(it.date).toLocaleDateString('nb-NO')}</span>
                          </div>
                          <div className="col-span-4 md:col-span-4 flex items-center gap-2 text-gray-800">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{(it as any).time ?? ((it as any).timeSlots?.[0]?.timeSlot ?? '20:00-21:00')}</span>
                          </div>
                          <div className="col-span-3 md:col-span-2 text-right font-medium">{it.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Extra actions for recurring bookings */}
                  <div className="p-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Handlinger</h4>
                    <div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle change time for recurring booking
                            console.log('Endre tidspunkt for gjentakende booking');
                          }}
                          className="flex items-center justify-center gap-1 text-xs"
                        >
                          <Edit className="w-3 h-3" />
                          <span className="truncate">Endre tidspunkt</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle cancel recurring booking
                            console.log('Avlys gjentakende booking');
                          }}
                          className="flex items-center justify-center gap-1 text-xs"
                        >
                          <X className="w-3 h-3" />
                          <span className="truncate">Avlys</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle share recurring booking
                            console.log('Del gjentakende booking');
                          }}
                          className="flex items-center justify-center gap-1 text-xs"
                        >
                          <Share className="w-3 h-3" />
                          <span className="truncate">Del</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle add to calendar for recurring booking
                            console.log('Legg til i kalender for gjentakende booking');
                          }}
                          className="flex items-center justify-center gap-1 text-xs"
                        >
                          <Calendar className="w-3 h-3" />
                          <span className="truncate">Legg til i kalender</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-700 space-y-0.5">
                      <div>Grunnpris: <span className="font-medium">{fmt(base)}</span></div>
                      <div>MVA (25%): <span className="font-medium">{fmt(vat)}</span></div>
                      <div className="font-semibold">Total inkl. MVA: <span>{fmt(sumGross)}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setShowRecurringGroupId(null)}>Lukk</Button>
                    </div>
                  </div>
                </>
              );
              } catch (error) {
                console.error('Error in recurring booking modal:', error);
                return (
                  <div className="p-6 text-center">
                    <p className="text-red-500">En feil oppstod ved visning av bookingdetaljer</p>
                    <Button variant="outline" onClick={() => setShowRecurringGroupId(null)} className="mt-4">
                      Lukk
                    </Button>
                  </div>
                );
              }
            })()}
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

      {/* Edit Booking Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rediger booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-date" className="text-right">
                Dato
              </Label>
              <Input
                id="edit-date"
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData(prev => ({ ...prev, date: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-time" className="text-right">
                Tid
              </Label>
              <Input
                id="edit-time"
                type="time"
                value={editFormData.time}
                onChange={(e) => setEditFormData(prev => ({ ...prev, time: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Varighet
              </Label>
              <Select
                value={editFormData.duration}
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Velg varighet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 time">1 time</SelectItem>
                  <SelectItem value="2 timer">2 timer</SelectItem>
                  <SelectItem value="3 timer">3 timer</SelectItem>
                  <SelectItem value="4 timer">4 timer</SelectItem>
                  <SelectItem value="Hele dagen">Hele dagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-attendees" className="text-right">
                Deltakere
              </Label>
              <Input
                id="edit-attendees"
                type="number"
                min="1"
                value={editFormData.attendees}
                onChange={(e) => setEditFormData(prev => ({ ...prev, attendees: parseInt(e.target.value) || 1 }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notater
              </Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="col-span-3"
                placeholder="Legg til notater..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Avbryt
            </Button>
            <Button onClick={handleSaveEdit}>
              Lagre endringer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Bookings;
