import React from "react";
import { Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { IBookingEvent } from "@/types/calendar";

interface EventTooltipProps {
  readonly event: IBookingEvent;
  readonly className?: string;
}

export const EventTooltip: React.FC<EventTooltipProps> = ({
  event,
  className = "",
}): JSX.Element => {
  const { t } = useTranslation("common");

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("no-NO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("no-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={`w-80 shadow-lg border-0 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
              {event.title}
            </h3>
            <StatusBadge
              status={event.status}
              translationKey={`calendar:status.${event.status}`}
              showIcon={false}
              size="sm"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>{formatDate(event.start)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {formatTime(event.start)} - {formatTime(event.end)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.facilityName}</span>
            </div>

            {event.price && event.price > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span>{event.price} kr</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <PrimaryButton className="flex-1 px-3 py-1.5 text-sm rounded">
              {t("common.view_details")}
            </PrimaryButton>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              {t("actions.edit")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
