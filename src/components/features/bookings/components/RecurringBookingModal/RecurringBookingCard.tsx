"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Repeat,
  Pause,
  Play,
  X,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RecurringBooking } from "@/types/recurringBooking";
import { recurrenceEngine } from "@/components/features/bookings/utils/recurrence";
import { useTranslation } from 'react-i18next';

/**
 * Props interface for RecurringBookingCard component
 */
interface RecurringBookingCardProps {
  readonly booking: RecurringBooking;
  readonly onPause: (id: string) => void;
  readonly onResume: (id: string) => void;
  readonly onCancel: (id: string) => void;
  readonly onEdit: (id: string) => void;
  readonly onCancelOccurrence: (
    bookingId: string,
    occurrenceId: string
  ) => void;
  readonly onConfirmOccurrence: (
    bookingId: string,
    occurrenceId: string
  ) => void;
}

/**
 * Occurrence status badge component
 */
const OccurrenceStatusBadge: React.FC<{
  status: RecurringBooking["occurrences"][0]["status"];
}> = ({ status }) => {
  return (
    <StatusBadge
      status={status}
      translationKey={`common:status.${status}`}
      showIcon={false}
      size="sm"
    />
  );
};

/**
 * Occurrence list component showing upcoming bookings
 */
const OccurrenceList: React.FC<{
  readonly occurrences: RecurringBooking["occurrences"];
  readonly onCancelOccurrence: (occurrenceId: string) => void;
  readonly onConfirmOccurrence: (occurrenceId: string) => void;
}> = ({ occurrences, onCancelOccurrence, onConfirmOccurrence }) => {
  const upcomingOccurrences = occurrences
    .filter((occ) => new Date(occ.date) >= new Date())
    .slice(0, 5); // Show next 5 occurrences

  if (upcomingOccurrences.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">
          Ingen kommende bookinger
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">
        Kommende bookinger
      </h4>
      <div className="space-y-1">
        {upcomingOccurrences.map((occurrence) => (
          <div
            key={occurrence.id}
            className="flex items-center justify-between p-2 bg-muted rounded-md"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {format(new Date(occurrence.date), "dd.MM.yyyy")}
              </span>
              <OccurrenceStatusBadge status={occurrence.status} />
            </div>
            <div className="flex items-center space-x-1">
              {occurrence.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onConfirmOccurrence(occurrence.id)}
                    className="h-6 px-2 text-xs"
                  >
                    Bekreft
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancelOccurrence(occurrence.id)}
                    className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                  >
                    Avbryt
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Confirmation dialog for booking actions
 */
const ConfirmationDialog: React.FC<{
  readonly isOpen: boolean;
  readonly title: string;
  readonly description: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly variant?: "default" | "destructive";
}> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Bekreft",
  cancelText = "Avbryt",
  variant = "default",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Recurring booking card component
 *
 * Displays a recurring booking with all details, actions, and upcoming occurrences.
 * Provides full management capabilities including pause, resume, cancel, and edit.
 */
export const RecurringBookingCard: React.FC<RecurringBookingCardProps> = ({
  booking,
  onPause,
  onResume,
  onCancel,
  onEdit,
  onCancelOccurrence,
  onConfirmOccurrence,
}) => {
  const { t } = useTranslation(['common', 'booking']);
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [showPauseDialog, setShowPauseDialog] = useState<boolean>(false);
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(false);

  const patternDescription = recurrenceEngine.getPatternDescription(
    booking.recurrencePattern,
    t
  );
  const totalOccurrences = booking.occurrences.length;
  const confirmedOccurrences = booking.occurrences.filter(
    (occ) => occ.status === "confirmed"
  ).length;
  const pendingOccurrences = booking.occurrences.filter(
    (occ) => occ.status === "pending"
  ).length;

  const handleCancelOccurrence = (occurrenceId: string): void => {
    onCancelOccurrence(booking.id, occurrenceId);
  };

  const handleConfirmOccurrence = (occurrenceId: string): void => {
    onConfirmOccurrence(booking.id, occurrenceId);
  };

  const handleCancel = (): void => {
    onCancel(booking.id);
    setShowCancelDialog(false);
  };

  const handlePause = (): void => {
    onPause(booking.id);
    setShowPauseDialog(false);
  };

  const handleResume = (): void => {
    onResume(booking.id);
    setShowResumeDialog(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <Repeat className="h-5 w-5" />
                <span>{booking.facilityName}</span>
                <StatusBadge
                  status={booking.status}
                  translationKey={`common:status.${booking.status}`}
                  showIcon={false}
                  size="sm"
                />
              </CardTitle>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{booking.zoneName}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{patternDescription}</span>
                </span>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Åpne meny</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(booking.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Rediger
                </DropdownMenuItem>
                {booking.status === "active" && (
                  <DropdownMenuItem onClick={() => setShowPauseDialog(true)}>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </DropdownMenuItem>
                )}
                {booking.status === "paused" && (
                  <DropdownMenuItem onClick={() => setShowResumeDialog(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Gjenoppta
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Avbryt serie
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Deltakere:</span>
                <span className="text-sm">{booking.attendees}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Startdato:</span>
                <span className="text-sm">
                  {format(new Date(booking.startDate), "dd.MM.yyyy")}
                </span>
              </div>
              {booking.endDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sluttdato:</span>
                  <span className="text-sm">
                    {format(new Date(booking.endDate), "dd.MM.yyyy")}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Formål:</span>
                <p className="text-muted-foreground mt-1">{booking.purpose}</p>
              </div>
              {booking.activityType && (
                <div className="text-sm">
                  <span className="font-medium">Aktivitetstype:</span>
                  <span className="text-muted-foreground ml-1">
                    {booking.activityType}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tidspunkter</h4>
            <div className="flex flex-wrap gap-2">
              {booking.timeSlots.map((timeSlot) => (
                <Badge key={timeSlot} variant="outline">
                  {timeSlot}
                </Badge>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-md">
            <div className="text-center">
              <div className="text-lg font-semibold">{totalOccurrences}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {confirmedOccurrences}
              </div>
              <div className="text-xs text-muted-foreground">Bekreftet</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {pendingOccurrences}
              </div>
              <div className="text-xs text-muted-foreground">Venter</div>
            </div>
          </div>

          {/* Upcoming Occurrences */}
          <OccurrenceList
            occurrences={booking.occurrences}
            onCancelOccurrence={handleCancelOccurrence}
            onConfirmOccurrence={handleConfirmOccurrence}
          />

          {/* Pricing */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Totalpris:</span>
              <span className="text-lg font-semibold">
                {booking.pricing.totalPrice.toLocaleString("no-NO")} kr
              </span>
            </div>
            {booking.pricing.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Rabatt:</span>
                <span>
                  -{booking.pricing.discount.toLocaleString("no-NO")} kr
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showCancelDialog}
        title="Avbryt gjentakende booking"
        description="Er du sikker på at du vil avbryte hele serien? Dette kan ikke angres."
        onConfirm={handleCancel}
        onCancel={() => setShowCancelDialog(false)}
        confirmText="Avbryt serie"
        variant="destructive"
      />

      <ConfirmationDialog
        isOpen={showPauseDialog}
        title="Pause gjentakende booking"
        description="Gjentakende bookingen vil bli pauset. Du kan gjenoppta den senere."
        onConfirm={handlePause}
        onCancel={() => setShowPauseDialog(false)}
        confirmText="Pause"
      />

      <ConfirmationDialog
        isOpen={showResumeDialog}
        title="Gjenoppta gjentakende booking"
        description="Gjentakende bookingen vil bli gjenopptatt og fortsette som før."
        onConfirm={handleResume}
        onCancel={() => setShowResumeDialog(false)}
        confirmText="Gjenoppta"
      />
    </>
  );
};
