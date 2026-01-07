"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Download, Users, ChevronDown, CalendarIcon } from "lucide-react";
import { startOfWeek, addWeeks, subWeeks, addDays, format } from "date-fns";
import { nb } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
                    <button
                      key={service.id}
                      onClick={() =>
                        setRecommendedServices((prev) =>
                          prev.map((s) =>
                            s.id === service.id ? { ...s, selected: !s.selected } : s
                          )
                        )
                      }
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
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
                    </button>
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

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  disabled={
                    !formData.priceGroup || !formData.termsAccepted || selectedSlots.length === 0
                  }
                >
                  Fortsett til neste steg
                </Button>
              </div>
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

      case "terms":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("booking:steps.terms.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("booking:steps.terms.description")}
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      {t("booking:terms.rules_title")}
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>
                        •{" "}
                        {t(
                          "booking:terms.rules.cleaning"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "booking:terms.rules.key_pickup"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "booking:terms.rules.free_cancellation"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "booking:terms.rules.no_show_fee"
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-start space-x-3 pt-4 border-t">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) =>
                        handleFormDataUpdate({
                          termsAccepted: e.target.checked,
                        })
                      }
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm cursor-pointer">
                      {t("booking:terms.accept_label")}{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {t("booking:terms.accept_terms_and_privacy")}
                      </a>
                      {" "}{t("booking:terms.and")}{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {t("booking:terms.privacy_policy")}
                      </a>
                      {" "}{t("booking:terms.for_use")}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "actions":
        return (
          <Step5Actions
            isValid={
              validateStep("details") &&
              validateStep("calendar") &&
              validateStep("terms")
            }
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            onCompleteBooking={handleCompleteBooking}
          />
        );

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
      const skipped = Array.from(
        new Set(
          conflicted.map((slot) =>
            `${format(slot.date, "dd.MM.yyyy", { locale: currentLocale })} ${slot.timeSlot}`
          )
        )
      );
      setConflictNotice(
        `Følgende tid(er) er opptatt og ble hoppet over: ${skipped.join(", ")}`
      );
      // Filter out conflicting slots, keep available ones
      const availableOnly = hourlySlots.filter(
        (slot) => !conflicted.includes(slot)
      );
      if (availableOnly.length > 0) {
        onSlotsChange([...selectedSlots, ...availableOnly]);
      }
      setSlotDialogOpen(false);
      setPendingSlot(null);
      // Abort if any conflicts were found
      return;
    }

    setConflictNotice(null);
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
                        bookingType={formData.bookingType}
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
    </div>
  );
};

export default StepByStepBooking;
