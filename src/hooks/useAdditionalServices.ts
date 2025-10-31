import { useQuery } from '@tanstack/react-query';
import { additionalServicesService } from '@/services/supabase/additionalServices.service';
import type { IAdditionalService } from '@/services/supabase/additionalServices.service';

export const useAdditionalServices = () => {
  return useQuery({
    queryKey: ['additional-services'],
    queryFn: () => additionalServicesService.getAll(),
  });
};

export const useAdditionalServicesByFacilityType = (facilityType: string) => {
  return useQuery({
    queryKey: ['additional-services', facilityType],
    queryFn: () => additionalServicesService.getByFacilityType(facilityType),
    enabled: !!facilityType,
  });
};

export const useAdditionalService = (id: string) => {
  return useQuery({
    queryKey: ['additional-services', id],
    queryFn: () => additionalServicesService.getById(id),
    enabled: !!id,
  });
};