"use client";

// External libraries
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  addDays,
  startOfWeek,
  isToday,
  isWeekend,
  isPast,
} from "date-fns";

// Internal hooks
import { useSlotSelection } from "@/components/features/bookings/hooks";
import {
  useHolidayCalculation,
  useCalendarPricing,
  useRecurrenceHandler,
  useBookingCoordination,
} from "@/hooks/features/calendar";

// Sub-components
import { StepByStepBooking } from "@/components/features/bookings/components/StepByStepBooking";
import { CalendarRenderer } from "./components/CalendarRenderer";
import { BookingFormPanel } from "./components/BookingFormPanel";

// Types
import {
  ISelectedTimeSlot,
  IZone,
  IBookingFormData,
  BookingType,
} from "@/components/features/bookings/types";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";

/**
 * Facility calendar component
 *
 * Main calendar component that combines time slot selection
 * with booking functionality. Provides a complete booking
 * experience with calendar view and booking form.
 *
 * Features:
 * - Week-based calendar view
 * - Time slot selection
 * - Real-time booking form
 * - Price calculation
 * - Cart integration
 * - Responsive design
 * - Loading states
 *
 * Refactored to use custom hooks and sub-components for
 * better separation of concerns and maintainability.
 */
export interface IFacilityCalendarProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zones: readonly IZone[];
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly selectedSlots?: readonly ISelectedTimeSlot[];
  readonly onSlotClick?: (
    zoneId: string,
    date: Date,
    timeSlot: string,
    status: string
  ) => void;
  readonly onBulkSlotSelection?: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus?: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => {
    status: string;
    conflict?: { readonly id: string; readonly title: string };
  };
  readonly isSlotSelected?: (
    zoneId: string,
    date: Date,
    timeSlot: string
  ) => boolean;
  readonly onAddToCart?: (bookingData: IBookingFormData) => void;
  readonly onCompleteBooking?: (bookingData: IBookingFormData) => void;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly useStepByStepBooking?: boolean;
}

export const FacilityCalendar: React.FC<IFacilityCalendarProps> = ({
  facilityId,
  facilityName,
  zones,
  isLoading = false,
  error,
  selectedSlots: externalSelectedSlots,
  onSlotClick: externalOnSlotClick,
  onBulkSlotSelection: externalOnBulkSlotSelection,
  getAvailabilityStatus: externalGetAvailabilityStatus,
  isSlotSelected: externalIsSlotSelected,
   
  onAddToCart: _externalOnAddToCart,
   
  onCompleteBooking: _externalOnCompleteBooking,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  useStepByStepBooking = false,
}) => {
  const { t } = useTranslation("calendar");

  // State for current week
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // State for selected zone
  const [selectedZoneId, setSelectedZoneId] = useState(zones?.[0]?.id || "");

  // Custom hooks
  const { checkIfHoliday, getHolidayName } = useHolidayCalculation();
  const { calculatePricing, 
     
    formatPrice: _formatPrice } = useCalendarPricing();
  const {
    pattern: recurrencePattern,
    setPattern: setRecurrencePattern,
    generateRecurringSlots,
     
    clearPattern: _clearRecurrencePattern,
  } = useRecurrenceHandler();

  // Slot selection hook
  const {
    selectedSlots: internalSelectedSlots,
     
    recurringSlots: _recurringSlots,
    handleSlotClick: internalHandleSlotClick,
    handleBulkSlotSelection: internalHandleBulkSlotSelection,
    clearSelection: internalClearSelection,
    setSelectedSlots,
    clearRecurringSlots,
  } = useSlotSelection();

  // Get selected zone
  const selectedZone = zones?.find((zone) => zone.id === selectedZoneId);

  // Booking coordination hook
  const {
    handleAddToCart: coordinatedAddToCart,
    handleCompleteBooking: coordinatedCompleteBooking,
    handleSlotClickCoordination,
    handleBulkSelectCoordination,
  } = useBookingCoordination({
    facilityId,
    facilityName,
    selectedZone,
    recurrencePattern,
    t: t as unknown as (key: string) => string,
  });

  // Use external props if available, otherwise use internal state
  const selectedSlots = externalSelectedSlots || internalSelectedSlots;
  const handleSlotClick = externalOnSlotClick || internalHandleSlotClick;
  const handleBulkSlotSelection =
    externalOnBulkSlotSelection || internalHandleBulkSlotSelection;
  const clearSelection = internalClearSelection;

  // Set default zone when zones are loaded
  useEffect(() => {
    if (zones && zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  /**
   * Handle slots change from BookingForm
   */
  const handleSlotsChange = useCallback(
    (slots: readonly ISelectedTimeSlot[]): void => {
      setSelectedSlots(slots);
    },
    [setSelectedSlots]
  );

  /**
   * Generate calendar week data with holiday information
   */
  const calendarWeek = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(currentWeekStart, i);
      return {
        date,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        isHoliday: checkIfHoliday(date),
        holidayName: getHolidayName(date),
        isPast: isPast(date),
        timeSlots: [],
      };
    });

    return {
      startDate: currentWeekStart,
      endDate: addDays(currentWeekStart, 6),
      days,
    };
  }, [currentWeekStart, checkIfHoliday, getHolidayName]);

  /**
   * Get all selected slots with facility context
   */
  const allSelectedSlots = useMemo(() => {
    if (!selectedZone) return [];

    const enrichedSlots = selectedSlots.map((slot) => ({
      ...slot,
      facilityName,
      zoneName: selectedZone.name,
    }));

    return enrichedSlots;
  }, [selectedSlots, facilityName, selectedZone]);

  // For step-by-step booking
  const stepByStepSelectedSlots = useStepByStepBooking
    ? selectedSlots
    : allSelectedSlots;

  /**
   * Handle time slot click with zone context
   */
  const handleSlotClickWithZone = useCallback(
    (zoneId: string, date: Date, timeSlot: string, status: string): void => {
      handleSlotClickCoordination(
        zoneId,
        date,
        timeSlot,
        status,
        handleSlotClick,
        stepByStepSelectedSlots,
        handleSlotsChange,
        useStepByStepBooking,
        selectedZone?.pricePerHour || 0
      );
    },
    [
      handleSlotClickCoordination,
      handleSlotClick,
      stepByStepSelectedSlots,
      handleSlotsChange,
      useStepByStepBooking,
      selectedZone?.pricePerHour,
    ]
  );

  /**
   * Handle bulk slot selection with zone context
   */
  const handleBulkSelectWithZone = useCallback(
    (slots: readonly ISelectedTimeSlot[]): void => {
      handleBulkSelectCoordination(
        slots,
        handleBulkSlotSelection,
        stepByStepSelectedSlots,
        handleSlotsChange,
        useStepByStepBooking,
        selectedZone?.pricePerHour || 0
      );
    },
    [
      handleBulkSelectCoordination,
      handleBulkSlotSelection,
      stepByStepSelectedSlots,
      handleSlotsChange,
      useStepByStepBooking,
      selectedZone?.pricePerHour,
    ]
  );

  /**
   * Week navigation handlers
   */
  const handlePreviousWeek = useCallback((): void => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback((): void => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(
    (bookingData: IBookingFormData): void => {
      const slotsToUse =
        bookingData.recurringSlots && bookingData.recurringSlots.length > 0
          ? bookingData.recurringSlots
          : allSelectedSlots;

      const pricing = calculatePricing(
        slotsToUse,
        bookingData.actorType,
        bookingData.activityType
      );

      coordinatedAddToCart(
        {
          purpose: bookingData.purpose,
          attendees: bookingData.attendees,
          activityType: bookingData.activityType,
          additionalInfo: bookingData.additionalInfo || "",
          actorType: bookingData.actorType,
          bookingType: bookingData.bookingType,
          recurrencePattern: bookingData.recurrencePattern,
          recurringSlots: bookingData.recurringSlots,
        },
        allSelectedSlots,
        pricing,
        clearSelection,
        clearRecurringSlots
      );
    },
    [
      allSelectedSlots,
      calculatePricing,
      coordinatedAddToCart,
      clearSelection,
      clearRecurringSlots,
    ]
  );

  /**
   * Handle add to cart for BookingFormPanel (without termsAccepted)
   */
  const handleAddToCartForPanel = useCallback(
    (bookingData: {
      readonly purpose: string;
      readonly attendees: number;
      readonly activityType: string;
      readonly additionalInfo: string;
      readonly actorType: string;
      readonly bookingType: BookingType;
      readonly recurrencePattern?: RecurrencePattern | null;
      readonly recurringSlots?: readonly ISelectedTimeSlot[];
    }): void => {
      handleAddToCart({
        ...bookingData,
        termsAccepted: false,
      } as IBookingFormData);
    },
    [handleAddToCart]
  );

  /**
   * Handle complete booking
   */
  const handleCompleteBooking = useCallback(
    (bookingData: IBookingFormData): void => {
      const slotsToUse =
        bookingData.recurringSlots && bookingData.recurringSlots.length > 0
          ? bookingData.recurringSlots
          : allSelectedSlots;

      const pricing = calculatePricing(
        slotsToUse,
        bookingData.actorType,
        bookingData.activityType
      );

      coordinatedCompleteBooking(
        {
          purpose: bookingData.purpose,
          attendees: bookingData.attendees,
          activityType: bookingData.activityType,
          additionalInfo: bookingData.additionalInfo || "",
          actorType: bookingData.actorType,
          bookingType: bookingData.bookingType,
          recurrencePattern: bookingData.recurrencePattern,
          recurringSlots: bookingData.recurringSlots,
        },
        allSelectedSlots,
        pricing,
        clearSelection,
        clearRecurringSlots
      );
    },
    [
      allSelectedSlots,
      calculatePricing,
      coordinatedCompleteBooking,
      clearSelection,
      clearRecurringSlots,
    ]
  );

  /**
   * Handle complete booking for BookingFormPanel (without termsAccepted)
   */
  const handleCompleteBookingForPanel = useCallback(
    (bookingData: {
      readonly purpose: string;
      readonly attendees: number;
      readonly activityType: string;
      readonly additionalInfo: string;
      readonly actorType: string;
      readonly bookingType: BookingType;
      readonly recurrencePattern?: RecurrencePattern | null;
      readonly recurringSlots?: readonly ISelectedTimeSlot[];
    }): void => {
      handleCompleteBooking({
        ...bookingData,
        termsAccepted: false,
      } as IBookingFormData);
    },
    [handleCompleteBooking]
  );

  /**
   * Handle booking type change
   */
  const handleBookingTypeChange = useCallback(
    (type: BookingType): void => {
      if (type === "one-time") {
        clearRecurringSlots();
      }
    },
    [clearRecurringSlots]
  );

  /**
   * Handle recurrence pattern change
   */
  const handleRecurrencePatternChange = useCallback(
    (pattern: RecurrencePattern | null): void => {
      if (pattern && selectedZone) {
        setRecurrencePattern(pattern);
        generateRecurringSlots(
          pattern,
          new Date(),
          selectedZone.id,
          facilityId,
          selectedZone.pricePerHour,
          pattern.maxOccurrences || 52
        );
      } else {
        clearRecurringSlots();
      }
    },
    [
      selectedZone,
      generateRecurringSlots,
      clearRecurringSlots,
      facilityId,
      setRecurrencePattern,
    ]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">{t("loading.calendar")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500">
              {t("messages.error_prefix")}: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No zones state
  if (!zones || zones.length === 0) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">{t("messages.no_zones_available")}</p>
          </div>
        </div>
      </div>
    );
  }

  // No selected zone state
  if (!selectedZone) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">{t("loading.zones")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Step-by-step booking mode
  if (useStepByStepBooking) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="w-full px-4">
          <StepByStepBooking
            facilityId={facilityId}
            facilityName={facilityName}
            zones={zones}
            selectedZoneId={selectedZoneId}
            onZoneChange={setSelectedZoneId}
            selectedSlots={stepByStepSelectedSlots}
            onSlotsChange={handleSlotsChange}
            onAddToCart={handleAddToCart}
            onCompleteBooking={handleCompleteBooking}
            isLoading={isLoading}
            error={error}
            openingHoursStart={openingHoursStart}
            openingHoursEnd={openingHoursEnd}
            calendarWeek={{
              start: calendarWeek.startDate,
              end: calendarWeek.endDate
            }}
            onSlotClick={handleSlotClickWithZone}
            onBulkSlotSelection={handleBulkSelectWithZone}
            getAvailabilityStatus={externalGetAvailabilityStatus}
            isSlotSelected={externalIsSlotSelected}
          />
        </div>
      </div>
    );
  }

  // Standard calendar view
  return (
    <div className="bg-gray-50 py-8">
      <div className="w-full px-4">
        <div className="space-y-6">
          {/* 60/40 Layout for Calendar and Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Calendar (60%) */}
            <div className="lg:col-span-3">
              <CalendarRenderer
                facilityId={facilityId}
                zones={zones}
                selectedZoneId={selectedZoneId}
                onZoneChange={setSelectedZoneId}
                calendarWeek={calendarWeek}
                currentWeekStart={currentWeekStart}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
                selectedSlots={selectedSlots}
                onSlotClick={handleSlotClickWithZone}
                onBulkSelect={handleBulkSelectWithZone}
                pricePerHour={selectedZone?.pricePerHour || 0}
                isLoading={isLoading}
                error={error}
                getAvailabilityStatus={externalGetAvailabilityStatus}
                isSlotSelected={externalIsSlotSelected}
                openingHoursStart={openingHoursStart}
                openingHoursEnd={openingHoursEnd}
              />
            </div>

            {/* Right Column - Booking Form (40%) */}
            <div className="lg:col-span-2">
              <BookingFormPanel
                facilityId={facilityId}
                facilityName={facilityName}
                zoneId={selectedZone.id}
                selectedSlots={allSelectedSlots}
                onSlotsChange={handleSlotsChange}
                onAddToCart={handleAddToCartForPanel}
                onCompleteBooking={handleCompleteBookingForPanel}
                isLoading={isLoading}
                error={error}
                bookingType="one-time"
                onBookingTypeChange={handleBookingTypeChange}
                recurrencePattern={recurrencePattern}
                onRecurrencePatternChange={handleRecurrencePatternChange}
                showRecurrenceSelector={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCalendar;