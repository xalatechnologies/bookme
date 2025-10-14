"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFacilityStore } from "@/stores/facilityStore";
// Import FacilityCardUser for consistent functionality across dashboard and facilities page
import FacilityCardUser from "@/components/facility/FacilityCardUser";
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
  TrendingDown,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  CalendarDays,
  CreditCard,
  History,
  Settings,
  ChevronRight,
  QrCode,
  Phone,
  Mail,
  MoreVertical,
  Sparkles
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
  readonly participants?: readonly string[];
  readonly qrCode?: string;
  readonly cancellationPolicy?: string;
  readonly contactInfo?: {
    readonly phone: string;
    readonly email: string;
  };
  readonly isExpanded?: boolean;
}

interface IUserFacility {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: string;
  readonly location: string;
  readonly address: string;
  readonly capacity: number;
  readonly amenities: readonly string[];
  readonly image: string;
  readonly rating: number;
  readonly price: string;
  readonly availability: "available" | "busy" | "full";
  readonly recommendationReason?: string;
  readonly isFrequentlyBooked?: boolean;
  readonly isNewInArea?: boolean;
  readonly matchesPreferredTimes?: boolean;
}

interface ISystemMessage {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: "info" | "warning" | "maintenance" | "success";
  readonly date: string;
  readonly isRead?: boolean;
  readonly category?: "system" | "booking" | "news";
}

interface IWeatherData {
  readonly temperature: number;
  readonly condition: "sunny" | "cloudy" | "rainy" | "snowy";
  readonly description: string;
}

interface IQuickAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly path: string;
  readonly color: string;
}

const UserDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [weather, setWeather] = useState<IWeatherData | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Get facilities from store
  const { getPublishedFacilities } = useFacilityStore();

  // Mock user data
  const user = {
    name: "Amin",
    totalBookings: 3,
    monthlyBookingLimit: 5,
    nextBooking: {
      facility: "Drammen Idrettshall",
      date: "20.01",
      time: "14:00"
    }
  };

  // Mock weather data
  useEffect(() => {
    // Simulate weather fetch
    setWeather({
      temperature: 8,
      condition: "cloudy",
      description: "Overskyet"
    });
  }, []);

  // Quick actions
  const quickActions: readonly IQuickAction[] = [
    {
      id: "calendar",
      title: "Se kalender",
      description: "Oversikt over alle bookinger",
      icon: CalendarDays,
      path: "/user/calendar",
      color: "bg-blue-500"
    },
    {
      id: "invoices",
      title: "Fakturaer & betalinger",
      description: "Betalingshistorikk og kvitteringer",
      icon: CreditCard,
      path: "/user/receipts",
      color: "bg-green-500"
    },
    {
      id: "favorites",
      title: "Favoritter",
      description: "Dine favorittlokaler",
      icon: Heart,
      path: "/user/favorites",
      color: "bg-red-500"
    },
    {
      id: "history",
      title: "Historikk",
      description: "Tidligere bookinger og aktivitet",
      icon: History,
      path: "/user/history",
      color: "bg-purple-500"
    }
  ];

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
      purpose: "Fotballtrening",
      participants: ["Amin", "Erik", "Lars", "Maria"],
      qrCode: "QR123456",
      cancellationPolicy: "Avbestilling mulig 24 timer før",
      contactInfo: {
        phone: "+47 123 45 678",
        email: "admin@drammen.no"
      }
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
      purpose: "Badminton",
      participants: ["Amin", "Sofia"],
      cancellationPolicy: "Avbestilling mulig 12 timer før",
      contactInfo: {
        phone: "+47 987 65 432",
        email: "booking@solberg.no"
      }
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
      purpose: "Konsert",
      participants: ["Amin", "Bandet"],
      cancellationPolicy: "Avbestilling mulig 48 timer før"
    }
  ];

  /**
   * Get recommended facilities from store (first 3 published facilities)
   * 
   * This replaces the previous mock data with real facility data from the store.
   * The facilities are mapped to the dashboard format with recommendation logic:
   * - First facility: "Anbefalt basert på dine tidligere bookinger" (isFrequentlyBooked: true)
   * - Second facility: "Tilgjengelig på dine vanlige tider" (matchesPreferredTimes: true)
   * - Third facility: "Ny i området" (isNewInArea: true)
   * 
   * This ensures consistency between the facilities page and dashboard recommendations.
   * The facilities are then rendered using FacilityCardUser component for unified functionality.
   */
  const storeFacilities = getPublishedFacilities();
  const recommendedFacilities: readonly IUserFacility[] = storeFacilities.slice(0, 3).map((facility, index) => ({
    id: facility.id,
    name: facility.name,
    description: facility.description,
    type: facility.type,
    location: facility.location,
    address: facility.address,
    capacity: facility.capacity,
    amenities: facility.amenities,
    image: facility.images[0] || "/placeholder.svg",
    rating: facility.rating,
    price: `${facility.pricePerHour} kr/time`,
    availability: "available" as const,
    recommendationReason: index === 0 ? "Anbefalt basert på dine tidligere bookinger" : 
                         index === 1 ? "Tilgjengelig på dine vanlige tider" : 
                         "Ny i området",
    isFrequentlyBooked: index === 0,
    matchesPreferredTimes: index === 1,
    isNewInArea: index === 2
  }));

  const systemMessages: readonly ISystemMessage[] = [
    {
      id: "1",
      title: "Booking oppdatert",
      message: "Booking for Solberghallen er oppdatert med nye tider.",
      type: "info",
      date: "2024-01-19T10:30:00Z",
      isRead: false,
      category: "booking"
    },
    {
      id: "2",
      title: "Nytt regelverk",
      message: "Nye regler for avbestillinger trer i kraft fra 1. februar.",
      type: "warning",
      date: "2024-01-18T14:15:00Z",
      isRead: false,
      category: "system"
    },
    {
      id: "3",
      title: "Vedlikehold planlagt",
      message: "Vedlikehold av systemet planlagt søndag 08:00–10:00.",
      type: "maintenance",
      date: "2024-01-17T16:45:00Z",
      isRead: true,
      category: "system"
    },
    {
      id: "4",
      title: "Booking bekreftet",
      message: "Din booking for Drammen Idrettshall er bekreftet! 🎉",
      type: "success",
      date: "2024-01-20T09:00:00Z",
      isRead: false,
      category: "booking"
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

  const filteredMessages = systemMessages.filter(message => 
    messageFilter === "all" || message.category === messageFilter
  );

  const unreadMessagesCount = systemMessages.filter(message => !message.isRead).length;

  const getDayOfWeek = (): string => {
    const days = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
    return days[new Date().getDay()];
  };

  const getWeatherIcon = (condition: IWeatherData["condition"]): JSX.Element => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      snowy: Snowflake
    };
    const Icon = icons[condition];
    return <Icon className="h-5 w-5" />;
  };

  const getMessageIcon = (type: ISystemMessage["type"]): JSX.Element => {
    const icons = {
      info: Bell,
      warning: AlertTriangle,
      maintenance: Clock,
      success: CheckCircle
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

  const toggleBookingExpansion = (bookingId: string): void => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };

  const markMessageAsRead = (messageId: string): void => {
    // TODO: Implement mark as read
  };

  const getStatusBadge = (status: IUserBooking["status"]): JSX.Element => {
    const statusConfig = {
      confirmed: { 
        label: "Bekreftet", 
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-l-4 border-green-500",
        icon: CheckCircle
      },
      pending: { 
        label: "Ventende", 
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-l-4 border-yellow-500",
        icon: Clock
      },
      cancelled: { 
        label: "Avlyst", 
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-l-4 border-red-500",
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



  const formatDate = (dateString: string): string => {
    // Handle date display more carefully to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, parse it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString('nb-NO');
    } else {
      // Fallback to original method
      return new Date(dateString).toLocaleDateString('nb-NO');
    }
  };

  const formatMessageDate = (dateString: string): string => {
    // Handle date display more carefully to avoid timezone issues
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // If it's a YYYY-MM-DD string, parse it as local date
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return localDate.toLocaleDateString('nb-NO', {
        month: 'short',
        day: 'numeric'
      });
    } else {
      // Fallback to original method
      return new Date(dateString).toLocaleDateString('nb-NO', {
        month: 'short',
        day: 'numeric'
      });
    }
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


  return (
    <div className="space-y-8">
      {/* Dynamic Hero Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  God {getDayOfWeek()}, {user.name}! 👋
                </h1>
                {weather && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full">
                    {getWeatherIcon(weather.condition)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {weather.temperature}°C
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {weather && `${weather.description} i Drammen. `}Perfekt dag for fotball i Drammen!
              </p>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bookinger denne måneden
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {user.totalBookings} av {user.monthlyBookingLimit}
                  </span>
                </div>
                <Progress 
                  value={(user.totalBookings / user.monthlyBookingLimit) * 100} 
                  className="h-2"
                />
              </div>

              <p className="text-sm text-blue-600 dark:text-blue-400">
                Neste booking: {user.nextBooking.facility} – {user.nextBooking.date} kl. {user.nextBooking.time}
              </p>
            </div>
            <div className="ml-6">
              <Button 
                onClick={handleNewBooking} 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3 shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ny booking
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Hurtighandlinger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                  onClick={() => {
                    navigate(action.path);
                  }}
                >
                  <div className={`p-2 rounded-full ${action.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {action.description}
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Bookings Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mine bookinger
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
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
            <div className="space-y-3">
              {filteredBookings.map((booking) => {
                const isExpanded = expandedBookings.has(booking.id);
                return (
                  <div
                    key={booking.id}
                    className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
                      booking.status === "confirmed" 
                        ? "border-l-4 border-l-green-500 shadow-sm" 
                        : booking.status === "pending"
                        ? "border-l-4 border-l-yellow-500 shadow-sm"
                        : "border-l-4 border-l-red-500 shadow-sm"
                    }`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => toggleBookingExpansion(booking.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`font-medium ${
                              booking.status === "cancelled" 
                                ? "line-through text-gray-500 dark:text-gray-500" 
                                : "text-gray-900 dark:text-white"
                            }`}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFacility(booking.id);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Se detaljer
                        </Button>
                        
                        {booking.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditBooking(booking.id);
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Endre
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelBooking(booking.id);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Avlys
                            </Button>
                          </>
                        )}
                        
                        {booking.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactAdmin(booking.id);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Kontakt
                          </Button>
                        )}
                        
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`} />
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {booking.participants && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Deltakere
                              </h5>
                              <div className="flex flex-wrap gap-1">
                                {booking.participants.map((participant, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {participant}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {booking.qrCode && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                QR-kode
                              </h5>
                              <div className="bg-white dark:bg-gray-700 p-2 rounded border text-center">
                                <div className="text-xs font-mono">{booking.qrCode}</div>
                              </div>
                            </div>
                          )}
                          
                          {booking.cancellationPolicy && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                Avbestillingsregler
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {booking.cancellationPolicy}
                              </p>
                            </div>
                          )}
                          
                          {booking.contactInfo && (
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                Kontaktinfo
                              </h5>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="h-3 w-3" />
                                  {booking.contactInfo.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Mail className="h-3 w-3" />
                                  {booking.contactInfo.email}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Start din første booking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {bookingFilter === "all" 
                  ? "Du har ingen bookinger ennå. Utforsk våre lokaler og book din første aktivitet."
                  : `Du har ingen ${bookingFilters.find(f => f.value === bookingFilter)?.label.toLowerCase()} bookinger.`
                }
              </p>
              <Button onClick={handleNewBooking} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Book et lokale
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Facilities */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Anbefalte lokaler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedFacilities.map((facility) => (
              <div key={facility.id} className="relative">
                {/* 
                  Use FacilityCardUser component for consistent functionality
                  This ensures the same heart icon, share button, and hover effects
                  as the main facilities page, providing a unified user experience.
                  
                  The component handles:
                  - Favorite toggle with visual feedback
                  - Share functionality (native share or clipboard fallback)
                  - Usage tracking and last visited updates
                  - Hover effects with "Se detaljer" and "Book nå" buttons
                  - Proper z-index layering to prevent UI conflicts
                */}
                <FacilityCardUser
                  id={facility.id}
                  name={facility.name}
                  address={facility.address}
                  type={facility.type}
                  capacity={facility.capacity}
                  amenities={facility.amenities}
                  image={facility.image}
                  rating={facility.rating}
                  price={facility.price}
                  description={facility.description}
                  availability={facility.availability}
                />
                
                {/* 
                  Recommendation Badge Overlay
                  Positioned with high z-index (z-40) to appear above the card content
                  but below the heart/share buttons (z-30) for proper layering
                */}
                {facility.recommendationReason && (
                  <div className="absolute top-2 left-2 z-40">
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                      {facility.recommendationReason}
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Messages */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Systemmeldinger
              {unreadMessagesCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadMessagesCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={messageFilter}
                onChange={(e) => setMessageFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">Alle</option>
                <option value="system">System</option>
                <option value="booking">Booking</option>
                <option value="news">Nyheter</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  message.isRead 
                    ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" 
                    : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                }`}
                onClick={() => markMessageAsRead(message.id)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="relative">
                    {getMessageIcon(message.type)}
                    {!message.isRead && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className={`font-medium ${
                      message.isRead 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-900 dark:text-white font-semibold"
                    }`}>
                      {message.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {message.category && (
                        <Badge variant="outline" className="text-xs">
                          {message.category}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatMessageDate(message.date)}
                      </span>
                    </div>
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