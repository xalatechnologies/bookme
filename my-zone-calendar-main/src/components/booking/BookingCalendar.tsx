import { useState, useMemo } from "react";
import { addDays, startOfWeek, format, isToday, eachDayOfInterval, getDay } from "date-fns";
import { nb } from "date-fns/locale";
import { ZoneSelector } from "./ZoneSelector";
import { BookingStepper } from "./BookingStepper";
import { WeekNavigation } from "./WeekNavigation";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { SlotLegend } from "./SlotLegend";
import { SelectedSlotsSummary } from "./SelectedSlotsSummary";
import { BookingDialog, BookingFormData } from "./BookingDialog";
import { BookingCheckout } from "./BookingCheckout";
import { BookingLogin } from "./BookingLogin";
import { BookingReview } from "./BookingReview";
import { BookingConfirmation } from "./BookingConfirmation";
import { SeasonConflictDialog } from "./SeasonConflictDialog";
import { Zone, DaySchedule, TimeSlot, SelectedSlot, SlotStatus, BookingCheckoutData, AdditionalService, ConflictCheckResult } from "@/types/booking";
import { toast } from "sonner";

const zones: Zone[] = [
  { id: 'zone-a', name: 'Zone A', size: '120 m²', color: 'a' },
  { id: 'zone-b', name: 'Zone B', size: '120 m²', color: 'b' },
  { id: 'zone-c', name: 'Zone C', size: '120 m²', color: 'c' },
];

// Generate mock booking data
const generateMockStatus = (date: Date, hour: number, zoneId: string): SlotStatus => {
  const dateNum = date.getDate();
  const dayOfWeek = date.getDay();
  
  // Make some patterns based on zone and day
  if (zoneId === 'zone-a') {
    if (hour >= 17 && hour <= 20 && (dayOfWeek === 2 || dayOfWeek === 4)) return 'booked';
    if (hour >= 8 && hour <= 12 && dayOfWeek === 1) return 'unavailable';
  }
  
  if (zoneId === 'zone-b') {
    if (hour >= 9 && hour <= 11 && (dayOfWeek === 3 || dayOfWeek === 5)) return 'booked';
    if (dateNum % 3 === 0 && hour === 14) return 'reserved';
  }
  
  if (zoneId === 'zone-c') {
    if ((dayOfWeek === 6 || dayOfWeek === 0) && hour >= 10 && hour <= 18) return 'booked';
    if (hour >= 19 && dateNum % 2 === 0) return 'unavailable';
  }
  
  const seed = dateNum + hour + zoneId.charCodeAt(5);
  if (seed % 7 === 0) return 'booked';
  if (seed % 11 === 0) return 'unavailable';
  
  return 'available';
};

const defaultServices: AdditionalService[] = [
  { id: 'extra-time', name: 'Ekstra tid', description: 'Forleng bookingen med 30 minutter', price: 200, selected: false },
  { id: 'equipment', name: 'Utstyr', description: 'Inkluderer ballnett, musikanlegg og annet utstyr', price: 150, selected: false },
  { id: 'caretaker', name: 'Vaktmesterhjelp', description: 'Hjelp med oppsett og nedrigg av utstyr', price: 300, selected: false },
  { id: 'security', name: 'Sikkerhet', description: 'Vaktmester til stede under hele arrangementet', price: 500, selected: false },
];

// Helper to convert JS weekday (0=Sun) to our weekday format (0=Mon)
const jsWeekdayToCustom = (jsDay: number): number => {
  return jsDay === 0 ? 6 : jsDay - 1;
};

// Generate all slots for a season booking
const generateSeasonSlots = (
  zoneId: string,
  zoneName: string,
  startDate: Date,
  endDate: Date,
  weekdays: number[],
  interval: number,
  startTime: string,
  bookingDetails: BookingFormData,
  seasonBookingGroupId: string
): SelectedSlot[] => {
  const slots: SelectedSlot[] = [];
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  let weekCounter = 0;
  let lastWeek = -1;
  
  for (const date of allDates) {
    const jsWeekday = getDay(date);
    const customWeekday = jsWeekdayToCustom(jsWeekday);
    const weekNumber = Math.floor((date.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Track week changes for interval
    if (weekNumber !== lastWeek) {
      lastWeek = weekNumber;
      weekCounter++;
    }
    
    // Check if this week matches the interval
    if ((weekCounter - 1) % interval !== 0) continue;
    
    // Check if this weekday is selected
    if (!weekdays.includes(customWeekday)) continue;
    
    const hour = parseInt(startTime.split(':')[0]);
    
    slots.push({
      zoneId,
      zoneName,
      date,
      time: startTime,
      hour,
      bookingDetails: {
        ...bookingDetails,
        date,
      },
      seasonBookingGroupId,
    });
  }
  
  return slots;
};

// Check for conflicts with existing bookings
const checkSlotConflicts = (
  slots: SelectedSlot[],
  days: DaySchedule[],
  selectedZone: string
): ConflictCheckResult => {
  const availableSlots: SelectedSlot[] = [];
  const unavailableSlots: SelectedSlot[] = [];
  
  for (const slot of slots) {
    const dateStr = format(slot.date, 'yyyy-MM-dd');
    
    // Check mock status for this slot
    const status = generateMockStatus(slot.date, slot.hour, selectedZone);
    
    if (status === 'available') {
      availableSlots.push(slot);
    } else {
      unavailableSlots.push(slot);
    }
  }
  
  return {
    availableSlots,
    unavailableSlots,
    hasConflicts: unavailableSlots.length > 0,
  };
};

export function BookingCalendar() {
  const [selectedZone, setSelectedZone] = useState('zone-a');
  const [currentStep, setCurrentStep] = useState(1);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [checkoutData, setCheckoutData] = useState<BookingCheckoutData>({
    priceGroup: null,
    additionalServices: defaultServices,
    termsAccepted: false,
  });
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ date: Date; slot: TimeSlot } | null>(null);
  
  // Season conflict dialog state
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [pendingConflictResult, setPendingConflictResult] = useState<ConflictCheckResult | null>(null);
  const [pendingFormData, setPendingFormData] = useState<BookingFormData | null>(null);
  
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const days: DaySchedule[] = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const slots: TimeSlot[] = Array.from({ length: 14 }, (_, h) => {
        const hour = 8 + h;
        return {
          id: `${format(date, 'yyyy-MM-dd')}-${hour}-${selectedZone}`,
          time: `${hour.toString().padStart(2, '0')}:00`,
          hour,
          status: generateMockStatus(date, hour, selectedZone),
        };
      });

      return {
        date,
        dayName: format(date, 'EEEE', { locale: nb }),
        dayNumber: date.getDate(),
        isToday: isToday(date),
        slots,
      };
    });
  }, [weekStart, selectedZone]);

  const handleSlotClick = (date: Date, slot: TimeSlot) => {
    const existing = selectedSlots.find(
      s => format(s.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
           s.hour === slot.hour &&
           s.zoneId === selectedZone
    );

    if (existing) {
      setSelectedSlots(prev => prev.filter(s => s !== existing));
    } else {
      setPendingSlot({ date, slot });
      setDialogOpen(true);
    }
  };

  const handleDialogConfirm = (formData: BookingFormData) => {
    if (!pendingSlot) return;
    
    const zone = zones.find(z => z.id === selectedZone);
    
    if (formData.isSeasonBooking && formData.endDate && formData.weekdays && formData.repetitionInterval) {
      // Generate all season slots
      const seasonBookingGroupId = `season-${Date.now()}`;
      const allSlots = generateSeasonSlots(
        selectedZone,
        zone?.name || '',
        pendingSlot.date,
        formData.endDate,
        formData.weekdays,
        formData.repetitionInterval,
        formData.startTime,
        formData,
        seasonBookingGroupId
      );
      
      // Check for conflicts
      const conflictResult = checkSlotConflicts(allSlots, days, selectedZone);
      
      if (conflictResult.hasConflicts) {
        // Show conflict dialog
        setPendingConflictResult(conflictResult);
        setPendingFormData(formData);
        setDialogOpen(false);
        setConflictDialogOpen(true);
      } else {
        // No conflicts, add all slots
        setSelectedSlots(prev => [...prev, ...allSlots]);
        setDialogOpen(false);
        setPendingSlot(null);
        toast.success("Sesongleie lagt til", {
          description: `${allSlots.length} tidspunkter lagt til`,
        });
      }
    } else {
      // Single booking
      setSelectedSlots(prev => [...prev, {
        zoneId: selectedZone,
        zoneName: zone?.name || '',
        date: pendingSlot.date,
        time: pendingSlot.slot.time,
        hour: pendingSlot.slot.hour,
        bookingDetails: formData,
      }]);
      
      setDialogOpen(false);
      setPendingSlot(null);
      toast.success("Tidspunkt lagt til", {
        description: `${formData.purpose} - ${format(pendingSlot.date, 'dd.MM.yyyy')} kl. ${formData.startTime}-${formData.endTime}`,
      });
    }
  };

  const handleConflictConfirm = (availableSlots: SelectedSlot[]) => {
    setSelectedSlots(prev => [...prev, ...availableSlots]);
    setConflictDialogOpen(false);
    setPendingConflictResult(null);
    setPendingFormData(null);
    setPendingSlot(null);
    toast.success("Sesongleie lagt til", {
      description: `${availableSlots.length} ledige tidspunkter lagt til`,
    });
  };

  const handleConflictChangeTime = () => {
    // Close conflict dialog and reopen booking dialog - keep form data
    setConflictDialogOpen(false);
    setPendingConflictResult(null);
    // Don't reset pendingFormData so the form retains its values
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingSlot(null);
  };

  const handleRemoveSlot = (slot: SelectedSlot) => {
    if (slot.seasonBookingGroupId) {
      // Remove all slots in this season booking group
      setSelectedSlots(prev => prev.filter(s => s.seasonBookingGroupId !== slot.seasonBookingGroupId));
      toast.success("Sesongleie fjernet");
    } else {
      setSelectedSlots(prev => prev.filter(s => s !== slot));
    }
  };

  const handlePreviousWeek = () => {
    setWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7));
  };

  const handleContinue = () => {
    if (selectedSlots.length === 0) {
      toast.error("Velg minst ett tidspunkt for å fortsette");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    toast.success("Lagt til i handlekurv!", {
      description: `${selectedSlots.length} tidspunkt(er) lagt til. Du kan nå velge flere.`,
    });
    setCurrentStep(1);
    setSelectedSlots([]);
    setCheckoutData({
      priceGroup: null,
      additionalServices: defaultServices,
      termsAccepted: false,
    });
  };

  const handleContinueToLogin = () => {
    if (isLoggedIn) {
      setCurrentStep(3);
    } else {
      setShowLoginOverlay(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginOverlay(false);
    setCurrentStep(3);
    toast.success("Innlogget!", {
      description: "Du er nå logget inn.",
    });
  };

  const handleLoginBack = () => {
    setShowLoginOverlay(false);
  };

  const handleSubmitForApproval = () => {
    setCurrentStep(4);
    toast.success("Reservasjon sendt!", {
      description: "Din forespørsel er sendt til godkjenning.",
    });
  };

  const handleBackToHome = () => {
    setCurrentStep(1);
    setSelectedSlots([]);
    setShowLoginOverlay(false);
    setCheckoutData({
      priceGroup: null,
      additionalServices: defaultServices,
      termsAccepted: false,
    });
  };

  const handleViewBookings = () => {
    toast.info("Mine bookinger", {
      description: "Denne funksjonen kommer snart!",
    });
  };

  const currentZoneSlots = selectedSlots.filter(s => s.zoneId === selectedZone);

  return (
    <div className="space-y-6">
        {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Ledighetskalender</h1>
          <p className="text-muted-foreground">
            Legg inn din reservasjon raskt og enkelt på 4 steg.
          </p>
        </div>

        {/* Stepper */}
          <BookingStepper currentStep={currentStep} totalSteps={4} />

        {/* Main Content */}
        {showLoginOverlay ? (
          <BookingLogin 
            onBack={handleLoginBack} 
            onLoginSuccess={handleLoginSuccess} 
          />
        ) : currentStep === 3 ? (
          <BookingReview
            slots={currentZoneSlots}
            checkoutData={checkoutData}
            onBack={handleBack}
            onSubmitForApproval={handleSubmitForApproval}
          />
        ) : currentStep === 4 ? (
          <BookingConfirmation
            slots={currentZoneSlots}
            checkoutData={checkoutData}
            onBackToHome={handleBackToHome}
            onViewBookings={handleViewBookings}
          />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* Left Section */}
          <div className="space-y-4">
              {currentStep === 1 ? (
                <>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 border-b border-border">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Velg tidspunkter</h2>
                      <p className="text-sm text-muted-foreground">
                        Klikk på ledige tidspunkter for å velge dem. Du kan velge flere tidspunkter samtidig.
                      </p>
                    </div>
                      <WeekNavigation
                        weekStart={weekStart}
                        onPreviousWeek={handlePreviousWeek}
                        onNextWeek={handleNextWeek}
                      />
                  </div>

                  <div className="p-4">
                  <TimeSlotGrid
                    days={days}
                    selectedSlots={currentZoneSlots}
                    onSlotClick={handleSlotClick}
                  />
                  </div>
                </div>

                  <SlotLegend />
                </>
              ) : (
                <BookingCheckout
                  checkoutData={checkoutData}
                  onCheckoutChange={setCheckoutData}
                  onBack={handleBack}
                  onAddToCart={handleAddToCart}
                  onComplete={handleContinueToLogin}
                />
              )}
            </div>

            {/* Summary Section */}
          <div>
            <div className="sticky top-4 space-y-4">
                <SelectedSlotsSummary
                  slots={currentZoneSlots}
                  onRemoveSlot={handleRemoveSlot}
                  onContinue={handleContinue}
                  showPricing={currentStep === 2}
                  checkoutData={checkoutData}
                />

                {currentStep === 1 && (
                <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                    <h4 className="font-medium text-sm text-foreground mb-2">Tips</h4>
                    <ul className="text-xs text-muted-foreground space-y-1.5">
                      <li>• Klikk på ledige tidspunkter for å velge</li>
                      <li>• Bruk "Book flere dager?" for sesongleie</li>
                      <li>• Bytt mellom soner for å se tilgjengelighet</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Booking Dialog */}
        <BookingDialog
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          onConfirm={handleDialogConfirm}
          selectedDate={pendingSlot?.date || null}
          selectedTime={pendingSlot?.slot.time || null}
          zoneName={zones.find(z => z.id === selectedZone)?.name || ''}
          initialFormData={pendingFormData}
          onFormDataCleared={() => setPendingFormData(null)}
        />

        {/* Season Conflict Dialog */}
        <SeasonConflictDialog
          isOpen={conflictDialogOpen}
          onClose={() => setConflictDialogOpen(false)}
          onConfirmAvailable={handleConflictConfirm}
          onChangeTime={handleConflictChangeTime}
          availableSlots={pendingConflictResult?.availableSlots || []}
          unavailableSlots={pendingConflictResult?.unavailableSlots || []}
        />
    </div>
  );
}
