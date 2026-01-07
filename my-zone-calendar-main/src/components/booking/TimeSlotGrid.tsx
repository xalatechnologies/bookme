import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { nb } from "date-fns/locale";
import { SlotStatus, TimeSlot, DaySchedule, SelectedSlot } from "@/types/booking";

interface TimeSlotGridProps {
  days: DaySchedule[];
  selectedSlots: SelectedSlot[];
  onSlotClick: (date: Date, slot: TimeSlot) => void;
}

const getSlotClasses = (status: SlotStatus, isSelected: boolean) => {
  const baseClasses = "py-1.5 px-2 text-xs font-medium rounded-md transition-all duration-200 text-center";
  
  if (isSelected) {
    return cn(baseClasses, "slot-selected transform scale-105");
  }
  
  switch (status) {
    case 'available':
      return cn(baseClasses, "slot-available hover:shadow-slot-hover hover:scale-105");
    case 'booked':
      return cn(baseClasses, "slot-booked");
    case 'reserved':
      return cn(baseClasses, "slot-reserved");
    case 'unavailable':
      return cn(baseClasses, "slot-unavailable");
    case 'conflict':
      return cn(baseClasses, "slot-conflict");
    default:
      return cn(baseClasses, "slot-available");
  }
};

export function TimeSlotGrid({ days, selectedSlots, onSlotClick }: TimeSlotGridProps) {
  const hours = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 - 21:00

  const isSlotSelected = (date: Date, hour: number) => {
    return selectedSlots.some(
      slot => 
        format(slot.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && 
        slot.hour === hour
    );
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      {/* Scrollable container for mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b border-border bg-muted/30">
            <div className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground border-r border-border">
              Tid
            </div>
            {days.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "p-2 sm:p-3 text-center border-r border-border last:border-r-0",
                  day.isToday && "bg-primary/5"
                )}
              >
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {format(day.date, 'EEE', { locale: nb })}
                </div>
                <div className={cn(
                  "text-sm sm:text-lg font-bold mt-0.5",
                  day.isToday ? "text-primary" : "text-foreground"
                )}>
                  {format(day.date, 'd')}
                </div>
                {day.isToday && (
                  <div className="text-[10px] font-medium text-primary mt-0.5">I dag</div>
                )}
              </div>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                <div className="p-1.5 sm:p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground border-r border-border bg-muted/20">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {days.map((day) => {
                  const slot = day.slots.find(s => s.hour === hour);
                  if (!slot) return <div key={`${day.date.toISOString()}-${hour}`} className="p-1" />;
                  
                  const selected = isSlotSelected(day.date, hour);
                  const isClickable = slot.status === 'available' || selected;

                  return (
                    <div 
                      key={slot.id} 
                      className={cn(
                        "p-1 sm:p-1.5 border-r border-border last:border-r-0",
                        day.isToday && "bg-primary/5"
                      )}
                    >
                      <button
                        onClick={() => isClickable && onSlotClick(day.date, slot)}
                        disabled={!isClickable}
                        className={cn(
                          "w-full text-[10px] sm:text-xs",
                          getSlotClasses(slot.status, selected)
                        )}
                      >
                        {slot.time}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
