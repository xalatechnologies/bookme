"use client";

// External imports
import { useState, useEffect } from 'react';

// Internal imports
import { useFacilityStore, type IFacility } from '@/stores/facilityStore';

interface FacilityState {
  readonly facility: IFacility | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly notFound: boolean;
}

export const useFacility = (id: string | number): FacilityState => {
  const [state, setState] = useState<FacilityState>({
    facility: null,
    loading: true,
    error: null,
    notFound: false
  });

  const { getFacilityById } = useFacilityStore();

  useEffect(() => {
    const fetchFacility = async (): Promise<void> => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 100));

        const facilityId = typeof id === 'number' ? id.toString() : id;
        const facility = getFacilityById(facilityId);

        if (!facility) {
          setState({
            facility: null,
            loading: false,
            error: null,
            notFound: true
          });
          return;
        }

        setState({
          facility,
          loading: false,
          error: null,
          notFound: false
        });
      } catch (error) {
        setState({
          facility: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          notFound: false
        });
      }
    };

    if (id) {
      fetchFacility();
    }
  }, [id, getFacilityById]);

  return state;
};
