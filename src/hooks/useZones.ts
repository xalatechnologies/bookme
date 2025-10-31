"use client";

// External imports
import { useState, useEffect } from 'react';

// Internal imports
import { useQuery } from '@tanstack/react-query';
import { zonesService } from '@/services/supabase/zones.service';
import type { Zone } from '@/types/booking';

export const useZones = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: () => zonesService.getAll(),
  });
};

export const useZonesByFacility = (facilityId: string) => {
  return useQuery({
    queryKey: ['zones', facilityId],
    queryFn: () => zonesService.getByFacilityId(facilityId),
    enabled: !!facilityId,
  });
};

export const useZone = (id: string) => {
  return useQuery({
    queryKey: ['zones', id],
    queryFn: () => zonesService.getById(id),
    enabled: !!id,
  });
};
