"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ExternalLink
} from "lucide-react";

interface IUserBooking {
  readonly id: string;
  readonly facility: string;
  readonly date: string;
  readonly time: string;
  readonly duration: string;
  readonly status: "confirmed" | "pending" | "cancelled";
  readonly location: string;
  readonly price: string;
  readonly description: string;
  readonly purpose?: string;
  readonly contactPerson?: string;
  readonly paymentStatus?: "paid" | "pending" | "failed";
  readonly facilityImage?: string;
  readonly rating?: number;
  readonly canRate?: boolean;
}

const UserBookings = (): JSX.Element => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState<string | null>(null);

  // Enhanced mock data
  const bookings: readonly IUserBooking[] = [
    {
      id: "1",
      facility: "Drammen Idrettshall",
      date: "2024-01-20",
      time: "14:00",
      duration: "2 timer",
      status: "confirmed",
      location: "Drammen",
      price: "1000 kr",
      description: "Fotballtrening for juniorlaget",
      purpose: "Trening",
      contactPerson: "Anna Hansen",
      paymentStatus: "paid",
      facilityImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop",
      canRate: true
    },
    {
      id: "2",
      facility: "Solberghallen",
      date: "2024-01-22",
      time: "10:00",
      duration: "1 time",
      status: "pending",
      location: "Drammen",
      price: "400 kr",
      description: "Badminton med venner",
      purpose: "Fritid",
      contactPerson: "Maria Olsen",
      paymentStatus: "pending",
      facilityImage: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      facility: "Kulturhuset",
      date: "2024-01-18",
      time: "16:00",
      duration: "3 timer",
      status: "cancelled",
      location: "Drammen",
      price: "2400 kr",
      description: "Konsert - avlyst på grunn av sykdom",
      purpose: "Kultur",
      contactPerson: "Erik Larsen",
      paymentStatus: "failed",
      facilityImage: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop"
    },
    {
      id: "4",
      facility: "Møterom 1",
      date: "2024-01-25",
      time: "09:00",
      duration: "2 timer",
      status: "confirmed",
      location: "Drammen sentrum",
      price: "400 kr",
      description: "Team meeting",
      purpose: "Møte",
      contactPerson: "Tom Hansen",
      paymentStatus: "paid",
      facilityImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      canRate: true
    }
  ];

  const statusFilters = [
    { value: "all", label: "Alle", icon: Calendar, count: bookings.length },
    { value: "confirmed", label: "Bekreftet", icon: CheckCircle, count: bookings.filter(b => b.status === "confirmed").length },
    { value: "pending", label: "Ventende", icon: AlertTriangle, count: bookings.filter(b => b.status === "pending").length },
    { value: "cancelled", label: "Avlyst", icon: XCircle, count: bookings.filter(b => b.status === "cancelled").length }
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    const matchesSearch = searchQuery === "" || 
      booking.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: IUserBooking["status"]): JSX.Element => {
    const statusConfig = {
      confirmed: { 
        label: "Bekreftet", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle,
        tooltip: "Booking er bekreftet og klar for bruk"
      },
      pending: { 
        label: "Ventende", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: AlertTriangle,
        tooltip: "Venter på godkjenning fra saksbehandler. Du vil få varsel når status endres."
      },
      cancelled: { 
        label: "Avlyst", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle,
        tooltip: "Booking er avlyst"
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className} title={config.tooltip}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: IUserBooking["paymentStatus"]): JSX.Element => {
    const statusConfig = {
      paid: { 
        label: "Betalt", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      },
      pending: { 
        label: "Venter betaling", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      },
      failed: { 
        label: "Betaling feilet", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }
    };
    
    const config = statusConfig[status || "pending"];
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    // Handle date display more carefully to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, parse it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString('nb-NO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // Fallback to original method
      return new Date(dateString).toLocaleDateString('nb-NO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const handleEditBooking = (bookingId: string): void => {
    // TODO: Implement edit booking
  };

  const handleCancelBooking = (bookingId: string): void => {
    // TODO: Implement cancel booking with confirmation
  };

  const handleViewFacility = (bookingId: string): void => {
    // TODO: Navigate to facility detail
  };

  const handleNewBooking = (): void => {
    navigate("/user/facilities");
  };

  const handleShareBooking = (bookingId: string): void => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking && navigator.share) {
      navigator.share({
        title: `Booking: ${booking.facility}`,
        text: `Jeg har booket ${booking.facility} den ${formatDate(booking.date)} kl. ${booking.time}`,
        url: window.location.origin + `/bookings/${bookingId}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/bookings/${bookingId}`);
    }
  };

  const handleRateBooking = (bookingId: string, rating: number): void => {
    // TODO: Implement rating
  };

  const renderBookingDetails = (booking: IUserBooking): JSX.Element => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Bookingdetaljer</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Formål:</span>
              <span className="text-gray-900 dark:text-white">{booking.purpose}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Kontaktperson:</span>
              <span className="text-gray-900 dark:text-white">{booking.contactPerson}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Betalingsstatus:</span>
              {getPaymentStatusBadge(booking.paymentStatus)}
            </div>
          </div>
        </div>
        
        {booking.facilityImage && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lokale</h4>
            <img 
              src={booking.facilityImage} 
              alt={booking.facility}
              className="w-full h-24 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      
      {booking.canRate && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vurder opplevelsen</h4>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRateBooking(booking.id, star)}
                className="text-gray-300 hover:text-yellow-400 transition-colors"
              >
                <Star className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mine bookinger
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administrer og oversikt over alle dine bookinger
          </p>
        </div>
        <Button onClick={handleNewBooking} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ny booking
        </Button>
      </div>

      {/* Status Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dine bookinger: <span className="font-semibold">{bookings.length} totalt</span>
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bookings.filter(b => b.status === "confirmed").length} bekreftet
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bookings.filter(b => b.status === "pending").length} ventende
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {bookings.filter(b => b.status === "cancelled").length} avlyst
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Søk i bookinger..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filtrer:
              </span>
              <div className="flex space-x-2">
                {statusFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.value}
                      size="sm"
                      variant={filterStatus === filter.value ? "default" : "outline"}
                      onClick={() => setFilterStatus(filter.value)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {filter.label}
                      <Badge variant="secondary" className="ml-1">
                        {filter.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card 
              key={booking.id} 
              className={`hover:shadow-lg transition-all duration-200 ${
                booking.status === "confirmed" ? "border-l-4 border-l-green-500" :
                booking.status === "pending" ? "border-l-4 border-l-yellow-500" :
                "border-l-4 border-l-red-500"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {booking.facility}
                      </h3>
                      
                      {/* Date, Time, Duration */}
                      <div className="flex items-center space-x-4 mb-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatDate(booking.date)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {booking.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {booking.duration}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {booking.description}
                      </p>
                      
                      {/* Location */}
                      <div className="flex items-center space-x-1 mb-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {booking.location}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm ml-2">
                          Vis på kart
                        </button>
                      </div>
                      
                      {/* Price and Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {booking.price}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBookingDetails(
                        showBookingDetails === booking.id ? null : booking.id
                      )}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShareBooking(booking.id)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    
                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBooking(booking.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                        >
                          Avbestill
                        </Button>
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id
                      )}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedBooking === booking.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedBooking === booking.id && renderBookingDetails(booking)}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ingen bookinger funnet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filterStatus === "all" 
                  ? "Du har ingen bookinger ennå. Start med å booke et lokale."
                  : `Du har ingen ${statusFilters.find(f => f.value === filterStatus)?.label.toLowerCase()} bookinger.`
                }
              </p>
              {filterStatus === "all" && (
                <Button onClick={handleNewBooking}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book et lokale
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserBookings;