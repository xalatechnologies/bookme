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
    
    if (startMonth === endMonth) {
      return `${format(weekStart, 'd.', { locale: nb })} - ${format(weekEnd, 'd. MMMM yyyy', { locale: nb })}`;
    }
    return `${format(weekStart, 'd. MMM', { locale: nb })} - ${format(weekEnd, 'd. MMM yyyy', { locale: nb })}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <button
          onClick={onPreviousWeek}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNextWeek}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <span className="text-lg font-semibold text-foreground capitalize">
        {formatDateRange()}
      </span>
    </div>
  );
}
