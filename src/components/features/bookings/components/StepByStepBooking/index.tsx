"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Download, Users, ChevronDown, CalendarIcon } from "lucide-react";
import { startOfWeek, addWeeks, subWeeks, addDays, format } from "date-fns";
import { nb } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useAuth } from "@/contexts/hooks";

import { BookingTypeSelector } from "../BookingForm/BookingTypeSelector";
import { RecurrencePatternSelector } from "../RecurringBookingModal/RecurrencePatternSelector";
import { TimeSlotGrid } from "@/components/features/calendar/components/EnhancedCalendar/TimeSlotGrid";
import { AvailabilityLegend } from "@/components/features/calendar/components/EnhancedCalendar/AvailabilityLegend";
import { PriceCalculation } from "../BookingForm/PriceCalculation";
import { TimeSlotDisplay } from "./components/TimeSlotDisplay";
import { Step5Actions } from "./steps/Step5Actions";
import { SlotBookingDialog, SlotBookingFormData } from "../SlotBookingDialog";

import { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";

import {
  useBookingSteps,
  useRecurringSlotGeneration,
} from "@/hooks/features/bookings";
import { useAvailabilityStatus } from "../../hooks";
import { useCreateBooking } from "@/services/supabase/bookings.service";
import { facilitiesService } from "@/services/supabase/facilities.service";

import type {
  ActivityType,
  ISelectedTimeSlot,
  IZone,
  BookingType,
  IBookingFormData,
  PriceGroup,
} from "../../types";

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
}

export const StepByStepBooking: React.FC<IStepByStepBookingProps> = ({
  facilityId,
   
  facilityName: _facilityName,
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
   
  calendarWeek: _calendarWeek,
  onSlotClick,
  onBulkSlotSelection,
  getAvailabilityStatus,
   
  isSlotSelected: _isSlotSelected,
}) => {
  const { t } = useTranslation(["booking", "common"]);
  // Force Norwegian locale and Monday as week start to match design
  const currentLocale = nb;

  // Form data state
  const [formData, setFormData] = useState<IBookingFormData>({
    purpose: "",
    attendees: 1,
    activityType: "",
    priceGroup: "",
    additionalInfo: "",
    actorType: "",
    termsAccepted: false,
    bookingType: "one-time",
  });

  // Recurrence state
  const [recurrencePattern, setRecurrencePattern] =
    useState<RecurrencePattern | null>({
      type: "weekly",
      weekdays: [],
      timeSlots: ["09:00-11:00"],
      interval: 1,
      maxOccurrences: 5,
    });

  const priceGroupDescriptions: Record<PriceGroup, string> = {
    "kommunale-virksomheter":
      "For kommunens egne virksomheter, skoler og barnehager. Redusert pris gjelder.",
    "ikke-kommersielle-aktorer":
      "Disse aktørene låner lokaler gratis. Kategorien omfatter frivillige organisasjoner, frivillige enkeltpersoner og grupper. Andre aktører som har sosiale og ideelle mål, i motsetning til økonomisk gevinst, kan også falle inn under denne kategorien. Det er avdelingen som styrer bookingen som vurderer dette. Aktørene må ha base i Drammen kommune.",
    "kommersielle-private":
      "For virksomheter med kommersielle formål, private selskaper, bursdag og andre private arrangementer. Standard timepris gjelder.",
  };

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 });
  });

  // Slot dialog state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{
    zoneId: string;
    date: Date;
    timeSlot: string;
    status: string;
  } | null>(null);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [conflictAvailableSlots, setConflictAvailableSlots] = useState<ISelectedTimeSlot[]>([]);
  const [conflictConflictedSlots, setConflictConflictedSlots] = useState<ISelectedTimeSlot[]>([]);
  const [recommendedServices, setRecommendedServices] = useState([
    { id: "extra-time", name: "Ekstra tid", description: "Forleng bookingen med 30 minutter", price: 200, selected: false },
    { id: "equipment", name: "Utstyr", description: "Inkluderer ballnett, musikanlegg og annet utstyr", price: 150, selected: false },
    { id: "caretaker", name: "Vaktmesterhjelp", description: "Hjelp med oppsett og nedrigg av utstyr", price: 300, selected: false },
    { id: "security", name: "Sikkerhet", description: "Vaktmester til stede under hele arrangementet", price: 500, selected: false },
  ]);

  // Get selected zone
  const selectedZone = zones?.find((zone) => zone.id === selectedZoneId);

  // Use hooks
  const {
    currentStep,
    currentStepIndex,
    steps,
    progress,
    nextStep,
    previousStep,
    validateStep,
    canProceedToNext,
    isFirstStep,
    isLastStep,
    goToStep,
    goToStepDirect,
  } = useBookingSteps({
    formData,
    selectedSlots,
    recurrencePattern,
    initialStep: "calendar",
  });

  const { recurringSlots, generateSlots, clearSlots } =
    useRecurringSlotGeneration({
      selectedSlots,
      selectedZone,
      facilityId,
    });

  const { getAvailabilityStatus: internalGetAvailabilityStatus } =
    useAvailabilityStatus(selectedSlots);

  const getAvailabilityStatusLocal =
    getAvailabilityStatus || internalGetAvailabilityStatus;

  // Simple isSlotSelected function
  const isSlotSelectedLocal = useCallback(
    (zoneId: string, date: Date, timeSlot: string): boolean => {
      return selectedSlots.some((slot) => {
        const slotDate =
          slot.date instanceof Date ? slot.date : new Date(slot.date);
        return (
          slot.zoneId === zoneId &&
          slotDate.toDateString() === date.toDateString() &&
          slot.timeSlot === timeSlot
        );
      });
    },
    [selectedSlots]
  );

  // Clean up old slots when entering recurrence step
  React.useEffect(() => {
    if (currentStep === "recurrence" && selectedSlots.length > 0) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSlots = selectedSlots.filter((slot) => {
        const slotDate =
          slot.date instanceof Date ? slot.date : new Date(slot.date);
        return slotDate >= sevenDaysAgo;
      });

      if (recentSlots.length !== selectedSlots.length) {
        onSlotsChange(recentSlots);
      }
    }
  }, [currentStep, selectedSlots, onSlotsChange]);

  // Week navigation
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
  }, []);

  // Calculate current week
  const currentWeek = useMemo(() => {
    const start = currentWeekStart;
    const end = addWeeks(start, 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      days.push({
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false,
        isPast: date < new Date(),
        timeSlots: [],
      });
    }
    return { startDate: start, endDate: end, days };
  }, [currentWeekStart]);

  // Form data handlers
  const handleFormDataUpdate = useCallback(
    (updates: Partial<IBookingFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleBookingTypeChange = useCallback(
    (type: BookingType) => {
      handleFormDataUpdate({ bookingType: type });
    },
    [handleFormDataUpdate]
  );

  // Recurrence pattern handler
  const handleRecurrencePatternChange = useCallback(
    (pattern: RecurrencePattern | null) => {
      const patternWithStartDate = pattern
        ? {
          ...pattern,
          startDate:
            selectedSlots.length > 0
              ? selectedSlots[selectedSlots.length - 1].date
              : pattern.startDate,
        }
        : null;

      setRecurrencePattern(patternWithStartDate);
      handleFormDataUpdate({ recurrencePattern: patternWithStartDate });

      if (pattern && selectedSlots.length > 0 && selectedZone) {
        const isPatternComplete = (() => {
          switch (pattern.type) {
            case "weekly":
            case "biweekly":
              return (
                Array.isArray(pattern.weekdays) && pattern.weekdays.length > 0
              );
            case "monthly":
              return (
                pattern.monthlyWeekday !== undefined ||
                (Array.isArray(pattern.weekdays) && pattern.weekdays.length > 0)
              );
            case "custom":
              return pattern.interval !== undefined && pattern.interval > 0;
            default:
              return true;
          }
        })();

        if (isPatternComplete) {
          generateSlots(pattern);
        } else {
          clearSlots();
        }
      } else {
        clearSlots();
      }
    },
    [
      handleFormDataUpdate,
      selectedSlots,
      selectedZone,
      generateSlots,
      clearSlots,
    ]
  );

  // Slot handlers
  const handleSlotClick = useCallback(
    (zoneId: string, date: Date, timeSlot: string, status: string) => {
      if (status === "available" || status === "selected") {
        const existingIndex = selectedSlots.findIndex((slot) => {
          const slotDate =
            slot.date instanceof Date ? slot.date : new Date(slot.date);
          return (
            slot.zoneId === zoneId &&
            slotDate.toDateString() === date.toDateString() &&
            slot.timeSlot === timeSlot
          );
        });

        if (existingIndex >= 0) {
          const updatedSlots = selectedSlots.filter(
            (_, index) => index !== existingIndex
          );
          onSlotsChange(updatedSlots);
        } else {
          setPendingSlot({ zoneId, date, timeSlot, status });
          setSlotDialogOpen(true);
        }
      }
    },
    [selectedSlots, onSlotsChange]
  );

  const handleClearAllSlots = useCallback(() => {
    onSlotsChange([]);
    clearSlots();
  }, [onSlotsChange, clearSlots]);

  const handleRemoveSlots = useCallback(
    (slotIds: readonly string[]) => {
      const filtered = selectedSlots.filter((s) => !slotIds.includes(s.id));
      onSlotsChange(filtered);
    },
    [selectedSlots, onSlotsChange]
  );

  const [conflictNotice, setConflictNotice] = useState<string | null>(null);
  const [confirmLoggedIn, setConfirmLoggedIn] = useState(false);

  const totalSelectedSlots = selectedSlots.length + recurringSlots.length;
  const totalSelectedHours =
    selectedSlots.reduce((sum, s) => sum + (s.duration || 0), 0) / 60 +
    recurringSlots.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

  // Booking handlers
  const handleAddToCart = useCallback(() => {
    if (
      validateStep("details") &&
      validateStep("calendar") &&
      validateStep("terms")
    ) {
      if (formData.bookingType === "recurring" && recurringSlots.length > 0) {
        onAddToCart({
          ...formData,
          recurringSlots: recurringSlots,
          bookingType: "recurring" as const,
        });
      } else {
        onAddToCart(formData);
      }
    }
  }, [formData, recurringSlots, validateStep, onAddToCart]);

  const handleCompleteBooking = useCallback(() => {
    if (
      validateStep("details") &&
      validateStep("calendar") &&
      validateStep("terms")
    ) {
      if (formData.bookingType === "recurring" && recurringSlots.length > 0) {
        onCompleteBooking({
          ...formData,
          recurringSlots: recurringSlots,
          bookingType: "recurring" as const,
        });
      } else {
        onCompleteBooking(formData);
      }
    }
  }, [formData, recurringSlots, validateStep, onCompleteBooking]);

  // Render step content
  const renderStepContent = (): JSX.Element | null => {
    switch (currentStep) {
      case "details":
        return (
          <div className="space-y-4">
            {/* Cards */}
            <div className="space-y-4">
              <Card className="w-full shadow-sm border-slate-200">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Prisgruppe
                      </p>
                      <p className="text-sm text-slate-500">
                        Utleier tilbyr egne priser til enkelte kundegrupper. Valg av prisgruppe medfører en godkjenningsprosess.
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>

                  <Select
                    value={formData.priceGroup}
                    onValueChange={(value: PriceGroup | "") =>
                      handleFormDataUpdate({ priceGroup: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Velg prisgruppe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kommunale-virksomheter">
                        Kommunale virksomheter
                      </SelectItem>
                      <SelectItem value="ikke-kommersielle-aktorer">
                        Ikke-kommersielle aktører
                      </SelectItem>
                      <SelectItem value="kommersielle-private">
                        Kommersielle aktører og private arrangementer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.priceGroup && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                      {priceGroupDescriptions[formData.priceGroup as PriceGroup]}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="w-full shadow-sm border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700">
                    Anbefalte tillegg
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100">
                  {recommendedServices.map((service) => (
                    <div
                      key={service.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        setRecommendedServices((prev) =>
                          prev.map((s) =>
                            s.id === service.id ? { ...s, selected: !s.selected } : s
                          )
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setRecommendedServices((prev) =>
                            prev.map((s) =>
                              s.id === service.id ? { ...s, selected: !s.selected } : s
                            )
                          );
                        }
                      }}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Checkbox checked={service.selected} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-slate-900">
                            {service.name}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            +{service.price} kr
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-red-200 bg-red-50 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-red-700">
                    Utleier DRAMMEN KOMMUNE - Skolelokaler orgnr. 920125298 krever at du har lest og godkjent betingelser før forespørsel kan sendes.
                  </p>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Last ned Brannvervideo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Last ned Ditt ansvar</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-slate-500" />
                      <span>Last ned Overordnede retningslinjer for lån og leie av lokaler</span>
                    </li>
                  </ul>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.termsAccepted}
                      onCheckedChange={(v: CheckedState) =>
                        handleFormDataUpdate({ termsAccepted: v === true })
                      }
                    />
                    <span className="text-sm text-slate-800">
                      Jeg har lest og godkjenner betingelsene
                    </span>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        );

      case "calendar":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("booking:steps.calendar.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("booking:steps.calendar.description")}
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePreviousWeek}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("booking:navigation.previous_week")}
                  </Button>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold">
                      {format(currentWeek.startDate, "dd. MMM", {
                        locale: currentLocale,
                      })}{" "}
                      -{" "}
                      {format(currentWeek.endDate, "dd. MMM yyyy", {
                        locale: currentLocale,
                      })}
                    </h3>
                  </div>
                  <Button variant="outline" size="lg" onClick={handleNextWeek}>
                    {t("booking:navigation.next_week")}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {selectedZone && (
                  <div className="mt-4">
                    <TimeSlotGrid
                      facilityId={facilityId}
                      zoneId={selectedZone.id}
                      week={currentWeek}
                      selectedSlots={selectedSlots}
                      onSlotClick={handleSlotClick}
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

                <div className="mt-4">
                  <AvailabilityLegend />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "recurrence":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("booking:steps.recurrence.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("booking:steps.recurrence.description")}
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

      case "confirm":
        {
          const priceGroupLabel =
            formData.priceGroup === "kommunale-virksomheter"
              ? "Kommunale virksomheter"
              : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? "Ikke-kommersielle aktører"
              : "Kommersielle/private";

          const baseTotal =
            selectedSlots.reduce(
              (sum, s) => sum + (s.pricePerHour || 0) * ((s.duration || 60) / 60),
              0
            ) +
            recommendedServices
              .filter((s) => s.selected)
              .reduce((sum, s) => sum + s.price, 0);

          const adjustedTotal =
            formData.priceGroup === "kommunale-virksomheter"
              ? baseTotal * 0.5
              : formData.priceGroup === "ikke-kommersielle-aktorer"
                ? 0
                : baseTotal;
          const finalTotalInclVat = adjustedTotal * 1.25;

          const isLoggedIn = confirmLoggedIn || (!!user && !authLoading);

          if (!isLoggedIn) {
            return (
              <div className="space-y-6">
                <div className="bg-[#0f172a] rounded-2xl text-white p-6 shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">Logg inn for å fullføre</h3>
                  <p className="text-sm text-slate-200 mb-4">
                    For å sende din bookingforespørsel må du være innlogget. Vi bruker sikker
                    autentisering for å verifisere din identitet.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-orange-500 text-white flex items-center justify-center font-semibold">
                            V
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Privatperson</p>
                            <p className="text-xs text-slate-500">Anbefalt</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">
                          Rask og enkel innlogging med Vipps. Ingen passord nødvendig.
                        </p>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => {
                            setUserLoginOpen(true);
                          }}
                        >
                          Logg inn med Vipps
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                            <span className="font-semibold">ID</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Organisasjon</p>
                            <p className="text-xs text-slate-500">For ansatte</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">
                          For kommunalt ansatte og bedrifter med organisasjonskonto.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full text-slate-900 border-slate-300"
                          onClick={() => {
                            setAdminLoginOpen(true);
                          }}
                        >
                          Logg inn som ansatt
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4 text-xs text-slate-200 flex items-start gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4 text-emerald-400 mt-0.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 6.97a.75.75 0 00-1.06-1.06l-4.72 4.72-1.72-1.72a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      Din informasjon behandles sikkert og i henhold til personvernlovgivningen. Ved å logge inn
                      godtar du at vi lagrer nødvendige opplysninger for å behandle din booking.
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center justify-center py-6">
              <div className="w-full max-w-xl">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Forespørsel...</h2>
                  </div>

                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mb-3">
                        <span className="text-cyan-600 text-lg">i</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">
                        Dette lokalet krever godkjenning før leie. Når forespørselen er behandlet, kan du betale via Min side
                      </p>
                      {formData.priceGroup && (
                        <p className="text-xs text-slate-700">
                          Du har valgt pris-/kundegruppe: <strong>{priceGroupLabel}</strong>. Utleier må
                          godkjenne at du kvalifiserer for denne kundegruppen.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-500 mb-1">Estimert pris</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {Math.round(finalTotalInclVat)},-
                    </p>
                  </div>

                  {sendBookingError && (
                    <div className="text-sm text-red-600 text-center">{sendBookingError}</div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-full py-5 text-base font-medium"
                      disabled={sendBookingLoading}
                      onClick={handleSendForApproval}
                    >
                      {sendBookingLoading ? "Sender..." : "Send til godkjenning"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

      case "sent":
        {
          const priceGroupLabel =
            formData.priceGroup === "kommunale-virksomheter"
              ? "Kommunale virksomheter"
              : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? "Ikke-kommersielle aktører"
              : "Kommersielle/private";

          const baseTotal =
            selectedSlots.reduce(
              (sum, s) => sum + (s.pricePerHour || 0) * ((s.duration || 60) / 60),
              0
            ) +
            recommendedServices
              .filter((s) => s.selected)
              .reduce((sum, s) => sum + s.price, 0);

          const adjustedTotal =
            formData.priceGroup === "kommunale-virksomheter"
              ? baseTotal * 0.5
              : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? 0
              : baseTotal;

          const firstSlot = selectedSlots[0];
          const firstSlotDate =
            firstSlot && firstSlot.date ? new Date(firstSlot.date) : null;
          const formattedDate =
            firstSlotDate && !Number.isNaN(firstSlotDate.getTime())
              ? format(firstSlotDate, "EEEE dd. MMMM", { locale: currentLocale })
              : null;

          return (
            <div className="flex items-center justify-center py-6">
              <div className="w-full max-w-xl">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <span className="text-emerald-600 text-xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Reservasjon sendt!</h2>
                    <p className="text-sm text-slate-600 mt-2">
                      Din forespørsel er sendt til godkjenning. Du vil motta en bekreftelse på e-post når
                      saksbehandler har behandlet den.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
                    <p className="text-sm font-semibold text-slate-800">Oppsummering</p>
                    {firstSlot && formattedDate && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          {formattedDate}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <span>🕒 {firstSlot.timeSlot}</span>
                          <span>•</span>
                          <span>Zone {firstSlot.zoneName || selectedZone?.name || "-"}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-slate-700">
                      <div className="flex justify-between py-1">
                        <span>Prisgruppe:</span>
                        <span className="font-medium">{priceGroupLabel}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Tilleggstjenester:</span>
                        <span className="font-medium">
                          {recommendedServices.filter((s) => s.selected).length > 0
                            ? `${recommendedServices
                                .filter((s) => s.selected)
                                .map((s) => s.name)
                                .join(", ")}`
                            : "Ingen"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-slate-200 mt-2 pt-2">
                        <span>Tillegg totalt:</span>
                        <span className="font-semibold text-slate-900">
                          {Math.round(
                            recommendedServices
                              .filter((s) => s.selected)
                              .reduce((sum, s) => sum + s.price, 0)
                          )}{" "}
                          kr
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-700">
                    <p className="font-semibold mb-1">Hva skjer nå?</p>
                    <p>
                      En saksbehandler vil se over din forespørsel. Når den er godkjent, vil du få beskjed
                      om å betale via “Min side”. Behandlingstid er vanligvis 1-2 virkedager.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" className="w-full">
                      Tilbake til forsiden
                    </Button>
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                      onClick={() => navigate("/user/bookings")}
                    >
                      Se mine bookinger
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (currentStep === "sent") {
          const priceGroupLabel =
            formData.priceGroup === "kommunale-virksomheter"
              ? "Kommunale virksomheter"
              : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? "Ikke-kommersielle aktører"
              : "Kommersielle/private";

          const baseTotal =
            selectedSlots.reduce(
              (sum, s) => sum + (s.pricePerHour || 0) * ((s.duration || 60) / 60),
              0
            ) +
            recommendedServices
              .filter((s) => s.selected)
              .reduce((sum, s) => sum + s.price, 0);

          const adjustedTotal =
            formData.priceGroup === "kommunale-virksomheter"
              ? baseTotal * 0.5
              : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? 0
              : baseTotal;

          const firstSlot = selectedSlots[0];

          return (
            <div className="flex items-center justify-center py-6">
              <div className="w-full max-w-xl">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <span className="text-emerald-600 text-xl">✓</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Reservasjon sendt!</h2>
                    <p className="text-sm text-slate-600 mt-2">
                      Din forespørsel er sendt til godkjenning. Du vil motta en bekreftelse på e-post når
                      saksbehandler har behandlet den.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 space-y-3">
                    <p className="text-sm font-semibold text-slate-800">Oppsummering</p>
                    {firstSlot && (
                      <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-1">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          {format(firstSlot.date, "EEEE dd. MMMM", { locale: currentLocale })}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <span>🕒 {firstSlot.timeSlot}</span>
                          <span>•</span>
                          <span>Zone {firstSlot.zoneName || selectedZone?.name || "-"}</span>
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-slate-700">
                      <div className="flex justify-between py-1">
                        <span>Prisgruppe:</span>
                        <span className="font-medium">{priceGroupLabel}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span>Tilleggstjenester:</span>
                        <span className="font-medium">
                          {recommendedServices.filter((s) => s.selected).length > 0
                            ? `${recommendedServices
                                .filter((s) => s.selected)
                                .map((s) => s.name)
                                .join(", ")}`
                            : "Ingen"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-t border-slate-200 mt-2 pt-2">
                        <span>Tillegg totalt:</span>
                        <span className="font-semibold text-slate-900">
                          {Math.round(
                            recommendedServices
                              .filter((s) => s.selected)
                              .reduce((sum, s) => sum + s.price, 0)
                          )}{" "}
                          kr
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs text-slate-700">
                    <p className="font-semibold mb-1">Hva skjer nå?</p>
                    <p>
                      En saksbehandler vil se over din forespørsel. Når den er godkjent, vil du få beskjed
                      om å betale via “Min side”. Behandlingstid er vanligvis 1-2 virkedager.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" className="w-full">
                      Tilbake til forsiden
                    </Button>
                    <Button
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                      onClick={() => navigate("/user/bookings")}
                    >
                      Se mine bookinger
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  const progressWidth =
    steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  const handleDialogConfirm = (data: SlotBookingFormData) => {
    if (!pendingSlot) return;

    const buildHourlySegments = (start: string, end: string): string[] => {
      const [sh, sm] = start.split(":").map((v) => parseInt(v, 10));
      const [eh, em] = end.split(":").map((v) => parseInt(v, 10));
      let cursorMinutes = sh * 60 + (sm || 0);
      const endMinutesTotal = eh * 60 + (em || 0);
      const segments: string[] = [];
      const toHHMM = (m: number) =>
        `${Math.floor(m / 60)
          .toString()
          .padStart(2, "0")}:${(m % 60).toString().padStart(2, "0")}`;
      while (cursorMinutes < endMinutesTotal) {
        const next = Math.min(cursorMinutes + 60, endMinutesTotal);
        segments.push(`${toHHMM(cursorMinutes)}-${toHHMM(next)}`);
        cursorMinutes = next;
      }
      return segments;
    };

    const expandToHourlySlots = (slot: ISelectedTimeSlot): ISelectedTimeSlot[] => {
      const segments = buildHourlySegments(
        slot.timeSlot.split("-")[0],
        slot.timeSlot.split("-")[1]
      );
      const date = slot.date instanceof Date ? slot.date : new Date(slot.date);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      return segments.map((segment) => ({
        ...slot,
        id: `${facilityId}-${slot.zoneId}-${dateStr}-${segment}`,
        timeSlot: segment,
        duration: 60,
        date,
      }));
    };

    const startParts = data.startTime.split(":");
    const endParts = data.endTime.split(":");
    const startMinutes = parseInt(startParts[0] || "0") * 60 + parseInt(startParts[1] || "0");
    const endMinutes = parseInt(endParts[0] || "0") * 60 + parseInt(endParts[1] || "0");
    if (endMinutes <= startMinutes) return;

    const buildId = (d: Date) =>
      `${facilityId}-${pendingSlot.zoneId}-${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${data.startTime}-${data.endTime}`;

    const baseSlot = (d: Date): ISelectedTimeSlot => ({
      id: buildId(d),
      facilityId,
      facilityName: _facilityName,
      zoneId: pendingSlot.zoneId,
      zoneName: selectedZone?.name,
      date: d,
      timeSlot: `${data.startTime}-${data.endTime}`,
      duration: endMinutes - startMinutes,
      pricePerHour: selectedZone?.pricePerHour || 0,
      purpose: data.purpose,
      attendees: data.numberOfPeople,
      activityType: data.activityType as ActivityType,
      description: data.description,
      showPurposeInCalendar: data.showPurposeInCalendar,
    });

    let candidateSlots: ISelectedTimeSlot[] = [baseSlot(pendingSlot.date)];

    if (data.isSeasonBooking && data.endDate && data.weekdays && data.weekdays.length > 0) {
      const end = data.endDate;
      const interval = Math.max(1, data.repetitionInterval || 1);
      const days: ISelectedTimeSlot[] = [];
      let cursor = new Date(pendingSlot.date);
      let weekCounter = 0;
      while (cursor <= end && weekCounter < 104) {
        const dayIdx = cursor.getDay(); // 0=Sun
        const mapped = dayIdx === 0 ? 6 : dayIdx - 1; // 0=Mon
        const weekIndex = Math.floor(
          (cursor.getTime() - pendingSlot.date.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        if (weekIndex % interval === 0 && data.weekdays.includes(mapped)) {
          days.push(baseSlot(new Date(cursor)));
        }
        cursor = addDays(cursor, 1);
        weekCounter++;
      }
      if (days.length > 0) {
        candidateSlots = days;
      }
    }

    // Expand to hourly slots for UI selection/visibility and conflict checking
    const hourlySlots = candidateSlots.flatMap(expandToHourlySlots);

    // Check conflicts against current availability
    const conflicted = hourlySlots.filter((slot) => {
      const status = getAvailabilityStatus?.(slot.zoneId, slot.date, slot.timeSlot);
      const s = status?.status;
      // Treat anything other than available/selected as conflict (busy, unavailable, conflict, occupied, etc.)
      return s !== "available" && s !== "selected";
    });

    if (conflicted.length > 0) {
      const availableOnly = hourlySlots.filter((slot) => !conflicted.includes(slot));
      setConflictAvailableSlots(availableOnly);
      setConflictConflictedSlots(conflicted);
      const skipped = Array.from(
        new Set(
          conflicted
            .map((slot) => {
              const slotDate =
                slot.date instanceof Date ? slot.date : new Date(slot.date);
              if (Number.isNaN(slotDate.getTime())) return null;
              return `${format(slotDate, "dd.MM.yyyy", { locale: currentLocale })} ${slot.timeSlot}`;
            })
            .filter(Boolean)
        )
      );
      setConflictNotice(
        `Følgende tid(er) er opptatt og ble hoppet over: ${skipped.join(", ")}`
      );
      setSlotDialogOpen(false);
      setConflictDialogOpen(true);
      return;
    }

    setConflictNotice(null);
    setConflictAvailableSlots([]);
    setConflictConflictedSlots([]);
    onSlotsChange([...selectedSlots, ...hourlySlots]);

    setFormData((prev) => ({
      ...prev,
      purpose: data.purpose || prev.purpose,
      attendees: data.numberOfPeople || prev.attendees,
      activityType: (data.activityType as ActivityType) || prev.activityType,
      additionalInfo: data.description || prev.additionalInfo || "",
    }));

    setSlotDialogOpen(false);
    setPendingSlot(null);
    goToStep("details");
  };

  const handleDialogClose = () => {
    setSlotDialogOpen(false);
    setPendingSlot(null);
  };

  const handleConflictConfirm = () => {
    if (conflictAvailableSlots.length > 0) {
      onSlotsChange([...selectedSlots, ...conflictAvailableSlots]);
    }
    setConflictDialogOpen(false);
    setConflictAvailableSlots([]);
    setConflictConflictedSlots([]);
    setConflictNotice(null);
    setPendingSlot(null);
  };

  const handleConflictChangeTime = () => {
    setConflictDialogOpen(false);
    setSlotDialogOpen(true);
  };

  const [userLoginOpen, setUserLoginOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [userLoginEmail, setUserLoginEmail] = useState("");
  const [userLoginPassword, setUserLoginPassword] = useState("");
  const [adminLoginEmail, setAdminLoginEmail] = useState("");
  const [adminLoginPassword, setAdminLoginPassword] = useState("");
  const [loginLoadingUser, setLoginLoadingUser] = useState(false);
  const [loginLoadingAdmin, setLoginLoadingAdmin] = useState(false);
  const [loginErrorUser, setLoginErrorUser] = useState<string | null>(null);
  const [loginErrorAdmin, setLoginErrorAdmin] = useState<string | null>(null);
  const { signInWithPassword, user, loading: authLoading, currentOrgId } = useAuth();
  const createBookingMutation = useCreateBooking();
  const [sendBookingLoading, setSendBookingLoading] = useState(false);
  const [sendBookingError, setSendBookingError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submitLogin = async (type: "user" | "admin") => {
    const email = type === "user" ? userLoginEmail : adminLoginEmail;
    const password = type === "user" ? userLoginPassword : adminLoginPassword;
    const setErr = type === "user" ? setLoginErrorUser : setLoginErrorAdmin;
    const setLoading = type === "user" ? setLoginLoadingUser : setLoginLoadingAdmin;
    if (!email || !password) {
      setErr("Vennligst fyll ut både e-post og passord");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      setConfirmLoggedIn(true);
      if (type === "user") {
        setUserLoginOpen(false);
      } else {
        setAdminLoginOpen(false);
      }
    } catch (err) {
      console.error("Login failed", err);
      setErr("Innlogging feilet. Sjekk e-post og passord.");
    } finally {
      setLoading(false);
    }
  };

  // Sett innloggingsstatus automatisk hvis bruker allerede er innlogget
  useEffect(() => {
    if (!authLoading && user) {
      setConfirmLoggedIn(true);
    }
  }, [authLoading, user]);

  const handleSendForApproval = useCallback(async () => {
    if (!user) {
      setConfirmLoggedIn(false);
      goToStep("confirm");
      return;
    }

    if (!selectedZone || selectedSlots.length === 0) {
      setSendBookingError("Ingen tidspunkter valgt.");
      return;
    }

    try {
      setSendBookingLoading(true);
      setSendBookingError(null);

      let orgId = currentOrgId || "00000000-0000-0000-0000-000000000000";
      try {
        const facility = await facilitiesService.getById(facilityId);
        orgId = facility.org_id || orgId;
      } catch (e) {
        console.warn("Klarte ikke hente org_id for facility, bruker fallback.", e);
      }

      const selectedServices = recommendedServices.filter((s) => s.selected);
      const servicesTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
      const servicesSharePerSlot =
        selectedSlots.length > 0 ? servicesTotal / selectedSlots.length : 0;

      const bookingPromises = selectedSlots.map((slot) => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        if (Number.isNaN(slotDate.getTime())) {
          throw new Error("Ugyldig dato på valgt tidspunkt.");
        }

        const [startStr, endStr] = slot.timeSlot.split("-");
        if (!startStr || !endStr) {
          throw new Error("Ugyldig tidsformat på valgt tidspunkt.");
        }

        const dateStr = format(slotDate, "yyyy-MM-dd");
        const starts_at = new Date(`${dateStr}T${startStr}`);
        const ends_at = new Date(`${dateStr}T${endStr}`);

        const base = (slot.pricePerHour || 0) * ((slot.duration || 60) / 60);
        const discountMultiplier =
          formData.priceGroup === "kommunale-virksomheter"
            ? 0.5
            : formData.priceGroup === "ikke-kommersielle-aktorer"
              ? 0
              : 1;
        const slotSubtotal = base * discountMultiplier + servicesSharePerSlot;
        const totalWithVat = slotSubtotal * 1.25;
        const total_cents = Math.round(totalWithVat * 100);

        return createBookingMutation.mutateAsync({
          facility_id: facilityId,
          zone_id: slot.zoneId ?? null,
          org_id: orgId,
          user_id: user.id,
          starts_at: starts_at.toISOString(),
          ends_at: ends_at.toISOString(),
          total_cents,
          currency: "NOK",
          status: "pending",
          notes: formData.purpose || slot.purpose || "Booking",
          is_recurring: false,
          price_breakdown: null,
          group_id: null,
          recurring_booking_id: null,
        });
      });

      await Promise.all(bookingPromises);
      goToStepDirect("sent");
    } catch (error) {
      console.error("Kunne ikke sende booking:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Kunne ikke sende booking. Prøv igjen.";
      setSendBookingError(message);
    } finally {
      setSendBookingLoading(false);
    }
  }, [
    user,
    selectedZone,
    selectedSlots,
    facilityId,
    formData.purpose,
    createBookingMutation,
    currentOrgId,
    goToStep,
    goToStepDirect,
  ]);

  const getSelectedSlotPurpose = useCallback(
    (zoneId: string, date: Date, timeSlot: string) => {
      const match = selectedSlots.find((slot) => {
        const slotDate = slot.date instanceof Date ? slot.date : new Date(slot.date);
        return (
          slot.zoneId === zoneId &&
          slotDate.toDateString() === date.toDateString() &&
          slot.timeSlot === timeSlot
        );
      });
      return match;
    },
    [selectedSlots]
  );

  return (
    <div className="space-y-6 bg-[#f5f7fb] p-4 sm:p-6 rounded-2xl border border-slate-200">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Ledighetskalender</h1>
        <p className="text-slate-600">
          Legg inn din reservasjon raskt og enkelt på 4 steg.
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Bookingprosess</h3>
          <span className="text-sm text-slate-500">
            Steg {currentStepIndex + 1} av {steps.length}
          </span>
        </div>
        <div className="relative px-2">
          <div className="absolute left-0 right-0 top-7 h-[2px] bg-slate-200" />
          <div
            className="absolute left-0 top-7 h-[2px] bg-[#3551a5] transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
          <div className="relative grid grid-cols-4 gap-2">
            {steps.slice(0, 4).map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isActive = step.id === currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center text-center gap-2">
                  <div className="relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <div
                      className={cn(
                        "w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                        isCompleted && "bg-[#3551a5] text-white border-[#3551a5]",
                        isActive &&
                          "bg-[#3551a5] text-white border-[#3551a5] shadow-[0_8px_20px_-6px_rgba(53,81,165,0.4)]",
                        !isCompleted && !isActive && "bg-slate-100 text-slate-500 border-slate-200"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium text-center leading-tight max-w-[110px]",
                      isActive ? "text-slate-900" : "text-slate-500"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {currentStep === "confirm" || currentStep === "sent" ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-full max-w-4xl">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">{renderStepContent()}</CardContent>
            </Card>
          </div>

          <div className="flex justify-between w-full max-w-4xl">
            <Button
              onClick={previousStep}
              variant="outline"
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common:navigation.previous")}
            </Button>

            <Button
              onClick={nextStep}
              disabled={isLastStep || !canProceedToNext}
              className="flex items-center gap-2"
            >
              {t("common:navigation.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          {/* Left Column - Step Content */}
          <div className="space-y-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">{renderStepContent()}</CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={previousStep}
                variant="outline"
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("common:navigation.previous")}
              </Button>

              <Button
                onClick={nextStep}
                disabled={isLastStep || !canProceedToNext}
                className="flex items-center gap-2"
              >
                {t("common:navigation.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Column - Time Slots & Pricing */}
          <div>
            <div className="sticky top-4 space-y-4">
              <Card className="w-full shadow-sm border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-800">
                    {selectedSlots.length > 0
                      ? formData.bookingType === "recurring"
                        ? recurringSlots.length > 0
                          ? currentStep === "calendar"
                            ? t("booking:sidebar.recurring_slots_only", "Valgte gjentakende tidspunkt")
                            : t("booking:sidebar.recurring_slots_and_price")
                          : t("booking:sidebar.slots_and_price_select_pattern")
                        : currentStep === "calendar"
                          ? t("booking:sidebar.selected_slots_only", "Valgte tidspunkt")
                          : formData.priceGroup
                            ? t("booking:sidebar.selected_slots_and_price")
                            : t("booking:sidebar.selected_slots_only", "Valgte tidspunkt")
                      : t("booking:sidebar.select_slots_pricing")}
                  </CardTitle>
                  {totalSelectedSlots > 0 && (
                    <p className="text-xs text-slate-500">
                      {totalSelectedSlots} valg · {totalSelectedHours} timer
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {selectedSlots.length > 0 || recurringSlots.length > 0 ? (
                    <>
                      <TimeSlotDisplay
                        slots={selectedSlots}
                        recurringSlots={recurringSlots}
                        bookingType={formData.bookingType}
                        onRemoveSlot={handleRemoveSlots}
                        onClearAll={handleClearAllSlots}
                        conflictNotice={conflictNotice}
                      />

                      {currentStep !== "calendar" && formData.priceGroup ? (
                        <PriceCalculation
                          selectedSlots={selectedSlots}
                          recurringSlots={recurringSlots}
                          actorType={formData.actorType}
                          activityType={formData.activityType}
                          priceGroup={formData.priceGroup}
                          bookingType={formData.bookingType}
                          recommendedServices={recommendedServices}
                        />
                      ) : currentStep !== "calendar" ? (
                        <div className="p-4 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-sm">
                          {t("booking:pricing.select_price_group_first", "Velg prisgruppe for å se prisberegning.")}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm">
                        {t("booking:sidebar.select_slots_pricing")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <h4 className="font-medium text-sm text-slate-900 mb-2">Tips</h4>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li>• Klikk på ledige tidspunkter for å velge</li>
                  <li>• Bruk "Book flere dager?" for gjentakende booking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot booking dialog */}
      <SlotBookingDialog
        isOpen={slotDialogOpen}
        onClose={() => {
          setSlotDialogOpen(false);
          setPendingSlot(null);
        }}
        onConfirm={handleDialogConfirm}
        selectedDate={pendingSlot?.date || null}
        selectedTime={pendingSlot?.timeSlot.split("-")[0] || null}
        zoneName={selectedZone?.name}
      />

      {/* User login modal (embedded form) */}
      <Dialog open={userLoginOpen} onOpenChange={setUserLoginOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <div className="flex flex-col rounded-lg overflow-hidden border border-slate-200">
            <div className="flex flex-col space-y-1.5 p-6 pb-4 pt-6 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
              <p className="text-xs uppercase tracking-wide">Bruker</p>
              <DialogTitle className="text-lg font-semibold text-white p-0">Innlogging</DialogTitle>
              <p className="text-sm text-slate-100">Logg inn med e-post og passord</p>
            </div>
            <div className="p-6 pt-4 space-y-3">
              <Label className="text-sm font-medium text-slate-700">E-postadresse</Label>
              <Input
                value={userLoginEmail}
                onChange={(e) => setUserLoginEmail(e.target.value)}
                placeholder="E-postadresse"
                disabled={loginLoadingUser}
                type="text"
                name="user-email"
                autoComplete="new-email"
              />
              <Label className="text-sm font-medium text-slate-700">Passord</Label>
              <Input
                type="password"
                value={userLoginPassword}
                onChange={(e) => setUserLoginPassword(e.target.value)}
                placeholder="Passord"
                disabled={loginLoadingUser}
                name="user-password"
                autoComplete="new-password"
              />
              {loginErrorUser && (
                <p className="text-xs text-red-600 font-medium">{loginErrorUser}</p>
              )}
              <p className="text-xs text-slate-500">
                Test-kontoer:
                <br />• test.user@drammen.kommune.no
                <br />• staff@drammen.kommune.no
                <br />• admin@drammen.kommune.no
                <br />• owner@drammen.kommune.no
                <br />• superadmin@booknor.no
                <br />
                Passord: Test123!
              </p>
            </div>
          </div>
          <DialogFooter className="mt-3 gap-2">
            <Button variant="outline" onClick={() => setUserLoginOpen(false)}>
              Lukk
            </Button>
            <Button
              disabled={loginLoadingUser}
              onClick={() => submitLogin("user")}
            >
              {loginLoadingUser ? "Logger inn..." : "Logg inn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin login modal (embedded form) */}
      <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Logg inn som ansatt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">Ansatt-ID / e-post</Label>
            <Input
              value={adminLoginEmail}
              onChange={(e) => setAdminLoginEmail(e.target.value)}
              placeholder="Ansatt-ID / e-post"
              disabled={loginLoadingAdmin}
              type="text"
              name="admin-email"
              autoComplete="new-email"
            />
            <Label className="text-sm font-medium text-slate-700">Passord</Label>
            <Input
              type="password"
              value={adminLoginPassword}
              onChange={(e) => setAdminLoginPassword(e.target.value)}
              placeholder="Passord"
              disabled={loginLoadingAdmin}
              name="admin-password"
              autoComplete="new-password"
            />
            {loginErrorAdmin && (
              <p className="text-xs text-red-600 font-medium">{loginErrorAdmin}</p>
            )}
            <p className="text-xs text-slate-500">
              Test-kontoer:
              <br />• test.user@drammen.kommune.no
              <br />• staff@drammen.kommune.no
              <br />• admin@drammen.kommune.no
              <br />• owner@drammen.kommune.no
              <br />• superadmin@booknor.no
              <br />
              Passord: Test123!
            </p>
          </div>
          <DialogFooter className="mt-3 gap-2">
            <Button variant="outline" onClick={() => setAdminLoginOpen(false)}>
              Avbryt
            </Button>
            <Button
              disabled={loginLoadingAdmin}
              onClick={() => submitLogin("admin")}
            >
              {loginLoadingAdmin ? "Logger inn..." : "Logg inn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={conflictDialogOpen} onOpenChange={setConflictDialogOpen}>
        <DialogContent
          className="sm:max-w-[520px] max-h-[85vh] overflow-hidden p-0"
          aria-describedby="conflict-dialog-description"
        >
          <div className="max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <DialogHeader className="sticky top-0 bg-white pb-3">
              <DialogTitle>Endre eller bekreft tider</DialogTitle>
              <p
                id="conflict-dialog-description"
                className="text-sm text-slate-600"
              >
                Noen valgte tider er opptatt. Du kan endre tidspunkt eller bekrefte de ledige tidene under.
              </p>
            </DialogHeader>
            {conflictConflictedSlots.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                Følgende tid(er) er opptatt og ble hoppet over:
                <ul className="list-disc list-inside mt-1">
                  {Array.from(
                    new Set(
                      conflictConflictedSlots.map(
                        (s) =>
                          `${format(s.date, "dd.MM.yyyy", { locale: currentLocale })} ${s.timeSlot}`
                      )
                    )
                  ).map((txt) => (
                    <li key={txt}>{txt}</li>
                  ))}
                </ul>
              </div>
            )}

            {conflictAvailableSlots.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 space-y-2">
                <p className="font-medium">Disse dagene er ledige for booking</p>
                <ul className="space-y-1">
                  {conflictAvailableSlots.map((s) => (
                    <li
                      key={`${s.id}-avail`}
                      className="flex items-center justify-between rounded-md bg-white px-3 py-2 border border-slate-200"
                    >
                      <span>
                        {format(s.date, "EEEE dd.MM.yyyy", { locale: currentLocale })} · {s.timeSlot}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter className="mt-2 gap-2">
              <Button variant="outline" onClick={handleConflictChangeTime}>
                Endre tidspunkt
              </Button>
              <Button onClick={handleConflictConfirm}>Book valgte tidspunkter</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StepByStepBooking;
