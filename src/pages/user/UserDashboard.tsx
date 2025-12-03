"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import FacilityCardUser from "@/components/features/facilities/components/FacilityCard/FacilityCardUser";
import {
  BookingFilters,
  SystemMessageFilters,
  BookingList,
} from "@/components/features/dashboard/user";
import {
  Calendar,
  Plus,
  Heart,
  Bell,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  CalendarDays,
  CreditCard,
  History,
  Settings,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useDashboardManagement } from "@/hooks/features/dashboard/useDashboardManagement";
import type { IUseDashboardManagementReturn } from "@/hooks/features/dashboard/useDashboardManagement";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get current day of week localized
 */
const getDayOfWeek = (): string => {
  const dayIndex = new Date().getDay();
  const dayKeys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return dayKeys[dayIndex];
};

/**
 * Get weather icon component
 */
const getWeatherIcon = (
  condition: "sunny" | "cloudy" | "rainy" | "snowy"
): JSX.Element => {
  const icons = {
    sunny: Sun,
    cloudy: Cloud,
    rainy: CloudRain,
    snowy: Snowflake,
  };
  const Icon = icons[condition];
  return <Icon className="h-5 w-5" />;
};

/**
 * Get message type icon
 */
const getMessageIcon = (
  type: "info" | "warning" | "maintenance" | "success"
): JSX.Element => {
  const icons = {
    info: Bell,
    warning: AlertTriangle,
    maintenance: Clock,
    success: CheckCircle,
  };
  const Icon = icons[type];
  return <Icon className="h-4 w-4" />;
};

/**
 * Format message date for display
 */
const formatMessageDate = (dateString: string): string => {
  // Handle date display more carefully to avoid timezone issues
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // If it's a YYYY-MM-DD string, parse it as local date
    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString("nb-NO", {
      month: "short",
      day: "numeric",
    });
  } else {
    // Fallback to original method
    return new Date(dateString).toLocaleDateString("nb-NO", {
      month: "short",
      day: "numeric",
    });
  }
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * User Dashboard Component
 *
 * Clean architecture presentation layer.
 * All business logic is handled by useDashboardManagement hook.
 *
 * Features:
 * - Personalized greeting with weather
 * - Booking statistics and progress
 * - Quick actions navigation
 * - Recent bookings list
 * - Recommended facilities
 * - System messages
 */
const UserDashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "user", "booking"]);
  const orgId = useOrganizationId();

  // Get all dashboard data and handlers from hook
  const dashboard: IUseDashboardManagementReturn =
    useDashboardManagement(orgId);

  // ============================================================================
  // Quick Actions Configuration
  // ============================================================================

  const quickActions = [
    {
      id: "calendar",
      title: t("user:quick_actions.calendar.title"),
      description: t("user:quick_actions.calendar.description"),
      icon: CalendarDays,
      path: "/user/calendar",
      color: "bg-blue-500",
    },
    {
      id: "invoices",
      title: t("user:quick_actions.invoices.title"),
      description: t("user:quick_actions.invoices.description"),
      icon: CreditCard,
      path: "/user/receipts",
      color: "bg-green-500",
    },
    {
      id: "favorites",
      title: t("user:quick_actions.favorites.title"),
      description: t("user:quick_actions.favorites.description"),
      icon: Heart,
      path: "/user/favorites",
      color: "bg-red-500",
    },
    {
      id: "history",
      title: t("user:quick_actions.history.title"),
      description: t("user:quick_actions.history.description"),
      icon: History,
      path: "/user/history",
      color: "bg-purple-500",
    },
  ];

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleNewBooking = (): void => {
    navigate("/facilities");
  };

  const handleViewFacility = (facilityId: string): void => {
    navigate(`/facilities/${facilityId}`);
  };

  const handleEditBooking = (): void => {
    navigate(`/user/bookings`);
  };

  const handleCancelBooking = (): void => {
    if (window.confirm(t("user:bookings.confirm_cancel"))) {
      alert(t("user:bookings.booking_cancelled"));
    }
  };

  const handleContactAdmin = (): void => {
    navigate("/user/messages");
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-8">
      {/* Dynamic Hero Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("user:dashboard.greeting", {
                    dayOfWeek: t(`user:dashboard.days.${getDayOfWeek()}` as "user:dashboard.days.sunday" | "user:dashboard.days.monday" | "user:dashboard.days.tuesday" | "user:dashboard.days.wednesday" | "user:dashboard.days.thursday" | "user:dashboard.days.friday" | "user:dashboard.days.saturday"),
                    name: dashboard.user.name,
                  })}{" "}
                  👋
                </h1>
                {dashboard.weather && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full">
                    {getWeatherIcon(dashboard.weather.condition)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dashboard.weather.temperature}°C
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {dashboard.weather &&
                  `${t("user:dashboard.weather_in_city", {
                    description: dashboard.weather.description,
                  })} `}
                {t("user:dashboard.perfect_day")}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("user:dashboard.monthly_bookings")}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {dashboard.user.totalBookings} {t("user:dashboard.of")}{" "}
                    {dashboard.user.monthlyBookingLimit}
                  </span>
                </div>
                <Progress
                  value={
                    (dashboard.user.totalBookings /
                      dashboard.user.monthlyBookingLimit) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <p className="text-sm text-blue-600 dark:text-blue-400">
                {dashboard.user.nextBooking
                  ? t("user:dashboard.next_booking", {
                      facility: dashboard.user.nextBooking.facility,
                      date: dashboard.user.nextBooking.date,
                      time: dashboard.user.nextBooking.time,
                    })
                  : t("user:dashboard.no_upcoming_bookings")}
              </p>
            </div>
            <div className="ml-6">
              <PrimaryButton
                onClick={handleNewBooking}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("user:dashboard.new_booking")}
              </PrimaryButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("user:dashboard.quick_actions")}
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
                  onClick={() => navigate(action.path)}
                >
                  <div
                    className={`p-2 rounded-full ${action.color} text-white`}
                  >
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
              {t("user:dashboard.my_bookings")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <BookingFilters
                bookingFilter={dashboard.bookingFilter}
                onFilterChange={dashboard.setBookingFilter}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BookingList
            bookings={dashboard.filteredBookings}
            expandedBookings={dashboard.expandedBookings}
            onToggleExpansion={dashboard.toggleBookingExpansion}
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
            {t("user:dashboard.recommended_facilities")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.recommendedFacilities.map((facility) => (
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
                  image={facility.image}
                  description={facility.description}
                  availability={facility.availability}
                />
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
              {t("user:dashboard.system_messages.title")}
              {dashboard.unreadMessagesCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {dashboard.unreadMessagesCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <SystemMessageFilters
                messageFilter={dashboard.messageFilter}
                onFilterChange={dashboard.setMessageFilter}
                unreadMessagesCount={dashboard.unreadMessagesCount}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard.filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  message.isRead
                    ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                }`}
                onClick={() => dashboard.markMessageAsRead(message.id)}
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
                    <h4
                      className={`font-medium ${
                        message.isRead
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-900 dark:text-white font-semibold"
                      }`}
                    >
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
