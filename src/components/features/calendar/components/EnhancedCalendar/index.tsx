import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleCalendar } from '../SimpleCalendar';
import { CalendarFilters } from './CalendarFilters';
import { EventTooltip } from '../EventTooltip';
import { EventContextMenu } from './EventContextMenu';
import { useCalendarEnhancements, useFilteredEvents, useAvailableFacilities } from '../../hooks/useCalendarEnhancements';
import type { IBookingEvent } from '@/types/calendar';

interface EnhancedCalendarProps {
  readonly events: readonly IBookingEvent[];
  readonly onEventClick?: (event: IBookingEvent) => void;
  readonly onEventEdit?: (event: IBookingEvent) => void;
  readonly onEventDelete?: (event: IBookingEvent) => void;
  readonly onEventCopy?: (event: IBookingEvent) => void;
  readonly onEventShare?: (event: IBookingEvent) => void;
  readonly onEventAddToCalendar?: (event: IBookingEvent) => void;
  readonly className?: string;
  // External control (optional)
  readonly view?: 'month' | 'week' | 'day';
  readonly onViewChange?: (view: 'month' | 'week' | 'day') => void;
  readonly currentDate?: Date;
  readonly onDateChange?: (date: Date) => void;
}

export const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({
  events,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventCopy,
  onEventShare,
  onEventAddToCalendar,
  className = '',
  view: externalView,
  onViewChange,
  currentDate: externalCurrentDate,
  onDateChange
}): JSX.Element => {
  const { t } = useTranslation('common');
  const {
    searchQuery,
    selectedFacilities,
    selectedStatuses,
    hoveredEvent,
    contextMenuEvent,
    contextMenuPosition,
    isLoading,
    lastRefresh,
    setSearchQuery,
    setSelectedFacilities,
    setSelectedStatuses,
    setHoveredEvent,
    handleEventRightClick,
    handleContextMenuClose,
    refreshCalendar
  } = useCalendarEnhancements();

  const availableFacilities = useAvailableFacilities(events);
  const filteredEvents = useFilteredEvents(events, searchQuery, selectedFacilities, selectedStatuses);

  const [internalView, setInternalView] = useState<'month' | 'week' | 'day'>('month');
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date());
  const view = externalView ?? internalView;
  const setView = onViewChange ?? setInternalView;
  const currentDate = externalCurrentDate ?? internalCurrentDate;
  const setCurrentDate = onDateChange ?? setInternalCurrentDate;

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      void refreshCalendar();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshCalendar]);

  const handleEventClick = useCallback((event: IBookingEvent): void => {
    onEventClick?.(event);
  }, [onEventClick]);

  const handleEventHover = useCallback((event: IBookingEvent | null): void => {
    setHoveredEvent(event);
  }, [setHoveredEvent]);

  const handleEventRightClickCallback = useCallback((event: IBookingEvent, position: { x: number; y: number }): void => {
    handleEventRightClick(event, position);
  }, [handleEventRightClick]);

  const handleContextMenuAction = useCallback((action: (event: IBookingEvent) => void, event: IBookingEvent): void => {
    action(event);
    handleContextMenuClose();
  }, [handleContextMenuClose]);


  const hasActiveFilters = searchQuery !== '' || selectedFacilities.length > 0 || selectedStatuses.length > 0;
  const hasEvents = filteredEvents.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('calendar:title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lastRefresh ? t('calendar:messages.last_updated', { time: lastRefresh.toLocaleTimeString('no-NO') }) : t('calendar:manage_bookings')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshCalendar()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? t('calendar:actions.refreshing') : t('calendar:actions.refresh')}
          </Button>

        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <CalendarFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFacilities={selectedFacilities}
            onFacilitiesChange={setSelectedFacilities}
            selectedStatuses={selectedStatuses}
            onStatusesChange={setSelectedStatuses}
            availableFacilities={availableFacilities}
          />
        </CardContent>
      </Card>

      {/* Results summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {t('calendar:filters.showing_results', { count: filteredEvents.length, total: events.length })}
          </span>
          {filteredEvents.length === 0 && (
            <Alert className="flex-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('calendar:filters.no_results_with_filters')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <SimpleCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventHover={handleEventHover}
            onEventRightClick={handleEventRightClickCallback}
          />
        </CardContent>
      </Card>

      {/* Event Tooltip */}
      {hoveredEvent && (
        <div className="fixed z-40 pointer-events-none">
          <EventTooltip event={hoveredEvent} />
        </div>
      )}

      {/* Context Menu */}
      {contextMenuEvent && contextMenuPosition && (
        <EventContextMenu
          event={contextMenuEvent}
          position={contextMenuPosition}
          onClose={handleContextMenuClose}
          onEdit={onEventEdit ? (event) => handleContextMenuAction(onEventEdit, event) : undefined}
          onDelete={onEventDelete ? (event) => handleContextMenuAction(onEventDelete, event) : undefined}
          onCopy={onEventCopy ? (event) => handleContextMenuAction(onEventCopy, event) : undefined}
          onShare={onEventShare ? (event) => handleContextMenuAction(onEventShare, event) : undefined}
          onAddToCalendar={onEventAddToCalendar ? (event) => handleContextMenuAction(onEventAddToCalendar, event) : undefined}
          onView={onEventClick ? (event) => handleContextMenuAction(onEventClick, event) : undefined}
        />
      )}

      {/* Empty state */}
      {!hasEvents && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('calendar:event.no_bookings')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {hasActiveFilters
                    ? t('calendar:event.adjust_filters')
                    : t('calendar:event.create_first_booking')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
