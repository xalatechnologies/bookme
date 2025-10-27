import React, { useState, useCallback } from 'react';
import { Edit, Trash2, Copy, Share2, CalendarPlus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { IBookingEvent } from '@/types/calendar';

interface EventContextMenuProps {
  readonly event: IBookingEvent;
  readonly position: { x: number; y: number };
  readonly onClose: () => void;
  readonly onEdit?: (event: IBookingEvent) => void;
  readonly onDelete?: (event: IBookingEvent) => void;
  readonly onCopy?: (event: IBookingEvent) => void;
  readonly onShare?: (event: IBookingEvent) => void;
  readonly onAddToCalendar?: (event: IBookingEvent) => void;
  readonly onView?: (event: IBookingEvent) => void;
  readonly className?: string;
}

export const EventContextMenu: React.FC<EventContextMenuProps> = ({
  event,
  position,
  onClose,
  onEdit,
  onDelete,
  onCopy,
  onShare,
  onAddToCalendar,
  onView,
  className = ''
}): JSX.Element => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleAction = useCallback((action: () => void): void => {
    action();
    setIsVisible(false);
    onClose();
  }, [onClose]);

  const handleEdit = useCallback((): void => {
    if (onEdit) {
      handleAction(() => onEdit(event));
    }
  }, [onEdit, event, handleAction]);

  const handleDelete = useCallback((): void => {
    if (onDelete) {
      handleAction(() => onDelete(event));
    }
  }, [onDelete, event, handleAction]);

  const handleCopy = useCallback((): void => {
    if (onCopy) {
      handleAction(() => onCopy(event));
    }
  }, [onCopy, event, handleAction]);

  const handleShare = useCallback((): void => {
    if (onShare) {
      handleAction(() => onShare(event));
    }
  }, [onShare, event, handleAction]);

  const handleAddToCalendar = useCallback((): void => {
    if (onAddToCalendar) {
      handleAction(() => onAddToCalendar(event));
    }
  }, [onAddToCalendar, event, handleAction]);

  const handleView = useCallback((): void => {
    if (onView) {
      handleAction(() => onView(event));
    }
  }, [onView, event, handleAction]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <Card className={`w-48 shadow-lg border-0 ${className}`}>
        <CardContent className="p-1">
          <div className="space-y-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                className="w-full justify-start"
              >
                <Eye className="w-4 h-4 mr-2" />
                Se detaljer
              </Button>
            )}
            
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="w-full justify-start"
              >
                <Edit className="w-4 h-4 mr-2" />
                Rediger
              </Button>
            )}
            
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="w-full justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Kopier
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="w-full justify-start"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Del
              </Button>
            )}
            
            {onAddToCalendar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToCalendar}
                className="w-full justify-start"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Legg til i kalender
              </Button>
            )}
            
            {onDelete && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Slett
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
