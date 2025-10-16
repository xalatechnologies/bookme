"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Calendar, FileText, Shield, Users, X } from "lucide-react";
import { startOfWeek, addWeeks, subWeeks, addDays, format, isToday, isWeekend, isPast } from "date-fns";
import { nb } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { BookingForm } from "./BookingForm";
import { BookingTypeSelector } from "./BookingTypeSelector";
import { RecurrencePatternSelector } from "./RecurrencePatternSelector";
import { TimeSlotGrid } from "@/components/calendar/TimeSlotGrid";
import { AvailabilityLegend } from "@/components/calendar/AvailabilityLegend";
import { PriceCalculation } from "./PriceCalculation";

import { ISelectedTimeSlot, IZone, BookingType, IBookingFormData } from "./types";
import type { RecurrencePattern } from "@/utils/recurrenceEngine";
import { RecurrenceEngine } from "@/utils/recurrenceEngine";
import { useAvailabilityStatus } from "@/hooks/useAvailabilityStatus";

export interface IStepByStepBookingProps {
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zones: readonly IZone[];
  readonly selectedZoneId: string;
  readonly onZoneChange: (zoneId: string) => void;
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly onSlotsChange: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly onAddToCart: (bookingData: IBookingFormData) => void;
  readonly onCompleteBooking: (bookingData: IBookingFormData) => void;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
  readonly calendarWeek?: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly onSlotClick?: (zoneId: string, date: Date, timeSlot: string, status: string) => void;
  readonly onBulkSlotSelection?: (slots: readonly ISelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus?: (zoneId: string, date: Date, timeSlot: string) => { status: string; conflict?: { readonly id: string; readonly title: string } };
  readonly isSlotSelected?: (zoneId: string, date: Date, timeSlot: string) => boolean;
}

type BookingStep = 'details' | 'calendar' | 'recurrence' | 'terms' | 'actions';

export const StepByStepBooking: React.FC<IStepByStepBookingProps> = ({
  facilityId,
  facilityName,
  zones,
  selectedZoneId,
  onZoneChange,
  selectedSlots,
  onSlotsChange,
  onAddToCart,
  onCompleteBooking,
  isLoading = false,
  error,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00",
  calendarWeek,
  onSlotClick,
  onBulkSlotSelection,
  getAvailabilityStatus,
  isSlotSelected,
}) => {
  // Current step state
  const [currentStep, setCurrentStep] = useState<BookingStep>('calendar');
  
  // Form data state
  const [formData, setFormData] = useState<IBookingFormData>({
    purpose: "",
    attendees: 1,
    activityType: "",
    additionalInfo: "",
    actorType: "",
    termsAccepted: false,
    bookingType: "one-time",
  });

  // Booking type and recurrence state
  const [bookingType, setBookingType] = useState<BookingType>('one-time');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>({
    type: 'weekly',
    weekdays: [1, 2, 3, 4, 5],
    timeSlots: ['09:00-11:00'],
    interval: 1,
    maxOccurrences: 52
  });
  const [recurringSlots, setRecurringSlots] = useState<ISelectedTimeSlot[]>([]);
  
  // Recurrence engine instance
  const recurrenceEngine = new RecurrenceEngine();
  
  // Timeout ref for debouncing
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
  });

  // Get selected zone
  const selectedZone = zones?.find(zone => zone.id === selectedZoneId);

  // Simple isSlotSelected function
  const isSlotSelectedLocal = useCallback((zoneId: string, date: Date, timeSlot: string): boolean => {
    const result = selectedSlots.some(slot => {
      const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
      return slot.zoneId === zoneId && 
             slotDate.toDateString() === date.toDateString() && 
             slot.timeSlot === timeSlot;
    });
    return result;
  }, [selectedSlots]);

  // Use the proper availability status hook
  const { getAvailabilityStatus: internalGetAvailabilityStatus } = useAvailabilityStatus(selectedSlots);
  
  // Use external prop if available, otherwise use internal hook
  const getAvailabilityStatusLocal = getAvailabilityStatus || internalGetAvailabilityStatus;


  // Week navigation functions
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  }, []);

  // Calculate current week range with days array
  const currentWeek = useMemo(() => {
    const start = currentWeekStart;
    const end = addWeeks(start, 1);
    
    // Generate days array for the week
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      days.push({
        date,
        isToday: isToday(date),
        isWeekend: isWeekend(date),
        isPast: isPast(date)
      });
    }
    
    return { 
      startDate: start, 
      endDate: end,
      days 
    };
  }, [currentWeekStart]);

  /**
   * Step configuration
   */
  const steps = useMemo(() => {
    const baseSteps = [
      {
        id: 'calendar' as BookingStep,
        title: 'Kalender',
        description: 'Velg dato og tid for bookingen',
        icon: Calendar,
      },
      {
        id: 'details' as BookingStep,
        title: 'Bookingdetaljer',
        description: 'Fyll ut informasjon om bookingen',
        icon: FileText,
      },
    ];

    // Add recurrence step only for recurring bookings
    if (bookingType === 'recurring') {
      baseSteps.push({
        id: 'recurrence' as BookingStep,
        title: 'Gjentakelse',
        description: 'Velg gjentakelsesmønster',
        icon: Clock,
      });
    }

    baseSteps.push(
      {
        id: 'terms' as BookingStep,
        title: 'Vilkår og betingelser',
        description: 'Les og godta vilkårene',
        icon: Shield,
      },
      {
        id: 'actions' as BookingStep,
        title: 'Fullfør booking',
        description: 'Legg i kurv eller fullfør direkte',
        icon: CheckCircle,
      }
    );

    return baseSteps;
  }, [bookingType]);

  /**
   * Calculate current step index
   */
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  /**
   * Validate current step
   */
  const validateStep = useCallback((step: BookingStep): boolean => {
    switch (step) {
      case 'details':
        return (
          formData.purpose.trim().length > 0 &&
          formData.attendees > 0 &&
          formData.activityType.trim().length > 0
        );
      
      case 'calendar':
        return selectedSlots.length > 0;
      
      case 'recurrence':
        return bookingType === 'one-time' || recurrencePattern !== null;
      
      case 'terms':
        return formData.termsAccepted;
      
      case 'actions':
        return true; // Always valid, just action buttons
      
      default:
        return false;
    }
  }, [formData, selectedSlots.length, recurringSlots.length, bookingType, recurrencePattern]);

  /**
   * Handle next step
   */
  const handleNext = useCallback(() => {
    const currentStepValid = validateStep(currentStep);
    
    if (!currentStepValid) {
      return; // Don't allow forward navigation if current step is invalid
    }
    
    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  }, [currentStep, validateStep, currentStepIndex, steps]);

  /**
   * Handle previous step
   */
  const handlePrevious = useCallback(() => {
    const previousStepIndex = currentStepIndex - 1;
    if (previousStepIndex >= 0) {
      setCurrentStep(steps[previousStepIndex].id);
    }
  }, [currentStepIndex, steps]);

  /**
   * Handle form data update
   */
  const handleFormDataUpdate = useCallback((updates: Partial<IBookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Handle booking type change
   */
  const handleBookingTypeChange = useCallback((type: BookingType) => {
    setBookingType(type);
    handleFormDataUpdate({ bookingType: type });
  }, [handleFormDataUpdate]);

  /**
   * Generate recurring slots based on pattern
   */
  const generateRecurringSlots = useCallback((pattern: RecurrencePattern) => {
    if (!selectedSlots.length || !selectedZone) return;
    
    const timeSlots = selectedSlots.map(slot => slot.timeSlot);
    const startDate = selectedSlots[0].date;
    
    // Create a pattern with the selected time slots
    const patternWithTimeSlots = {
      ...pattern,
      timeSlots: timeSlots,
      startDate: startDate,
      endDate: pattern.endDate
    };
    
    // Generate recurring occurrences
    const generatedSlots = recurrenceEngine.generateOccurrences(
      patternWithTimeSlots,
      startDate,
      selectedZone.id,
      facilityId,
      selectedZone.pricePerHour || 0,
      pattern.maxOccurrences || 52
    );
    
    // Convert to ISelectedTimeSlot format
    const convertedSlots: ISelectedTimeSlot[] = generatedSlots.map(slot => ({
      id: slot.id,
      facilityId: slot.facilityId,
      zoneId: slot.zoneId,
      date: slot.date,
      timeSlot: slot.timeSlot,
      duration: slot.duration,
      pricePerHour: slot.pricePerHour,
      zoneName: selectedZone.name,
      isRecurring: true,
      recurrencePattern: pattern,
      parentBookingId: selectedSlots[0].id
    }));
    
    setRecurringSlots(convertedSlots);
  }, [selectedSlots, selectedZone, facilityId, recurrenceEngine]);

  /**
   * Handle recurrence pattern change
   */
  const handleRecurrencePatternChange = useCallback((pattern: RecurrencePattern | null) => {
    setRecurrencePattern(pattern);
    handleFormDataUpdate({ recurrencePattern: pattern });
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only generate recurring slots if pattern is complete and valid
    if (pattern && selectedSlots.length > 0 && selectedZone) {
      // Check if pattern is complete enough to generate slots
      const isPatternComplete = pattern.weekdays && pattern.weekdays.length > 0;
      
      if (isPatternComplete) {
        // Use setTimeout to debounce the generation
        timeoutRef.current = setTimeout(() => {
          generateRecurringSlots(pattern);
        }, 500); // 500ms delay
      } else {
        setRecurringSlots([]);
      }
    } else {
      setRecurringSlots([]);
    }
  }, [handleFormDataUpdate, selectedSlots, selectedZone, generateRecurringSlots]);

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(() => {
    if (validateStep('details') && validateStep('calendar') && validateStep('terms')) {
      // Include recurring slots in the form data
      const formDataWithRecurring = {
        ...formData,
        recurringSlots: recurringSlots
      };
      onAddToCart(formDataWithRecurring);
    }
  }, [formData, recurringSlots, validateStep, onAddToCart]);

  /**
   * Handle complete booking
   */
  const handleCompleteBooking = useCallback(() => {
    if (validateStep('details') && validateStep('calendar') && validateStep('terms')) {
      // Include recurring slots in the form data
      const formDataWithRecurring = {
        ...formData,
        recurringSlots: recurringSlots
      };
      onCompleteBooking(formDataWithRecurring);
    }
  }, [formData, recurringSlots, validateStep, onCompleteBooking]);

  /**
   * Handle remove slot
   */
  const handleRemoveSlot = useCallback((slotId: string) => {
    const newSlots = selectedSlots.filter(slot => slot.id !== slotId);
    onSlotsChange(newSlots);
  }, [selectedSlots, onSlotsChange]);

  /**
   * Handle clear all slots
   */
  const handleClearAllSlots = useCallback(() => {
    onSlotsChange([]);
    setRecurringSlots([]);
  }, [onSlotsChange]);

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fyll ut bookingdetaljer</h3>
              <p className="text-gray-600 text-sm">
                Fortell oss om arrangementet ditt så kan vi hjelpe deg med riktig booking.
              </p>
            </div>
            
            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    Formål med bookingen <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => handleFormDataUpdate({ purpose: e.target.value })}
                    placeholder="F.eks. fotballtrening, møte, arrangement"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {/* Attendees */}
                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-sm font-medium">
                    Antall deltakere <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    value={formData.attendees}
                    onChange={(e) => handleFormDataUpdate({ attendees: parseInt(e.target.value) || 1 })}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="activityType" className="text-sm font-medium">
                    Type aktivitet <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) => handleFormDataUpdate({ activityType: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Velg aktivitetstype" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sport">Sport</SelectItem>
                      <SelectItem value="kultur">Kultur</SelectItem>
                      <SelectItem value="møte">Møte</SelectItem>
                      <SelectItem value="arrangement">Arrangement</SelectItem>
                      <SelectItem value="trening">Trening</SelectItem>
                      <SelectItem value="annet">Annet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Velg tidspunkter</h3>
              <p className="text-gray-600 text-sm">
                Klikk på ledige tidspunkter for å velge dem. Du kan velge flere tidspunkter samtidig.
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="lg" onClick={handlePreviousWeek}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Forrige uke
                  </Button>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      {format(currentWeek.startDate, 'dd. MMM', { locale: nb })} - {format(currentWeek.endDate, 'dd. MMM yyyy', { locale: nb })}
                    </h3>
                  </div>
                  <Button variant="outline" size="lg" onClick={handleNextWeek}>
                    Neste uke
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                {selectedZone && (
                  <div className="mt-4">
                    <TimeSlotGrid
                      facilityId={facilityId}
                      zoneId={selectedZone.id}
                      week={currentWeek}
                      selectedSlots={selectedSlots}
                      onSlotClick={(zoneId, date, timeSlot, status) => {
                        // Handle slot toggle logic directly
                        if (status === "available" || status === "selected") {
                          const existingIndex = selectedSlots.findIndex(slot => {
                            // Convert slot.date to Date object if it's a string
                            const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
                            return slot.zoneId === zoneId && 
                                   slotDate.toDateString() === date.toDateString() && 
                                   slot.timeSlot === timeSlot;
                          });
                          
                          if (existingIndex >= 0) {
                            // Remove slot
                            const updatedSlots = selectedSlots.filter((_, index) => index !== existingIndex);
                            onSlotsChange(updatedSlots);
                          } else {
                            // Add slot
                            const newSlot: ISelectedTimeSlot = {
                              id: `${facilityId}-${zoneId}-${date.toISOString().split('T')[0]}-${timeSlot}`,
                              facilityId,
                              zoneId,
                              date,
                              timeSlot,
                              duration: 1,
                              pricePerHour: selectedZone?.pricePerHour || 0,
                            };
                            onSlotsChange([...selectedSlots, newSlot]);
                          }
                        }
                        
                        // Also call parent's onSlotClick for any additional handling
                        onSlotClick?.(zoneId, date, timeSlot, status);
                      }}
                      onBulkSelect={(slots) => {
                        // Handle bulk selection by adding all slots
                        const enrichedSlots = slots.map(slot => ({
                          ...slot,
                          facilityId,
                          zoneName: selectedZone?.name || '',
                          pricePerHour: selectedZone?.pricePerHour || 0,
                        }));
                        onSlotsChange([...selectedSlots, ...enrichedSlots]);
                        
                        // Also call parent's onBulkSlotSelection for any additional handling
                        onBulkSlotSelection?.(slots);
                      }}
                      pricePerHour={selectedZone?.pricePerHour || 0}
                      isLoading={isLoading}
                      error={error}
                      getAvailabilityStatus={getAvailabilityStatusLocal}
                      isSlotSelected={isSlotSelectedLocal}
                      openingHoursStart={openingHoursStart}
                      openingHoursEnd={openingHoursEnd}
                    />
                  </div>
                )}

                {/* Legend */}
                <div className="mt-4">
                  <AvailabilityLegend />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'recurrence':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Velg gjentakelsesmønster</h3>
              <p className="text-gray-600 text-sm">
                Velg hvordan ofte bookingen skal gjentas. Dette gjelder for alle valgte tidspunkter.
              </p>
            </div>
            
            <Card className="w-full">
              <CardContent className="p-6">
                <RecurrencePatternSelector
                  pattern={recurrencePattern}
                  onPatternChange={handleRecurrencePatternChange}
                />
              </CardContent>
            </Card>
          </div>
        );

      case 'terms':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vilkår og betingelser</h3>
              <p className="text-gray-600 text-sm">
                Les gjennom vilkårene og godta dem for å fortsette.
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Regler for bruk</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Renhold etter bruk er påkrevd</li>
                      <li>• Nøkler hentes ved inngang 15 min før start</li>
                      <li>• Avbestilling gratis til 48 timer før start</li>
                      <li>• Gebyr ved no-show: 50% av leiepris</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Personvern</h4>
                    <p className="text-sm text-gray-600">
                      Vi behandler dine personopplysninger i henhold til vår personvernerklæring. 
                      Ved å godta vilkårene samtykker du til behandling av personopplysninger for denne bestillingen.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Avbestilling</h4>
                    <p className="text-sm text-gray-600">
                      Du kan avbestille bookingen din gratis inntil 48 timer før arrangementet starter. 
                      Ved avbestilling senere enn dette vil det bli trukket et gebyr på 50% av leieprisen.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3 pt-4 border-t">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleFormDataUpdate({ termsAccepted: e.target.checked })}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      Jeg godtar <a href="/terms" target="_blank" className="text-blue-600 hover:underline">vilkår for leie</a> og 
                      <a href="/privacy" target="_blank" className="text-blue-600 hover:underline ml-1">personvernerklæring</a>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'actions':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fullfør booking</h3>
              <p className="text-gray-600 text-sm">
                Gjennomgå opplysningene og velg hvordan du vil fortsette.
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold mb-2">Klar for booking!</h4>
                    <p className="text-gray-600 text-sm">
                      Alle opplysninger er fylt ut og vilkårene er godtatt.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1"
                      disabled={!validateStep('details') || !validateStep('calendar') || !validateStep('terms')}
                    >
                      Legg i reservasjonskurv
                    </Button>
                    <Button
                      onClick={handleCompleteBooking}
                      className="flex-1"
                      disabled={!validateStep('details') || !validateStep('calendar') || !validateStep('terms')}
                    >
                      Fullfør booking
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone Selection and Booking Type - Always visible at the top */}
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-3 flex-1">
              {zones?.map((zone) => (
                <Button
                  key={zone.id}
                  variant={selectedZoneId === zone.id ? "default" : "outline"}
                  onClick={() => onZoneChange(zone.id)}
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
            
            {/* Booking Type Selector */}
            <div className="flex gap-2">
              <BookingTypeSelector
                selectedType={bookingType}
                onTypeChange={handleBookingTypeChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Step Content (60%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Indicator */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bookingprosess</h3>
                  <span className="text-sm text-gray-500">
                    Steg {currentStepIndex + 1} av {steps.length}
                  </span>
                </div>
                
                <Progress value={((currentStepIndex + 1) / steps.length) * 100} className="h-2" />
                
                <div className="flex justify-between">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = step.id === currentStep;
                    const isAccessible = index <= currentStepIndex;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => isAccessible && setCurrentStep(step.id)}
                        disabled={!isAccessible}
                        className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-blue-100 text-blue-700'
                            : isCompleted
                            ? 'bg-green-100 text-green-700'
                            : isAccessible
                            ? 'hover:bg-gray-100 text-gray-600'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                        <span className="text-xs font-medium text-center">{step.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Forrige
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1 || !validateStep(currentStep)}
              className="flex items-center gap-2"
            >
              Neste
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Column - Time Slots & Pricing (40%) */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
            {/* Time Selection and Price Calculation Box */}
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {selectedSlots.length > 0 
                    ? (bookingType === 'recurring' 
                        ? (recurringSlots.length > 0 ? "Gjentakende tidspunkter og prisberegning" : "Tidspunkter og prisberegning (velg gjentakelsesmønster)")
                        : "Valgte tidspunkter og prisberegning")
                    : "Velg tidspunkter og få en prisberegning"
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {selectedSlots.length > 0 || recurringSlots.length > 0 ? (
                  <>
                    {/* Selected Slots Display */}
                    <div className="space-y-2">
                      {/* Show selected slots (template for recurring or final for one-time) */}
                      {selectedSlots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{slot.timeSlot}</div>
                            <div className="text-xs text-gray-500">{slot.zoneName}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(slot.date).toLocaleDateString('nb-NO')}
                            </div>
                            {bookingType === 'recurring' && (
                              <div className="text-xs text-blue-600 font-medium">
                                Mal for gjentakelse
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {slot.duration} timer
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveSlot(slot.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show recurring slots preview for recurring bookings */}
                      {bookingType === 'recurring' && recurringSlots.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            Gjentakende forekomster ({recurringSlots.length} totalt):
                          </div>
                          {recurringSlots.slice(0, 5).map((slot, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{slot.timeSlot}</div>
                                <div className="text-xs text-gray-500">{slot.zoneName}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(slot.date).toLocaleDateString('nb-NO')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {slot.duration} timer
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Gjentakende
                                </Badge>
                              </div>
                            </div>
                          ))}
                          {recurringSlots.length > 5 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              ... og {recurringSlots.length - 5} til
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Clear All Button */}
                      {(selectedSlots.length > 1 || recurringSlots.length > 0) && (
                        <div className="pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAllSlots}
                            className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Fjern alle valgte tidspunkter
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Price Calculation */}
                    <PriceCalculation
                      selectedSlots={selectedSlots}
                      recurringSlots={recurringSlots}
                      actorType={formData.actorType}
                      activityType={formData.activityType}
                      bookingType={bookingType}
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      Velg tidspunkter og få en prisberegning
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepByStepBooking;