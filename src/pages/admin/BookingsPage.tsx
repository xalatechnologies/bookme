"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal,
  Eye,
  Check,
  X,
  Trash2,
  Settings,
  Plus,
  TrendingUp,
  Users,
  FileText,
  ChevronDown,
  Calendar as CalendarIcon,
  Building2,
  UserCheck,
  Timer
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

const BookingKPICard = ({ title, value, color, icon: Icon, subtext, onClick, trend }: IBookingKPICardProps): JSX.Element => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30",
    gray: "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/30"
  };

  return (
    <Card 
      className={`${colorClasses[color]} border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-105 ${
        onClick ? 'hover:shadow-lg' : ''
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
              <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} mt-1`}>
                {trend.isPositive ? '+' : ''}{trend.value}% fra i går
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 opacity-60 flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

const FilterModal = ({ isOpen, onClose, onApplyFilters }: IFilterModalProps): JSX.Element => {
  const [filters, setFilters] = useState<IFilterState>({
    dateFrom: "",
    dateTo: "",
    facilityType: "",
    handler: "",
    duration: ""
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
      duration: ""
    });
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Avanserte filtre
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dato fra
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dato til
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lokaletype
              </label>
              <select
                value={filters.facilityType}
                onChange={(e) => setFilters({ ...filters, facilityType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Alle typer</option>
                <option value="idrettshall">Idrettshall</option>
                <option value="kulturhus">Kulturhus</option>
                <option value="møterom">Møterom</option>
                <option value="hall">Hall</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Behandler
              </label>
              <select
                value={filters.handler}
                onChange={(e) => setFilters({ ...filters, handler: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Alle behandlere</option>
                <option value="admin">Admin</option>
                <option value="saksbehandler">Saksbehandler</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Varighet
              </label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Alle varigheter</option>
                <option value="1">1 time</option>
                <option value="2">2 timer</option>
                <option value="4">4 timer</option>
                <option value="8">8 timer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={handleReset}>
              Tilbakestill
            </Button>
            <Button variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button onClick={handleApply}>
              Bruk filtre
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingRow = ({ booking, onApprove, onReject, onViewDetails, onDelete, isSelected, onSelect }: IBookingRowProps): JSX.Element => {
  const getStatusBadge = (status: IBooking["status"]): JSX.Element => {
    const statusConfig = {
      pending: { label: "Ventende", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
      approved: { label: "Godkjent", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
      rejected: { label: "Avvist", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
      cancelled: { label: "Avlyst", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" }
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (date: string, time: string): string => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('nb-NO');
    return `${formattedDate} kl. ${time}`;
  };

  const getStatusBorderColor = (status: IBooking["status"]): string => {
    const borderColors = {
      pending: "hover:border-orange-300 dark:hover:border-orange-600",
      approved: "hover:border-green-300 dark:hover:border-green-600",
      rejected: "hover:border-red-300 dark:hover:border-red-600",
      cancelled: "hover:border-gray-300 dark:hover:border-gray-600"
    };
    return borderColors[status];
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
      isSelected 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
        : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${getStatusBorderColor(booking.status)}`
    } ${booking.status === 'pending' ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(booking.id, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {booking.title}
              </h4>
              {getStatusBadge(booking.status)}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(booking.startDate, booking.startTime)} - {formatDateTime(booking.endDate, booking.endTime)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{booking.bookerName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{booking.duration}t</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {booking.facility} • {booking.purpose}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {booking.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(booking.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Godkjenn
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(booking.id)}
              >
                <X className="h-4 w-4 mr-1" />
                Avvis
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(booking.id)}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <Eye className="h-4 w-4 mr-1" />
            Detaljer
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(booking.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const BookingDetailModal = ({ booking, isOpen, onClose, onApprove, onReject, onDelete }: IBookingDetailModalProps): JSX.Element => {
  if (!isOpen || !booking) return <></>;

  const formatDateTime = (date: string, time: string): string => {
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('nb-NO');
    return `${formattedDate} kl. ${time}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Lokaleinformasjon</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">{booking.facility}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {formatDateTime(booking.startDate, booking.startTime)} - {formatDateTime(booking.endDate, booking.endTime)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Varighet: {booking.duration} timer • Pris: {booking.price.toLocaleString('nb-NO')} kr
                </p>
              </div>
            </div>

            {/* Booker Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Booker</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">{booking.bookerName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{booking.bookerEmail}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <strong>Formål:</strong> {booking.purpose}
                </p>
              </div>
            </div>

            {/* History */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Historikk</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Søkt:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(booking.requestedAt).toLocaleString('nb-NO')}
                  </span>
                </div>
                {booking.processedBy && booking.processedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Behandlet av:</span>
                    <span className="text-gray-900 dark:text-white">
                      {booking.processedBy} ({new Date(booking.processedAt).toLocaleString('nb-NO')})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {booking.status === 'pending' && (
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
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [appliedFilters, setAppliedFilters] = useState<IFilterState>({
    dateFrom: "",
    dateTo: "",
    facilityType: "",
    handler: "",
    duration: ""
  });

  // Get pending bookings from localStorage (user bookings)
  const getPendingBookings = useCallback((): IBooking[] => {
    try {
      const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      return pendingBookings.map((booking: any, index: number) => ({
        id: booking.id || (index + 1).toString(),
        title: `Booking #${booking.id || (index + 1)} – ${booking.facility}`,
        facility: booking.facility,
        facilityId: booking.facilityId || '1',
        bookerName: booking.contactPerson || 'Ukjent bruker',
        bookerEmail: 'bruker@example.com', // This should come from user profile
        purpose: booking.purpose || booking.description || 'Booking',
        startDate: booking.date || new Date().toISOString().split('T')[0],
        endDate: booking.date || new Date().toISOString().split('T')[0],
        startTime: booking.time ? booking.time.split('-')[0] : '10:00',
        endTime: booking.time ? booking.time.split('-')[1] : '12:00',
        status: booking.status || 'pending',
        requestedAt: booking.submittedAt || new Date().toISOString(),
        price: booking.price ? parseInt(booking.price.replace(/\D/g, '')) : 0,
        duration: booking.duration ? parseInt(booking.duration) : 2
      }));
    } catch (error) {
      console.error('Error loading pending bookings:', error);
      return [];
    }
  }, []);

  // Get approved/rejected bookings from localStorage
  const getProcessedBookings = useCallback((): IBooking[] => {
    try {
      return JSON.parse(localStorage.getItem('processedBookings') || '[]');
    } catch (error) {
      console.error('Error loading processed bookings:', error);
      return [];
    }
  }, []);

  // Real bookings only - refresh when trigger changes
  const bookings: readonly IBooking[] = useMemo(() => [
    ...getPendingBookings(),
    ...getProcessedBookings()
  ], [getPendingBookings, getProcessedBookings, refreshTrigger]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(booking => booking.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.title.toLowerCase().includes(query) ||
        booking.facility.toLowerCase().includes(query) ||
        booking.bookerName.toLowerCase().includes(query) ||
        booking.bookerEmail.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [bookings, activeTab, searchQuery]);

  const kpiData = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "pending").length;
    const approvedToday = bookings.filter(b => 
      b.status === "approved" && 
      new Date(b.processedAt || "").toDateString() === new Date().toDateString()
    ).length;
    const rejectedToday = bookings.filter(b => 
      b.status === "rejected" && 
      new Date(b.processedAt || "").toDateString() === new Date().toDateString()
    ).length;

    return { total, pending, approvedToday, rejectedToday };
  }, [bookings]);

  const handleApprove = useCallback((id: string): void => {
    try {
      // Find the booking
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      // Remove from pending bookings
      const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = pendingBookings.filter((b: any) => b.id !== id);
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));

      // Add to processed bookings with approved status
      const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const approvedBooking = {
        ...booking,
        status: 'approved',
        processedBy: 'Admin', // This should be the actual admin user
        processedAt: new Date().toISOString()
      };
      processedBookings.push(approvedBooking);
      localStorage.setItem('processedBookings', JSON.stringify(processedBookings));

      // Refresh the component
      setRefreshTrigger(prev => prev + 1);
      
      console.log(`Booking ${id} approved successfully`);
    } catch (error) {
      console.error('Error approving booking:', error);
    }
  }, [bookings]);

  const handleReject = useCallback((id: string): void => {
    try {
      // Find the booking
      const booking = bookings.find(b => b.id === id);
      if (!booking) return;

      // Remove from pending bookings
      const pendingBookings = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const updatedPending = pendingBookings.filter((b: any) => b.id !== id);
      localStorage.setItem('pendingBookings', JSON.stringify(updatedPending));

      // Add to processed bookings with rejected status
      const processedBookings = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const rejectedBooking = {
        ...booking,
        status: 'rejected',
        processedBy: 'Admin', // This should be the actual admin user
        processedAt: new Date().toISOString()
      };
      processedBookings.push(rejectedBooking);
      localStorage.setItem('processedBookings', JSON.stringify(processedBookings));

      // Refresh the component
      setRefreshTrigger(prev => prev + 1);
      
      console.log(`Booking ${id} rejected successfully`);
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  }, [bookings]);

  const handleViewDetails = (id: string): void => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailModalOpen(true);
    }
  };

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
    // TODO: Implement bulk approval logic
  };

  const handleBulkReject = (): void => {
    // TODO: Implement bulk rejection logic
  };

  const tabs = [
    { id: "all", label: "Alle", count: bookings.length },
    { id: "pending", label: "Ventende", count: bookings.filter(b => b.status === "pending").length },
    { id: "approved", label: "Godkjent", count: bookings.filter(b => b.status === "approved").length },
    { id: "rejected", label: "Avvist", count: bookings.filter(b => b.status === "rejected").length }
  ] as const;

  return (
    <RequireRole roles={["org-admin", "facility-manager", "case-worker"]}>
      <div className="space-y-12">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Bookinger & Godkjenninger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administrer alle bookinger og godkjenningsprosesser i systemet.
          </p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <BookingKPICard
            title="Totalt antall bookinger"
            value={kpiData.total}
            color="blue"
            icon={Calendar}
            subtext="Aktive siste 30 dager"
            onClick={() => setActiveTab("all")}
          />
          <BookingKPICard
            title="Ventende godkjenninger"
            value={kpiData.pending}
            color="orange"
            icon={AlertCircle}
            subtext="Trenger behandling"
            onClick={() => setActiveTab("pending")}
          />
          <BookingKPICard
            title="Godkjent i dag"
            value={kpiData.approvedToday}
            color="green"
            icon={CheckCircle}
            subtext="Behandlet i dag"
            onClick={() => setActiveTab("approved")}
          />
          <BookingKPICard
            title="Avvist i dag"
            value={kpiData.rejectedToday}
            color="red"
            icon={XCircle}
            subtext="Avvist i dag"
            onClick={() => setActiveTab("rejected")}
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {tabs.map(tab => (
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
                      placeholder="Søk bookinger..."
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
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedBookings.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedBookings.size} booking(er) valgt
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Godkjenn alle
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Avvis alle
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Bookings List */}
            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ingen bookinger funnet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? "Prøv å endre søkekriteriene" : "Det er ingen bookinger å vise for øyeblikket"}
                  </p>
                </div>
              ) : (
                filteredBookings.map(booking => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Godkjenningsflyter</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Administrer regler og flyter for godkjenning av bookinger
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Definer hvordan ulike typer bookinger behandles og hvem som må godkjenne dem.
                </p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Opprett ny flyt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Skolebookinger", description: "Automatisk godkjenning for skoler", status: "Aktiv", isActive: true },
                { name: "Idrettslag", description: "Manuell godkjenning påkrevd", status: "Aktiv", isActive: true },
                { name: "Kommersiell leie", description: "Godkjenning av saksbehandler påkrevd", status: "Aktiv", isActive: true }
              ].map((workflow, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md ${
                    workflow.isActive 
                      ? 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600' 
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={workflow.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}>
                      {workflow.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Rediger
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