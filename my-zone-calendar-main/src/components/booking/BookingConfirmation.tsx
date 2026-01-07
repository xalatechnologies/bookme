import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectedSlot, BookingCheckoutData } from "@/types/booking";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

interface BookingConfirmationProps {
  slots: SelectedSlot[];
  checkoutData: BookingCheckoutData;
  onBackToHome: () => void;
  onViewBookings: () => void;
}

const priceGroupLabels: Record<string, string> = {
  'non-commercial': 'Ikke-kommersielle aktører',
  'commercial': 'Kommersielle aktører',
  'municipal': 'Kommunale virksomheter',
};

export function BookingConfirmation({ 
  slots, 
  checkoutData, 
  onBackToHome, 
  onViewBookings 
}: BookingConfirmationProps) {
  const selectedServices = checkoutData.additionalServices.filter(s => s.selected);
  const servicesTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reservasjon sendt!
            </h2>
            <p className="text-muted-foreground">
              Din forespørsel er sendt til godkjenning. Du vil motta en bekreftelse på e-post når saksbehandler har behandlet den.
            </p>
          </div>

          {/* Booking Summary */}
          <div className="bg-muted/50 rounded-xl p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-foreground mb-4">Oppsummering</h3>
            
            {/* Time Slots */}
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-start gap-3 bg-background rounded-lg p-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {format(slot.date, 'EEEE d. MMMM', { locale: nb })}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {slot.bookingDetails?.startTime} - {slot.bookingDetails?.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {slot.zoneName}
                      </span>
                    </div>
                    {slot.bookingDetails?.purpose && (
                      <div className="text-sm text-primary mt-1">
                        {slot.bookingDetails.purpose}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Group */}
            {checkoutData.priceGroup && (
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prisgruppe:</span>
                  <span className="font-medium text-foreground">
                    {priceGroupLabels[checkoutData.priceGroup]}
                  </span>
                </div>
              </div>
            )}

            {/* Additional Services */}
            {selectedServices.length > 0 && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="text-sm text-muted-foreground">Tilleggstjenester:</div>
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-sm">
                    <span className="text-foreground">{service.name}</span>
                    <span className="font-medium text-foreground">{service.price} kr</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-semibold pt-2">
                  <span className="text-foreground">Tillegg totalt:</span>
                  <span className="text-primary">{servicesTotal} kr</span>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-foreground">
              <strong>Hva skjer nå?</strong> En saksbehandler vil se over din forespørsel. 
              Når den er godkjent, vil du få beskjed om å betale via "Min side". 
              Behandlingstid er vanligvis 1-2 virkedager.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={onBackToHome}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Tilbake til forsiden
            </Button>
            <Button 
              onClick={onViewBookings}
              className="flex-1"
            >
              Se mine bookinger
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}