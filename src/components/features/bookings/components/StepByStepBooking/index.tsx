"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
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
  addMonths,
  format,
  isToday,
  isWeekend,
  isPast,
  getDay,
  parseISO,
  isValid,
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

import { BookingForm } from "../BookingForm";
import { BookingTypeSelector } from "../BookingForm/BookingTypeSelector";
import { RecurrencePatternSelector } from "../RecurringBookingModal/RecurrencePatternSelector";
import { TimeSlotGrid } from "@/components/features/calendar/components/EnhancedCalendar/TimeSlotGrid";
import { AvailabilityLegend } from "@/components/features/calendar/components/EnhancedCalendar/AvailabilityLegend";
import { PriceCalculation } from "../BookingForm/PriceCalculation";

import {
  ISelectedTimeSlot,
  IZone,
  BookingType,
  IBookingFormData,
} from "../../types";
import type { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import { RecurrenceEngine } from "@/components/features/bookings/utils/recurrence";
import { useAvailabilityStatus } from "../../hooks";

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

type BookingStep = "details" | "calendar" | "recurrence" | "terms" | "actions";

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
  const { t, i18n } = useTranslation(["bookings", "common"]);
  const currentLocale = i18n.language === "en" ? enUS : nb;

  // Current step state
  const [currentStep, setCurrentStep] = useState<BookingStep>("calendar");

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
      weekdays: [], // No default selection - user must choose
      timeSlots: ["09:00-11:00"],
      interval: 1,
      maxOccurrences: 5,
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

  // Clean up old slots when entering recurrence step
  React.useEffect(() => {
    if (currentStep === "recurrence" && selectedSlots.length > 0) {
      // Keep only the most recent slots (from the last 7 days)
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

  // Week navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
  });

  // Get selected zone
  const selectedZone = zones?.find((zone) => zone.id === selectedZoneId);

  // Simple isSlotSelected function
  const isSlotSelectedLocal = useCallback(
    (zoneId: string, date: Date, timeSlot: string): boolean => {
      const result = selectedSlots.some((slot) => {
        const slotDate =
          slot.date instanceof Date ? slot.date : new Date(slot.date);
        return (
          slot.zoneId === zoneId &&
          slotDate.toDateString() === date.toDateString() &&
          slot.timeSlot === timeSlot
        );
      });
      return result;
    },
    [selectedSlots]
  );

  // Use the proper availability status hook
  const { getAvailabilityStatus: internalGetAvailabilityStatus } =
    useAvailabilityStatus(selectedSlots);

  // Use external prop if available, otherwise use internal hook
  const getAvailabilityStatusLocal =
    getAvailabilityStatus || internalGetAvailabilityStatus;

  // Week navigation functions
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1));
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
        isPast: isPast(date),
      });
    }

    return {
      startDate: start,
      endDate: end,
      days,
    };
  }, [currentWeekStart]);

  /**
   * Step configuration
   */
  const steps = useMemo(() => {
    const baseSteps = [
      {
        id: "calendar" as BookingStep,
        title: t("bookings:steps.calendar.title", "Kalender"),
        description: t(
          "bookings:steps.calendar.description",
          "Velg dato og tid for bookingen"
        ),
        icon: Calendar,
      },
      {
        id: "details" as BookingStep,
        title: t("bookings:steps.details.title", "Bookingdetaljer"),
        description: t(
          "bookings:steps.details.description",
          "Fyll ut informasjon om bookingen"
        ),
        icon: FileText,
      },
    ];

    // Add recurrence step only for recurring bookings
    if (formData.bookingType === "recurring") {
      baseSteps.push({
        id: "recurrence" as BookingStep,
        title: t("bookings:steps.recurrence.title", "Gjentakelse"),
        description: t(
          "bookings:steps.recurrence.description",
          "Velg gjentakelsesmønster"
        ),
        icon: Clock,
      });
    }

    baseSteps.push(
      {
        id: "terms" as BookingStep,
        title: t("bookings:steps.terms.title", "Vilkår og betingelser"),
        description: t(
          "bookings:steps.terms.description",
          "Les og godta vilkårene"
        ),
        icon: Shield,
      },
      {
        id: "actions" as BookingStep,
        title: t("bookings:steps.actions.title", "Fullfør booking"),
        description: t(
          "bookings:steps.actions.description",
          "Legg i kurv eller fullfør direkte"
        ),
        icon: CheckCircle,
      }
    );

    return baseSteps;
  }, [formData.bookingType, t]);

  /**
   * Calculate current step index
   */
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  /**
   * Validate current step
   */
  const validateStep = useCallback(
    (step: BookingStep): boolean => {
      switch (step) {
        case "details":
          return (
            formData.purpose.trim().length > 0 &&
            formData.attendees > 0 &&
            formData.activityType.trim().length > 0
          );

        case "calendar":
          return selectedSlots.length > 0;

        case "recurrence":
          return (
            formData.bookingType === "one-time" || recurrencePattern !== null
          );

        case "terms":
          return formData.termsAccepted;

        case "actions":
          return true; // Always valid, just action buttons

        default:
          return false;
      }
    },
    [formData, selectedSlots.length, recurringSlots.length, recurrencePattern]
  );

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
  const handleFormDataUpdate = useCallback(
    (updates: Partial<IBookingFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  /**
   * Handle booking type change
   */
  const handleBookingTypeChange = useCallback(
    (type: BookingType) => {
      handleFormDataUpdate({ bookingType: type });
    },
    [handleFormDataUpdate]
  );

  /**
   * Generate recurring slots based on pattern
   */
  const generateRecurringSlots = useCallback(
    (pattern: RecurrencePattern) => {
      if (!selectedSlots.length || !selectedZone) return;

      // Group selected slots into packages first
      const groupTimeSlotsIntoPackages = (slots: ISelectedTimeSlot[]) => {
        // Group by date first
        const dateGroups = slots.reduce((groups, slot) => {
          // Safely handle date conversion
          let date: Date;
          if (slot.date instanceof Date) {
            date = slot.date;
          } else if (typeof slot.date === "string") {
            date = parseISO(slot.date);
          } else {
            date = new Date(slot.date);
          }

          // Validate date
          if (!isValid(date)) {
            console.warn("Invalid date for slot:", slot);
            return groups;
          }

          const dateKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          if (!groups[dateKey]) {
            groups[dateKey] = [];
          }
          groups[dateKey].push(slot);
          return groups;
        }, {} as Record<string, ISelectedTimeSlot[]>);

        // Process each date group
        return Object.entries(dateGroups).map(([dateKey, dateSlots]) => {
          // Sort by start time
          const sortedSlots = dateSlots.sort((a, b) => {
            const timeA = a.timeSlot.split("-")[0];
            const timeB = b.timeSlot.split("-")[0];
            return timeA.localeCompare(timeB);
          });

          // Group consecutive time slots
          const consecutiveGroups: ISelectedTimeSlot[][] = [];
          let currentGroup: ISelectedTimeSlot[] = [sortedSlots[0]];

          for (let i = 1; i < sortedSlots.length; i++) {
            const prevSlot = sortedSlots[i - 1];
            const currentSlot = sortedSlots[i];

            // Check if current slot is consecutive to previous
            const prevEndTime = prevSlot.timeSlot.split("-")[1];
            const currentStartTime = currentSlot.timeSlot.split("-")[0];

            if (prevEndTime === currentStartTime) {
              // Consecutive - add to current group
              currentGroup.push(currentSlot);
            } else {
              // Not consecutive - start new group
              consecutiveGroups.push([...currentGroup]);
              currentGroup = [currentSlot];
            }
          }

          // Add the last group
          consecutiveGroups.push(currentGroup);

          return {
            date: dateKey,
            dateFormatted: new Date(dateKey).toLocaleDateString("nb-NO"),
            groups: consecutiveGroups.map((group) => ({
              slots: group,
              startTime: group[0].timeSlot.split("-")[0],
              endTime: group[group.length - 1].timeSlot.split("-")[1],
              totalDuration: group.reduce(
                (total, slot) => total + slot.duration,
                0
              ),
              isConsecutive:
                group.length === 1 ||
                group.every((slot, index) => {
                  if (index === 0) return true;
                  const prevEndTime = group[index - 1].timeSlot.split("-")[1];
                  const currentStartTime = slot.timeSlot.split("-")[0];
                  return prevEndTime === currentStartTime;
                }),
            })),
          };
        });
      };

      const timePackages = groupTimeSlotsIntoPackages(selectedSlots);

      // Use the first package as the template for recurrence
      const templatePackage = timePackages[0];
      if (!templatePackage) return;

      const templateGroup = templatePackage.groups[0];
      if (!templateGroup) return;

      // Build a map: weekday (0-6) -> grouped time window for that weekday
      const weekdayToGroup = new Map<
        number,
        { startTime: string; endTime: string; totalDuration: number }
      >();
      // And track the first explicit date from the template per weekday
      const weekdayToFirstDate = new Map<number, Date>();
      for (const datePackage of timePackages) {
        // datePackage.date is formatted as YYYY-MM-DD from grouping logic
        const [y, m, d] = datePackage.date.split("-").map(Number);
        const localDate = new Date(y, (m || 1) - 1, d || 1);
        const wd = localDate.getDay();
        const grp = datePackage.groups && datePackage.groups[0];
        if (grp && !weekdayToGroup.has(wd)) {
          weekdayToGroup.set(wd, {
            startTime: grp.startTime,
            endTime: grp.endTime,
            totalDuration: grp.totalDuration,
          });
        }
        if (!weekdayToFirstDate.has(wd)) {
          weekdayToFirstDate.set(wd, localDate);
        }
      }
      // Fallback group if a specific weekday was not part of the template selection
      const defaultGroup = {
        startTime: templateGroup.startTime,
        endTime: templateGroup.endTime,
        totalDuration: templateGroup.totalDuration,
      };

      // Create time slots from the grouped package (kept for compatibility where one weekday is chosen)
      const timeSlots = [`${templateGroup.startTime}-${templateGroup.endTime}`];

      // Use the actual date from selected slots, not pattern.startDate
      // Find the most common date among selected slots
      const dateCounts = selectedSlots.reduce((counts, slot) => {
        // Use local date to avoid timezone issues
        const slotDate =
          slot.date instanceof Date ? slot.date : new Date(slot.date);
        const dateKey = `${slotDate.getFullYear()}-${String(
          slotDate.getMonth() + 1
        ).padStart(2, "0")}-${String(slotDate.getDate()).padStart(2, "0")}`;
        counts[dateKey] = (counts[dateKey] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const mostCommonDate = Object.entries(dateCounts).reduce((a, b) =>
        dateCounts[a[0]] > dateCounts[b[0]] ? a : b
      )[0];

      // Safely handle startDate conversion
      let startDate: Date;
      if (mostCommonDate) {
        startDate = parseISO(mostCommonDate);
      } else {
        const rawStartDate = pattern.startDate || selectedSlots[0].date;
        if (rawStartDate instanceof Date) {
          startDate = rawStartDate;
        } else if (typeof rawStartDate === "string") {
          startDate = parseISO(rawStartDate);
        } else {
          startDate = new Date(rawStartDate);
        }
      }

      // Validate startDate
      if (!isValid(startDate)) {
        console.error(
          "Invalid startDate:",
          mostCommonDate || pattern.startDate
        );
        return [];
      }

      const maxOccurrences = Math.max(1, pattern.maxOccurrences || 5); // Allow any value >=1
      const occurrences: ISelectedTimeSlot[] = [];

      // Simple weekly pattern generation (supports multiple weekdays)
      if (pattern.type === "weekly" || pattern.type === "biweekly") {
        const weekIncrement = pattern.type === "biweekly" ? 2 : 1;
        const selectedWeekdays =
          pattern.weekdays && pattern.weekdays.length > 0
            ? [...pattern.weekdays]
            : [getDay(startDate)];

        // Build a cursor per weekday pointing to the first matching date on/after startDate
        type WeekdayCursor = { weekday: number; date: Date };
        const cursors: WeekdayCursor[] = selectedWeekdays.map((weekday) => {
          // Prefer the explicit first date captured from the template (so we include 25.10 if selected)
          const templateFirst = weekdayToFirstDate.get(weekday);
          if (templateFirst) {
            return { weekday, date: new Date(templateFirst) };
          }
          // Fallback: compute the first matching date on/after startDate
          const startDow = getDay(startDate);
          const daysToAdd = (weekday - startDow + 7) % 7;
          const firstDate = addDays(startDate, daysToAdd);
          return { weekday, date: firstDate };
        });

        // Track per-weekday counts to enforce maxOccurrences per selected day
        const perWeekdayCount = new Map<number, number>();
        selectedWeekdays.forEach((w) => perWeekdayCount.set(w, 0));

        let occurrenceCount = 0; // total generated (all weekdays)
        const targetTotal = maxOccurrences * selectedWeekdays.length;
        // The time window depends on the weekday cursor we are expanding
        // Use the specific group's times if available; otherwise, fall back to templateGroup

        // Generate occurrences by always taking the next earliest cursor date,
        // then advance only that cursor by the (bi)weekly increment
        while (occurrenceCount < targetTotal && cursors.length > 0) {
          // Find earliest upcoming date among cursors
          let earliestIndex = 0;
          for (let i = 1; i < cursors.length; i++) {
            if (cursors[i].date < cursors[earliestIndex].date) {
              earliestIndex = i;
            }
          }

          const next = cursors[earliestIndex];
          const nextDate = next.date;
          const groupForWeekday =
            weekdayToGroup.get(next.weekday) || defaultGroup;
          const timeSlot = `${groupForWeekday.startTime}-${groupForWeekday.endTime}`;
          const duration = groupForWeekday.totalDuration;

          // If this weekday already reached its cap, advance its cursor and continue
          const currentCount = perWeekdayCount.get(next.weekday) || 0;
          if (currentCount >= maxOccurrences) {
            // Remove this cursor - it's done
            cursors.splice(earliestIndex, 1);
            continue;
          }

          occurrences.push({
            id: `${
              selectedZone.id
            }-${nextDate.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
            facilityId,
            zoneId: selectedZone.id,
            date: nextDate,
            timeSlot,
            duration,
            pricePerHour: selectedZone.pricePerHour || 0,
            zoneName: selectedZone.name,
            isRecurring: true,
            recurrencePattern: pattern,
            parentBookingId: selectedSlots[0].id,
          });

          occurrenceCount++;
          perWeekdayCount.set(next.weekday, currentCount + 1);

          // Advance that weekday's cursor by weekIncrement weeks
          const advancedDate = addWeeks(nextDate, weekIncrement);
          // If this weekday reached its cap after increment, drop its cursor; else update
          if ((perWeekdayCount.get(next.weekday) || 0) >= maxOccurrences) {
            cursors.splice(earliestIndex, 1);
          } else {
            cursors[earliestIndex] = {
              weekday: next.weekday,
              date: advancedDate,
            };
          }
        }
      } else if (pattern.type === "monthly") {
        // Generate on the selected weekday each month. If no weekday provided, use weekday of startDate.
        let occurrenceCount = 0;
        const targetWeekday =
          pattern.weekdays && pattern.weekdays.length > 0
            ? pattern.weekdays[0]
            : getDay(startDate);

        // Start from the month of startDate
        let monthCursor = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          1
        );

        while (occurrenceCount < maxOccurrences) {
          // First occurrence of targetWeekday in this month
          const monthStartDay = getDay(monthCursor); // 0-6
          const add = (targetWeekday - monthStartDay + 7) % 7;
          let occ = addDays(monthCursor, add);

          // Ensure the first occurrence is not before startDate for the first month
          if (
            occ < startDate &&
            monthCursor.getMonth() === startDate.getMonth() &&
            monthCursor.getFullYear() === startDate.getFullYear()
          ) {
            // Take the next week's same weekday
            occ = addDays(occ, 7);
          }

          // Add timeslots for this monthly occurrence
          for (const timeSlot of timeSlots) {
            if (occurrenceCount >= maxOccurrences) break;
            const [startTime, endTime] = timeSlot.split("-");
            const startMinutes =
              parseInt(startTime.split(":")[0]) * 60 +
              parseInt(startTime.split(":")[1]);
            const endMinutes =
              parseInt(endTime.split(":")[0]) * 60 +
              parseInt(endTime.split(":")[1]);
            const duration = endMinutes - startMinutes;
            occurrences.push({
              id: `${
                selectedZone.id
              }-${occ.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
              facilityId,
              zoneId: selectedZone.id,
              date: new Date(occ),
              timeSlot,
              duration,
              pricePerHour: selectedZone.pricePerHour || 0,
              zoneName: selectedZone.name,
              isRecurring: true,
              recurrencePattern: pattern,
              parentBookingId: selectedSlots[0].id,
            });
            occurrenceCount++;
          }

          // Move to next month
          monthCursor = addMonths(monthCursor, 1);
        }
      } else if (pattern.type === "custom") {
        // Use interval as days between occurrences
        const intervalDays = Math.max(1, pattern.interval || 1);
        let occurrenceCount = 0;
        let occurrenceDate = new Date(startDate);
        while (occurrenceCount < maxOccurrences) {
          for (const timeSlot of timeSlots) {
            if (occurrenceCount >= maxOccurrences) break;
            const [startTime, endTime] = timeSlot.split("-");
            const startMinutes =
              parseInt(startTime.split(":")[0]) * 60 +
              parseInt(startTime.split(":")[1]);
            const endMinutes =
              parseInt(endTime.split(":")[0]) * 60 +
              parseInt(endTime.split(":")[1]);
            const duration = endMinutes - startMinutes;
            occurrences.push({
              id: `${
                selectedZone.id
              }-${occurrenceDate.getTime()}-${timeSlot}-recurring-${occurrenceCount}`,
              facilityId,
              zoneId: selectedZone.id,
              date: new Date(occurrenceDate),
              timeSlot,
              duration,
              pricePerHour: selectedZone.pricePerHour || 0,
              zoneName: selectedZone.name,
              isRecurring: true,
              recurrencePattern: pattern,
              parentBookingId: selectedSlots[0].id,
            });
            occurrenceCount++;
          }
          occurrenceDate = addDays(occurrenceDate, intervalDays);
        }
      }

      setRecurringSlots(occurrences);
    },
    [selectedSlots, selectedZone, facilityId]
  );

  /**
   * Handle recurrence pattern change
   */
  const handleRecurrencePatternChange = useCallback(
    (pattern: RecurrencePattern | null) => {
      // Set startDate to the most recent selected slot's date if available
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

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only generate recurring slots if pattern is complete and valid
      if (pattern && selectedSlots.length > 0 && selectedZone) {
        // Check if pattern is complete enough to generate slots based on type
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
    },
    [handleFormDataUpdate, selectedSlots, selectedZone, generateRecurringSlots]
  );

  /**
   * Handle add to cart
   */
  const handleAddToCart = useCallback(() => {
    if (
      validateStep("details") &&
      validateStep("calendar") &&
      validateStep("terms")
    ) {
      if (formData.bookingType === "recurring" && recurringSlots.length > 0) {
        // For recurring bookings, create separate bookings for each occurrence
        const recurringBookings = recurringSlots.map((slot) => ({
          ...formData,
          id: slot.id,
          date: slot.date.toISOString().split("T")[0],
          timeSlots: [
            {
              date: slot.date,
              timeSlot: slot.timeSlot,
              duration: slot.duration,
            },
          ],
          zoneId: slot.zoneId,
          facilityId: slot.facilityId,
          pricePerHour: slot.pricePerHour,
          bookingType: "one-time" as const, // Each occurrence is a one-time booking
          isRecurring: true,
          parentBookingId: slot.parentBookingId,
          recurrencePattern: formData.recurrencePattern,
          // Calculate individual pricing for this slot
          individualPricing: {
            basePrice: slot.pricePerHour * (slot.duration / 60),
            vatRate: 0.25,
            vatAmount: slot.pricePerHour * (slot.duration / 60) * 0.25,
            finalPrice: slot.pricePerHour * (slot.duration / 60) * 1.25,
          },
        }));

        // Send one booking with all recurring slots
        onAddToCart({
          ...formData,
          recurringSlots: recurringSlots,
          bookingType: "recurring" as const,
        });
      } else {
        // For one-time bookings, use the original logic
        onAddToCart(formData);
      }
    }
  }, [formData, recurringSlots, validateStep, onAddToCart]);

  /**
   * Handle complete booking
   */
  const handleCompleteBooking = useCallback(() => {
    if (
      validateStep("details") &&
      validateStep("calendar") &&
      validateStep("terms")
    ) {
      if (formData.bookingType === "recurring" && recurringSlots.length > 0) {
        // For recurring bookings, create separate bookings for each occurrence
        const recurringBookings = recurringSlots.map((slot) => ({
          ...formData,
          id: slot.id,
          date: slot.date.toISOString().split("T")[0],
          timeSlots: [
            {
              date: slot.date,
              timeSlot: slot.timeSlot,
              duration: slot.duration,
            },
          ],
          zoneId: slot.zoneId,
          facilityId: slot.facilityId,
          pricePerHour: slot.pricePerHour,
          bookingType: "one-time" as const, // Each occurrence is a one-time booking
          isRecurring: true,
          parentBookingId: slot.parentBookingId,
          recurrencePattern: formData.recurrencePattern,
          // Calculate individual pricing for this slot
          individualPricing: {
            basePrice: slot.pricePerHour * (slot.duration / 60),
            vatRate: 0.25,
            vatAmount: slot.pricePerHour * (slot.duration / 60) * 0.25,
            finalPrice: slot.pricePerHour * (slot.duration / 60) * 1.25,
          },
        }));

        // Complete all recurring bookings
        onCompleteBooking({
          ...formData,
          recurringSlots: recurringSlots,
          bookingType: "recurring" as const,
        });
      } else {
        // For one-time bookings, use the original logic
        onCompleteBooking(formData);
      }
    }
  }, [formData, recurringSlots, validateStep, onCompleteBooking]);

  /**
   * Handle remove slot
   */
  const handleRemoveSlot = useCallback(
    (slotId: string) => {
      const newSlots = selectedSlots.filter((slot) => slot.id !== slotId);
      onSlotsChange(newSlots);
    },
    [selectedSlots, onSlotsChange]
  );

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
      case "details":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("bookings:steps.details.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("bookings:steps.details.description")}
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium">
                    {t("bookings:form.purpose_label")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) =>
                      handleFormDataUpdate({ purpose: e.target.value })
                    }
                    placeholder={t("bookings:form.purpose_placeholder")}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {/* Attendees */}
                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-sm font-medium">
                    {t("bookings:form.attendees_label")}{" "}
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

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label htmlFor="activityType" className="text-sm font-medium">
                    {t("bookings:form.activity_type_label")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.activityType}
                    onValueChange={(value) =>
                      handleFormDataUpdate({ activityType: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t(
                          "bookings:form.activity_type_placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sport">
                        {t("bookings:activity_types.sport")}
                      </SelectItem>
                      <SelectItem value="kultur">
                        {t("bookings:activity_types.culture")}
                      </SelectItem>
                      <SelectItem value="møte">
                        {t("bookings:activity_types.meeting")}
                      </SelectItem>
                      <SelectItem value="arrangement">
                        {t("bookings:activity_types.event")}
                      </SelectItem>
                      <SelectItem value="trening">
                        {t("bookings:activity_types.training")}
                      </SelectItem>
                      <SelectItem value="annet">{t("common:other")}</SelectItem>
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
                {t("bookings:steps.calendar.title")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("bookings:steps.calendar.description")}
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6 space-y-4">
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePreviousWeek}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t("calendar:navigation.previous_week")}
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
                    {t("calendar:navigation.next_week")}
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
                          const existingIndex = selectedSlots.findIndex(
                            (slot) => {
                              // Convert slot.date to Date object if it's a string
                              const slotDate =
                                slot.date instanceof Date
                                  ? slot.date
                                  : new Date(slot.date);
                              return (
                                slot.zoneId === zoneId &&
                                slotDate.toDateString() ===
                                  date.toDateString() &&
                                slot.timeSlot === timeSlot
                              );
                            }
                          );

                          if (existingIndex >= 0) {
                            // Remove slot
                            const updatedSlots = selectedSlots.filter(
                              (_, index) => index !== existingIndex
                            );
                            onSlotsChange(updatedSlots);
                          } else {
                            // Add slot - use local date for ID to avoid timezone issues
                            const localDateString = `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              date.getDate()
                            ).padStart(2, "0")}`;
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

                        // Also call parent's onSlotClick for any additional handling
                        onSlotClick?.(zoneId, date, timeSlot, status);
                      }}
                      onBulkSelect={(slots) => {
                        // Handle bulk selection by adding all slots
                        const enrichedSlots = slots.map((slot) => ({
                          ...slot,
                          facilityId,
                          zoneName: selectedZone?.name || "",
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

      case "recurrence":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Velg gjentakelsesmønster
              </h3>
              <p className="text-gray-600 text-sm">
                Velg hvordan ofte bookingen skal gjentas. Dette gjelder for alle
                valgte tidspunkter.
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
                Vilkår og betingelser
              </h3>
              <p className="text-gray-600 text-sm">
                Les gjennom vilkårene og godta dem for å fortsette.
              </p>
            </div>

            <Card className="w-full">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      {t("bookings:terms.rules_title", "Regler for bruk")}
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>
                        •{" "}
                        {t(
                          "bookings:terms.rules.cleaning",
                          "Renhold etter bruk er påkrevd"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "bookings:terms.rules.key_pickup",
                          "Nøkler hentes ved inngang 15 min før start"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "bookings:terms.rules.free_cancellation",
                          "Avbestilling gratis til 48 timer før start"
                        )}
                      </li>
                      <li>
                        •{" "}
                        {t(
                          "bookings:terms.rules.no_show_fee",
                          "Gebyr ved no-show: 50% av leiepris"
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Personvern</h4>
                    <p className="text-sm text-gray-600">
                      Vi behandler dine personopplysninger i henhold til vår
                      personvernerklæring. Ved å godta vilkårene samtykker du
                      til behandling av personopplysninger for denne
                      bestillingen.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Avbestilling</h4>
                    <p className="text-sm text-gray-600">
                      Du kan avbestille bookingen din gratis inntil 48 timer før
                      arrangementet starter. Ved avbestilling senere enn dette
                      vil det bli trukket et gebyr på 50% av leieprisen.
                    </p>
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
                      Jeg godtar{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        vilkår for leie
                      </a>{" "}
                      og
                      <a
                        href="/privacy"
                        target="_blank"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        personvernerklæring
                      </a>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "actions":
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
                    <h4 className="text-lg font-semibold mb-2">
                      Klar for booking!
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Alle opplysninger er fylt ut og vilkårene er godtatt.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      variant="outline"
                      className="flex-1"
                      disabled={
                        !validateStep("details") ||
                        !validateStep("calendar") ||
                        !validateStep("terms")
                      }
                    >
                      Legg i reservasjonskurv
                    </Button>
                    <Button
                      onClick={handleCompleteBooking}
                      className="flex-1"
                      disabled={
                        !validateStep("details") ||
                        !validateStep("calendar") ||
                        !validateStep("terms")
                      }
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
                selectedType={formData.bookingType}
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
                  <h3 className="font-semibold">
                    {t("bookings:progress.title")}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {t("bookings:progress.step_of", {
                      current: currentStepIndex + 1,
                      total: steps.length,
                    })}
                  </span>
                </div>

                <Progress
                  value={((currentStepIndex + 1) / steps.length) * 100}
                  className="h-2"
                />

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
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common:navigation.previous")}
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                currentStepIndex === steps.length - 1 ||
                !validateStep(currentStep)
              }
              className="flex items-center gap-2"
            >
              {t("common:navigation.next")}
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
                    ? formData.bookingType === "recurring"
                      ? recurringSlots.length > 0
                        ? t("bookings:sidebar.recurring_slots_and_price")
                        : t("bookings:sidebar.slots_and_price_select_pattern")
                      : t("bookings:sidebar.selected_slots_and_price")
                    : t("bookings:sidebar.select_slots_pricing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {selectedSlots.length > 0 || recurringSlots.length > 0 ? (
                  <>
                    {/* Selected Slots Display */}
                    <div className="space-y-2">
                      {/* Show selected slots (template for recurring or final for one-time) */}
                      {formData.bookingType === "recurring" &&
                      recurringSlots.length > 0
                        ? // For recurring bookings, show intelligently grouped time packages as template
                          (() => {
                            // Group time slots into packages by date and consecutive times
                            const groupTimeSlotsIntoPackages = (
                              slots: ISelectedTimeSlot[]
                            ) => {
                              // Group by date first
                              const dateGroups = slots.reduce(
                                (groups, slot) => {
                                  // Safely handle date conversion
                                  let date: Date;
                                  if (slot.date instanceof Date) {
                                    date = slot.date;
                                  } else if (typeof slot.date === "string") {
                                    date = parseISO(slot.date);
                                  } else {
                                    date = new Date(slot.date);
                                  }

                                  // Validate date
                                  if (!isValid(date)) {
                                    console.warn(
                                      "Invalid date for slot:",
                                      slot
                                    );
                                    return groups;
                                  }

                                  const dateKey = `${date.getFullYear()}-${String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0")}-${String(
                                    date.getDate()
                                  ).padStart(2, "0")}`;
                                  if (!groups[dateKey]) {
                                    groups[dateKey] = [];
                                  }
                                  groups[dateKey].push(slot);
                                  return groups;
                                },
                                {} as Record<string, ISelectedTimeSlot[]>
                              );

                              // Process each date group
                              return Object.entries(dateGroups).map(
                                ([dateKey, dateSlots]) => {
                                  // Sort by start time
                                  const sortedSlots = dateSlots.sort((a, b) => {
                                    const timeA = a.timeSlot.split("-")[0];
                                    const timeB = b.timeSlot.split("-")[0];
                                    return timeA.localeCompare(timeB);
                                  });

                                  // Group consecutive time slots
                                  const consecutiveGroups: ISelectedTimeSlot[][] =
                                    [];
                                  let currentGroup: ISelectedTimeSlot[] = [
                                    sortedSlots[0],
                                  ];

                                  for (let i = 1; i < sortedSlots.length; i++) {
                                    const prevSlot = sortedSlots[i - 1];
                                    const currentSlot = sortedSlots[i];

                                    // Check if current slot is consecutive to previous
                                    const prevEndTime =
                                      prevSlot.timeSlot.split("-")[1];
                                    const currentStartTime =
                                      currentSlot.timeSlot.split("-")[0];

                                    if (prevEndTime === currentStartTime) {
                                      // Consecutive - add to current group
                                      currentGroup.push(currentSlot);
                                    } else {
                                      // Not consecutive - start new group
                                      consecutiveGroups.push([...currentGroup]);
                                      currentGroup = [currentSlot];
                                    }
                                  }

                                  // Add the last group
                                  consecutiveGroups.push(currentGroup);

                                  return {
                                    date: dateKey,
                                    dateFormatted: new Date(
                                      dateKey
                                    ).toLocaleDateString("nb-NO"),
                                    groups: consecutiveGroups.map((group) => ({
                                      slots: group,
                                      startTime:
                                        group[0].timeSlot.split("-")[0],
                                      endTime:
                                        group[group.length - 1].timeSlot.split(
                                          "-"
                                        )[1],
                                      totalDuration: group.reduce(
                                        (total, slot) => total + slot.duration,
                                        0
                                      ),
                                      isConsecutive:
                                        group.length === 1 ||
                                        group.every((slot, index) => {
                                          if (index === 0) return true;
                                          const prevEndTime =
                                            group[index - 1].timeSlot.split(
                                              "-"
                                            )[1];
                                          const currentStartTime =
                                            slot.timeSlot.split("-")[0];
                                          return (
                                            prevEndTime === currentStartTime
                                          );
                                        }),
                                    })),
                                  };
                                }
                              );
                            };

                            // Debug: Log selected slots to see what we're working with
                            console.log(
                              "Selected slots for template:",
                              selectedSlots.map((slot) => ({
                                id: slot.id,
                                date: slot.date,
                                dateString:
                                  slot.date instanceof Date
                                    ? slot.date.toDateString()
                                    : new Date(slot.date).toDateString(),
                                timeSlot: slot.timeSlot,
                              }))
                            );

                            // Debug: Log selected slots to see what we're working with
                            console.log(
                              "Selected slots for template (calendar step):",
                              selectedSlots.map((slot) => ({
                                id: slot.id,
                                date: slot.date,
                                dateString:
                                  slot.date instanceof Date
                                    ? slot.date.toDateString()
                                    : new Date(slot.date).toDateString(),
                                timeSlot: slot.timeSlot,
                              }))
                            );

                            // Use all selected slots for the template (no filtering needed)
                            const timePackages =
                              groupTimeSlotsIntoPackages(selectedSlots);

                            return (
                              <div className="space-y-2">
                                <div className="text-xs text-blue-600 font-medium mb-2">
                                  Mal for gjentakelse
                                </div>
                                {[...timePackages]
                                  .sort((a, b) => {
                                    // Sort by actual date ascending
                                    const ad = new Date(a.date);
                                    const bd = new Date(b.date);
                                    return ad.getTime() - bd.getTime();
                                  })
                                  .map((datePackage) => (
                                    <div
                                      key={datePackage.date}
                                      className="space-y-2"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-800">
                                          {datePackage.dateFormatted}
                                        </span>
                                      </div>

                                      {datePackage.groups.map(
                                        (group, groupIndex) => (
                                          <div
                                            key={`${datePackage.date}-${groupIndex}`}
                                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2">
                                                <Clock className="h-3 w-3 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-900">
                                                  {group.isConsecutive
                                                    ? `(${group.startTime}-${
                                                        group.endTime
                                                      }) - (${
                                                        group.totalDuration /
                                                          60 ===
                                                        1
                                                          ? "1 time"
                                                          : `${
                                                              group.totalDuration /
                                                              60
                                                            } timer`
                                                      })`
                                                    : `(${group.slots
                                                        .map(
                                                          (slot) =>
                                                            slot.timeSlot.split(
                                                              "-"
                                                            )[0]
                                                        )
                                                        .join(", ")}) - (${
                                                        group.totalDuration /
                                                          60 ===
                                                        1
                                                          ? "1 time"
                                                          : `${
                                                              group.totalDuration /
                                                              60
                                                            } timer`
                                                      })`}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                              </div>
                            );
                          })()
                        : // For one-time bookings, show grouped time packages
                          (() => {
                            // Group time slots into packages by date and consecutive times
                            const groupTimeSlotsIntoPackages = (
                              slots: ISelectedTimeSlot[]
                            ) => {
                              // Group by date first
                              const dateGroups = slots.reduce(
                                (groups, slot) => {
                                  // Safely handle date conversion
                                  let date: Date;
                                  if (slot.date instanceof Date) {
                                    date = slot.date;
                                  } else if (typeof slot.date === "string") {
                                    date = parseISO(slot.date);
                                  } else {
                                    date = new Date(slot.date);
                                  }

                                  // Validate date
                                  if (!isValid(date)) {
                                    console.warn(
                                      "Invalid date for slot:",
                                      slot
                                    );
                                    return groups;
                                  }

                                  const dateKey = `${date.getFullYear()}-${String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0")}-${String(
                                    date.getDate()
                                  ).padStart(2, "0")}`;
                                  if (!groups[dateKey]) {
                                    groups[dateKey] = [];
                                  }
                                  groups[dateKey].push(slot);
                                  return groups;
                                },
                                {} as Record<string, ISelectedTimeSlot[]>
                              );

                              // Process each date group
                              return Object.entries(dateGroups).map(
                                ([dateKey, dateSlots]) => {
                                  // Sort by start time
                                  const sortedSlots = dateSlots.sort((a, b) => {
                                    const timeA = a.timeSlot.split("-")[0];
                                    const timeB = b.timeSlot.split("-")[0];
                                    return timeA.localeCompare(timeB);
                                  });

                                  // Group consecutive time slots
                                  const consecutiveGroups: ISelectedTimeSlot[][] =
                                    [];
                                  let currentGroup: ISelectedTimeSlot[] = [
                                    sortedSlots[0],
                                  ];

                                  for (let i = 1; i < sortedSlots.length; i++) {
                                    const prevSlot = sortedSlots[i - 1];
                                    const currentSlot = sortedSlots[i];

                                    // Check if current slot is consecutive to previous
                                    const prevEndTime =
                                      prevSlot.timeSlot.split("-")[1];
                                    const currentStartTime =
                                      currentSlot.timeSlot.split("-")[0];

                                    if (prevEndTime === currentStartTime) {
                                      // Consecutive - add to current group
                                      currentGroup.push(currentSlot);
                                    } else {
                                      // Not consecutive - start new group
                                      consecutiveGroups.push([...currentGroup]);
                                      currentGroup = [currentSlot];
                                    }
                                  }

                                  // Add the last group
                                  consecutiveGroups.push(currentGroup);

                                  return {
                                    date: dateKey,
                                    dateFormatted: new Date(
                                      dateKey
                                    ).toLocaleDateString("nb-NO"),
                                    groups: consecutiveGroups.map((group) => ({
                                      slots: group,
                                      startTime:
                                        group[0].timeSlot.split("-")[0],
                                      endTime:
                                        group[group.length - 1].timeSlot.split(
                                          "-"
                                        )[1],
                                      totalDuration: group.reduce(
                                        (total, slot) => total + slot.duration,
                                        0
                                      ),
                                      isConsecutive:
                                        group.length === 1 ||
                                        group.every((slot, index) => {
                                          if (index === 0) return true;
                                          const prevEndTime =
                                            group[index - 1].timeSlot.split(
                                              "-"
                                            )[1];
                                          const currentStartTime =
                                            slot.timeSlot.split("-")[0];
                                          return (
                                            prevEndTime === currentStartTime
                                          );
                                        }),
                                    })),
                                  };
                                }
                              );
                            };

                            const timePackages =
                              groupTimeSlotsIntoPackages(selectedSlots);

                            return timePackages.map((datePackage) => (
                              <div key={datePackage.date} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-800">
                                    {datePackage.dateFormatted}
                                  </span>
                                </div>

                                {datePackage.groups.map((group, groupIndex) => (
                                  <div
                                    key={`${datePackage.date}-${groupIndex}`}
                                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                          {group.isConsecutive
                                            ? `(${group.startTime}-${
                                                group.endTime
                                              }) - (${
                                                group.totalDuration / 60 === 1
                                                  ? "1 time"
                                                  : `${
                                                      group.totalDuration / 60
                                                    } timer`
                                              })`
                                            : `(${group.slots
                                                .map(
                                                  (slot) =>
                                                    slot.timeSlot.split("-")[0]
                                                )
                                                .join(", ")}) - (${
                                                group.totalDuration / 60 === 1
                                                  ? "1 time"
                                                  : `${
                                                      group.totalDuration / 60
                                                    } timer`
                                              })`}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ));
                          })()}

                      {/* Show recurring slots preview for recurring bookings */}
                      {formData.bookingType === "recurring" &&
                        recurringSlots.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-2">
                              Gjentakende forekomster ({recurringSlots.length}{" "}
                              totalt):
                            </div>
                            {(() => {
                              // Group recurring slots by date and consecutive times
                              const groupRecurringSlotsIntoPackages = (
                                slots: ISelectedTimeSlot[]
                              ) => {
                                // Group by date first
                                const dateGroups = slots.reduce(
                                  (groups, slot) => {
                                    // Safely handle date conversion
                                    let date: Date;
                                    if (slot.date instanceof Date) {
                                      date = slot.date;
                                    } else if (typeof slot.date === "string") {
                                      date = parseISO(slot.date);
                                    } else {
                                      date = new Date(slot.date);
                                    }

                                    // Validate date
                                    if (!isValid(date)) {
                                      console.warn(
                                        "Invalid date for slot:",
                                        slot
                                      );
                                      return groups;
                                    }

                                    const dateKey = `${date.getFullYear()}-${String(
                                      date.getMonth() + 1
                                    ).padStart(2, "0")}-${String(
                                      date.getDate()
                                    ).padStart(2, "0")}`;
                                    if (!groups[dateKey]) {
                                      groups[dateKey] = [];
                                    }
                                    groups[dateKey].push(slot);
                                    return groups;
                                  },
                                  {} as Record<string, ISelectedTimeSlot[]>
                                );

                                // Process each date group
                                return Object.entries(dateGroups).map(
                                  ([dateKey, dateSlots]) => {
                                    // Sort by start time
                                    const sortedSlots = dateSlots.sort(
                                      (a, b) => {
                                        const timeA = a.timeSlot.split("-")[0];
                                        const timeB = b.timeSlot.split("-")[0];
                                        return timeA.localeCompare(timeB);
                                      }
                                    );

                                    // Group consecutive time slots
                                    const consecutiveGroups: ISelectedTimeSlot[][] =
                                      [];
                                    let currentGroup: ISelectedTimeSlot[] = [
                                      sortedSlots[0],
                                    ];

                                    for (
                                      let i = 1;
                                      i < sortedSlots.length;
                                      i++
                                    ) {
                                      const prevSlot = sortedSlots[i - 1];
                                      const currentSlot = sortedSlots[i];

                                      // Check if current slot is consecutive to previous
                                      const prevEndTime =
                                        prevSlot.timeSlot.split("-")[1];
                                      const currentStartTime =
                                        currentSlot.timeSlot.split("-")[0];

                                      if (prevEndTime === currentStartTime) {
                                        // Consecutive - add to current group
                                        currentGroup.push(currentSlot);
                                      } else {
                                        // Not consecutive - start new group
                                        consecutiveGroups.push([
                                          ...currentGroup,
                                        ]);
                                        currentGroup = [currentSlot];
                                      }
                                    }

                                    // Add the last group
                                    consecutiveGroups.push(currentGroup);

                                    return {
                                      date: dateKey,
                                      dateFormatted: new Date(
                                        dateKey
                                      ).toLocaleDateString("nb-NO"),
                                      groups: consecutiveGroups.map(
                                        (group) => ({
                                          slots: group,
                                          startTime:
                                            group[0].timeSlot.split("-")[0],
                                          endTime:
                                            group[
                                              group.length - 1
                                            ].timeSlot.split("-")[1],
                                          totalDuration: group.reduce(
                                            (total, slot) =>
                                              total + slot.duration,
                                            0
                                          ),
                                          isConsecutive:
                                            group.length === 1 ||
                                            group.every((slot, index) => {
                                              if (index === 0) return true;
                                              const prevEndTime =
                                                group[index - 1].timeSlot.split(
                                                  "-"
                                                )[1];
                                              const currentStartTime =
                                                slot.timeSlot.split("-")[0];
                                              return (
                                                prevEndTime === currentStartTime
                                              );
                                            }),
                                        })
                                      ),
                                    };
                                  }
                                );
                              };

                              const recurringPackages =
                                groupRecurringSlotsIntoPackages(recurringSlots);

                              return recurringPackages
                                .slice(0, 5)
                                .map((datePackage, packageIndex) => (
                                  <div
                                    key={datePackage.date}
                                    className="space-y-2 mb-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-800">
                                        {datePackage.dateFormatted}
                                      </span>
                                    </div>

                                    {datePackage.groups.map(
                                      (group, groupIndex) => (
                                        <div
                                          key={`${datePackage.date}-${groupIndex}`}
                                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-3 w-3 text-blue-600" />
                                              <span className="text-sm font-medium text-blue-900">
                                                {group.isConsecutive
                                                  ? `(${group.startTime}-${
                                                      group.endTime
                                                    }) - (${
                                                      group.totalDuration /
                                                        60 ===
                                                      1
                                                        ? "1 time"
                                                        : `${
                                                            group.totalDuration /
                                                            60
                                                          } timer`
                                                    })`
                                                  : `(${group.slots
                                                      .map(
                                                        (slot) =>
                                                          slot.timeSlot.split(
                                                            "-"
                                                          )[0]
                                                      )
                                                      .join(", ")}) - (${
                                                      group.totalDuration /
                                                        60 ===
                                                      1
                                                        ? "1 time"
                                                        : `${
                                                            group.totalDuration /
                                                            60
                                                          } timer`
                                                    })`}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {group.totalDuration / 60 === 1
                                                ? "1 time"
                                                : `${
                                                    group.totalDuration / 60
                                                  } timer`}
                                            </Badge>
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              Gjentakende
                                            </Badge>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ));
                            })()}
                            {recurringSlots.length > 5 && (
                              <div className="text-xs text-gray-500 text-center py-1">
                                ... og {recurringSlots.length - 5} til
                              </div>
                            )}
                          </div>
                        )}

                      {/* Clear All Button */}
                      {(selectedSlots.length > 1 ||
                        recurringSlots.length > 0) && (
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
                      bookingType={formData.bookingType}
                    />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">
                      {t("bookings:sidebar.select_slots_pricing")}
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
