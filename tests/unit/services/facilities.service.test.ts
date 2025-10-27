import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { facilitiesService, useFacilities, useFacility, useCreateFacility } from '@/services/supabase/facilities.service';
import { supabase } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Create wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Facilities Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('facilitiesService.getAll', () => {
    it('should fetch all facilities for an organization', async () => {
      const mockFacilities = [
        { id: '1', name: 'Facility 1', org_id: 'org-1', type: 'sports' },
        { id: '2', name: 'Facility 2', org_id: 'org-1', type: 'conference' },
      ];

      const mockResponse = {
        data: mockFacilities,
        error: null,
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await facilitiesService.getAll('org-1');

      expect(result).toEqual(mockFacilities);
      expect(supabase.from).toHaveBeenCalledWith('facilities');
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await expect(facilitiesService.getAll('org-1')).rejects.toThrow('Database error');
    });
  });

  describe('facilitiesService.getById', () => {
    it('should fetch a facility by ID', async () => {
      const mockFacility = {
        id: '1',
        name: 'Test Facility',
        org_id: 'org-1',
        type: 'sports',
      };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFacility, error: null }),
      });

      const result = await facilitiesService.getById('1');

      expect(result).toEqual(mockFacility);
    });

    it('should handle not found error', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      await expect(facilitiesService.getById('non-existent')).rejects.toThrow('Not found');
    });
  });

  describe('facilitiesService.getByType', () => {
    it('should filter facilities by type', async () => {
      const mockFacilities = [
        { id: '1', name: 'Sports Center', type: 'sports' },
        { id: '2', name: 'Another Sports Center', type: 'sports' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFacilities, error: null }),
      });

      const result = await facilitiesService.getByType('org-1', 'sports');

      expect(result).toEqual(mockFacilities);
      expect(result).toHaveLength(2);
    });
  });

  describe('facilitiesService.create', () => {
    it('should create a new facility', async () => {
      const newFacility = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports' as const,
        status: 'published' as const,
        capacity: 50,
        price_per_hour: 500,
      };

      const createdFacility = { id: '3', ...newFacility };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdFacility, error: null }),
      });

      const result = await facilitiesService.create(newFacility);

      expect(result).toEqual(createdFacility);
      expect(supabase.from).toHaveBeenCalledWith('facilities');
    });

    it('should handle validation errors', async () => {
      const invalidFacility = {
        org_id: 'org-1',
        name: '',
        type: 'sports' as const,
      };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Validation error' },
        }),
      });

      await expect(facilitiesService.create(invalidFacility as any)).rejects.toThrow();
    });
  });

  describe('facilitiesService.update', () => {
    it('should update a facility', async () => {
      const updates = { name: 'Updated Facility Name' };
      const updatedFacility = { id: '1', name: 'Updated Facility Name' };

      (supabase.from as any).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedFacility, error: null }),
      });

      const result = await facilitiesService.update('1', updates);

      expect(result).toEqual(updatedFacility);
    });
  });

  describe('facilitiesService.delete', () => {
    it('should delete a facility', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(facilitiesService.delete('1')).resolves.not.toThrow();
    });

    it('should handle delete errors', async () => {
      (supabase.from as any).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Cannot delete' } }),
      });

      await expect(facilitiesService.delete('1')).rejects.toThrow('Cannot delete');
    });
  });
});

describe('Facilities Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useFacilities', () => {
    it('should fetch facilities list', async () => {
      const mockFacilities = [
        { id: '1', name: 'Facility 1' },
        { id: '2', name: 'Facility 2' },
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockFacilities, error: null }),
      });

      const { result } = renderHook(() => useFacilities('org-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFacilities);
    });

    it('should handle fetch error', async () => {
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        }),
      });

      const { result } = renderHook(() => useFacilities('org-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch when disabled', async () => {
      const { result } = renderHook(() => useFacilities('org-1', false), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useFacility', () => {
    it('should fetch single facility', async () => {
      const mockFacility = { id: '1', name: 'Test Facility' };

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFacility, error: null }),
      });

      const { result } = renderHook(() => useFacility('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFacility);
    });
  });

  describe('useCreateFacility', () => {
    it('should create a facility', async () => {
      const newFacility = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports' as const,
        status: 'published' as const,
        capacity: 50,
        price_per_hour: 500,
      };

      const createdFacility = { id: '3', ...newFacility };

      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdFacility, error: null }),
      });

      const { result } = renderHook(() => useCreateFacility(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(newFacility);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(createdFacility);
    });

    it('should handle creation error', async () => {
      (supabase.from as any).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Creation failed' },
        }),
      });

      const { result } = renderHook(() => useCreateFacility(), {
        wrapper: createWrapper(),
      });

      const newFacility = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports' as const,
      };

      result.current.mutate(newFacility as any);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });
});
