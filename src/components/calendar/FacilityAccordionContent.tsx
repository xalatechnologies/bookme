"use client";

// External imports
import React from "react";

// Internal imports
import type { SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';
import type { IFacility } from '@/stores/facilityStore';
import { getZonesForFacility } from '@/data/zones/dummyZones';

// Alias for backward compatibility
type Facility = IFacility;

// Sibling imports
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/shared/Calendar";

interface FacilityAccordionContentProps {
  readonly facility: Facility;
  readonly selectedSlots: readonly SelectedTimeSlot[];
  readonly onSlotClick: (zoneId: string, date: Date, timeSlot: string, availability: string) => void;
  readonly onBulkSlotSelection?: (slots: readonly SelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => AvailabilityStatus;
  readonly isSlotSelected: (zoneId: string, date: Date, timeSlot: string) => boolean;
  readonly onClearSlots: () => void;
  readonly onRemoveSlot: (zoneId: string, date: Date, timeSlot: string) => void;
}

export const FacilityAccordionContent: React.FC<FacilityAccordionContentProps> = ({
  facility,
  selectedSlots,
  onSlotClick,
  onBulkSlotSelection,
  getAvailabilityStatus,
  isSlotSelected,
  onClearSlots,
  onRemoveSlot
}): JSX.Element => {
  const zones = getZonesForFacility(facility.id);
  
  return (
    <AccordionItem 
      key={facility.id} 
      value={`facility-${facility.id}`}
      className="border rounded-lg bg-white shadow-sm"
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
            <p className="text-gray-600 mt-1">{facility.address}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Kapasitet: {facility.capacity} personer</span>
              <span>{zones.length} sone(r) tilgjengelig</span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-6 pb-6">
        <Calendar
          zones={zones}
          selectedSlots={selectedSlots}
          onSlotClick={onSlotClick}
          onBulkSlotSelection={onBulkSlotSelection}
          getAvailabilityStatus={getAvailabilityStatus}
          isSlotSelected={isSlotSelected}
          timeSlotDuration={1}
          showZoneSelector={zones.length > 1}
          compact={false}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
