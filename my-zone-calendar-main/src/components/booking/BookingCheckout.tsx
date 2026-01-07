import { useState } from "react";
import { ChevronDown, Download, ShoppingCart, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PriceGroup, AdditionalService, BookingCheckoutData } from "@/types/booking";
import { cn } from "@/lib/utils";

interface BookingCheckoutProps {
  checkoutData: BookingCheckoutData;
  onCheckoutChange: (data: BookingCheckoutData) => void;
  onBack: () => void;
  onAddToCart: () => void;
  onComplete: () => void;
}

const priceGroupOptions: { value: PriceGroup; label: string; description: string; basePrice: number }[] = [
  { 
    value: 'non-commercial', 
    label: 'Ikke-kommersielle aktører', 
    description: 'Disse aktørene låner lokaler gratis. Kategorien omfatter frivillige organisasjoner, frivillige enkeltpersoner og grupper. Andre aktører som har sosiale og ideelle mål, i motsetning til økonomisk gevinst, kan også falle inn under denne kategorien. Det er avdelingen som styrer bookingen som vurderer dette. Aktørene må ha base i Asker kommune.',
    basePrice: 0,
  },
  { 
    value: 'commercial', 
    label: 'Kommersielle aktører og private arrangement', 
    description: 'For virksomheter med kommersielle formål, private selskaper, bursdag og andre private arrangementer. Standard timepris gjelder.',
    basePrice: 500,
  },
  { 
    value: 'municipal', 
    label: 'Kommunale virksomheter', 
    description: 'For kommunens egne virksomheter, skoler og barnehager. Redusert pris gjelder.',
    basePrice: 200,
  },
];

const termsDocuments = [
  { id: 'fire-safety', name: 'Brannvernvideo' },
  { id: 'responsibility', name: 'Ditt ansvar' },
  { id: 'guidelines', name: 'Overordnede retningslinjer for lån og leie av lokaler' },
];

export function BookingCheckout({ 
  checkoutData, 
  onCheckoutChange, 
  onBack, 
  onAddToCart, 
  onComplete 
}: BookingCheckoutProps) {
  const [priceGroupOpen, setPriceGroupOpen] = useState(true);

  const handlePriceGroupChange = (value: string) => {
    onCheckoutChange({
      ...checkoutData,
      priceGroup: value as PriceGroup,
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = checkoutData.additionalServices.map(service =>
      service.id === serviceId ? { ...service, selected: !service.selected } : service
    );
    onCheckoutChange({
      ...checkoutData,
      additionalServices: updatedServices,
    });
  };

  const handleTermsChange = (checked: boolean) => {
    onCheckoutChange({
      ...checkoutData,
      termsAccepted: checked,
    });
  };

  const selectedServicesTotal = checkoutData.additionalServices
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      {/* Price Group Section */}
      <Collapsible open={priceGroupOpen} onOpenChange={setPriceGroupOpen}>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <h3 className="font-semibold text-foreground">Prisgruppe</h3>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", priceGroupOpen && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-4">
                Utleier tilbyr egne priser til enkelte kundegrupper. Valg av prisgruppe medfører en godkjenningsprosess.
              </p>
              <Select value={checkoutData.priceGroup || undefined} onValueChange={handlePriceGroupChange}>
                <SelectTrigger className="w-full border-2 border-primary/20 focus:border-primary">
                  <SelectValue placeholder="Velg prisgruppe" />
                </SelectTrigger>
                <SelectContent>
                  {priceGroupOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Price group description */}
              {checkoutData.priceGroup && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    {priceGroupOptions.find(o => o.value === checkoutData.priceGroup)?.description}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Additional Services Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground uppercase text-sm tracking-wide">Anbefalte tillegg</h3>
        </div>
        <div className="p-4 space-y-3">
          {checkoutData.additionalServices.map((service) => (
            <label
              key={service.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                service.selected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/30"
              )}
            >
              <Checkbox
                checked={service.selected}
                onCheckedChange={() => handleServiceToggle(service.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{service.name}</div>
                <div className="text-sm text-muted-foreground">{service.description}</div>
              </div>
              <div className="text-primary font-semibold whitespace-nowrap">
                +{service.price} kr
              </div>
            </label>
          ))}
        </div>
        {selectedServicesTotal > 0 && (
          <div className="px-4 pb-4">
            <div className="flex justify-between text-sm font-medium text-muted-foreground pt-3 border-t border-border">
              <span>Tilleggstjenester totalt:</span>
              <span className="text-primary">{selectedServicesTotal} kr</span>
            </div>
          </div>
        )}
      </div>

      {/* Terms Section */}
      <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl overflow-hidden">
        <div className="p-4">
          <p className="text-sm text-foreground mb-4">
            Utleier <span className="font-semibold">ASKER KOMMUNE - Skolelokaler orgnr. 920125298</span> krever at du har lest og godkjent betingelser før forespørsel kan sendes.
          </p>
          
          <div className="space-y-2 mb-4">
            {termsDocuments.map((doc) => (
              <a
                key={doc.id}
                href="#"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                <Download className="w-4 h-4" />
                Last ned {doc.name}
              </a>
            ))}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={checkoutData.termsAccepted}
              onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
            />
            <span className="text-sm font-medium text-foreground">
              Jeg har lest og godkjenner betingelsene
            </span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Tilbake
        </Button>
        <Button 
          variant="secondary" 
          onClick={onAddToCart} 
          className="flex-1"
          disabled={!checkoutData.priceGroup || !checkoutData.termsAccepted}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Legg i handlekurv
        </Button>
        <Button 
          onClick={onComplete} 
          className="flex-1"
          disabled={!checkoutData.priceGroup || !checkoutData.termsAccepted}
        >
          Fortsett til innlogging
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}