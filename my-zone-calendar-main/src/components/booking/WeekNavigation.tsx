import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays } from "date-fns";
import { nb } from "date-fns/locale";

interface WeekNavigationProps {
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export function WeekNavigation({ weekStart, onPreviousWeek, onNextWeek }: WeekNavigationProps) {
  const weekEnd = addDays(weekStart, 6);
  
  const formatDateRange = () => {
    const startMonth = format(weekStart, 'MMMM', { locale: nb });
    const endMonth = format(weekEnd, 'MMMM', { locale: nb });
    const year = format(weekStart, 'yyyy');
    
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

    if (startMonth === endMonth) {
      const endDay = format(weekEnd, 'd.', { locale: nb });
      const month = capitalize(endMonth);
      return `${format(weekStart, 'd.', { locale: nb })} - ${endDay} ${month} ${year}`;
    }
    const month = capitalize(endMonth);
    return `${format(weekStart, 'd. MMM', { locale: nb })} - ${format(weekEnd, 'd.', { locale: nb })} ${month} ${year}`;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousWeek}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-border bg-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-border bg-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <span className="text-sm sm:text-base font-semibold text-foreground">
        {formatDateRange()}
      </span>
    </div>
  );
}
