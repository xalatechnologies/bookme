"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFacilityStore } from "@/stores/facilityStore";
import FacilityCardUser from "@/components/features/facilities/components/FacilityCard/FacilityCardUser";
import { 
  BookingFilters,
  SystemMessageFilters,
  BookingList
} from "@/components/features/dashboard/user";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle,
  AlertTriangle,
  Heart,
  Bell,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CalendarDays,
  CreditCard,
  History,
  Settings
} from "lucide-react";

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

interface IWeatherData {
  readonly temperature: number;
  readonly condition: "sunny" | "cloudy" | "rainy" | "snowy";
  readonly description: string;
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



const UserDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [weather, setWeather] = useState<IWeatherData | null>(null);

  // Get facilities from store
  const { getPublishedFacilities } = useFacilityStore();

  // Get user data from localStorage
  const user = useMemo(() => {
    try {
      const pending: any[] = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed: any[] = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];

      // Find next upcoming booking
      const upcomingBookings = all
        .filter((booking: any) => {
          const bookingDate = new Date(booking.startDate);
          return bookingDate >= new Date() && booking.status === 'approved';
        })
        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      const nextBooking = upcomingBookings[0];

      return {
        name: "Amin", // Could be from user profile context
        totalBookings: all.length,
        monthlyBookingLimit: 5,
        nextBooking: nextBooking ? {
          facility: nextBooking.facilityName || 'Ukjent lokale',
          date: new Date(nextBooking.startDate).toLocaleDateString('nb-NO', { day: '2-digit', month: '2-digit' }),
          time: nextBooking.startTime || '14:00'
        } : null
      };
    } catch (error) {
      console.error('Error loading user data:', error);
      return {
        name: "Amin",
        totalBookings: 0,
        monthlyBookingLimit: 5,
        nextBooking: null
      };
    }
  }, []);

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
  const quickActions = [
    {
      id: "calendar",
      title: t('user:quick_actions.calendar.title'),
      description: t('user:quick_actions.calendar.description'),
      icon: CalendarDays,
      path: "/user/calendar",
      color: "bg-blue-500"
    },
    {
      id: "invoices",
      title: t('user:quick_actions.invoices.title'),
      description: t('user:quick_actions.invoices.description'),
      icon: CreditCard,
      path: "/user/receipts",
      color: "bg-green-500"
    },
    {
      id: "favorites",
      title: t('user:quick_actions.favorites.title'),
      description: t('user:quick_actions.favorites.description'),
      icon: Heart,
      path: "/user/favorites",
      color: "bg-red-500"
    },
    {
      id: "history",
      title: t('user:quick_actions.history.title'),
      description: t('user:quick_actions.history.description'),
      icon: History,
      path: "/user/history",
      color: "bg-purple-500"
    }
  ];

  // Get recent bookings from localStorage
  const userBookings = useMemo(() => {
    try {
      const pending: any[] = JSON.parse(localStorage.getItem('pendingBookings') || '[]');
      const processed: any[] = JSON.parse(localStorage.getItem('processedBookings') || '[]');
      const all = [...pending, ...processed];

      // Get recent bookings (last 3)
      const recentBookings = all
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 3);

      return recentBookings.map((booking: any) => ({
        id: booking.id,
        facility: booking.facilityName || 'Ukjent lokale',
        date: booking.startDate || new Date().toISOString().split('T')[0],
        time: booking.startTime || '14:00',
        duration: booking.duration || '1 time',
        status: booking.status === 'approved' ? ('confirmed' as const) :
                booking.status === 'rejected' ? ('cancelled' as const) : ('pending' as const),
        location: booking.facilityName || 'Ukjent lokale',
        price: booking.price || '0 kr',
        purpose: booking.purpose || t('user:bookings.not_specified'),
        participants: ["Amin"], // Default participant
        qrCode: `QR${booking.id.slice(-6)}`,
        cancellationPolicy: t('user:bookings.cancellation_policy'),
        contactInfo: {
          phone: "+47 123 45 678",
          email: "admin@drammen.no"
        }
      }));
    } catch (error) {
      console.error('Error loading recent bookings:', error);
      return [];
    }
  }, [t]);

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
    recommendationReason: index === 0 ? t('user:recommendations.frequent_bookings') :
                         index === 1 ? t('user:recommendations.preferred_times') :
                         t('user:recommendations.new_in_area'),
    isFrequentlyBooked: index === 0,
    matchesPreferredTimes: index === 1,
    isNewInArea: index === 2
  }));

  const systemMessages: ISystemMessage[] = [
    {
      id: "1",
      title: "Booking oppdatert",
      message: "Booking for Solberghallen er oppdatert med nye tider.",
      type: "info" as const,
      date: "2024-01-19T10:30:00Z",
      isRead: false,
      category: "booking"
    },
    {
      id: "2",
      title: "Nytt regelverk",
      message: "Nye regler for avbestillinger trer i kraft fra 1. februar.",
      type: "warning" as const,
      date: "2024-01-18T14:15:00Z",
      isRead: false,
      category: "system"
    },
    {
      id: "3",
      title: "Vedlikehold planlagt",
      message: "Vedlikehold av systemet planlagt søndag 08:00–10:00.",
      type: "maintenance" as const,
      date: "2024-01-17T16:45:00Z",
      isRead: true,
      category: "system"
    },
    {
      id: "4",
      title: "Booking bekreftet",
      message: "Din booking for Drammen Idrettshall er bekreftet! 🎉",
      type: "success" as const,
      date: "2024-01-20T09:00:00Z",
      isRead: false,
      category: "booking"
    }
  ];

  const filteredBookings = userBookings.filter(booking =>
    bookingFilter === "all" || booking.status === bookingFilter
  );

  const filteredMessages = systemMessages.filter(message =>
    messageFilter === "all" || message.category === messageFilter
  );

  const unreadMessagesCount = systemMessages.filter(message => !message.isRead).length;

  const getDayOfWeek = (): string => {
    const dayIndex = new Date().getDay();
    const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return t(`user:dashboard.days.${dayKeys[dayIndex]}`);
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

  const markMessageAsRead = (): void => {
    // Mark message as read in local state
    // In a real app, this would call an API

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

  const handleEditBooking = (): void => {
    // Navigate to bookings page with edit context
    navigate(`/user/bookings`);
  };

  const handleCancelBooking = (): void => {
    if (window.confirm(t('user:bookings.confirm_cancel'))) {
      // In a real app, this would call an API

      // Show success message
      alert(t('user:bookings.booking_cancelled'));
    }
  };

  const handleContactAdmin = (): void => {
    // Navigate to messages page
    navigate('/user/messages');
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
                  {t('user:dashboard.greeting', { dayOfWeek: getDayOfWeek(), name: user.name })} 👋
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
                {weather && `${t('user:dashboard.weather_in_city', { description: weather.description })} `}
                {t('user:dashboard.perfect_day')}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('user:dashboard.monthly_bookings')}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {user.totalBookings} {t('user:dashboard.of')} {user.monthlyBookingLimit}
                  </span>
                </div>
                <Progress
                  value={(user.totalBookings / user.monthlyBookingLimit) * 100}
                  className="h-2"
                />
              </div>

              <p className="text-sm text-blue-600 dark:text-blue-400">
                {user.nextBooking ?
                  t('user:dashboard.next_booking', {
                    facility: user.nextBooking.facility,
                    date: user.nextBooking.date,
                    time: user.nextBooking.time
                  }) :
                  t('user:dashboard.no_upcoming_bookings')
                }
              </p>
            </div>
            <div className="ml-6">
              <Button
                onClick={handleNewBooking}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3 shadow-lg"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('user:dashboard.new_booking')}
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
            {t('user:dashboard.quick_actions')}
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
              {t('user:dashboard.my_bookings')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <BookingFilters
                bookingFilter={bookingFilter}
                onFilterChange={setBookingFilter}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BookingList
            bookings={filteredBookings}
            expandedBookings={expandedBookings}
            onToggleExpansion={toggleBookingExpansion}
            onViewFacility={handleViewFacility}
            onEditBooking={handleEditBooking}
            onCancelBooking={handleCancelBooking}
            onContactAdmin={handleContactAdmin}
          />
        </CardContent>
      </Card>

      {/* Recommended Facilities */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('user:dashboard.recommended_facilities')}
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
              {t('user:dashboard.system_messages')}
              {unreadMessagesCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadMessagesCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <SystemMessageFilters
                messageFilter={messageFilter}
                onFilterChange={setMessageFilter}
                unreadMessagesCount={unreadMessagesCount}
              />
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
                onClick={() => markMessageAsRead()}
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
