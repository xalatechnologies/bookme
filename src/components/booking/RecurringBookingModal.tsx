"use client";

import React, { useState, useMemo } from "react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { Calendar, Clock, Users, MapPin, Repeat, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecurrencePattern } from "@/utils/recurrenceEngine";
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
 * Weekday selector component for recurring booking patterns
 */
const WeekdaySelector: React.FC<{
  readonly selectedDays: readonly number[];
  readonly onDaysChange: (days: readonly number[]) => void;
}> = ({ selectedDays, onDaysChange }) => {
  const weekdays = [
    { value: 0, label: "Søndag" },
    { value: 1, label: "Mandag" },
    { value: 2, label: "Tirsdag" },
    { value: 3, label: "Onsdag" },
    { value: 4, label: "Torsdag" },
    { value: 5, label: "Fredag" },
    { value: 6, label: "Lørdag" }
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
      <Label className="text-sm font-medium">Velg dager i uken</Label>
      <div className="grid grid-cols-2 gap-2">
        {weekdays.map((weekday) => (
          <div key={weekday.value} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${weekday.value}`}
              checked={selectedDays.includes(weekday.value)}
              onCheckedChange={() => handleDayToggle(weekday.value)}
              aria-label={`Velg ${weekday.label}`}
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
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="start-date" className="text-sm font-medium">
          Startdato
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
          Velg når den gjentakende bookingen skal starte
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
          Har sluttdato
        </Label>
      </div>

      {hasEndDate && (
        <div className="space-y-2">
          <Label htmlFor="end-date" className="text-sm font-medium">
            Sluttdato
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
            Velg når den gjentakende bookingen skal slutte
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
  const occurrences = useMemo(() => {
    const results: Array<{ date: Date; timeSlot: string }> = [];
    let currentDate = new Date(startDate);
    const maxOccurrences = 8; // Show next 8 occurrences
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

      // Move to next date based on pattern type
      switch (pattern.type) {
        case 'weekly':
          currentDate = addDays(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addDays(currentDate, 1);
          break;
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
      <Label className="text-sm font-medium">Forhåndsvisning av bookinger</Label>
      <div className="max-h-40 overflow-y-auto space-y-2">
        {occurrences.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ingen bookinger funnet for dette mønsteret
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
  const pricing = useMemo(() => {
    const occurrences = [];
    let currentDate = new Date(startDate);
    const maxOccurrences = 52; // 1 year max
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

      // Move to next date
      switch (pattern.type) {
        case 'weekly':
          currentDate = addDays(currentDate, 1);
          break;
        case 'biweekly':
          currentDate = addDays(currentDate, 1);
          break;
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
    const discount = totalOccurrences >= 10 ? basePrice * 0.1 : 0; // 10% discount for 10+ occurrences
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
        <CardTitle className="text-lg">Prisoversikt</CardTitle>
        <CardDescription>
          {pricing.totalOccurrences} bookinger totalt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Grunnpris ({pricing.totalOccurrences} bookinger):</span>
          <span>{pricing.basePrice.toLocaleString('no-NO')} kr</span>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Rabatt (10% for 10+ bookinger):</span>
            <span>-{pricing.discount.toLocaleString('no-NO')} kr</span>
          </div>
        )}
        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>Totalpris:</span>
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
}) => {
  const [recurrenceType, setRecurrenceType] = useState<RecurrencePattern['type']>('weekly');
  const [selectedDays, setSelectedDays] = useState<readonly number[]>([1, 2, 3, 4, 5]); // Monday-Friday
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
    interval: recurrenceType === 'custom' ? 1 : undefined,
    startDate,
    endDate: hasEndDate ? endDate : undefined,
    monthlyPattern: recurrenceType === 'monthly' ? 'first' : undefined,
    monthlyWeekday: recurrenceType === 'monthly' ? 1 : undefined
  };

  const handleSubmit = (): void => {
    if (selectedTimeSlots.length === 0) {
      alert("Vennligst velg minst ett tidspunkt");
      return;
    }

    if (!purpose.trim()) {
      alert("Vennligst fyll ut formål");
      return;
    }

    const bookingData: CreateRecurringBookingData = {
      userId: "current-user", // This should come from auth context
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
        basePrice: 0, // Will be calculated in the store
        totalPrice: 0, // Will be calculated in the store
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Repeat className="h-5 w-5" />
            <span>Opprett gjentakende booking</span>
          </DialogTitle>
          <DialogDescription>
            Konfigurer en gjentakende booking for {facilityName} - {zoneName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Configuration */}
          <div className="space-y-6">
            {/* Recurrence Type */}
            <div className="space-y-2">
              <Label htmlFor="recurrence-type" className="text-sm font-medium">
                Gjentakelsestype
              </Label>
              <Select value={recurrenceType} onValueChange={(value: RecurrencePattern['type']) => setRecurrenceType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Velg gjentakelsestype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Enkelt booking</SelectItem>
                  <SelectItem value="weekly">Ukentlig</SelectItem>
                  <SelectItem value="biweekly">Annenhver uke</SelectItem>
                  <SelectItem value="monthly">Månedlig</SelectItem>
                  <SelectItem value="custom">Egendefinert</SelectItem>
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
              <Label className="text-sm font-medium">Velg tidspunkter</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableTimeSlots.map((timeSlot) => (
                  <div key={timeSlot} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${timeSlot}`}
                      checked={selectedTimeSlots.includes(timeSlot)}
                      onCheckedChange={() => handleTimeSlotToggle(timeSlot)}
                      aria-label={`Velg ${timeSlot}`}
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
                  Formål *
                </Label>
                <Textarea
                  id="purpose"
                  placeholder="Beskriv formålet med bookingen..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  aria-describedby="purpose-help"
                />
                <p id="purpose-help" className="text-xs text-muted-foreground">
                  Beskriv hva lokalet skal brukes til
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attendees" className="text-sm font-medium">
                    Antall deltakere
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
                    Aktivitetstype
                  </Label>
                  <Input
                    id="activity-type"
                    placeholder="f.eks. møte, kurs, arrangement"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="actor-type" className="text-sm font-medium">
                  Aktørtype
                </Label>
                <Select value={actorType} onValueChange={(value: CreateRecurringBookingData['actorType']) => setActorType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg aktørtype" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private-person">Privatperson</SelectItem>
                    <SelectItem value="lag-foreninger">Lag/foreninger</SelectItem>
                    <SelectItem value="paraply">Paraplyorganisasjon</SelectItem>
                    <SelectItem value="private-firma">Privat firma</SelectItem>
                    <SelectItem value="kommunale-enheter">Kommunale enheter</SelectItem>
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit} disabled={selectedTimeSlots.length === 0 || !purpose.trim()}>
            Opprett gjentakende booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

