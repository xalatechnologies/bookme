"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  MoreHorizontal
} from "lucide-react";

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
}

const Bookings = (): JSX.Element => {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState<string>("confirmed");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedFacility, setSelectedFacility] = useState<string>("all");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["confirmed"]);
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState<boolean>(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  // Mock data - combine bookings and requests
  const allBookings: IBooking[] = [
    {
      id: "1",
      facility: "Drammenshallen",
      date: "2024-01-20",
      time: "10:00-12:00",
      duration: "2 timer",
      status: "confirmed",
      location: "Drammen",
      price: "2 400 kr",
      description: "Fotballtrening",
      purpose: "Ungdomsfotball",
      contactPerson: "Ola Nordmann",
      paymentStatus: "paid",
      type: "booking"
    },
    {
      id: "2",
      facility: "Kulturhuset",
      date: "2024-01-22",
      time: "18:00-20:00",
      duration: "2 timer",
      status: "pending",
      location: "Drammen",
      price: "1 200 kr",
      description: "Konsert",
      purpose: "Musikkarrangement",
      contactPerson: "Kari Hansen",
      submittedAt: "2024-01-15",
      type: "request"
    },
    {
      id: "3",
      facility: "Idrettshallen",
      date: "2024-01-18",
      time: "14:00-16:00",
      duration: "2 timer",
      status: "rejected",
      location: "Drammen",
      price: "1 800 kr",
      description: "Basketball",
      purpose: "Klubbaktivitet",
      rejectionReason: "Lokale ikke tilgjengelig",
      submittedAt: "2024-01-10",
      type: "request"
    },
    {
      id: "4",
      facility: "Svømmehallen",
      date: "2024-01-16",
      time: "08:00-10:00",
      duration: "2 timer",
      status: "cancelled",
      location: "Drammen",
      price: "2 000 kr",
      description: "Svømmetrening",
      purpose: "Treningsaktivitet",
      contactPerson: "Erik Olsen",
      type: "booking"
    }
  ];

  const statusOptions = [
    { value: "all", label: "Alle", count: allBookings.length, color: "gray" },
    { value: "confirmed", label: "Bekreftet", count: allBookings.filter(b => b.status === "confirmed").length, color: "green" },
    { value: "pending", label: "Ventende", count: allBookings.filter(b => b.status === "pending").length, color: "yellow" },
    { value: "rejected", label: "Avvist", count: allBookings.filter(b => b.status === "rejected").length, color: "red" },
    { value: "cancelled", label: "Avlyst", count: allBookings.filter(b => b.status === "cancelled").length, color: "red" }
  ];

  const facilities = ["Drammenshallen", "Kulturhuset", "Idrettshallen", "Svømmehallen"];

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

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSelectedFacility("all");
    setSelectedStatuses(["confirmed"]);
    setActiveStatus("confirmed");
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

    switch (booking.status) {
      case "pending":
        return [
          ...baseActions,
          { icon: Edit, label: "Rediger", onClick: () => console.log("Edit", booking.id) },
          { icon: RotateCcw, label: "Trekk tilbake", onClick: () => console.log("Withdraw", booking.id) }
        ];
      case "confirmed":
        return [
          ...baseActions,
          { icon: Edit, label: "Endre tidspunkt", onClick: () => console.log("Reschedule", booking.id) },
          { icon: X, label: "Avlys", onClick: () => console.log("Cancel", booking.id) },
          { icon: Share2, label: "Del", onClick: () => console.log("Share", booking.id) },
          { icon: CalendarPlus, label: "Legg til i kalender", onClick: () => console.log("Add to calendar", booking.id) }
        ];
      case "rejected":
      case "cancelled":
        return [
          ...baseActions,
          { icon: Plus, label: "Send ny forespørsel", onClick: () => console.log("New request", booking.id) }
        ];
      default:
        return baseActions;
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
        <Button 
          onClick={() => navigate('/facilities')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ny booking
        </Button>
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
                variant="outline"
                size="sm"
                onClick={() => console.log("Bulk action", selectedBookings)}
              >
                Bulk-handlinger
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
              <Button onClick={() => navigate('/facilities')}>
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
    </div>
  );
};

export default Bookings;
