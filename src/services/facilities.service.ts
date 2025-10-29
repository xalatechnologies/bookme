import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from './http';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export const facilitiesService = {
  getAll: (): Promise<readonly Facility[]> =>
    httpClient.get<readonly Facility[]>('/facilities'),

  getById: (id: string): Promise<Facility> =>
    httpClient.get<Facility>(`/facilities/${id}`),

  create: (facility: Omit<Facility, 'id' | 'created_at' | 'updated_at'>): Promise<Facility> =>
    httpClient.post<Facility>('/facilities', facility),

  update: (id: string, facility: Partial<Facility>): Promise<Facility> =>
    httpClient.patch<Facility>(`/facilities/${id}`, facility),

  delete: (id: string): Promise<void> =>
    httpClient.delete(`/facilities/${id}`),
};

export const useFacilities = (): ReturnType<typeof useQuery<readonly Facility[], Error>> => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: facilitiesService.getAll,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFacility = (id: string): ReturnType<typeof useQuery<Facility, Error>> => {
  return useQuery({
    queryKey: ['facilities', id],
    queryFn: () => facilitiesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateFacility = (): ReturnType<typeof useMutation<Facility, Error, Omit<Facility, 'id' | 'created_at' | 'updated_at'>>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: facilitiesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
    },
  });
};

export const useUpdateFacility = (): ReturnType<typeof useMutation<Facility, Error, { id: string; facility: Partial<Facility> }>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, facility }: { id: string; facility: Partial<Facility> }) =>
      facilitiesService.update(id, facility),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      queryClient.invalidateQueries({ queryKey: ['facilities', id] });
    },
  });
};
