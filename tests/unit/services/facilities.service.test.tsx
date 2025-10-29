import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { facilitiesService, useFacilities, useFacility, useCreateFacility } from '@/services/supabase/facilities.service';
import { supabase } from '@/lib/supabase';

// Type for mock Supabase response
interface MockSupabaseResponse<T> {
  readonly data: T[] | T | null;
  readonly error: { readonly message: string } | null;
}

// Type for mock facility
interface MockFacility {
  readonly id: string;
  readonly name: string;
  readonly org_id: string;
  readonly type: string;
}

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
  return ({ children }: { readonly children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Facilities Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('facilitiesService.getAll', () => {
    it('should fetch all facilities for an organization', async () => {
      const mockFacilities: MockFacility[] = [
        { id: '1', name: 'Facility 1', org_id: 'org-1', type: 'sports' },
        { id: '2', name: 'Facility 2', org_id: 'org-1', type: 'conference' },
      ];

      const mockResponse: MockSupabaseResponse<MockFacility> = {
        data: mockFacilities,
        error: null,
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await facilitiesService.getAll('org-1');

      expect(result).toEqual(mockFacilities);
      expect(supabase.from).toHaveBeenCalledWith('facilities');
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database error' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError } as MockSupabaseResponse<MockFacility>),
      });

      await expect(facilitiesService.getAll('org-1')).rejects.toThrow('Database error');
    });
  });

  describe('facilitiesService.getById', () => {
    it('should fetch a facility by ID', async () => {
      const mockFacility: MockFacility = {
        id: '1',
        name: 'Test Facility',
        org_id: 'org-1',
        type: 'sports',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFacility, error: null } as MockSupabaseResponse<MockFacility>),
      });

      const result = await facilitiesService.getById('1');

      expect(result).toEqual(mockFacility);
    });

    it('should handle not found error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        } as MockSupabaseResponse<MockFacility>),
      });

      await expect(facilitiesService.getById('non-existent')).rejects.toThrow('Not found');
    });
  });

  describe('facilitiesService.getByType', () => {
    it('should filter facilities by type', async () => {
      interface TypedFacility {
        readonly id: string;
        readonly name: string;
        readonly type: string;
      }

      const mockFacilities: TypedFacility[] = [
        { id: '1', name: 'Sports Center', type: 'sports' },
        { id: '2', name: 'Another Sports Center', type: 'sports' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockFacilities, error: null } as MockSupabaseResponse<TypedFacility>),
      });

      const result = await facilitiesService.getByType('org-1', 'sports');

      expect(result).toEqual(mockFacilities);
      expect(result).toHaveLength(2);
    });
  });

  describe('facilitiesService.create', () => {
    it('should create a new facility', async () => {
      interface NewFacilityInput {
        readonly org_id: string;
        readonly name: string;
        readonly type: 'sports';
        readonly status: 'published';
        readonly capacity: number;
        readonly price_per_hour: number;
      }

      const newFacility: NewFacilityInput = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      };

      interface CreatedFacilityType extends NewFacilityInput {
        readonly id: string;
      }

      const createdFacility: CreatedFacilityType = { id: '3', ...newFacility };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdFacility, error: null }),
      });

      const result = await facilitiesService.create(newFacility);

      expect(result).toEqual(createdFacility);
      expect(supabase.from).toHaveBeenCalledWith('facilities');
    });

    it('should handle validation errors', async () => {
      interface InvalidFacilityInput {
        readonly org_id: string;
        readonly name: string;
        readonly type: 'sports';
      }

      const invalidFacility: InvalidFacilityInput = {
        org_id: 'org-1',
        name: '',
        type: 'sports',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Validation error' },
        }),
      });

      await expect(facilitiesService.create(invalidFacility as never)).rejects.toThrow();
    });
  });

  describe('facilitiesService.update', () => {
    it('should update a facility', async () => {
      interface UpdateData {
        readonly name: string;
      }

      interface UpdatedFacility {
        readonly id: string;
        readonly name: string;
      }

      const updates: UpdateData = { name: 'Updated Facility Name' };
      const updatedFacility: UpdatedFacility = { id: '1', name: 'Updated Facility Name' };

      (supabase.from as jest.Mock).mockReturnValue({
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
      (supabase.from as jest.Mock).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      await expect(facilitiesService.delete('1')).resolves.not.toThrow();
    });

    it('should handle delete errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
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
      interface SimpleFacility {
        readonly id: string;
        readonly name: string;
      }

      const mockFacilities: SimpleFacility[] = [
        { id: '1', name: 'Facility 1' },
        { id: '2', name: 'Facility 2' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: mockFacilities, error: null } as MockSupabaseResponse<SimpleFacility>),
      });

      const { result } = renderHook(() => useFacilities('org-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFacilities);
    });

    it('should handle fetch error', async () => {
      interface SimpleFacility {
        readonly id: string;
        readonly name: string;
      }

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Fetch error' },
        } as MockSupabaseResponse<SimpleFacility>),
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
      interface SimpleFacility {
        readonly id: string;
        readonly name: string;
      }

      const mockFacility: SimpleFacility = { id: '1', name: 'Test Facility' };

      (supabase.from as jest.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockFacility, error: null } as MockSupabaseResponse<SimpleFacility>),
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
      interface NewFacilityInput {
        readonly org_id: string;
        readonly name: string;
        readonly type: 'sports';
        readonly status: 'published';
        readonly capacity: number;
        readonly price_per_hour: number;
      }

      const newFacility: NewFacilityInput = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports',
        status: 'published',
        capacity: 50,
        price_per_hour: 500,
      };

      interface CreatedFacility extends NewFacilityInput {
        readonly id: string;
      }

      const createdFacility: CreatedFacility = { id: '3', ...newFacility };

      (supabase.from as jest.Mock).mockReturnValue({
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
      interface NewFacilityInput {
        readonly org_id: string;
        readonly name: string;
        readonly type: 'sports';
      }

      (supabase.from as jest.Mock).mockReturnValue({
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

      const newFacility: NewFacilityInput = {
        org_id: 'org-1',
        name: 'New Facility',
        type: 'sports',
      };

      result.current.mutate(newFacility as never);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });
});
