"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek, isToday, isWeekend, isPast } from "date-fns";
import { nb } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeekNavigation } from "./WeekNavigation";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { AvailabilityLegend } from "./AvailabilityLegend";
import { BookingForm } from "@/components/booking/BookingForm";
import { BookingTypeSelector } from "@/components/booking/BookingTypeSelector";
import { RecurrencePatternSelector } from "@/components/booking/RecurrencePatternSelector";
import { ISelectedTimeSlot, ActorType, ActivityType, IZone, BookingType } from "@/components/booking/types";
import type { RecurrencePattern } from "@/utils/recurrenceEngine";
import { useCart } from "@/contexts/CartContext";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useSlotSelection } from "@/hooks/useSlotSelection";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

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
}

export const FacilityCalendar: React.FC<IFacilityCalendarProps> = ({
  facilityId,
  facilityName,
  zones,
  isLoading = false,
  error,
}) => {
  const { addItem } = useCart();
  
  // State for current week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  
  // State for selected zone
  const [selectedZoneId, setSelectedZoneId] = useState(zones?.[0]?.id || "");
  
  // State for booking type and recurrence
  const [bookingType, setBookingType] = useState<BookingType>('one-time');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>({
    type: 'weekly',
    weekdays: [1, 2, 3, 4, 5],
    timeSlots: ['09:00-11:00'],
    interval: 1
  });
  
  // Set default zone when zones are loaded
  useEffect(() => {
    if (zones && zones.length > 0) {
      if (!selectedZoneId) {
        console.log("Setting default zone:", zones[0].id, "with price:", zones[0].pricePerHour);
        setSelectedZoneId(zones[0].id);
      } else {
        console.log("Zone already selected:", selectedZoneId);
      }
    }
  }, [zones, selectedZoneId]);
  
  // Use slot selection hook
  const {
    selectedSlots,
    recurringSlots,
    handleSlotClick,
    handleBulkSlotSelection,
    clearSelection,
    setSelectedSlots,
    generateRecurringSlots,
    clearRecurringSlots,
    getAllSlots,
  } = useSlotSelection();
  
  // Get selected zone
  const selectedZone = zones?.find(zone => zone.id === selectedZoneId);
  
  // Debug logging
  console.log("Selected zone ID:", selectedZoneId);
  console.log("Selected zone found:", !!selectedZone);
  console.log("Selected zone:", selectedZone);
  console.log("Selected zone pricePerHour:", selectedZone?.pricePerHour);
  console.log("Zones count:", zones?.length);
  console.log("Zones[0] pricePerHour:", zones?.[0]?.pricePerHour);

  /**
   * Handle slots change from BookingForm
   * 
   * @param slots - New array of selected slots
   */
  const handleSlotsChange = (slots: readonly ISelectedTimeSlot[]): void => {
    setSelectedSlots(slots);
  };

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
        isHoliday: false, // TODO: Implement holiday checking
        holidayName: undefined,
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
   * Handle time slot click with zone context
   * 
   * @param slotId - ID of the clicked slot
   * @param status - Current status of the slot
   */
  const handleSlotClickWithZone = (slotId: string, status: string): void => {
    if (status === "available" || status === "selected") {
      const [facId, zone, timestamp, timeSlot] = slotId.split("-");
      const date = new Date(parseInt(timestamp));
      
      console.log("Slot click with zone:", { 
        slotId, 
        status, 
        selectedZone: selectedZone?.name, 
        pricePerHour: selectedZone?.pricePerHour 
      });
      
      // Call the slot selection hook with proper parameters
      handleSlotClick(zone, date, timeSlot, status, facilityId, selectedZone?.pricePerHour || 0);
    }
  };

  /**
   * Handle bulk slot selection with zone context
   * 
   * @param slots - Array of selected time slots
   */
  const handleBulkSelectWithZone = (slots: readonly ISelectedTimeSlot[]): void => {
    console.log("Bulk select with zone:", { 
      slotsCount: slots.length, 
      selectedZone: selectedZone?.name, 
      pricePerHour: selectedZone?.pricePerHour 
    });
    
    // Update slots with current zone context
    const updatedSlots: ISelectedTimeSlot[] = slots.map(slot => ({
      ...slot,
      facilityId: facilityId,
      pricePerHour: selectedZone?.pricePerHour || 0,
    }));
    
    console.log("Updated slots with pricePerHour:", updatedSlots.map(s => ({ 
      id: s.id, 
      pricePerHour: s.pricePerHour,
      zoneId: s.zoneId,
      timeSlot: s.timeSlot
    })));
    
    handleBulkSlotSelection(updatedSlots);
  };

  /**
   * Handle previous week navigation
   */
  const handlePreviousWeek = (): void => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  /**
   * Handle next week navigation
   */
  const handleNextWeek = (): void => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  /**
   * Handle current week navigation
   */
  const handleCurrentWeek = (): void => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };


  /**
   * Handle add to cart
   * 
   * @param bookingData - Booking form data
   */
  const handleAddToCart = (bookingData: any): void => {
    try {
      if (!selectedZone) return;
      
      // Calculate total price from all selected slots (regular + recurring)
      const basePrice = allSelectedSlots.reduce((total, slot) => {
        const slotPrice = slot.pricePerHour * slot.duration;
        console.log("Slot price calculation:", { 
          slotId: slot.id, 
          pricePerHour: slot.pricePerHour, 
          duration: slot.duration, 
          slotPrice,
          isRecurring: slot.isRecurring
        });
        return total + slotPrice;
      }, 0);
      
      // Calculate VAT (25% in Norway)
      const vatRate = 0.25;
      const vatAmount = basePrice * vatRate;
      const finalPrice = basePrice + vatAmount;
      
      console.log("Price calculation:", { 
        basePrice, 
        vatAmount, 
        finalPrice 
      });
      
      // Create cart item
      const cartItem = {
        facilityId,
        facilityName,
        zoneId: selectedZone.id,
        zoneName: selectedZone.name,
        timeSlots: allSelectedSlots,
        purpose: bookingData.purpose,
        attendees: bookingData.attendees,
        activityType: bookingData.activityType,
        additionalInfo: bookingData.additionalInfo,
        actorType: bookingData.actorType,
        bookingType: bookingType,
        recurrencePattern: recurrencePattern,
        pricing: {
          basePrice: basePrice,
          totalPrice: basePrice,
          vatAmount: vatAmount,
          finalPrice: finalPrice, // Price including VAT
        },
      };

      addItem(cartItem);
      
      // Clear all slots
      clearSelection();
      clearRecurringSlots();
      
      console.log("Added to cart:", cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  /**
   * Handle booking type change
   * 
   * @param type - New booking type
   */
  const handleBookingTypeChange = useCallback((type: BookingType): void => {
    setBookingType(type);
    
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
   * Get all selected slots (regular + recurring)
   */
  const allSelectedSlots = useMemo(() => {
    if (!selectedZone) return [];
    
    return getAllSlots().map(slot => ({
      ...slot,
      facilityName,
      zoneName: selectedZone.name
    }));
  }, [getAllSlots, facilityName, selectedZone]);

  /**
   * Handle complete booking
   * 
   * @param bookingData - Booking form data
   */
  const handleCompleteBooking = (bookingData: any): void => {
    // TODO: Implement direct booking logic
    console.log("Complete booking:", bookingData);
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

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="space-y-6">
          {/* Zone Selection */}
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
                        {zone.area || "120 m²"}
                      </Badge>
                    </Button>
                  ))}
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
                    selectedSlots={selectedSlots.map(slot => slot.id)}
                    onSlotClick={handleSlotClickWithZone}
                    onBulkSelect={handleBulkSelectWithZone}
                    pricePerHour={selectedZone?.pricePerHour || 0}
                    isLoading={isLoading}
                    error={error}
                  />
                  {console.log("TimeSlotGrid pricePerHour:", selectedZone?.pricePerHour || 0)}
                </CardContent>
              </Card>

              {/* Legend */}
              <AvailabilityLegend />
            </div>

            {/* Right Column - Booking Form (40%) */}
            <div className="lg:col-span-2">
              <div className="sticky top-6 space-y-4">
                {/* Booking Type Selector */}
                <BookingTypeSelector
                  selectedType={bookingType}
                  onTypeChange={handleBookingTypeChange}
                />
                
                {/* Recurrence Pattern Selector (only for recurring bookings) */}
                {bookingType === 'recurring' && (
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
