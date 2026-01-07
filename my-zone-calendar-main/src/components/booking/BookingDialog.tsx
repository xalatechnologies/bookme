import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BookingFormData) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  zoneName: string;
  initialFormData?: BookingFormData | null;
  onFormDataCleared?: () => void;
}

export interface BookingFormData {
  purpose: string;
  date: Date;
  startTime: string;
  endTime: string;
  showPurposeInCalendar: boolean;
  numberOfPeople: number;
  activityType: string;
  description: string;
  // Season booking fields
  isSeasonBooking: boolean;
  endDate?: Date;
  weekdays?: number[];
  repetitionInterval?: number;
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

export function BookingDialog({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  zoneName,
  initialFormData,
  onFormDataCleared,
}: BookingDialogProps) {
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
  const [showPurposeInCalendar, setShowPurposeInCalendar] = useState(initialFormData?.showPurposeInCalendar || false);
  const [numberOfPeople, setNumberOfPeople] = useState<string>(initialFormData?.numberOfPeople?.toString() || "");
  const [activityType, setActivityType] = useState(initialFormData?.activityType || "");
  const [description, setDescription] = useState(initialFormData?.description || "");

  // Season booking state
  const [isSeasonBooking, setIsSeasonBooking] = useState(initialFormData?.isSeasonBooking || false);
  const [endDate, setEndDate] = useState<Date | undefined>(initialFormData?.endDate);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>(initialFormData?.weekdays || []);
  const [repetitionInterval, setRepetitionInterval] = useState(initialFormData?.repetitionInterval?.toString() || "1");

  // Populate form with initialFormData when it changes (e.g., when reopening after conflict dialog)
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

    // Validate season booking fields
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

    // Reset form
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

  // Update times when selectedTime changes
  useEffect(() => {
    if (selectedTime && startTime !== selectedTime) {
      setStartTime(selectedTime);
      const hour = parseInt(selectedTime.split(":")[0]) + 1;
      setEndTime(`${hour.toString().padStart(2, "0")}:00`);
    }
  }, [selectedTime]);

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const isFormValid = purpose && activityType && numberOfPeople && description && 
    (!isSeasonBooking || (endDate && selectedWeekdays.length > 0));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Book tidspunkt
          </DialogTitle>
          {zoneName && (
            <p className="text-sm text-muted-foreground mt-1">
              {zoneName}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Purpose */}
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
            {/* Show purpose in calendar checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="showPurpose"
                checked={showPurposeInCalendar}
                onCheckedChange={(checked) => setShowPurposeInCalendar(checked === true)}
              />
              <Label htmlFor="showPurpose" className="text-sm font-normal cursor-pointer">
                Vis formål i kalender (synlig for alle)
              </Label>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Dato</Label>
              <Input
                value={selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: nb }) : ""}
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

          {/* Season booking checkbox */}
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

          {/* Season booking fields */}
          {isSeasonBooking && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              {/* End date */}
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
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => 
                        date < (selectedDate ? addDays(selectedDate, 1) : new Date())
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Weekdays */}
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

              {/* Repetition interval */}
              <div className="space-y-2">
                <Label>Gjentagelse</Label>
                <Select value={repetitionInterval} onValueChange={setRepetitionInterval}>
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


          {/* Number of people */}
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

          {/* Activity type */}
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

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Kort beskrivelse av ditt arrangement</Label>
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
