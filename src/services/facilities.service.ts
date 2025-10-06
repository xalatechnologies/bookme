import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from './http';
import type { IFacility } from '@/stores/facilityStore';

export const facilitiesService = {
  getAll: (): Promise<readonly IFacility[]> => 
    httpClient.get<readonly IFacility[]>('/facilities'),
  
  getById: (id: string): Promise<IFacility> => 
    httpClient.get<IFacility>(`/facilities/${id}`),
  
  create: (facility: Omit<IFacility, 'id' | 'createdAt' | 'updatedAt'>): Promise<IFacility> => 
    httpClient.post<IFacility>('/facilities', facility),
  
  update: (id: string, facility: Partial<IFacility>): Promise<IFacility> => 
    httpClient.patch<IFacility>(`/facilities/${id}`, facility),
  
  delete: (id: string): Promise<void> => 
    httpClient.delete(`/facilities/${id}`),
};

export const useFacilities = (): ReturnType<typeof useQuery<readonly IFacility[], Error>> => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: facilitiesService.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFacility = (id: string): ReturnType<typeof useQuery<IFacility, Error>> => {
  return useQuery({
    queryKey: ['facilities', id],
    queryFn: () => facilitiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateFacility = (): ReturnType<typeof useMutation<IFacility, Error, Omit<IFacility, 'id' | 'createdAt' | 'updatedAt'>>> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: facilitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useUpdateFacility = (): ReturnType<typeof useMutation<IFacility, Error, { id: string; facility: Partial<IFacility> }>> => {
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
