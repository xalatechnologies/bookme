import { AlertCircle, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectedSlot, BookingCheckoutData } from "@/types/booking";

interface BookingReviewProps {
  slots: SelectedSlot[];
  checkoutData: BookingCheckoutData;
  onBack: () => void;
  onSubmitForApproval: () => void;
}

const priceGroupLabels: Record<string, string> = {
  'non-commercial': 'Ikke-kommersielle aktører',
  'commercial': 'Kommersielle aktører',
  'municipal': 'Kommunale virksomheter',
};

export function BookingReview({ 
  slots, 
  checkoutData, 
  onBack, 
  onSubmitForApproval 
}: BookingReviewProps) {
  // Calculate total price
  const basePrice = slots.length * 214; // Mock base price per slot
  const servicesTotal = checkoutData.additionalServices
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.price, 0);
  const totalPrice = basePrice + servicesTotal;

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-xl">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-slate-600 to-slate-500 bg-clip-text text-transparent">
              Forespørsel...
            </h2>
          </div>

          {/* Warning Box */}
          <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6 mb-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-sm text-foreground mb-3">
                Dette lokalet krever godkjenning før leie. Når forespørselen er behandlet, kan du betale via Min side
              </p>
              {checkoutData.priceGroup && (
                <p className="text-sm text-muted-foreground">
                  Du har valgt pris-/kundegruppe: <strong>{priceGroupLabels[checkoutData.priceGroup]}</strong>. 
                  Utleier må godkjenne at du kvalifiserer for denne kundegruppen. 
                  Får du avslag, vil bookingen din bli slettet og tidspunktet gjort tilgjengelig for andre.
                </p>
              )}
            </div>
          </div>

          {/* Total Price */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-2">Estimert pris</p>
            <p className="text-4xl font-bold text-foreground">{totalPrice},-</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onSubmitForApproval}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-full py-6 text-base font-medium"
            >
              <Send className="w-4 h-4 mr-2" />
              Send til godkjenning
            </Button>
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Tilbake
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
