/**
 * Facility Editor Hook
 *
 * Manages facility creation and editing with business logic separation.
 * Handles form state, validation, and save operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useFacility,
  useCreateFacility,
  useUpdateFacility,
} from '@/services/supabase/facilities.service';
import { useOrganizationId } from '@/hooks/useOrganizationId';
import { validateFacilityData } from '@/services/business/facility.business.service';
import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'];

export interface IUseFacilityEditorOptions {
  readonly facilityId?: string;
  readonly isNewFacility?: boolean;
  readonly onSaveSuccess?: (facility: Facility) => void;
  readonly onSaveError?: (error: Error) => void;
}

export interface IUseFacilityEditorReturn {
  // Data
  readonly facility: Facility | null;
  readonly editedFacility: Partial<Facility> | null;
  readonly isLoading: boolean;
  readonly isSaving: boolean;
  readonly error: Error | null;

  // Validation
  readonly validationErrors: string[];
  readonly isValid: boolean;

  // State
  readonly hasUnsavedChanges: boolean;
  readonly showSaveMessage: boolean;

  // Actions
  readonly updateField: (field: keyof Facility, value: any) => void;
  readonly updateFields: (fields: Partial<Facility>) => void;
  readonly save: () => Promise<void>;
  readonly cancel: () => void;
  readonly reset: () => void;
}

/**
 * Hook for editing facilities with clean architecture
 */
export const useFacilityEditor = (
  options: IUseFacilityEditorOptions
): IUseFacilityEditorReturn => {
  const { facilityId, isNewFacility = false, onSaveSuccess, onSaveError } = options;

  const navigate = useNavigate();
  const orgId = useOrganizationId();

  // Data layer
  const { facility, loading: isLoading, error } = useFacility(facilityId || '');
  const createFacilityMutation = useCreateFacility();
  const updateFacilityMutation = useUpdateFacility();

  // Local state
  const [editedFacility, setEditedFacility] = useState<Partial<Facility> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  // Initialize edited facility
  useEffect(() => {
    if (isNewFacility) {
      // Create new facility template
      setEditedFacility({
        name: '',
        description: '',
        facility_type: 'conference',
        address: '',
        city: 'Drammen',
        postal_code: '',
        country: 'NO',
        capacity: 0,
        amenities: [],
        images: [],
        location: { lat: 59.744, lng: 10.204 } as any,
        rating: 0,
        review_count: 0,
        area_description: '',
        status: 'draft',
        org_id: orgId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (facility) {
      setEditedFacility({ ...facility });
    }
  }, [facility, isNewFacility, orgId]);

  // Validation
  const validation = validateFacilityData(editedFacility || {});

  // Actions
  const updateField = useCallback((field: keyof Facility, value: any): void => {
    setEditedFacility((prev) => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateFields = useCallback((fields: Partial<Facility>): void => {
    setEditedFacility((prev) => {
      if (!prev) return prev;
      return { ...prev, ...fields };
    });
    setHasUnsavedChanges(true);
  }, []);

  const save = useCallback(async (): Promise<void> => {
    if (!editedFacility) {
      throw new Error('No facility data to save');
    }

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    try {
      if (isNewFacility) {
        // Create new facility
        const newFacility = await createFacilityMutation.mutateAsync(editedFacility as any);
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess) {
          onSaveSuccess(newFacility);
        } else {
          navigate(`/admin/facilities/${newFacility.id}`);
        }
      } else if (facilityId) {
        // Update existing facility
        await updateFacilityMutation.mutateAsync({
          id: facilityId,
          data: editedFacility as any,
        });
        setHasUnsavedChanges(false);
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);

        if (onSaveSuccess && facility) {
          onSaveSuccess(facility);
        }
      }
    } catch (error) {
      console.error('Failed to save facility:', error);
      if (onSaveError && error instanceof Error) {
        onSaveError(error);
      }
      throw error;
    }
  }, [
    editedFacility,
    validation,
    isNewFacility,
    facilityId,
    facility,
    createFacilityMutation,
    updateFacilityMutation,
    navigate,
    onSaveSuccess,
    onSaveError,
  ]);

  const cancel = useCallback((): void => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }

    if (isNewFacility) {
      navigate('/admin/facilities');
    } else if (facility) {
      setEditedFacility({ ...facility });
      setHasUnsavedChanges(false);
    }
  }, [hasUnsavedChanges, isNewFacility, facility, navigate]);

  const reset = useCallback((): void => {
    if (facility) {
      setEditedFacility({ ...facility });
      setHasUnsavedChanges(false);
    }
  }, [facility]);

  return {
    // Data
    facility,
    editedFacility,
    isLoading,
    isSaving: createFacilityMutation.isPending || updateFacilityMutation.isPending,
    error,

    // Validation
    validationErrors: validation.errors,
    isValid: validation.isValid,

    // State
    hasUnsavedChanges,
    showSaveMessage,

    // Actions
    updateField,
    updateFields,
    save,
    cancel,
    reset,
  };
};
