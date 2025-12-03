import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { IBookingEvent } from '@/types/calendar';
import { useDateNavigation, type CalendarView } from '@/hooks/features/calendar/useDateNavigation';
import { useCalendarDateLogic } from '@/hooks/features/calendar/useCalendarDateLogic';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';

interface SimpleCalendarProps {
  readonly events: readonly IBookingEvent[];
  readonly onEventClick?: (event: IBookingEvent) => void;
  readonly onEventHover?: (event: IBookingEvent | null) => void;
  readonly onEventRightClick?: (event: IBookingEvent, position: { x: number; y: number }) => void;
  readonly className?: string;
  readonly view?: CalendarView;
  readonly onViewChange?: (view: CalendarView) => void;
  readonly currentDate?: Date;
  readonly onDateChange?: (date: Date) => void;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  events,
  onEventClick,
  onEventHover,
  onEventRightClick,
  className = '',
  view = 'month',
  onViewChange,
  currentDate: externalCurrentDate,
  onDateChange
}): JSX.Element => {
  const { t } = useTranslation('common');

  // Use custom hooks for date navigation and calendar logic
  const {
    currentDate,
    goToPrevious,
    goToNext,
    goToToday,
    getDisplayText,
    weekStartDate,
    firstDayOfMonth,
    lastDayOfMonth
  } = useDateNavigation(externalCurrentDate, onDateChange, view);

  const { calendarDays, getEventsForDate } = useCalendarDateLogic({
    currentDate,
    view,
    weekStartDate,
    firstDayOfMonth,
    lastDayOfMonth
  });

  // Day names - starting with Monday
  const dayNames = [
    t('time.days.mon', 'Mon'),
    t('time.days.tue', 'Tue'),
    t('time.days.wed', 'Wed'),
    t('time.days.thu', 'Thu'),
    t('time.days.fri', 'Fri'),
    t('time.days.sat', 'Sat'),
    t('time.days.sun', 'Sun')
  ];

  // Render the appropriate view component
  const renderView = (): JSX.Element => {
    if (view === 'day') {
      return (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={onEventClick}
          onEventHover={onEventHover}
          onEventRightClick={onEventRightClick}
        />
      );
    }

    const viewProps = {
      calendarDays,
      events,
      getEventsForDate,
      onEventClick,
      onEventHover,
      onEventRightClick
    };

    if (view === 'week') {
      return <WeekView {...viewProps} />;
    }

    // Month view
    return (
      <MonthView
        {...viewProps}
        currentMonth={currentDate.getMonth()}
        currentYear={currentDate.getFullYear()}
      />
    );
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getDisplayText()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevious} className="p-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="text-sm">
            {t('navigation.today')}
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext} className="p-2">
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* View buttons */}
          <div className="flex gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('month')}
              className={`p-2 ${view === 'month' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('week')}
              className={`px-3 ${view === 'week' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              {t('views.week')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('day')}
              className={`px-3 ${view === 'day' ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700 dark:text-white' : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              {t('views.day')}
            </Button>
          </div>
        </div>
      </div>

      {/* Day names header - only show for month and week views */}
      {view !== 'day' && (
        <div className="grid gap-px bg-gray-200 dark:bg-gray-700 grid-cols-7">
          {dayNames.map((dayName) => (
            <div
              key={dayName}
              className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {dayName}
            </div>
          ))}
        </div>
      )}

      {/* Calendar view content */}
      {renderView()}

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('status.confirmed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('status.pending')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('status.cancelled')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
