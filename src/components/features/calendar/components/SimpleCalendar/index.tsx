import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3X3, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { IBookingEvent } from '@/types/calendar';

type CalendarView = 'month' | 'week' | 'day';

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
}) => {
  const { t } = useTranslation('calendar');
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  const currentDate = externalCurrentDate || internalCurrentDate;
  const setCurrentDate = onDateChange || setInternalCurrentDate;

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Generate calendar days based on view
  const calendarDays = useMemo(() => {
    const days = [];
    
    if (view === 'month') {
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }
    } else if (view === 'week') {
      // Get start of week (Monday)
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
      const adjustedDay = (day + 6) % 7;
      const diff = startOfWeek.getDate() - adjustedDay;
      startOfWeek.setDate(diff);
      
      // Add 7 days for the week - store the actual dates, not just day numbers
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(startOfWeek);
        weekDay.setDate(startOfWeek.getDate() + i);
        days.push(weekDay.getDate());
      }
    } else if (view === 'day') {
      // Just the current day
      days.push(currentDate.getDate());
    }
    
    return days;
  }, [startingDayOfWeek, daysInMonth, view, currentDate]);

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    if (!day) return [];
    
    let dateString: string;
    
    if (view === 'month') {
      const targetDate = new Date(currentYear, currentMonth, day);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dayNum = String(targetDate.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${dayNum}`;
    } else if (view === 'week') {
      // For week view, we need to calculate the actual date for this day
      // First, get the start of the week (Monday)
      const startOfWeek = new Date(currentDate);
      const dayOfWeek = startOfWeek.getDay();
      // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
      const adjustedDayOfWeek = (dayOfWeek + 6) % 7;
      const diff = startOfWeek.getDate() - adjustedDayOfWeek;
      startOfWeek.setDate(diff);
      
      // Now find which day of the week this is (0-6, where 0 is Monday)
      // We need to find the index of this day in the week
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const weekDay = new Date(startOfWeek);
        weekDay.setDate(startOfWeek.getDate() + i);
        weekDays.push(weekDay.getDate());
      }
      
      // Find the index of this day in the week
      const dayIndex = weekDays.indexOf(day);
      if (dayIndex === -1) return [];
      
      // Calculate the actual date
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + dayIndex);
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dayNum = String(targetDate.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${dayNum}`;
    } else if (view === 'day') {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayNum = String(currentDate.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${dayNum}`;
    } else {
      return [];
    }
    
    const filteredEvents = events.filter(event => {
      const eventStart = new Date(event.start);
      const year = eventStart.getFullYear();
      const month = String(eventStart.getMonth() + 1).padStart(2, '0');
      const day = String(eventStart.getDate()).padStart(2, '0');
      const eventDate = `${year}-${month}-${day}`;
      return eventDate === dateString;
    });
    
    
    return filteredEvents;
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format display based on view
  const getDisplayText = () => {
    if (view === 'month') {
      return firstDayOfMonth.toLocaleDateString('nb-NO', {
        month: 'long',
        year: 'numeric'
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      // Adjust for Monday start: Sunday (0) becomes 6, Monday (1) becomes 0, etc.
      const adjustedDay = (day + 6) % 7;
      const diff = startOfWeek.getDate() - adjustedDay;
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })} - ${endOfWeek.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (view === 'day') {
      return currentDate.toLocaleDateString('nb-NO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return '';
  };

  // Day names - starting with Monday
  const dayNames = [
    t('days.mon'), t('days.tue'), t('days.wed'),
    t('days.thu'), t('days.fri'), t('days.sat'), t('days.sun')
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {getDisplayText()}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            className="p-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm"
          >
            {t('navigation.today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="p-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {/* View buttons */}
          <div className="flex gap-1 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('month')}
              className={`p-2 ${view === 'month' ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('week')}
              className={`px-3 ${view === 'week' ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              {t('views.week')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewChange?.('day')}
              className={`px-3 ${view === 'day' ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              {t('views.day')}
            </Button>
          </div>
        </div>
      </div>

      {/* Day names header */}
      <div className={`grid gap-px bg-gray-200 dark:bg-gray-700 ${
        view === 'day' ? 'grid-cols-1' : 
        view === 'week' ? 'grid-cols-7' : 
        'grid-cols-7'
      }`}>
        {view === 'day' ? (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {currentDate.toLocaleDateString('no-NO', { weekday: 'long' })}
          </div>
        ) : (
          dayNames.map((dayName) => (
            <div
              key={dayName}
              className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {dayName}
            </div>
          ))
        )}
      </div>

      {/* Calendar grid */}
      {view === 'day' ? (
        // Day view with time slots
        <div className="bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('no-NO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </div>
          </div>
          
          {/* Time slots for day view */}
          <div className="max-h-96 overflow-y-auto">
            {Array.from({ length: 24 }, (_, hour) => {
              const timeString = `${hour.toString().padStart(2, '0')}:00`;
              
              // Get events for this hour - show events that span this hour
              const hourEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                const eventEnd = new Date(event.end);
                
                // Use local date components to avoid timezone issues
                const eventYear = eventStart.getFullYear();
                const eventMonth = String(eventStart.getMonth() + 1).padStart(2, '0');
                const eventDay = String(eventStart.getDate()).padStart(2, '0');
                const eventDate = `${eventYear}-${eventMonth}-${eventDay}`;
                
                const currentYear = currentDate.getFullYear();
                const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
                const currentDay = String(currentDate.getDate()).padStart(2, '0');
                const currentDateString = `${currentYear}-${currentMonth}-${currentDay}`;
                
                // Check if event is on the current date
                if (eventDate !== currentDateString) return false;
                
                // Check if this hour is within the event's time range
                const eventStartHour = eventStart.getHours();
                const eventEndHour = eventEnd.getHours();
                
                // Event spans this hour if:
                // 1. Event starts at this hour, OR
                // 2. Event ends after this hour (but starts before), OR
                // 3. Event spans multiple hours and this hour is in between
                return hour >= eventStartHour && hour < eventEndHour;
              });
              
              return (
                <div key={hour} className="flex border-b border-gray-100 dark:border-gray-700">
                  <div className="w-20 p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-100 dark:border-gray-700">
                    {timeString}
                  </div>
                  <div 
                    className="flex-1 p-3 min-h-[60px] relative"
                  >
                    {hourEvents.map((event) => {
                      // Calculate how many hours this event spans
                      const eventStart = new Date(event.start);
                      const eventEnd = new Date(event.end);
                      const eventStartHour = eventStart.getHours();
                      const eventEndHour = eventEnd.getHours();
                      const durationHours = eventEndHour - eventStartHour;
                      
                      // Only show the event on its starting hour to avoid duplicates
                      const isEventStartHour = eventStartHour === hour;
                      
                      if (!isEventStartHour) return null;
                      
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          onMouseEnter={() => onEventHover?.(event)}
                          onMouseLeave={() => onEventHover?.(null)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onEventRightClick?.(event, { x: e.clientX, y: e.clientY });
                          }}
                          className="text-sm p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 transition-colors absolute left-0 right-0 z-10"
                          style={{
                            backgroundColor: event.status === 'confirmed' ? '#dcfce7' : 
                                           event.status === 'pending' ? '#fef3c7' : '#fecaca',
                            borderLeft: `3px solid ${
                              event.status === 'confirmed' ? '#16a34a' : 
                              event.status === 'pending' ? '#d97706' : '#dc2626'
                            }`,
                            height: `${Math.max(60, durationHours * 60)}px`, // Minimum 60px, then 60px per hour
                            top: '12px' // Offset from the top of the time slot
                          }}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs">
                            {new Date(event.start).toLocaleTimeString('no-NO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(event.end).toLocaleTimeString('no-NO', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                            {event.facilityName}
                          </div>
                        </div>
                      );
                    })}
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Month and week view
        <div className={`grid gap-px bg-gray-200 dark:bg-gray-700 ${
          view === 'week' ? 'grid-cols-7' : 'grid-cols-7'
        }`}>
          {calendarDays.map((day, index) => {
            const isToday = view === 'week' ? 
              day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear() :
              day === new Date().getDate() && 
              currentMonth === new Date().getMonth() && 
              currentYear === new Date().getFullYear();
            
            const dayEvents = day ? getEventsForDate(day) : [];

            return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 min-h-[100px] p-2"
            >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {day}
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          onMouseEnter={() => onEventHover?.(event)}
                          onMouseLeave={() => onEventHover?.(null)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            onEventRightClick?.(event, { x: e.clientX, y: e.clientY });
                          }}
                          className={`text-xs p-1 rounded cursor-pointer truncate transition-colors ${
                            event.status === 'confirmed' || event.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                              : event.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                          }`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {new Date(event.start).toLocaleTimeString('no-NO', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                      
                      {/* Show "more" indicator if there are more than 3 events */}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {t('event.more_events', { count: dayEvents.length - 3 })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

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
