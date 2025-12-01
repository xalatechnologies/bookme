"use client";

import React from "react";
import type { SelectedTimeSlot, AvailabilityStatus } from '@/types/booking';
import type { Database } from '@/types/database';
import { useFacilityZoneData } from '@/hooks/features/facilities/useFacilityZoneData';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FacilityCalendar } from "./index";

type Facility = Database['public']['Tables']['facilities']['Row'];

interface FacilityAccordionContentProps {
  readonly facility: Facility;
  readonly selectedSlots: readonly SelectedTimeSlot[];
  readonly onSlotClick: (zoneId: string, date: Date, timeSlot: string, availability: string) => void;
  readonly onBulkSlotSelection?: (slots: readonly SelectedTimeSlot[]) => void;
  readonly getAvailabilityStatus: (zoneId: string, date: Date, timeSlot: string) => AvailabilityStatus;
  readonly isSlotSelected: (zoneId: string, date: Date, timeSlot: string) => boolean;
  readonly onClearSlots?: () => void;
  readonly onRemoveSlot?: (zoneId: string, date: Date, timeSlot: string) => void;
}

export const FacilityAccordionContent: React.FC<FacilityAccordionContentProps> = ({
  facility,
  selectedSlots,
  onSlotClick,
  onBulkSlotSelection,
  getAvailabilityStatus,
  isSlotSelected
}): JSX.Element => {
  const { zones } = useFacilityZoneData({ facilityId: facility.id });
  
  return (
    <AccordionItem 
      key={facility.id} 
      value={`facility-${facility.id}`}
      className="border-0 bg-white"
    >
      <AccordionTrigger className="px-6 py-4 hover:no-underline border-b border-gray-200">
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
      
      <AccordionContent className="p-0">
        <FacilityCalendar
          facilityId={facility.id}
          facilityName={facility.name}
          zones={zones}
          selectedSlots={selectedSlots}
          onSlotClick={onSlotClick}
          onBulkSlotSelection={onBulkSlotSelection}
          getAvailabilityStatus={getAvailabilityStatus}
          isSlotSelected={isSlotSelected}
          isLoading={false}
          error={null}
          openingHoursStart="08:00"
          openingHoursEnd="22:00"
          useStepByStepBooking={true}
        />
      </AccordionContent>
    </AccordionItem>
  );
};
