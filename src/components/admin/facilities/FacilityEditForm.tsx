"use client";

import React, { useState, useEffect, useRef } from "react";
import { IFacility } from "@/stores/facilityStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFacilityStore } from "@/stores/facilityStore";
import { X, GripVertical, Image as ImageIcon, Upload, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface FacilityEditFormProps {
  readonly facility: IFacility;
  readonly onClose: () => void;
  readonly onUpdate: () => void;
}

// Mapbox public token provided by user
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA';

export const FacilityEditForm: React.FC<FacilityEditFormProps> = ({ 
  facility, 
  onClose,
  onUpdate
}): JSX.Element => {
  const [formData, setFormData] = useState<Partial<IFacility>>({ ...facility });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [coordinateStatus, setCoordinateStatus] = useState<{type: 'success' | 'error' | null; message: string}>({type: null, message: ''});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateFacility } = useFacilityStore();

  useEffect(() => {
    setFormData({ ...facility });
  }, [facility]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle address change with auto-fetch coordinates
  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, address: value }));
    
    // Reset status when address changes
    setCoordinateStatus({type: null, message: ''});
    
    // Auto-fetch coordinates when address is entered
    if (value.trim()) {
      await autoFetchCoordinates(value.trim());
    }
  };

  // Handle image reordering with drag and drop
  const handleDragStart = (index: number): void => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number): void => {
    if (draggedIndex === null) return;
    
    const images = [...(formData.images || [])];
    const draggedImage = images[draggedIndex];
    
    // Remove the dragged image
    images.splice(draggedIndex, 1);
    // Insert it at the new position
    images.splice(dropIndex, 0, draggedImage);
    
    setFormData(prev => ({ ...prev, images }));
    setDraggedIndex(null);
  };

  // Handle adding a new image via file upload
  const handleAddImage = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
  };

  // Handle removing an image
  const handleRemoveImage = (index: number): void => {
    const images = [...(formData.images || [])];
    images.splice(index, 1);
    setFormData(prev => ({ ...prev, images }));
  };

  // Auto-fetch coordinates based on address
  const autoFetchCoordinates = async (address: string): Promise<void> => {
    if (!address) {
      setCoordinateStatus({
        type: 'error', 
        message: 'Adresse er påkrevd for å hente koordinater'
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
          message: 'Kunne ikke finne adressen i Mapbox'
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
        message: 'Koordinater hentet automatisk fra adresse'
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      setCoordinateStatus({
        type: 'error', 
        message: 'Kunne ikke hente koordinater: ' + (error instanceof Error ? error.message : 'Ukjent feil')
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (facility.id) {
      updateFacility(facility.id, formData);
      onUpdate();
      onClose();
    }
  };

  return (
    <Card className="w-full max-w-md h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">Rediger lokale</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Lukk">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              name="address"
              value={formData.address || ""}
              onChange={handleAddressChange}
              required
            />
            
            {/* Coordinate status feedback */}
            {isFetching && (
              <div className="flex items-center mt-2 p-2 rounded text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Henter koordinater...
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
              <Label>Bilder</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddImage}>
                <Upload className="h-4 w-4 mr-2" />
                Legg til bilde
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
                            alt={`Preview ${index + 1}`} 
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
                        Bilde {index + 1}
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveImage(index)}
                      aria-label={`Fjern bilde ${index + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p>Ingen bilder lagt til</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Avbryt
            </Button>
            <Button type="submit">Lagre endringer</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};