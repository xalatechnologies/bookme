import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar, Clock, Trash2, ChevronDown, ChevronUp, Repeat } from "lucide-react";
import { SelectedSlot, BookingCheckoutData, PriceGroup } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SelectedSlotsSummaryProps {
  slots: SelectedSlot[];
  onRemoveSlot: (slot: SelectedSlot) => void;
  onContinue: () => void;
  showPricing?: boolean;
  checkoutData?: BookingCheckoutData;
}

const priceGroupBasePrice: Record<PriceGroup, number> = {
  'non-commercial': 0,
  'commercial': 500,
  'municipal': 200,
};

interface GroupedSlots {
  type: 'single' | 'season';
  slots: SelectedSlot[];
  seasonBookingGroupId?: string;
}

export function SelectedSlotsSummary({ slots, onRemoveSlot, onContinue, showPricing = false, checkoutData }: SelectedSlotsSummaryProps) {
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());

  // Group slots by season booking or single
  const groupedSlots: GroupedSlots[] = [];
  const seasonGroups = new Map<string, SelectedSlot[]>();
  const singleSlots: SelectedSlot[] = [];

  for (const slot of slots) {
    if (slot.seasonBookingGroupId) {
      const existing = seasonGroups.get(slot.seasonBookingGroupId) || [];
      existing.push(slot);
      seasonGroups.set(slot.seasonBookingGroupId, existing);
    } else {
      singleSlots.push(slot);
    }
  }

  // Add season groups first
  for (const [groupId, groupSlots] of seasonGroups) {
    groupedSlots.push({
      type: 'season',
      slots: groupSlots.sort((a, b) => a.date.getTime() - b.date.getTime()),
      seasonBookingGroupId: groupId,
    });
  }

  // Group single slots by date
  const singleByDate = singleSlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = { date: slot.date, slots: [] };
    }
    acc[dateKey].slots.push(slot);
    return acc;
  }, {} as Record<string, { date: Date; slots: SelectedSlot[] }>);

  const totalHours = slots.length;
  
  // Calculate pricing
  const basePrice = checkoutData?.priceGroup ? priceGroupBasePrice[checkoutData.priceGroup] * totalHours : 0;
  const additionalServicesTotal = checkoutData?.additionalServices
    ?.filter(s => s.selected)
    .reduce((sum, s) => sum + s.price, 0) || 0;
  const subtotal = basePrice + additionalServicesTotal;
  const mva = Math.round(subtotal * 0.25);
  const total = subtotal + mva;

  const toggleSeasonExpand = (groupId: string) => {
    setExpandedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const getSeasonSummary = (groupSlots: SelectedSlot[]) => {
    if (groupSlots.length === 0) return '';
    const firstDate = groupSlots[0].date;
    const lastDate = groupSlots[groupSlots.length - 1].date;
    return `${format(firstDate, 'd. MMM', { locale: nb })} - ${format(lastDate, 'd. MMM yyyy', { locale: nb })}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Valgte tidspunkter
        </h3>
      </div>

      {slots.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-muted-foreground text-sm">
            Klikk på ledige tidspunkter for å velge dem.
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Du kan velge flere tidspunkter samtidig.
          </div>
        </div>
      ) : (
        <>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {/* Season bookings */}
            {groupedSlots.filter(g => g.type === 'season').map(({ slots: seasonSlots, seasonBookingGroupId }) => {
              const isExpanded = expandedSeasons.has(seasonBookingGroupId!);
              const purpose = seasonSlots[0]?.bookingDetails?.purpose;
              
              return (
                <div key={seasonBookingGroupId} className="animate-fade-in">
                  <div 
                    className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2 cursor-pointer hover:bg-primary/15 transition-colors"
                    onClick={() => toggleSeasonExpand(seasonBookingGroupId!)}
                  >
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-primary" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Sesongleie
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {getSeasonSummary(seasonSlots)} ({seasonSlots.length} bookinger)
                        </div>
                        {purpose && (
                          <div className="text-xs text-muted-foreground">
                            Formål: <span className="text-foreground">{purpose}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSlot(seasonSlots[0]);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-2 ml-6 space-y-1.5">
                      {seasonSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="bg-muted/50 rounded-lg px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{format(slot.date, 'EEEE d. MMMM', { locale: nb })}</span>
                            <span className="text-muted-foreground">kl. {slot.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Single bookings grouped by date */}
            {Object.values(singleByDate).map(({ date, slots: dateSlots }) => (
              <div key={format(date, 'yyyy-MM-dd')} className="animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {format(date, 'd. MMMM yyyy', { locale: nb })}
                </div>
                <div className="space-y-1.5 ml-5">
                  {dateSlots.map((slot) => (
                    <div
                      key={`${slot.date.toISOString()}-${slot.hour}`}
                      className="bg-muted/50 rounded-lg px-3 py-2 group hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>
                            {slot.time} - {(slot.hour + 1).toString().padStart(2, '0')}:00
                          </span>
                          <span className="text-xs text-muted-foreground">
                            (1 time)
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveSlot(slot)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                      {slot.bookingDetails?.purpose && (
                        <div className="mt-1 text-xs text-muted-foreground pl-5">
                          Formål: <span className="text-foreground font-medium">{slot.bookingDetails.purpose}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-muted/30">
            {showPricing && checkoutData?.priceGroup ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Prisberegning</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">{totalHours} forekomst{totalHours !== 1 ? 'er' : ''}</span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grunnpris:</span>
                    <span className="text-foreground">{basePrice} kr</span>
                  </div>
                  {additionalServicesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tilleggstjenester:</span>
                      <span className="text-foreground">{additionalServicesTotal} kr</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MVA (25%):</span>
                    <span className="text-foreground">{mva} kr</span>
                  </div>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-border font-semibold">
                  <span>Totalt inkl. MVA:</span>
                  <span className="text-primary">{total} kr</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  * Prisen er et resultat av følgende prisfaktorer: timespris basert på prisgruppe og valgte tilleggstjenester.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Totalt:</span>
                  <span className="font-semibold text-foreground">{totalHours} time{totalHours !== 1 ? 'r' : ''}</span>
                </div>
                <Button onClick={onContinue} className="w-full">
                  Fortsett til neste steg
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
