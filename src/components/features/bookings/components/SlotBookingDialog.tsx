"use client";

import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const calendarClassNames = {
  root:
    "rdp-root p-3 pointer-events-auto rounded-xl border border-slate-200 shadow-sm bg-white",
  months: "space-y-4",
  month: "space-y-4",
  caption: "flex items-center justify-between px-1",
  caption_label: "text-sm font-semibold text-slate-900",
  nav: "flex items-center gap-1",
  button_previous:
    "h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600",
  button_next:
    "h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600",
  head_row: "grid grid-cols-7 text-xs font-medium text-slate-400",
  head_cell: "text-center",
  row: "grid grid-cols-7 gap-1",
  cell: "h-9 w-9 text-center text-sm rounded-md hover:bg-slate-100 focus-within:bg-slate-100",
  day: "h-9 w-9 p-0 font-normal",
  day_selected: "bg-slate-300 text-slate-900 hover:bg-slate-300",
  day_today: "border border-slate-200",
  day_outside: "text-slate-300",
  day_disabled: "text-slate-300 opacity-50",
};

export interface SlotBookingFormData {
  purpose: string;
  date: Date;
  startTime: string;
  endTime: string;
  showPurposeInCalendar: boolean;
  numberOfPeople: number;
  activityType: string;
  description: string;
  isSeasonBooking: boolean;
  endDate?: Date;
  weekdays?: number[];
  repetitionInterval?: number;
}

interface SlotBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: SlotBookingFormData) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  zoneName?: string;
  initialFormData?: SlotBookingFormData | null;
  onFormDataCleared?: () => void;
}

const activityTypes = [
  { value: "trening", label: "Trening" },
  { value: "kamp", label: "Kamp/Turnering" },
  { value: "arrangement", label: "Arrangement" },
  { value: "kurs", label: "Kurs/Opplæring" },
  { value: "møte", label: "Møte" },
  { value: "annet", label: "Annet" },
];

const timeOptions = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const weekdayLabels = [
  { value: 0, label: "Ma" },
  { value: 1, label: "Ti" },
  { value: 2, label: "On" },
  { value: 3, label: "To" },
  { value: 4, label: "Fr" },
  { value: 5, label: "Lø" },
  { value: 6, label: "Sø" },
];

const repetitionOptions = [
  { value: "1", label: "Hver uke" },
  { value: "2", label: "Annenhver uke" },
  { value: "3", label: "Hver 3. uke" },
  { value: "4", label: "Hver 4. uke" },
  { value: "5", label: "Hver 5. uke" },
  { value: "6", label: "Hver 6. uke" },
  { value: "7", label: "Hver 7. uke" },
  { value: "8", label: "Hver 8. uke" },
  { value: "9", label: "Hver 9. uke" },
  { value: "10", label: "Hver 10. uke" },
];

export function SlotBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  zoneName,
  initialFormData,
  onFormDataCleared,
}: SlotBookingDialogProps) {
  const [purpose, setPurpose] = useState(initialFormData?.purpose || "");
  const [startTime, setStartTime] = useState(() => {
    if (initialFormData?.startTime) return initialFormData.startTime;
    if (selectedTime) return selectedTime;
    return "08:00";
  });
  const [endTime, setEndTime] = useState(() => {
    if (initialFormData?.endTime) return initialFormData.endTime;
    if (selectedTime) {
      const hour = parseInt(selectedTime.split(":")[0]) + 1;
      return `${hour.toString().padStart(2, "0")}:00`;
    }
    return "09:00";
  });
  const [showPurposeInCalendar, setShowPurposeInCalendar] = useState(
    initialFormData?.showPurposeInCalendar || false
  );
  const [numberOfPeople, setNumberOfPeople] = useState<string>(
    initialFormData?.numberOfPeople?.toString() || ""
  );
  const [activityType, setActivityType] = useState(
    initialFormData?.activityType || ""
  );
  const [description, setDescription] = useState(
    initialFormData?.description || ""
  );

  const [isSeasonBooking, setIsSeasonBooking] = useState(
    initialFormData?.isSeasonBooking || false
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFormData?.endDate
  );
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(
    initialFormData?.weekdays || []
  );
  const [repetitionInterval, setRepetitionInterval] = useState(
    initialFormData?.repetitionInterval?.toString() || "1"
  );

  useEffect(() => {
    if (isOpen && initialFormData) {
      setPurpose(initialFormData.purpose || "");
      setStartTime(initialFormData.startTime || selectedTime || "08:00");
      setEndTime(initialFormData.endTime || "09:00");
      setShowPurposeInCalendar(initialFormData.showPurposeInCalendar || false);
      setNumberOfPeople(initialFormData.numberOfPeople?.toString() || "");
      setActivityType(initialFormData.activityType || "");
      setDescription(initialFormData.description || "");
      setIsSeasonBooking(initialFormData.isSeasonBooking || false);
      setEndDate(initialFormData.endDate);
      setSelectedWeekdays(initialFormData.weekdays || []);
      setRepetitionInterval(initialFormData.repetitionInterval?.toString() || "1");
    }
  }, [isOpen, initialFormData, selectedTime]);

  const handleConfirm = () => {
    if (!selectedDate || !purpose || !activityType || !numberOfPeople || !description) {
      return;
    }

    if (isSeasonBooking) {
      if (!endDate || selectedWeekdays.length === 0) {
        return;
      }
    }

    onConfirm({
      purpose,
      date: selectedDate,
      startTime,
      endTime,
      showPurposeInCalendar,
      numberOfPeople: parseInt(numberOfPeople),
      activityType,
      description,
      isSeasonBooking,
      endDate: isSeasonBooking ? endDate : undefined,
      weekdays: isSeasonBooking ? selectedWeekdays : undefined,
      repetitionInterval: isSeasonBooking ? parseInt(repetitionInterval) : undefined,
    });

    setPurpose("");
    setNumberOfPeople("");
    setActivityType("");
    setDescription("");
    setShowPurposeInCalendar(false);
    setIsSeasonBooking(false);
    setEndDate(undefined);
    setSelectedWeekdays([]);
    setRepetitionInterval("1");
    onFormDataCleared?.();
  };

  const handleClose = () => {
    setPurpose("");
    setNumberOfPeople("");
    setActivityType("");
    setDescription("");
    setShowPurposeInCalendar(false);
    setIsSeasonBooking(false);
    setEndDate(undefined);
    setSelectedWeekdays([]);
    setRepetitionInterval("1");
    onFormDataCleared?.();
    onClose();
  };

  useEffect(() => {
    if (selectedTime && startTime !== selectedTime) {
      setStartTime(selectedTime);
      const hour = parseInt(selectedTime.split(":")[0]) + 1;
      setEndTime(`${hour.toString().padStart(2, "0")}:00`);
    }
  }, [selectedTime]);

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const isFormValid =
    purpose &&
    activityType &&
    numberOfPeople &&
    description &&
    (!isSeasonBooking || (endDate && selectedWeekdays.length > 0));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Book tidspunkt</DialogTitle>
          {zoneName && (
            <p className="text-sm text-muted-foreground mt-1">{zoneName}</p>
          )}
        </DialogHeader>

        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="purpose">Formål med bookingen</Label>
              <span className="text-xs text-muted-foreground">*påkrevd</span>
            </div>
            <Input
              id="purpose"
              placeholder="F.eks 'Trening'"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="showPurpose"
                checked={showPurposeInCalendar}
                onCheckedChange={(checked) => setShowPurposeInCalendar(checked === true)}
              />
              <Label
                htmlFor="showPurpose"
                className="text-sm font-normal cursor-pointer"
              >
                Vis formål i kalender (synlig for alle)
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Dato</Label>
              <Input
                value={
                  selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: nb }) : ""
                }
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Fra kl.</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Til kl.</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="seasonBooking"
              checked={isSeasonBooking}
              onCheckedChange={(checked) => setIsSeasonBooking(checked === true)}
            />
            <Label htmlFor="seasonBooking" className="text-sm font-normal cursor-pointer">
              Book flere dager?
            </Label>
          </div>

          {isSeasonBooking && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-2">
                <Label>Til dato</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: nb }) : "Velg sluttdato"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={nb}
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        date < (selectedDate ? addDays(selectedDate, 1) : new Date())
                      }
                      initialFocus
                      classNames={calendarClassNames}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Ukedager</Label>
                <div className="flex gap-1">
                  {weekdayLabels.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleWeekday(value)}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md border transition-colors",
                        selectedWeekdays.includes(value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gjentagelse</Label>
                <Select
                  value={repetitionInterval}
                  onValueChange={setRepetitionInterval}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {repetitionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="numberOfPeople">Antall personer</Label>
              <span className="text-xs text-muted-foreground">*påkrevd</span>
            </div>
            <Input
              id="numberOfPeople"
              type="number"
              min="1"
              placeholder="Antall deltakere"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Type aktivitet</Label>
              <span className="text-xs text-muted-foreground">*påkrevd</span>
            </div>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger>
                <SelectValue placeholder="Velg" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">
                Kort beskrivelse av ditt arrangement
              </Label>
              <span className="text-xs text-muted-foreground">*påkrevd</span>
            </div>
            <Textarea
              id="description"
              placeholder="Beskriv aktiviteten..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Lukk
          </Button>
          <Button onClick={handleConfirm} disabled={!isFormValid}>
            Bekreft valg
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


