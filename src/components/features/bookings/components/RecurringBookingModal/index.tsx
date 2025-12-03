"use client";

import React, { useState, useMemo } from "react";
import { format, addDays } from "date-fns";
import { Calendar, Clock, Repeat } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { BaseModal } from "@/components/common/modals/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecurrencePattern } from "@/components/features/bookings/utils/recurrence";
import { CreateRecurringBookingData } from "@/types/recurringBooking";

/**
 * Props interface for RecurringBookingModal component
 */
interface RecurringBookingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (bookingData: CreateRecurringBookingData) => void;
  readonly facilityId: string;
  readonly facilityName: string;
  readonly zoneId: string;
  readonly zoneName: string;
  readonly availableTimeSlots: readonly string[];
  readonly pricePerHour: number;
}

/**
 * Occurrence type for preview
 */
interface OccurrencePreviewItem {
  readonly date: Date;
  readonly timeSlot: string;
}

/**
 * Pricing occurrence type
 */
interface PricingOccurrence {
  readonly duration: number;
  readonly price: number;
}

/**
 * Weekday selector component for recurring booking patterns
 */
const WeekdaySelector: React.FC<{
  readonly selectedDays: readonly number[];
  readonly onDaysChange: (days: readonly number[]) => void;
}> = ({ selectedDays, onDaysChange }) => {
  const { t } = useTranslation(['booking', 'common']);

  const weekdays = [
    { value: 0, label: t('weekdays.sunday') },
    { value: 1, label: t('weekdays.monday') },
    { value: 2, label: t('weekdays.tuesday') },
    { value: 3, label: t('weekdays.wednesday') },
    { value: 4, label: t('weekdays.thursday') },
    { value: 5, label: t('weekdays.friday') },
    { value: 6, label: t('weekdays.saturday') }
  ];

  const handleDayToggle = (day: number): void => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('recurring.repeat_on')}</Label>
      <div className="grid grid-cols-2 gap-2">
        {weekdays.map((weekday) => (
          <div key={weekday.value} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${weekday.value}`}
              checked={selectedDays.includes(weekday.value)}
              onCheckedChange={() => handleDayToggle(weekday.value)}
              aria-label={t('validation.select_weekdays')}
            />
            <Label
              htmlFor={`day-${weekday.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {weekday.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Time range selector component for recurring booking patterns
 */
const TimeRangeSelector: React.FC<{
  readonly startDate: Date;
  readonly endDate: Date | undefined;
  readonly onStartDateChange: (date: Date) => void;
  readonly onEndDateChange: (date: Date | undefined) => void;
  readonly hasEndDate: boolean;
  readonly onHasEndDateChange: (hasEndDate: boolean) => void;
}> = ({ startDate, endDate, onStartDateChange, onEndDateChange, hasEndDate, onHasEndDateChange }) => {
  const { t } = useTranslation(['booking', 'common']);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="start-date" className="text-sm font-medium">
          {t('recurring.end_date')}
        </Label>
        <Input
          id="start-date"
          type="date"
          value={format(startDate, "yyyy-MM-dd")}
          onChange={(e) => onStartDateChange(new Date(e.target.value))}
          min={format(new Date(), "yyyy-MM-dd")}
          aria-describedby="start-date-help"
        />
        <p id="start-date-help" className="text-xs text-muted-foreground">
          {t('recurring.end_date')}
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="has-end-date"
          checked={hasEndDate}
          onCheckedChange={onHasEndDateChange}
          aria-describedby="end-date-help"
        />
        <Label htmlFor="has-end-date" className="text-sm font-medium">
          {t('recurring.ends')}
        </Label>
      </div>

      {hasEndDate && (
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            {t('recurring.end_date')}
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
            onChange={(e) => onEndDateChange(new Date(e.target.value))}
            min={format(startDate, "yyyy-MM-dd")}
            aria-describedby="end-date-help"
          />
          <p id="end-date-help" className="text-xs text-muted-foreground">
            {t('recurring.end_date')}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Occurrence preview component showing future bookings
 */
const OccurrencePreview: React.FC<{
  readonly pattern: RecurrencePattern;
  readonly startDate: Date;
  readonly endDate: Date | undefined;
  readonly timeSlots: readonly string[];
}> = ({ pattern, startDate, endDate, timeSlots }) => {
  const { t } = useTranslation(['booking', 'common']);

  const occurrences = useMemo(() => {
    const results: OccurrencePreviewItem[] = [];
    let currentDate = new Date(startDate);
    const maxOccurrences = 8;
    let count = 0;

    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
      const dayOfWeek = currentDate.getDay();

      if (pattern.weekdays.includes(dayOfWeek)) {
        timeSlots.forEach(timeSlot => {
          results.push({
            date: new Date(currentDate),
            timeSlot
          });
        });
        count++;
      }

      switch (pattern.type) {
        case 'weekly':
        case 'biweekly':
        case 'monthly':
          currentDate = addDays(currentDate, 1);
          break;
        case 'custom':
          currentDate = addDays(currentDate, pattern.interval || 1);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }
    }

    return results;
  }, [pattern, startDate, endDate, timeSlots]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('recurring.upcoming_bookings_title')}</Label>
      <div className="max-h-40 overflow-y-auto space-y-2">
        {occurrences.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('recurring.no_upcoming')}
          </p>
        ) : (
          occurrences.map((occurrence, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-muted rounded-md"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(occurrence.date, "dd.MM.yyyy")}
                </span>
                <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                <span className="text-sm text-muted-foreground">
                  {occurrence.timeSlot}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Pricing summary component for recurring bookings
 */
const PricingSummary: React.FC<{
  readonly pattern: RecurrencePattern;
  readonly startDate: Date;
  readonly endDate: Date | undefined;
  readonly timeSlots: readonly string[];
  readonly pricePerHour: number;
}> = ({ pattern, startDate, endDate, timeSlots, pricePerHour }) => {
  const { t } = useTranslation(['booking', 'common']);

  const pricing = useMemo(() => {
    const occurrences: PricingOccurrence[] = [];
    let currentDate = new Date(startDate);
    const maxOccurrences = 5;
    let count = 0;

    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
      const dayOfWeek = currentDate.getDay();

      if (pattern.weekdays.includes(dayOfWeek)) {
        timeSlots.forEach(timeSlot => {
          const [start, end] = timeSlot.split('-').map(t => t.trim());
          const startHour = parseInt(start.split(':')[0]);
          const endHour = parseInt(end.split(':')[0]);
          const duration = endHour - startHour;

          occurrences.push({
            duration,
            price: duration * pricePerHour
          });
        });
        count++;
      }

      switch (pattern.type) {
        case 'weekly':
        case 'biweekly':
        case 'monthly':
          currentDate = addDays(currentDate, 1);
          break;
        case 'custom':
          currentDate = addDays(currentDate, pattern.interval || 1);
          break;
        default:
          currentDate = addDays(currentDate, 1);
      }
    }

    const totalOccurrences = occurrences.length;
    const basePrice = occurrences.reduce((sum, occ) => sum + occ.price, 0);
    const discount = totalOccurrences >= 10 ? basePrice * 0.1 : 0;
    const totalPrice = basePrice - discount;

    return {
      totalOccurrences,
      basePrice,
      discount,
      totalPrice
    };
  }, [pattern, startDate, endDate, timeSlots, pricePerHour]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('details.pricing_breakdown')}</CardTitle>
        <CardDescription>
          {t('recurring.occurrences', { count: pricing.totalOccurrences })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{t('pricing.base_price')}</span>
          <span>{pricing.basePrice.toLocaleString('no-NO')} kr</span>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>{t('pricing.discount')}</span>
            <span>-{pricing.discount.toLocaleString('no-NO')} kr</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>{t('common:common.total')}:</span>
            <span>{pricing.totalPrice.toLocaleString('no-NO')} kr</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Recurring booking modal component
 *
 * Provides a comprehensive interface for creating recurring bookings with
 * pattern selection, time range configuration, and pricing preview.
 *
 * Follows SOLID principles:
 * - Single Responsibility: Each sub-component handles one specific aspect
 * - Open/Closed: Extends BaseModal without modifying it
 * - Dependency Inversion: Depends on BaseModal abstraction
 */
export const RecurringBookingModal: React.FC<RecurringBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  facilityId,
  facilityName,
  zoneId,
  zoneName,
  availableTimeSlots,
  pricePerHour
}): JSX.Element => {
  const { t } = useTranslation(['booking', 'common']);

  const [recurrenceType, setRecurrenceType] = useState<RecurrencePattern['type']>('weekly');
  const [selectedDays, setSelectedDays] = useState<readonly number[]>([1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [hasEndDate, setHasEndDate] = useState<boolean>(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<readonly string[]>([]);
  const [purpose, setPurpose] = useState<string>("");
  const [attendees, setAttendees] = useState<number>(1);
  const [activityType, setActivityType] = useState<string>("");
  const [actorType, setActorType] = useState<CreateRecurringBookingData['actorType']>('private-person');

  const recurrencePattern: RecurrencePattern = {
    type: recurrenceType,
    weekdays: selectedDays,
    timeSlots: selectedTimeSlots,
    interval: recurrenceType === 'custom' ? 1 : 1,
    startDate,
    endDate: hasEndDate ? endDate : undefined,
    monthlyPattern: recurrenceType === 'monthly' ? 'first' : undefined,
    monthlyWeekday: recurrenceType === 'monthly' ? 1 : undefined
  };

  const handleSubmit = (): void => {
    if (selectedTimeSlots.length === 0) {
      alert(t('validation.select_time_slots'));
      return;
    }

    if (!purpose.trim()) {
      alert(t('validation.purpose_required'));
      return;
    }

    const bookingData: CreateRecurringBookingData = {
      userId: "current-user",
      facilityId,
      facilityName,
      zoneId,
      zoneName,
      recurrencePattern,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
      timeSlots: selectedTimeSlots,
      purpose: purpose.trim(),
      attendees,
      activityType: activityType.trim(),
      actorType,
      pricing: {
        basePrice: 0,
        totalPrice: 0,
        discount: 0
      }
    };

    onSubmit(bookingData);
    onClose();
  };

  const handleTimeSlotToggle = (timeSlot: string): void => {
    if (selectedTimeSlots.includes(timeSlot)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(slot => slot !== timeSlot));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
    }
  };

  const modalActions = (
    <>
      <Button variant="outline" onClick={onClose}>
        {t('common:actions.cancel')}
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={selectedTimeSlots.length === 0 || !purpose.trim()}
      >
        {t('actions.create')}
      </Button>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('recurring.title')}
      description={t('booking_types.recurring_description')}
      size="4xl"
      titleIcon={<Repeat className="h-5 w-5" />}
      actions={modalActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Configuration */}
        <div className="space-y-6">
          {/* Recurrence Type */}
          <div className="space-y-2">
            <Label htmlFor="recurrence-type" className="text-sm font-medium">
              {t('recurring.pattern')}
            </Label>
            <Select
              value={recurrenceType}
              onValueChange={(value: RecurrencePattern['type']) => setRecurrenceType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('recurrence.select_pattern')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t('recurrence.single')}</SelectItem>
                <SelectItem value="weekly">{t('recurring.weekly')}</SelectItem>
                <SelectItem value="biweekly">{t('recurring.biweekly')}</SelectItem>
                <SelectItem value="monthly">{t('recurring.monthly')}</SelectItem>
                <SelectItem value="custom">{t('recurring.custom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekday Selection */}
          {recurrenceType !== 'single' && (
            <WeekdaySelector
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />
          )}

          {/* Time Range */}
          <TimeRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            hasEndDate={hasEndDate}
            onHasEndDateChange={setHasEndDate}
          />

          {/* Time Slots */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('details.time_slots')}</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableTimeSlots.map((timeSlot) => (
                <div key={timeSlot} className="flex items-center space-x-2">
                  <Checkbox
                    id={`time-${timeSlot}`}
                    checked={selectedTimeSlots.includes(timeSlot)}
                    onCheckedChange={() => handleTimeSlotToggle(timeSlot)}
                    aria-label={t('validation.select_time_slots')}
                  />
                  <Label
                    htmlFor={`time-${timeSlot}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {timeSlot}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-sm font-medium">
                {t('form.purpose_label')}
              </Label>
              <Textarea
                id="purpose"
                placeholder={t('form.purpose_placeholder')}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={3}
                aria-describedby="purpose-help"
              />
              <p id="purpose-help" className="text-xs text-muted-foreground">
                {t('form.purpose_label')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attendees" className="text-sm font-medium">
                  {t('fields.attendees')}
                </Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  value={attendees}
                  onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-type" className="text-sm font-medium">
                  {t('fields.activity_type')}
                </Label>
                <Input
                  id="activity-type"
                  placeholder={t('form.activity_type_placeholder')}
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actor-type" className="text-sm font-medium">
                {t('fields.actor_type')}
              </Label>
              <Select
                value={actorType}
                onValueChange={(value: CreateRecurringBookingData['actorType']) => setActorType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common:placeholders.selectOption')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private-person">
                    {t('actor_types.private_person')}
                  </SelectItem>
                  <SelectItem value="lag-foreninger">
                    {t('actor_types.lag_foreninger')}
                  </SelectItem>
                  <SelectItem value="paraply">
                    {t('actor_types.paraply')}
                  </SelectItem>
                  <SelectItem value="private-firma">
                    {t('actor_types.private_firma')}
                  </SelectItem>
                  <SelectItem value="kommunale-enheter">
                    {t('actor_types.kommunale_enheter')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right column - Preview and Pricing */}
        <div className="space-y-6">
          <OccurrencePreview
            pattern={recurrencePattern}
            startDate={startDate}
            endDate={hasEndDate ? endDate : undefined}
            timeSlots={selectedTimeSlots}
          />

          <PricingSummary
            pattern={recurrencePattern}
            startDate={startDate}
            endDate={hasEndDate ? endDate : undefined}
            timeSlots={selectedTimeSlots}
            pricePerHour={pricePerHour}
          />
        </div>
      </div>
    </BaseModal>
  );
};
