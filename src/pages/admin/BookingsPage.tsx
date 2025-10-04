"use client";

import React, { useState, useMemo } from "react";
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
  Plus
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

const BookingKPICard = ({ title, value, color, icon: Icon, trend }: IBookingKPICardProps): JSX.Element => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    gray: "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800"
  };

  return (
    <Card className={`${colorClasses[color]} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% fra i går
              </p>
            )}
          </div>
          <Icon className="h-8 w-8 opacity-60" />
        </div>
      </CardContent>
    </Card>
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

  return (
    <div className={`p-4 border rounded-lg transition-colors ${
      isSelected 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
    } ${booking.status === 'pending' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(booking.id, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
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

  // Mock data - replace with real data from API
  const bookings: readonly IBooking[] = [
    {
      id: "245",
      title: "Booking #245 – Drammen Idrettshall",
      facility: "Drammen Idrettshall",
      facilityId: "1",
      bookerName: "Ola Nordmann",
      bookerEmail: "ola@example.com",
      purpose: "Fotballtrening",
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      startTime: "18:00",
      endTime: "20:00",
      status: "pending",
      requestedAt: "2024-01-10T10:30:00Z",
      price: 500,
      duration: 2
    },
    {
      id: "244",
      title: "Booking #244 – Solberghallen",
      facility: "Solberghallen",
      facilityId: "2",
      bookerName: "Kari Hansen",
      bookerEmail: "kari@example.com",
      purpose: "Basketballkamp",
      startDate: "2024-01-14",
      endDate: "2024-01-14",
      startTime: "19:00",
      endTime: "21:00",
      status: "approved",
      requestedAt: "2024-01-09T14:20:00Z",
      processedBy: "Admin User",
      processedAt: "2024-01-09T15:30:00Z",
      price: 800,
      duration: 2
    },
    {
      id: "243",
      title: "Booking #243 – Drammen Kulturhus",
      facility: "Drammen Kulturhus",
      facilityId: "3",
      bookerName: "Erik Larsen",
      bookerEmail: "erik@example.com",
      purpose: "Konsert",
      startDate: "2024-01-13",
      endDate: "2024-01-13",
      startTime: "20:00",
      endTime: "23:00",
      status: "rejected",
      requestedAt: "2024-01-08T09:15:00Z",
      processedBy: "Admin User",
      processedAt: "2024-01-08T11:45:00Z",
      price: 1200,
      duration: 3
    },
    {
      id: "242",
      title: "Booking #242 – Drammen Idrettshall",
      facility: "Drammen Idrettshall",
      facilityId: "1",
      bookerName: "Lisa Johansen",
      bookerEmail: "lisa@example.com",
      purpose: "Volleyballtrening",
      startDate: "2024-01-12",
      endDate: "2024-01-12",
      startTime: "17:00",
      endTime: "19:00",
      status: "cancelled",
      requestedAt: "2024-01-07T16:00:00Z",
      price: 400,
      duration: 2
    }
  ];

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

  const handleApprove = (id: string): void => {
    // TODO: Implement approval logic
  };

  const handleReject = (id: string): void => {
    // TODO: Implement rejection logic
  };

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
      <div className="space-y-6">
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
          />
          <BookingKPICard
            title="Ventende godkjenninger"
            value={kpiData.pending}
            color="orange"
            icon={AlertCircle}
          />
          <BookingKPICard
            title="Godkjent i dag"
            value={kpiData.approvedToday}
            color="green"
            icon={CheckCircle}
          />
          <BookingKPICard
            title="Avvist i dag"
            value={kpiData.rejectedToday}
            color="red"
            icon={XCircle}
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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Søk bookinger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
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
                { name: "Skolebookinger", description: "Automatisk godkjenning for skoler", status: "Aktiv" },
                { name: "Idrettslag", description: "Manuell godkjenning påkrevd", status: "Aktiv" },
                { name: "Kommersiell leie", description: "Godkjenning av saksbehandler påkrevd", status: "Aktiv" }
              ].map((workflow, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{workflow.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
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
      </div>
    </RequireRole>
  );
};

export default BookingsPage;