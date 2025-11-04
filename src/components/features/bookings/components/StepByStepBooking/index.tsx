"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  FileText,
  Shield,
  Users,
  X,
} from "lucide-react";
import {
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  format,
} from "date-fns";
import { nb, enUS } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BookingTypeSelector } from "../BookingForm/BookingTypeSelector";
import { RecurrencePatternSelector } from "../RecurringBookingModal/RecurrencePatternSelector";
import { TimeSlotGrid } from "@/components/features/calendar/components/EnhancedCalendar/TimeSlotGrid";
import { AvailabilityLegend } from "@/components/features/calendar/components/EnhancedCalendar/AvailabilityLegend";
import { PriceCalculation } from "../BookingForm/PriceCalculation";
import { TimeSlotDisplay } from "./components/TimeSlotDisplay";
import { Step5Actions } from "./steps/Step5Actions";

import { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";

import {
  useBookingSteps,
  useRecurringSlotGeneration,
} from "@/hooks/features/bookings";
import { useAvailabilityStatus } from "../../hooks";

import type {
  ISelectedTimeSlot,
  IZone,
  BookingType,
  IBookingFormData,
  ActivityType,
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
  const { t, i18n } = useTranslation(["booking", "common"]);
  const currentLocale = i18n.language === "en" ? enUS : nb;

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

  // Recurrence state
  const [recurrencePattern, setRecurrencePattern] =
    useState<RecurrencePattern | null>({
      type: "weekly",
      weekdays: [],
      timeSlots: ["09:00-11:00"],
      interval: 1,
      maxOccurrences: 5,
    });

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 });
  });

  // Get selected zone
  const selectedZone = zones?.find((zone) => zone.id === selectedZoneId);

  // Use hooks
  const {
    currentStep,
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
          const localDateString = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          const newSlot: ISelectedTimeSlot = {
            id: `${facilityId}-${zoneId}-${localDateString}-${timeSlot}`,
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
      onSlotClick?.(zoneId, date, timeSlot, status);
    },
    [selectedSlots, onSlotsChange, facilityId, selectedZone, onSlotClick]
  );

  const handleBulkSelect = useCallback(
    (slots: readonly ISelectedTimeSlot[]) => {
      const enrichedSlots = slots.map((slot) => ({
        ...slot,
        facilityId,
        zoneName: selectedZone?.name || "",
        pricePerHour: selectedZone?.pricePerHour || 0,
      }));
      onSlotsChange([...selectedSlots, ...enrichedSlots]);
      onBulkSlotSelection?.(slots);
    },
    [selectedSlots, onSlotsChange, facilityId, selectedZone, onBulkSlotSelection]
  );

  const handleClearAllSlots = useCallback(() => {
    onSlotsChange([]);
    clearSlots();
  }, [onSlotsChange, clearSlots]);

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
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("booking:steps.details.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("booking:steps.details.description")}
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    {t("booking:form.purpose_label")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) =>
                      handleFormDataUpdate({ purpose: e.target.value })
                    }
                    placeholder={t("booking:form.purpose_placeholder")}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-sm font-medium">
                    {t("booking:form.attendees_label")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="attendees"
                    type="number"
                    min="1"
                    value={formData.attendees}
                    onChange={(e) =>
                      handleFormDataUpdate({
                        attendees: parseInt(e.target.value) || 1,
                      })
                    }
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activityType" className="text-sm font-medium">
                    {t("booking:form.activity_type_label")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) =>
                      handleFormDataUpdate({ activityType: value as ActivityType | "" })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t(
                          "booking:form.activity_type_placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sport">
                        {t("booking:activity_types.sport")}
                      </SelectItem>
                      <SelectItem value="kultur">
                        {t("booking:activity_types.culture")}
                      </SelectItem>
                      <SelectItem value="møte">
                        {t("booking:activity_types.meeting")}
                      </SelectItem>
                      <SelectItem value="arrangement">
                        {t("booking:activity_types.event")}
                      </SelectItem>
                      <SelectItem value="trening">
                        {t("booking:activity_types.training")}
                      </SelectItem>
                      <SelectItem value="annet">{t("common:common.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
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
                      onBulkSelect={handleBulkSelect}
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

  return (
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

            <div className="flex gap-2">
              <BookingTypeSelector
                selectedType={formData.bookingType}
                onTypeChange={handleBookingTypeChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Step Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Progress Indicator */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {t("booking:progress.title")}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {t("booking:progress.step_of", {
                      current: steps.findIndex((s) => s.id === currentStep) + 1,
                      total: steps.length
                    })}
                  </span>
                </div>

                <Progress value={progress} className="h-2" />

                <div className="flex justify-between">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isCompleted =
                      index <
                      steps.findIndex((s) => s.id === currentStep);
                    const isCurrent = step.id === currentStep;
                    const isAccessible =
                      index <=
                      steps.findIndex((s) => s.id === currentStep);

                    return (
                      <button
                        key={step.id}
                        onClick={() => isAccessible && goToStep(step.id)}
                        disabled={!isAccessible}
                        className={`flex flex-col items-center space-y-2 p-2 rounded-lg transition-colors ${
                          isCurrent
                            ? "bg-blue-100 text-blue-700"
                            : isCompleted
                            ? "bg-green-100 text-green-700"
                            : isAccessible
                            ? "hover:bg-gray-100 text-gray-600"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                        <span className="text-xs font-medium text-center">
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
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
        <div className="lg:col-span-2">
          <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {selectedSlots.length > 0
                    ? formData.bookingType === "recurring"
                      ? recurringSlots.length > 0
                        ? t("booking:sidebar.recurring_slots_and_price")
                        : t("booking:sidebar.slots_and_price_select_pattern")
                      : t("booking:sidebar.selected_slots_and_price")
                    : t("booking:sidebar.select_slots_pricing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {selectedSlots.length > 0 || recurringSlots.length > 0 ? (
                  <>
                    <TimeSlotDisplay
                      slots={selectedSlots}
                      recurringSlots={recurringSlots}
                      bookingType={formData.bookingType}
                      onClearAll={handleClearAllSlots}
                    />

                    <PriceCalculation
                      selectedSlots={selectedSlots}
                      recurringSlots={recurringSlots}
                      actorType={formData.actorType}
                      activityType={formData.activityType}
                      bookingType={formData.bookingType}
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      {t("booking:sidebar.select_slots_pricing")}
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
