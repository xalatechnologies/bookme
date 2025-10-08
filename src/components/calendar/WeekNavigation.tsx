"use client";

// External libraries
import React from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { nb } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

// Internal libraries/utilities
import { Button } from "@/components/ui/button";

// Types
import { IWeekNavigationProps } from "./types";

/**
 * Week navigation component for calendar
 * 
 * Provides navigation controls for moving between weeks in the calendar.
 * Includes previous/next week buttons and current week indicator.
 * 
 * Features:
 * - Previous/next week navigation
 * - Current week indicator
 * - Responsive design
 * - Loading state support
 * - Accessibility features
 * 
 * @param props - Week navigation props
 */
export const WeekNavigation: React.FC<IWeekNavigationProps> = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  isLoading = false,
}) => {
  const formatWeekRange = (startDate: Date, endDate: Date): string => {
    const start = format(startDate, "dd. MMM", { locale: nb });
    const end = format(endDate, "dd. MMM yyyy", { locale: nb });
    return `${start} - ${end}`;
  };

  const isCurrentWeek = (): boolean => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    return currentWeek.startDate.getTime() === currentWeekStart.getTime();
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Previous Week Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onPreviousWeek}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2"
        aria-label="Forrige uke"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Forrige uke</span>
      </Button>

      {/* Current Week Display */}
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {formatWeekRange(currentWeek.startDate, currentWeek.endDate)}
          </h3>
        </div>
        
        {/* Current Week Indicator */}
        {isCurrentWeek() && (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <div className="h-2 w-2 bg-blue-600 rounded-full" />
            <span>Denne uken</span>
          </div>
        )}
      </div>

      {/* Next Week Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onNextWeek}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2"
        aria-label="Neste uke"
      >
        <span className="hidden sm:inline">Neste uke</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default WeekNavigation;
