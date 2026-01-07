import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Trash2, AlertTriangle, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SelectedSlot } from "@/types/booking";
import { useState, useEffect } from "react";

interface SeasonConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAvailable: (slots: SelectedSlot[]) => void;
  onChangeTime: () => void;
  availableSlots: SelectedSlot[];
  unavailableSlots: SelectedSlot[];
}

export function SeasonConflictDialog({
  isOpen,
  onClose,
  onConfirmAvailable,
  onChangeTime,
  availableSlots: initialAvailableSlots,
  unavailableSlots,
}: SeasonConflictDialogProps) {
  const [availableSlots, setAvailableSlots] = useState(initialAvailableSlots);

  // Update local state when props change
  useEffect(() => {
    setAvailableSlots(initialAvailableSlots);
  }, [initialAvailableSlots]);

  const handleRemoveSlot = (slotToRemove: SelectedSlot) => {
    setAvailableSlots(prev => prev.filter(slot => 
      !(format(slot.date, 'yyyy-MM-dd') === format(slotToRemove.date, 'yyyy-MM-dd') && 
        slot.hour === slotToRemove.hour)
    ));
  };

  const handleConfirm = () => {
    onConfirmAvailable(availableSlots);
  };

  const formatDayName = (date: Date) => {
    return format(date, 'EEEE', { locale: nb });
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd.MM.yyyy');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Book tidspunkt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Unavailable slots warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Følgende datoer er ikke tilgjengelig på ønsket tidspunkt:
              </p>
            </div>
          </div>

          {/* Unavailable dates list */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <div className="space-y-2">
              {unavailableSlots.map((slot, index) => (
                <div key={index} className="text-sm text-rose-800 text-center">
                  {formatDayName(slot.date)} {formatDate(slot.date)}
                </div>
              ))}
            </div>
          </div>

          {/* Available slots section */}
          {availableSlots.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Disse dagene er ledige for booking</span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2 group hover:bg-muted transition-colors"
                  >
                    <span className="text-sm">
                      {formatDayName(slot.date)} {formatDate(slot.date)}
                    </span>
                    <button
                      onClick={() => handleRemoveSlot(slot)}
                      className="p-1 hover:bg-destructive/10 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onChangeTime}>
            Endre tidspunkt
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={availableSlots.length === 0}
          >
            Book valgte tidspunkt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
