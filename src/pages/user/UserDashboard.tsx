"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Heart,
  Bell,
  MessageSquare,
  Download,
  Filter,
  ChevronDown,
  Star,
  Users,
  TrendingUp,
  TrendingDown
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
  readonly purpose: string;
}

interface IUserFacility {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly location: string;
  readonly capacity: number;
  readonly amenities: readonly string[];
  readonly image: string;
  readonly rating: number;
  readonly price: string;
  readonly availability: "available" | "busy" | "full";
}

interface ISystemMessage {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: "info" | "warning" | "maintenance";
  readonly date: string;
}

const UserDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookingFilter, setBookingFilter] = useState<string>("all");

  // Mock user data
  const user = {
    name: "Amin",
    totalBookings: 3,
    nextBooking: {
      facility: "Drammen Idrettshall",
      date: "20.01",
      time: "14:00"
    }
  };

  // Mock data
  const userBookings: readonly IUserBooking[] = [
    {
      id: "1",
      facility: "Drammen Idrettshall",
      date: "2024-01-20",
      time: "14:00",
      duration: "2 timer",
      status: "confirmed",
      location: "Drammen",
      price: "1000 kr",
      purpose: "Fotballtrening"
    },
    {
      id: "2",
      facility: "Solberghallen",
      date: "2024-01-22",
      time: "10:00",
      duration: "1 time",
      status: "pending",
      location: "Drammen",
      price: "500 kr",
      purpose: "Badminton"
    },
    {
      id: "3",
      facility: "Kulturhuset",
      date: "2024-01-18",
      time: "16:00",
      duration: "3 timer",
      status: "cancelled",
      location: "Drammen",
      price: "1500 kr",
      purpose: "Konsert"
    }
  ];

  const recommendedFacilities: readonly IUserFacility[] = [
    {
      id: "1",
      name: "Møterom 1",
      type: "Møterom",
      location: "Drammen sentrum",
      capacity: 12,
      amenities: ["WiFi", "Projektor", "Whiteboard"],
      image: "/placeholder.svg",
      rating: 4.5,
      price: "400 kr/time",
      availability: "available"
    },
    {
      id: "2",
      name: "Tennisbane",
      type: "Idrett",
      location: "Drammen",
      capacity: 4,
      amenities: ["Utendørs", "Belysning"],
      image: "/placeholder.svg",
      rating: 4.8,
      price: "300 kr/time",
      availability: "busy"
    },
    {
      id: "3",
      name: "Fitnesssenter",
      type: "Treningssenter",
      location: "Drammen",
      capacity: 20,
      amenities: ["Utstyr", "Dusj", "Parkering"],
      image: "/placeholder.svg",
      rating: 4.2,
      price: "200 kr/time",
      availability: "available"
    }
  ];

  const systemMessages: readonly ISystemMessage[] = [
    {
      id: "1",
      title: "Booking oppdatert",
      message: "Booking for Solberghallen er oppdatert med nye tider.",
      type: "info",
      date: "2024-01-19T10:30:00Z"
    },
    {
      id: "2",
      title: "Nytt regelverk",
      message: "Nye regler for avbestillinger trer i kraft fra 1. februar.",
      type: "warning",
      date: "2024-01-18T14:15:00Z"
    },
    {
      id: "3",
      title: "Vedlikehold planlagt",
      message: "Vedlikehold av systemet planlagt søndag 08:00–10:00.",
      type: "maintenance",
      date: "2024-01-17T16:45:00Z"
    }
  ];

  const bookingFilters = [
    { value: "all", label: "Alle" },
    { value: "confirmed", label: "Bekreftet" },
    { value: "pending", label: "Ventende" },
    { value: "cancelled", label: "Avlyst" }
  ];

  const filteredBookings = userBookings.filter(booking => 
    bookingFilter === "all" || booking.status === bookingFilter
  );

  const getStatusBadge = (status: IUserBooking["status"]): JSX.Element => {
    const statusConfig = {
      confirmed: { 
        label: "Bekreftet", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        icon: CheckCircle
      },
      pending: { 
        label: "Ventende", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
        icon: Clock
      },
      cancelled: { 
        label: "Avlyst", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        icon: XCircle
      }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability: IUserFacility["availability"]): JSX.Element => {
    const availabilityConfig = {
      available: { 
        label: "Ledig denne uken", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      },
      busy: { 
        label: "Fullbooket i helgen", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      },
      full: { 
        label: "Fullbooket", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      }
    };
    
    const config = availabilityConfig[availability];
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getMessageIcon = (type: ISystemMessage["type"]): JSX.Element => {
    const icons = {
      info: Bell,
      warning: AlertTriangle,
      maintenance: Clock
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  const formatMessageDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleNewBooking = (): void => {
    navigate("/user/facilities");
  };

  const handleViewFacility = (facilityId: string): void => {
    navigate(`/facilities/${facilityId}`);
  };

  const handleEditBooking = (bookingId: string): void => {
    // TODO: Implement edit booking
  };

  const handleCancelBooking = (bookingId: string): void => {
    // TODO: Implement cancel booking
  };

  const handleAddToCalendar = (bookingId: string): void => {
    // TODO: Implement add to calendar
  };

  const handleContactAdmin = (bookingId: string): void => {
    // TODO: Implement contact admin
  };

  const handleAddToFavorites = (facilityId: string): void => {
    // TODO: Implement add to favorites
  };

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                👋 Hei, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Du har {user.totalBookings} aktive bookinger denne måneden.
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Neste booking: {user.nextBooking.facility} – {user.nextBooking.date} kl. {user.nextBooking.time}
              </p>
            </div>
            <Button onClick={handleNewBooking} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ny booking
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Bookings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mine bookinger
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
              >
                {bookingFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    booking.status === "pending" 
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10" 
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {booking.facility}
                        </h4>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formatDate(booking.date)} kl. {booking.time} • {booking.duration}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {booking.purpose} • {booking.price}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {booking.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewFacility(booking.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {booking.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCalendar(booking.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBooking(booking.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {booking.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContactAdmin(booking.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ingen bookinger funnet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {bookingFilter === "all" 
                  ? "Du har ingen bookinger ennå. Start med å booke et lokale."
                  : `Du har ingen ${bookingFilters.find(f => f.value === bookingFilter)?.label.toLowerCase()} bookinger.`
                }
              </p>
              <Button onClick={handleNewBooking}>
                <Plus className="h-4 w-4 mr-2" />
                Book et lokale
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Facilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Anbefalte lokaler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedFacilities.map((facility) => (
              <div
                key={facility.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleViewFacility(facility.id)}
              >
                <div className="relative">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-gray-400" />
                  </div>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorites(facility.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <div className="absolute top-2 left-2">
                    {getAvailabilityBadge(facility.availability)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {facility.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {facility.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {facility.type} • {facility.capacity} personer
                  </p>
                  <div className="flex items-center space-x-1 mb-3">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {facility.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {facility.amenities.slice(0, 2).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {facility.amenities.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{facility.amenities.length - 2}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {facility.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Systemmeldinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {message.title}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {formatMessageDate(message.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;