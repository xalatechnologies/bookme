import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { facilitiesService } from './supabase/facilities.service';
import type { IFacility } from '../types/facility';

export const useFacilities = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: facilitiesService.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFacility = (id: string) => {
  return useQuery({
    queryKey: ['facilities', id],
    queryFn: () => facilitiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: facilitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, facility }: { id: string; facility: Partial<IFacility> }) =>
      facilitiesService.update(id, facility),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', id] });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: facilitiesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};