"use client";

// External libraries
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, startOfWeek, isToday, isWeekend, isPast } from "date-fns";
import { nb } from "date-fns/locale";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";

// Internal libraries/utilities
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useSlotSelection } from "@/hooks/useSlotSelection";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

// Sibling imports
import { WeekNavigation } from "./WeekNavigation";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { AvailabilityLegend } from "./AvailabilityLegend";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingTypeSelector } from "@/components/booking/BookingTypeSelector";
import { RecurrencePatternSelector } from "@/components/booking/RecurrencePatternSelector";
import { StepByStepBooking } from "@/components/booking/StepByStepBooking";

// Types
import { ISelectedTimeSlot, IZone, BookingType } from "@/components/booking/types";
import type { RecurrencePattern } from "@/utils/recurrenceEngine";

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
 * @param props - Facility calendar props
 */
export interface IFacilityCalendarProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zones: readonly IZone[];
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly selectedSlots?: readonly ISelectedTimeSlot[];
  readonly onSlotClick?: (zoneId: string, date: Date, timeSlot: string, status: string) => void;
  readonly onBulkSlotSelection?: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus?: (zoneId: string, date: Date, timeSlot: string) => { status: string; conflict?: { readonly id: string; readonly title: string } };
  readonly isSlotSelected?: (zoneId: string, date: Date, timeSlot: string) => boolean;
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
  onAddToCart: externalOnAddToCart,
  onCompleteBooking: externalOnCompleteBooking,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  useStepByStepBooking = false,
}) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  // State for current week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  // State for selected zone
  const [selectedZoneId, setSelectedZoneId] = useState(zones?.[0]?.id || "");
  
  // State for recurrence
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>({
    type: 'weekly',
    weekdays: [1, 2, 3, 4, 5],
    timeSlots: ['09:00-11:00'],
    interval: 1
  });
  
  // Set default zone when zones are loaded
  useEffect(() => {
    if (zones && zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  /**
   * Check if a date is a Norwegian holiday
   * 
   * @param date - Date to check
   * @returns True if the date is a holiday
   */
  const checkIfHoliday = useCallback((date: Date): boolean => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    
    // Fixed holidays
    const fixedHolidays = [
      { month: 1, day: 1 },   // New Year's Day
      { month: 5, day: 1 },   // Labour Day
      { month: 5, day: 17 },  // Constitution Day
      { month: 12, day: 25 }, // Christmas Day
      { month: 12, day: 26 }, // Boxing Day
    ];
    
    // Check fixed holidays
    for (const holiday of fixedHolidays) {
      if (month === holiday.month && day === holiday.day) {
        return true;
      }
    }
    
    // Calculate Easter and related holidays
    const easter = calculateEaster(year);
    const easterHolidays = [
      addDays(easter, -2),  // Good Friday
      addDays(easter, 1),   // Easter Monday
      addDays(easter, 39),  // Ascension Day
      addDays(easter, 49),  // Whit Monday
    ];
    
    // Check Easter-related holidays
    for (const holiday of easterHolidays) {
      if (holiday.getFullYear() === year && 
          holiday.getMonth() + 1 === month && 
          holiday.getDate() === day) {
        return true;
      }
    }
    
    return false;
  }, []);

  /**
   * Get the name of a Norwegian holiday
   * 
   * @param date - Date to check
   * @returns Holiday name or undefined
   */
  const getHolidayName = useCallback((date: Date): string | undefined => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Fixed holidays
    const fixedHolidays: Record<string, string> = {
      '1-1': 'Nyttårsdag',
      '5-1': 'Arbeidernes dag',
      '5-17': 'Grunnlovsdag',
      '12-25': '1. juledag',
      '12-26': '2. juledag',
    };
    
    const key = `${month}-${day}`;
    if (fixedHolidays[key]) {
      return fixedHolidays[key];
    }
    
    // Calculate Easter and related holidays
    const easter = calculateEaster(year);
    const easterHolidays = [
      { date: addDays(easter, -2), name: 'Langfredag' },
      { date: addDays(easter, 1), name: '2. påskedag' },
      { date: addDays(easter, 39), name: 'Kristi himmelfartsdag' },
      { date: addDays(easter, 49), name: '2. pinsedag' },
    ];
    
    // Check Easter-related holidays
    for (const holiday of easterHolidays) {
      if (holiday.date.getFullYear() === year && 
          holiday.date.getMonth() + 1 === month && 
          holiday.date.getDate() === day) {
        return holiday.name;
      }
    }
    
    return undefined;
  }, []);

  /**
   * Calculate Easter date for a given year
   * 
   * @param year - Year to calculate Easter for
   * @returns Easter date
   */
  const calculateEaster = useCallback((year: number): Date => {
    // Algorithm to calculate Easter date
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = Math.floor((h + l - 7 * m + 114) / 31);
    const p = (h + l - 7 * m + 114) % 31;
    
    return new Date(year, n - 1, p + 1);
  }, []);
  
  // Use slot selection hook
  const {
    selectedSlots: internalSelectedSlots,
    recurringSlots,
    handleSlotClick: internalHandleSlotClick,
    handleBulkSlotSelection: internalHandleBulkSlotSelection,
    clearSelection: internalClearSelection,
    setSelectedSlots,
    generateRecurringSlots,
    clearRecurringSlots,
    getAllSlots,
  } = useSlotSelection();

  // Use external props if available, otherwise use internal state
  const selectedSlots = externalSelectedSlots || internalSelectedSlots;
  const handleSlotClick = externalOnSlotClick || internalHandleSlotClick;
  const handleBulkSlotSelection = externalOnBulkSlotSelection || internalHandleBulkSlotSelection;
  const clearSelection = internalClearSelection;
  
  // Get selected zone
  const selectedZone = zones?.find(zone => zone.id === selectedZoneId);
  

  /**
   * Handle slots change from BookingForm
   * 
   * @param slots - New array of selected slots
   */
  const handleSlotsChange = useCallback((slots: readonly ISelectedTimeSlot[]): void => {
    setSelectedSlots(slots);
  }, [setSelectedSlots]);

  // Update selected zone when zones change
  useEffect(() => {
    if (zones && zones.length > 0 && !selectedZone) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZone]);

  /**
   * Generate calendar week data
   * 
   * @returns Calendar week with days and time slots
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
        timeSlots: [], // Will be populated by TimeSlotGrid
      };
    });

    return {
      startDate: currentWeekStart,
      endDate: addDays(currentWeekStart, 6),
      days,
    };
  }, [currentWeekStart]);

  /**
   * Get all selected slots (regular + recurring)
   * Memoized for performance
   */
  const allSelectedSlots = useMemo(() => {
    if (!selectedZone) return [];
    
    const enrichedSlots = selectedSlots.map(slot => ({
      ...slot,
      facilityName,
      zoneName: selectedZone.name
    }));
    
    return enrichedSlots;
  }, [selectedSlots, facilityName, selectedZone?.id, selectedZone?.name]);

  // For step-by-step booking, we need to use the internal selectedSlots directly
  const stepByStepSelectedSlots = useStepByStepBooking ? selectedSlots : allSelectedSlots;

  /**
   * Handle time slot click with zone context
   * 
   * @param zoneId - Zone ID of the clicked slot
   * @param date - Date of the clicked slot
   * @param timeSlot - Time slot string
   * @param status - Current status of the slot
   */
  const handleSlotClickWithZone = useCallback((zoneId: string, date: Date, timeSlot: string, status: string): void => {
    if (status === "available" || status === "selected") {
      // Call the slot selection hook with proper parameters
      handleSlotClick(zoneId, date, timeSlot, status, facilityId, selectedZone?.pricePerHour || 0);
      
      // Update external selected slots if we're in step-by-step mode
      if (useStepByStepBooking) {
        const updatedSlots = [...stepByStepSelectedSlots];
        const existingIndex = updatedSlots.findIndex(slot => {
          // Convert slot.date to Date object if it's a string
          const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
          return slot.zoneId === zoneId && 
                 slotDate.toDateString() === date.toDateString() && 
                 slot.timeSlot === timeSlot;
        });
        
        if (existingIndex >= 0) {
          // Remove slot
          updatedSlots.splice(existingIndex, 1);
        } else {
          // Add slot
          // Calculate duration in minutes from timeSlot (e.g., "08:00-09:00" = 60 minutes)
          const [startTime, endTime] = timeSlot.split('-');
          const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
          const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
          const duration = endMinutes - startMinutes;
          
          const newSlot: ISelectedTimeSlot = {
            id: `${facilityId}-${zoneId}-${date.toISOString().split('T')[0]}-${timeSlot}`,
            facilityId,
            zoneId,
            date,
            timeSlot,
            duration: duration, // Duration in minutes
            pricePerHour: selectedZone?.pricePerHour || 0,
          };
          updatedSlots.push(newSlot);
        }
        
        handleSlotsChange(updatedSlots);
      }
    }
  }, [handleSlotClick, facilityId, selectedZone?.pricePerHour, useStepByStepBooking, stepByStepSelectedSlots, handleSlotsChange]);

  /**
   * Handle bulk slot selection with zone context
   * 
   * @param slots - Array of selected time slots
   */
  const handleBulkSelectWithZone = useCallback((slots: readonly ISelectedTimeSlot[]): void => {
    // Update slots with current zone context
    const updatedSlots: ISelectedTimeSlot[] = slots.map(slot => ({
      ...slot,
      facilityId: facilityId,
      pricePerHour: selectedZone?.pricePerHour || 0,
    }));
    
    handleBulkSlotSelection(updatedSlots);
    
    // Update external selected slots if we're in step-by-step mode
    if (useStepByStepBooking) {
      const currentSlots = [...stepByStepSelectedSlots];
      
      // For each slot in the drag selection, toggle its state
      updatedSlots.forEach(dragSlot => {
        const existingIndex = currentSlots.findIndex(existingSlot => {
          // Convert dates to Date objects if they're strings
          const existingDate = existingSlot.date instanceof Date ? existingSlot.date : new Date(existingSlot.date);
          const dragDate = dragSlot.date instanceof Date ? dragSlot.date : new Date(dragSlot.date);
          return existingSlot.zoneId === dragSlot.zoneId && 
                 existingDate.toDateString() === dragDate.toDateString() && 
                 existingSlot.timeSlot === dragSlot.timeSlot;
        });
        
        if (existingIndex >= 0) {
          // Remove slot if it already exists
          currentSlots.splice(existingIndex, 1);
        } else {
          // Add slot if it doesn't exist
          currentSlots.push(dragSlot);
        }
      });
      
      handleSlotsChange(currentSlots);
    }
  }, [facilityId, selectedZone?.pricePerHour, handleBulkSlotSelection, useStepByStepBooking, stepByStepSelectedSlots, handleSlotsChange]);

  /**
   * Handle previous week navigation
   */
  const handlePreviousWeek = useCallback((): void => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  }, []);

  /**
   * Handle next week navigation
   */
  const handleNextWeek = useCallback((): void => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  }, []);

  /**
   * Handle current week navigation
   */
  const handleCurrentWeek = useCallback((): void => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  /**
   * Calculate pricing for booking
   */
  const calculatePricing = useCallback((slots: ISelectedTimeSlot[]): {
    readonly basePrice: number;
    readonly vatRate: number;
    readonly vatAmount: number;
    readonly finalPrice: number;
  } => {
    // slot.duration is stored in minutes; convert to hours for pricing
    const basePrice = slots.reduce((total, slot) => {
      const durationHours = (slot.duration ?? 60) / 60;
      return total + (slot.pricePerHour * durationHours);
    }, 0);
    
    const vatRate = 0.25;
    const vatAmount = basePrice * vatRate;
    const finalPrice = basePrice + vatAmount;
    
    return { basePrice, vatRate, vatAmount, finalPrice };
  }, []);

  /**
   * Create cart item from booking data
   */
  const createCartItem = useCallback((bookingData: {
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern?: RecurrencePattern | null;
  }, pricing: {
    readonly basePrice: number;
    readonly vatRate: number;
    readonly vatAmount: number;
    readonly finalPrice: number;
  }, slotsToUse: readonly ISelectedTimeSlot[]): {
    readonly facilityId: string;
    readonly facilityName: string;
    readonly zoneId: string;
    readonly zoneName: string;
    readonly timeSlots: ISelectedTimeSlot[];
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern: RecurrencePattern | null;
    readonly pricing: {
      readonly basePrice: number;
      readonly totalPrice: number;
      readonly vatAmount: number;
      readonly finalPrice: number;
    };
  } => {
    if (!selectedZone) throw new Error("No zone selected");
    
    // Use recurrencePattern from bookingData if available, otherwise use the component state
    const patternToUse = bookingData.recurrencePattern !== undefined 
      ? bookingData.recurrencePattern 
      : recurrencePattern;
    
    return {
      facilityId,
      facilityName,
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      timeSlots: slotsToUse,
      purpose: bookingData.purpose,
      attendees: bookingData.attendees,
      activityType: bookingData.activityType,
      additionalInfo: bookingData.additionalInfo,
      actorType: bookingData.actorType,
      bookingType: bookingData.bookingType,
      recurrencePattern: patternToUse,
      pricing: {
        basePrice: pricing.basePrice,
        totalPrice: pricing.basePrice,
        vatAmount: pricing.vatAmount,
        finalPrice: pricing.finalPrice,
      },
      status: 'pending' as const, // Set status to pending for new bookings
    };
  }, [selectedZone, facilityId, facilityName, recurrencePattern]);

  /**
   * Handle add to cart
   * 
   * @param bookingData - Booking form data
   */
  const handleAddToCart = useCallback((bookingData: {
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern?: RecurrencePattern | null;
    readonly recurringSlots?: readonly ISelectedTimeSlot[];
  }): void => {
    try {
      if (!selectedZone) return;
      
      // Use recurring slots if available, otherwise use selected slots
      const slotsToUse = bookingData.recurringSlots && bookingData.recurringSlots.length > 0 
        ? bookingData.recurringSlots 
        : allSelectedSlots;
      
      // For recurring bookings, calculate pricing for all slots
      const pricing = calculatePricing(slotsToUse);
      const cartItem = createCartItem(bookingData, pricing, slotsToUse);
      
      addItem(cartItem);
      clearSelection();
      clearRecurringSlots();
      toast.success("Booking lagt til i kurven!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "En feil oppstod ved lagring";
      toast.error(`Kunne ikke legge til i kurv: ${errorMessage}`);
    }
  }, [selectedZone, allSelectedSlots, calculatePricing, createCartItem, addItem, clearSelection, clearRecurringSlots, recurrencePattern]);

  /**
   * Handle booking type change
   * 
   * @param type - New booking type
   */
  const handleBookingTypeChange = useCallback((type: BookingType): void => {
    // Clear recurring slots when switching to one-time
    if (type === 'one-time') {
      clearRecurringSlots();
    }
  }, [clearRecurringSlots]);

  /**
   * Handle recurrence pattern change
   * 
   * @param pattern - New recurrence pattern
   */
  const handleRecurrencePatternChange = useCallback((pattern: RecurrencePattern | null): void => {
    if (pattern) {
      setRecurrencePattern(pattern);
      
      if (selectedZone) {
        // Generate recurring slots based on the pattern
        generateRecurringSlots(
          pattern,
          new Date(), // Start from today
          selectedZone.id,
          facilityId,
          selectedZone.pricePerHour,
          pattern.maxOccurrences || 52
        );
      }
    } else {
      clearRecurringSlots();
    }
  }, [selectedZone, generateRecurringSlots, clearRecurringSlots, facilityId]);

  /**
   * Handle complete booking
   * 
   * @param bookingData - Booking form data
   */
  const handleCompleteBooking = (bookingData: {
    readonly purpose: string;
    readonly attendees: number;
    readonly activityType: string;
    readonly additionalInfo: string;
    readonly actorType: string;
    readonly bookingType: BookingType;
    readonly recurrencePattern?: RecurrencePattern | null;
    readonly recurringSlots?: readonly ISelectedTimeSlot[];
  }): void => {
    try {
      if (!selectedZone) return;
      
      // Use recurring slots if available, otherwise use selected slots
      const slotsToUse = bookingData.recurringSlots && bookingData.recurringSlots.length > 0 
        ? bookingData.recurringSlots 
        : allSelectedSlots;
      
      // For recurring bookings, calculate pricing for all slots
      const pricing = calculatePricing(slotsToUse);
      const cartItem = createCartItem(bookingData, pricing, slotsToUse);
      
      addItem(cartItem);
      clearSelection();
      clearRecurringSlots();
      toast.success("Booking lagt til i kurven!");
      
      // Navigate to checkout using React Router
      navigate("/checkout");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "En feil oppstod ved lagring";
      toast.error(`Kunne ikke fullføre booking: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Laster kalender...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-500">Feil: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!zones || zones.length === 0) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Ingen soner tilgjengelig for denne fasiliteten.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedZone) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Laster soner...</p>
          </div>
        </div>
      </div>
    );
  }

  // If step-by-step booking is enabled, render StepByStepBooking component
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
            calendarWeek={calendarWeek}
            onSlotClick={handleSlotClickWithZone}
            onBulkSlotSelection={handleBulkSelectWithZone}
            getAvailabilityStatus={externalGetAvailabilityStatus}
            isSlotSelected={externalIsSlotSelected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="w-full px-4">
        <div className="space-y-6">
          {/* Zone Selection and Booking Type */}
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3 flex-1">
                  {zones?.map((zone) => (
                    <Button
                      key={zone.id}
                      variant={selectedZoneId === zone.id ? "default" : "outline"}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className="flex items-center gap-2 text-base px-4 py-2"
                      size="lg"
                    >
                      <Users className="h-4 w-4" />
                      {zone.name}
                      <Badge variant="secondary" className="ml-1 text-sm">
                        {zone.area ? `${zone.area} m²` : "120 m²"}
                      </Badge>
                    </Button>
                  ))}
                </div>
                
                {/* Booking Type Selector - Moved to top right */}
                <div className="flex gap-2">
                  <BookingTypeSelector
                    selectedType="one-time"
                    onTypeChange={handleBookingTypeChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 60/40 Layout for Calendar and Booking Form */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Calendar (60%) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Week Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePreviousWeek} size="lg">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Forrige uke
                </Button>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">
                    {format(currentWeekStart, 'dd. MMMM', { locale: nb })} - {format(addDays(currentWeekStart, 6), 'dd. MMMM yyyy', { locale: nb })}
                  </h3>
                </div>
                <Button variant="outline" onClick={handleNextWeek} size="lg">
                  Neste uke
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <Card>
                <CardContent className="p-4">
                  <TimeSlotGrid
                    facilityId={facilityId}
                    zoneId={selectedZone.id}
                    week={calendarWeek}
                    selectedSlots={allSelectedSlots}
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
                </CardContent>
              </Card>

              {/* Legend */}
              <AvailabilityLegend />
            </div>

            {/* Right Column - Booking Form (40%) */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
                {/* Recurrence Pattern Selector (only for recurring bookings) */}
                {false && (
                  <RecurrencePatternSelector
                    pattern={recurrencePattern}
                    onPatternChange={handleRecurrencePatternChange}
                  />
                )}
                
                {selectedZone && (
                  <BookingForm
                    facilityId={facilityId}
                    facilityName={facilityName}
                    zoneId={selectedZone.id}
                    selectedSlots={allSelectedSlots}
                    onSlotsChange={handleSlotsChange}
                    onAddToCart={handleAddToCart}
                    onCompleteBooking={handleCompleteBooking}
                    isLoading={isLoading}
                    error={error}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilityCalendar;
