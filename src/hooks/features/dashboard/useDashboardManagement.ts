/**
 * Dashboard Management Hook
 *
 * Clean architecture hook that handles all dashboard business logic:
 * - User data loading from Supabase
 * - Booking statistics and filtering
 * - Recommended facilities mapping
 * - System messages management
 * - Weather data simulation
 *
 * This hook extracts all business logic from the UserDashboard component,
 * making the component a pure presentation layer.
 *
 * @example
 * ```tsx
 * function UserDashboard() {
 *   const dashboard = useDashboardManagement(orgId);
 *
 *   return (
 *     <div>
 *       <h1>Welcome {dashboard.user.name}</h1>
 *       <BookingList bookings={dashboard.filteredBookings} />
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { usePublishedFacilities } from "@/services/supabase/facilities.service";
import { useUserBookings } from "@/services/supabase/bookings.service";
import { useAuth } from "@/contexts/hooks";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface IUserData {
  readonly name: string;
  readonly totalBookings: number;
  readonly monthlyBookingLimit: number;
  readonly nextBooking: {
    readonly facility: string;
    readonly date: string;
    readonly time: string;
  } | null;
}

interface IWeatherData {
  readonly temperature: number;
  readonly condition: "sunny" | "cloudy" | "rainy" | "snowy";
  readonly description: string;
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
  readonly slug?: string;
}

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

export interface IUseDashboardManagementReturn {
  readonly user: IUserData;
  readonly weather: IWeatherData | null;
  readonly recommendedFacilities: readonly IUserFacility[];
  readonly userBookings: readonly IUserBooking[];
  readonly systemMessages: readonly ISystemMessage[];
  readonly filteredBookings: readonly IUserBooking[];
  readonly filteredMessages: readonly ISystemMessage[];
  readonly unreadMessagesCount: number;
  readonly facilitiesLoading: boolean;
  readonly bookingsLoading: boolean;
  readonly bookingFilter: string;
  readonly messageFilter: string;
  readonly expandedBookings: Set<string>;
  readonly setBookingFilter: (filter: string) => void;
  readonly setMessageFilter: (filter: string) => void;
  readonly toggleBookingExpansion: (id: string) => void;
  readonly markMessageAsRead: (id: string) => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Dashboard management hook
 *
 * @param orgId - Organization ID for fetching facilities
 * @returns Complete dashboard state and handlers
 */
export const useDashboardManagement = (
  orgId: string
): IUseDashboardManagementReturn => {
  const { t } = useTranslation(["common", "user", "booking"]);
  const { user: authUser } = useAuth();

  // State management
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [messageFilter, setMessageFilter] = useState<string>("all");
  const [expandedBookings, setExpandedBookings] = useState<Set<string>>(
    new Set()
  );
  const [weather, setWeather] = useState<IWeatherData | null>(null);

  // Fetch data from Supabase
  const { data: facilities = [], isLoading: facilitiesLoading } =
    usePublishedFacilities(orgId);

  const { data: bookingsData = [], isLoading: bookingsLoading } =
    useUserBookings(authUser?.id || "", !!authUser?.id);

  // ============================================================================
  // User Data Loading
  // ============================================================================

  /**
   * Calculate user data from Supabase bookings
   * Includes total bookings count and next upcoming booking
   */
  const user: IUserData = useMemo(() => {
    try {
      // Find next upcoming paid/confirmed booking
      const now = new Date();
      const upcomingBookings = bookingsData
        .filter((booking) => {
          const bookingDate = new Date(booking.starts_at);
          return bookingDate >= now &&
                 (booking.status === "paid" || booking.status === "completed");
        })
        .sort((a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
        );

      const nextBooking = upcomingBookings[0];

      return {
        name: t("user:dashboard.default_username"),
        totalBookings: bookingsData.length,
        monthlyBookingLimit: 5,
        nextBooking: nextBooking
          ? {
              facility:
                nextBooking.facility?.name ||
                t("user:dashboard.unknown_facility"),
              date: new Date(nextBooking.starts_at).toLocaleDateString(
                "nb-NO",
                { day: "2-digit", month: "2-digit" }
              ),
              time: new Date(nextBooking.starts_at).toLocaleTimeString(
                "nb-NO",
                { hour: "2-digit", minute: "2-digit" }
              ),
            }
          : null,
      };
    } catch (error) {
      console.error("Error calculating user data:", error);
      return {
        name: t("user:dashboard.default_username"),
        totalBookings: 0,
        monthlyBookingLimit: 5,
        nextBooking: null,
      };
    }
  }, [bookingsData, t]);

  // ============================================================================
  // Bookings Loading
  // ============================================================================

  /**
   * Load recent bookings from Supabase
   * Converts Supabase data to dashboard format
   */
  const userBookings: readonly IUserBooking[] = useMemo(() => {
    try {
      // Get recent bookings (last 3)
      const recentBookings = [...bookingsData]
        .sort(
          (a, b) =>
            new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
        )
        .slice(0, 3);

      return recentBookings.map((booking) => {
        // Calculate duration
        const startTime = new Date(booking.starts_at);
        const endTime = new Date(booking.ends_at);
        const durationHours = Math.round(
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        );

        // Map Supabase status to dashboard status
        let status: "confirmed" | "pending" | "cancelled";
        if (booking.status === "paid" || booking.status === "completed") {
          status = "confirmed";
        } else if (booking.status === "cancelled" || booking.status === "expired" || booking.status === "refunded") {
          status = "cancelled";
        } else {
          status = "pending";
        }

        return {
          id: booking.id,
          facility:
            booking.facility?.name || t("user:dashboard.unknown_facility"),
          date: booking.starts_at.split("T")[0],
          time: startTime.toLocaleTimeString("nb-NO", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          duration: `${durationHours} ${durationHours === 1 ? "time" : "timer"}`,
          status,
          location:
            booking.facility?.name || t("user:dashboard.unknown_facility"),
          price: `${(booking.total_cents || 0) / 100} ${booking.currency || "kr"}`,
          purpose: booking.notes || t("user:bookings.not_specified"),
          participants: [t("user:dashboard.default_username")],
          qrCode: `QR${booking.id.slice(-6)}`,
          cancellationPolicy: t("user:bookings.cancellation_policy"),
          contactInfo: {
            phone: "+47 123 45 678",
            email: "admin@drammen.no",
          },
        };
      });
    } catch (error) {
      console.error("Error loading recent bookings:", error);
      return [];
    }
  }, [bookingsData, t]);

  // ============================================================================
  // Recommended Facilities
  // ============================================================================

  /**
   * Map published facilities to dashboard format
   * First 3 facilities with recommendation reasons
   */
  const recommendedFacilities: readonly IUserFacility[] = useMemo(() => {
    return facilities.slice(0, 3).map((facility, index) => {
      // Type guard for amenities - filter out non-string values
      let amenitiesArray: string[] = [];
      if (Array.isArray(facility.amenities)) {
        amenitiesArray = (facility.amenities as unknown[]).filter(
          (item): item is string => typeof item === 'string'
        );
      }
      
      // Type guard for images
      let imagesArray: string[] = [];
      if (Array.isArray(facility.images)) {
        imagesArray = (facility.images as unknown[]).filter(
          (item): item is string => typeof item === 'string'
        );
      }

      // Access price with type assertion since it's not in the type definition
      const facilityWithPrice = facility as typeof facility & { price_per_hour_cents?: number };

      return {
        id: facility.id,
        name: facility.name,
        description: facility.description || "",
        type: facility.facility_type || "",
        location: facility.city || "",
        address: facility.address || "",
        capacity: facility.capacity || 0,
        amenities: amenitiesArray,
        image: imagesArray[0] || "/placeholder.svg",
        rating: 0,
        price: `${(facilityWithPrice.price_per_hour_cents || 0) / 100} kr/time`,
        availability: "available" as const,
        recommendationReason:
          index === 0
            ? t("user:recommendations.frequent_bookings")
            : index === 1
            ? t("user:recommendations.preferred_times")
            : t("user:recommendations.new_in_area"),
        isFrequentlyBooked: index === 0,
        matchesPreferredTimes: index === 1,
        isNewInArea: index === 2,
        slug: facility.slug,
      };
    });
  }, [facilities, t]);

  // ============================================================================
  // System Messages
  // ============================================================================

  /**
   * Static system messages
   * In production, this would come from an API
   */
  const systemMessages: readonly ISystemMessage[] = useMemo(
    () => [
      {
        id: "1",
        title: t("user:dashboard.system_messages.booking_updated"),
        message: t("user:dashboard.system_messages.booking_updated_desc", {
          facility: "Solberghallen",
        }),
        type: "info" as const,
        date: "2024-01-19T10:30:00Z",
        isRead: false,
        category: "booking" as const,
      },
      {
        id: "2",
        title: t("user:dashboard.system_messages.new_regulation"),
        message: t("user:dashboard.system_messages.new_regulation_desc"),
        type: "warning" as const,
        date: "2024-01-18T14:15:00Z",
        isRead: false,
        category: "system" as const,
      },
      {
        id: "3",
        title: t("user:dashboard.system_messages.maintenance"),
        message: t("user:dashboard.system_messages.maintenance_desc"),
        type: "maintenance" as const,
        date: "2024-01-17T16:45:00Z",
        isRead: true,
        category: "system" as const,
      },
      {
        id: "4",
        title: t("user:dashboard.system_messages.booking_confirmed"),
        message: t("user:dashboard.system_messages.booking_confirmed_desc", {
          facility: "Drammen Idrettshall",
        }),
        type: "success" as const,
        date: "2024-01-20T09:00:00Z",
        isRead: false,
        category: "booking" as const,
      },
    ],
    [t]
  );

  // ============================================================================
  // Weather Simulation
  // ============================================================================

  /**
   * Simulate weather data fetch
   * In production, this would call a weather API
   */
  useEffect(() => {
    setWeather({
      temperature: 8,
      condition: "cloudy",
      description: t("user:dashboard.weather.cloudy"),
    });
  }, [t]);

  // ============================================================================
  // Filtering Logic
  // ============================================================================

  /**
   * Filter bookings by status
   */
  const filteredBookings = useMemo(
    () =>
      userBookings.filter(
        (booking) => bookingFilter === "all" || booking.status === bookingFilter
      ),
    [userBookings, bookingFilter]
  );

  /**
   * Filter messages by category
   */
  const filteredMessages = useMemo(
    () =>
      systemMessages.filter(
        (message) =>
          messageFilter === "all" || message.category === messageFilter
      ),
    [systemMessages, messageFilter]
  );

  /**
   * Calculate unread messages count
   */
  const unreadMessagesCount = useMemo(
    () => systemMessages.filter((message) => !message.isRead).length,
    [systemMessages]
  );

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Toggle booking expansion state
   */
  const toggleBookingExpansion = useCallback((bookingId: string): void => {
    setExpandedBookings((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(bookingId)) {
        newExpanded.delete(bookingId);
      } else {
        newExpanded.add(bookingId);
      }
      return newExpanded;
    });
  }, []);

  /**
   * Mark message as read
   * In production, this would call an API
   */
  const markMessageAsRead = useCallback((_id: string): void => {
    // Mark message as read in local state
    // In a real app, this would call an API
  }, []);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    user,
    weather,
    recommendedFacilities,
    userBookings,
    systemMessages,
    filteredBookings,
    filteredMessages,
    unreadMessagesCount,
    facilitiesLoading,
    bookingsLoading,
    bookingFilter,
    messageFilter,
    expandedBookings,
    setBookingFilter,
    setMessageFilter,
    toggleBookingExpansion,
    markMessageAsRead,
  };
};
