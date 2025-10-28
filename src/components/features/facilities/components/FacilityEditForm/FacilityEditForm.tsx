"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { IFacility } from "@/stores/facilityStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/common/forms/FormField";
import { FormActions } from "@/components/common/forms/FormActions";
import { useFormValidation } from "@/hooks/shared";
import { useFacilityStore } from "@/stores/facilityStore";
import { X, GripVertical, Image as ImageIcon, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

/**
 * Facility edit form props
 */
export interface IFacilityEditFormProps {
  readonly facility: IFacility;
  readonly onClose: () => void;
  readonly onUpdate: () => void;
}

// Mapbox public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

/**
 * Facility Edit Form Component
 *
 * Admin form for editing facility details
 *
 * Refactored with:
 * - i18n support using react-i18next
 * - SOLID principles (SRP - form state management)
 * - Reusable FormField and FormActions components
 * - Validation hook
 * - Pixel-perfect UI/UX maintained
 *
 * Features:
 * - Form validation with i18n
 * - Image upload and reordering
 * - Auto-fetch coordinates from address
 * - Mapbox integration
 * - Drag-and-drop image reordering
 * - Loading states
 * - Error handling
 *
 * @param props - Facility edit form props
 */
export const FacilityEditForm: React.FC<IFacilityEditFormProps> = ({
  facility,
  onClose,
  onUpdate
}): JSX.Element => {
  const { t } = useTranslation(['facilities', 'admin', 'validation', 'common']);

  const [formData, setFormData] = useState<Partial<IFacility>>({ ...facility });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [coordinateStatus, setCoordinateStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateFacility } = useFacilityStore();

  // Validation rules
  const { errors, validateAll, clearError } = useFormValidation({
    name: [{ type: 'required' }, { type: 'minLength', value: 3 }],
    address: [{ type: 'required' }],
  });

  useEffect(() => {
    setFormData({ ...facility });
  }, [facility]);

  /**
   * Handle form field change
   */
  const handleChange = useCallback((name: string, value: string): void => {
    setFormData(prev => ({ ...prev, [name]: value }));
    clearError(name);
  }, [clearError]);

  /**
   * Handle address change with auto-fetch coordinates
   */
  const handleAddressChange = useCallback(async (value: string): Promise<void> => {
    handleChange('address', value);

    // Reset status when address changes
    setCoordinateStatus({ type: null, message: '' });

    // Auto-fetch coordinates when address is entered
    if (value.trim()) {
      await autoFetchCoordinates(value.trim());
    }
  }, [handleChange]);

  /**
   * Handle image reordering with drag and drop
   */
  const handleDragStart = useCallback((index: number): void => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((dropIndex: number): void => {
    if (draggedIndex === null) return;

    const images = [...(formData.images || [])];
    const draggedImage = images[draggedIndex];

    // Remove the dragged image
    images.splice(draggedIndex, 1);
    // Insert it at the new position
    images.splice(dropIndex, 0, draggedImage);

    setFormData(prev => ({ ...prev, images }));
    setDraggedIndex(null);
  }, [draggedIndex, formData.images]);

  /**
   * Handle adding a new image via file upload
   */
  const handleAddImage = useCallback((): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  /**
   * Handle file selection
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert files to URLs (in a real app, you would upload to a server)
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            // All files have been read, update state
            setFormData(prev => ({
              ...prev,
              images: [...(prev.images || []), ...newImages]
            }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  /**
   * Handle removing an image
   */
  const handleRemoveImage = useCallback((index: number): void => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);
    setFormData(prev => ({ ...prev, images }));
  }, [formData.images]);

  /**
   * Auto-fetch coordinates based on address
   */
  const autoFetchCoordinates = async (address: string): Promise<void> => {
    if (!address) {
      setCoordinateStatus({
        type: 'error',
        message: t('validation:address_required', 'Adresse er påkrevd for å hente koordinater')
      });
      return;
    }

    setIsFetching(true);

    try {
      // Use Mapbox Geocoding API to get coordinates for the address
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&types=address&limit=1`;

      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.features || geocodeData.features.length === 0) {
        setCoordinateStatus({
          type: 'error',
          message: t('admin:facilities.errors.geocode_failed', 'Kunne ikke finne adressen i Mapbox')
        });
        setIsFetching(false);
        return;
      }

      const geocodedCoords = geocodeData.features[0].center; // [longitude, latitude]
      const geocodedLat = geocodedCoords[1];
      const geocodedLng = geocodedCoords[0];

      // Update coordinates in formData
      setFormData(prev => ({
        ...prev,
        coordinates: {
          lat: geocodedLat,
          lng: geocodedLng
        }
      }));

      setCoordinateStatus({
        type: 'success',
        message: t('admin:facilities.success.coordinates_fetched', 'Koordinater hentet automatisk fra adresse')
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setCoordinateStatus({
        type: 'error',
        message: t('admin:facilities.errors.geocode_error', 'Kunne ikke hente koordinater') + ': ' + (error instanceof Error ? error.message : t('common:messages.error.generic', 'Ukjent feil'))
      });
    } finally {
      setIsFetching(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateAll(formData)) {
      return;
    }

    if (!facility.id) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateFacility(facility.id, formData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update facility:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateAll, facility.id, updateFacility, onUpdate, onClose]);

  return (
    <Card className="w-full max-w-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">
          {t('admin:facilities.edit', 'Rediger lokale')}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common:actions.close', 'Lukk')}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <FormField
            id="name"
            name="name"
            label={t('common:name', 'Navn')}
            type="text"
            value={formData.name || ""}
            onChange={(value) => handleChange('name', String(value))}
            required
            error={errors.name}
          />

          {/* Address Field */}
          <div className="space-y-2">
            <FormField
              id="address"
              name="address"
              label={t('common:address', 'Adresse')}
              type="text"
              value={formData.address || ""}
              onChange={(value) => handleAddressChange(String(value))}
              required
              error={errors.address}
            />

            {/* Coordinate status feedback */}
            {isFetching && (
              <div className="flex items-center mt-2 p-2 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('admin:facilities.fetching_coordinates', 'Henter koordinater...')}
              </div>
            )}

            {coordinateStatus.type && !isFetching && (
              <div className={`mt-2 p-2 rounded text-sm flex items-center ${
                coordinateStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {coordinateStatus.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 mr-2" />
                )}
                {coordinateStatus.message}
              </div>
            )}
          </div>

          {/* Images with drag and drop reordering */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">
                {t('admin:facilities.images', 'Bilder')}
              </label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                <Upload className="h-4 w-4 mr-2" />
                {t('admin:facilities.add_image', 'Legg til bilde')}
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            {formData.images && formData.images.length > 0 ? (
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`flex items-center gap-2 p-2 border rounded ${
                      draggedIndex === index ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <div
                      className="cursor-move text-gray-400 hover:text-gray-600"
                      draggable
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        {image ? (
                          <img
                            src={image}
                            alt={`${t('admin:facilities.preview', 'Preview')} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-sm text-gray-500 truncate">
                        {t('admin:facilities.image_number', 'Bilde {{number}}', { number: index + 1 })}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={t('admin:facilities.remove_image', 'Fjern bilde {{number}}', { number: index + 1 })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p>{t('admin:facilities.no_images', 'Ingen bilder lagt til')}</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <FormActions
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel={t('common:actions.save', 'Lagre endringer')}
            cancelLabel={t('common:actions.cancel', 'Avbryt')}
            isSubmitting={isSubmitting}
            isValid={Object.keys(errors).length === 0}
          />
        </form>
      </CardContent>
    </Card>
  );
};
