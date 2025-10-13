"use client";

import React from 'react';
import type { Zone as BookingZone } from '@/components/booking/types';
import { FacilityCalendar } from '@/components/calendar/FacilityCalendar';

interface FacilityDetailCalendarProps {
  readonly zones: readonly BookingZone[];
  readonly facilityId: string;
  readonly facilityName: string;
  readonly timeSlotDuration?: number;
  readonly currentPattern?: any;
  readonly onPatternChange?: (pattern: any) => void;
  readonly onPatternApply?: (pattern: any) => void;
  readonly openingHoursStart?: string;
  readonly openingHoursEnd?: string;
}

export const FacilityDetailCalendar: React.FC<FacilityDetailCalendarProps> = ({
  zones,
  facilityId,
  facilityName,
  timeSlotDuration = 1,
  currentPattern,
  onPatternChange,
  onPatternApply,
  openingHoursStart = "08:00",
  openingHoursEnd = "22:00"
}): JSX.Element => {
  return (
    <FacilityCalendar
      facilityId={facilityId}
      facilityName={facilityName}
      zones={zones}
      isLoading={false}
      error={undefined}
      openingHoursStart={openingHoursStart}
      openingHoursEnd={openingHoursEnd}
    />
  );
};
