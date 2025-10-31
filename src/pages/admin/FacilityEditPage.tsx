"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, X, ArrowLeft, Eye, MapPin, Users, Clock, Phone, Mail, Plus, Trash2, Edit3, Check, X as XIcon, Settings } from "lucide-react";
import { useFacilityStore } from "@/stores/facilityStore";
import type { IFacility } from "@/types/facility";
import { useFieldConfigStore } from "@/stores/fieldConfigStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
// FieldConfigModal component not found, removing import
import { ReadOnlyCalendar } from "@/features/calendar/ReadOnlyCalendar";
import { Zone } from "@/types/booking";
import { useZoneStore } from "@/stores/zoneStore";

interface IFacilityEditPageProps {
  readonly children?: never;
}

// Use Zone type from types/booking.ts
type IZone = Zone;

interface IFaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly isEditing: boolean;
}

interface IOpeningHours {
  readonly start: string;
  readonly end: string;
}

interface IOpeningHoursMap {
  readonly monday: IOpeningHours;
  readonly tuesday: IOpeningHours;
  readonly wednesday: IOpeningHours;
  readonly thursday: IOpeningHours;
  readonly friday: IOpeningHours;
  readonly saturday: IOpeningHours;
  readonly sunday: IOpeningHours;
}

interface IBookingPolicies {
  readonly freeCancellation: number;
  readonly minBooking: number;
  readonly maxBooking: number;
  readonly advanceBooking: number;
}

// Use the same interface as the store
type IEditedFacility = IFacility;

const FacilityEditPage = (_props: IFacilityEditPageProps): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [editedFacility, setEditedFacility] = useState<IEditedFacility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showSaveMessage, setShowSaveMessage] = useState<boolean>(false);
  // FieldConfigModal component not found, removing state
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);
  
  // Use field config store
  const { 
    getFieldConfigsForFacility, 
    updateFieldConfig, 
    toggleFieldVisibility, 
    updateFieldValue,
    addCustomField,
    removeField
  } = useFieldConfigStore();
  
  const fieldConfigs = getFieldConfigsForFacility(id || "");
  
  // Mock current admin user - in real app this would come from auth context
  const currentAdminUser = "Admin User";
  
  // Use the facility store
  const { getFacilityById, updateFacility, addFacility } = useFacilityStore();
  
  // Helper function to generate timestamp
  const generateTimestamp = (): string => {
    const now = new Date();
    return now.toLocaleString('nb-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  const { addZone: storeAddZone, updateZone: storeUpdateZone, deleteZone: storeDeleteZone, getZonesForFacility: storeGetZonesForFacility } = useZoneStore();
  const [faqItems, setFaqItems] = useState<readonly IFaqItem[]>([]);
  const [openingHours, setOpeningHours] = useState<IOpeningHoursMap>({
    monday: { start: "08:00", end: "22:00" },
    tuesday: { start: "08:00", end: "22:00" },
    wednesday: { start: "08:00", end: "22:00" },
    thursday: { start: "08:00", end: "22:00" },
    friday: { start: "08:00", end: "22:00" },
    saturday: { start: "09:00", end: "20:00" },
    sunday: { start: "10:00", end: "18:00" }
  });
  const [bookingPolicies, setBookingPolicies] = useState<IBookingPolicies>({
    freeCancellation: 24,
    minBooking: 1,
    maxBooking: 8,
    advanceBooking: 30
  });

  // Find facility by ID from store or create new facility
  useEffect(() => {
    if (id === "new" || window.location.pathname.includes('/facilities/new')) {
      // Create new facility template
      const newFacility = createNewFacilityTemplate();
      setEditedFacility(newFacility);
      setIsLoading(false);
    } else {
      const facility = getFacilityById(id || "");
      if (facility) {
        setEditedFacility(facility);
        
        // Load zones for this facility from store only
        // No dummy data loading - zones should be created manually
        
        // Update field configs with facility values
        fieldConfigs.forEach(field => {
          let value = field.value;
          if (field.key === 'capacity') value = facility.capacity || 0;
          if (field.key === 'area') value = facility.area || '';
          if (field.key === 'pricePerHour') value = facility.pricePerHour || 0;
          if (field.key === 'rating') value = facility.rating || 0;
          if (field.key === 'reviewCount') value = facility.reviewCount || 0;
          
          if (value !== field.value) {
            updateFieldValue(id || "", field.id, value);
          }
        });
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [id, getFacilityById, fieldConfigs, updateFieldValue, currentAdminUser]);

  // Helper function to create new facility template
  const createNewFacilityTemplate = (): IEditedFacility => ({
    id: "new",
    name: "",
    description: "",
    type: "Møterom",
    location: "",
    address: "",
    capacity: 0,
    pricePerHour: 0,
    amenities: [],
    images: [],
    availability: {
      monday: { start: "08:00", end: "22:00" },
      tuesday: { start: "08:00", end: "22:00" },
      wednesday: { start: "08:00", end: "22:00" },
      thursday: { start: "08:00", end: "22:00" },
      friday: { start: "08:00", end: "22:00" },
      saturday: { start: "09:00", end: "20:00" },
      sunday: { start: "10:00", end: "18:00" }
    },
    coordinates: { lat: 59.744, lng: 10.204 },
    rating: 0,
    reviewCount: 0,
    area: "",
    accessibilityFeatures: [],
    status: "draft",
    owner: currentAdminUser,
    lastUpdated: generateTimestamp(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedBy: currentAdminUser,
    rules: "",
    contactEmail: "",
    openingHours: "",
    openingHoursStart: "08:00",
    openingHoursEnd: "22:00",
    emergencyContact: ""
  });


  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laster...</p>
        </div>
      </div>
    );
  }

  if (!editedFacility && id !== "new" && !window.location.pathname.includes('/facilities/new')) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lokale ikke funnet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Det oppgitte lokalet kunne ikke finnes.</p>
          <Button onClick={() => navigate("/admin/facilities")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til lokaler
          </Button>
        </div>
      </div>
    );
  }

  if (!editedFacility) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Feil</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Noe gikk galt ved lasting av siden.</p>
          <Button onClick={() => navigate("/admin/facilities")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tilbake til lokaler
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = (): void => {
    if (!editedFacility) {
      return;
    }
    
    if (id === "new" || window.location.pathname.includes('/facilities/new')) {
      // Create new facility
      try {
        addFacility({
          name: editedFacility.name,
          description: editedFacility.description,
          type: editedFacility.type,
          location: editedFacility.location,
          address: editedFacility.address,
          capacity: editedFacility.capacity,
          pricePerHour: editedFacility.pricePerHour,
          amenities: editedFacility.amenities,
          images: editedFacility.images,
          availability: editedFacility.availability,
          coordinates: editedFacility.coordinates,
          rating: editedFacility.rating,
          reviewCount: editedFacility.reviewCount,
          area: editedFacility.area,
          accessibilityFeatures: editedFacility.accessibilityFeatures,
          status: editedFacility.status,
          owner: editedFacility.owner,
          lastUpdated: generateTimestamp(),
          updatedBy: currentAdminUser,
          rules: editedFacility.rules,
          contactEmail: editedFacility.contactEmail,
          openingHours: editedFacility.openingHours,
          openingHoursStart: editedFacility.openingHoursStart,
          openingHoursEnd: editedFacility.openingHoursEnd,
          emergencyContact: editedFacility.emergencyContact
        });
        
        navigate('/admin/facilities');
      } catch (error) {
        // Handle error silently or show user-friendly message
        return;
      }
      
      // Navigate to the new facility's edit page
      navigate("/admin/facilities");
    } else {
      // Update existing facility
      updateFacility(editedFacility.id, {
        name: editedFacility.name,
        description: editedFacility.description,
        type: editedFacility.type,
        address: editedFacility.address,
        capacity: editedFacility.capacity,
        amenities: editedFacility.amenities,
        images: editedFacility.images,
        coordinates: editedFacility.coordinates,
        status: editedFacility.status,
        owner: editedFacility.owner,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser,
        rules: editedFacility.rules,
        contactEmail: editedFacility.contactEmail,
        openingHours: editedFacility.openingHours,
        openingHoursStart: editedFacility.openingHoursStart,
        openingHoursEnd: editedFacility.openingHoursEnd,
        emergencyContact: editedFacility.emergencyContact
      });
    }
    
    setHasUnsavedChanges(false);
    setShowSaveMessage(true);
    setTimeout((): void => setShowSaveMessage(false), 3000);
  };

  const handleCancel = (): void => {
    if (hasUnsavedChanges) {
      if (window.confirm("Du har ulagrede endringer. Er du sikker på at du vil avbryte?")) {
        // Reset to original data from store
        const originalFacility = getFacilityById(id || "");
        if (originalFacility) {
          setEditedFacility(originalFacility);
        }
        setHasUnsavedChanges(false);
      }
    } else {
      navigate("/admin/facilities");
    }
  };

  const handleViewInApp = (): void => {
    if (editedFacility) {
      navigate(`/facilities/${editedFacility.id}`);
    }
  };

  // Function to render field based on configuration
  const renderField = (field: {
    readonly id: string;
    readonly key: string;
    readonly label: string;
    readonly type: 'text' | 'number' | 'boolean';
    readonly visible: boolean;
    readonly value: string | number | boolean;
  }): JSX.Element | null => {
    if (!field.visible) return null;

    const getFieldValue = (): string | number => {
      if (field.key === 'capacity') return editedFacility?.capacity || 0;
      if (field.key === 'area') return editedFacility?.area || '';
      if (field.key === 'pricePerHour') return editedFacility?.pricePerHour || 0;
      if (field.key === 'rating') return editedFacility?.rating || 0;
      if (field.key === 'reviewCount') return editedFacility?.reviewCount || 0;
      return field.value as string | number;
    };

    const handleFieldChange = (value: string | number | boolean): void => {
      if (field.key === 'capacity') {
        handleInputChange('capacity', typeof value === 'number' ? value : parseInt(String(value)) || 0);
      } else if (field.key === 'area') {
        handleInputChange('area', String(value));
      } else if (field.key === 'pricePerHour') {
        handleInputChange('pricePerHour', typeof value === 'number' ? value : parseInt(String(value)) || 0);
      } else if (field.key === 'rating') {
        handleInputChange('rating', typeof value === 'number' ? value : parseFloat(String(value)) || 0);
      } else if (field.key === 'reviewCount') {
        handleInputChange('reviewCount', typeof value === 'number' ? value : parseInt(String(value)) || 0);
      } else {
        // For custom fields, update the field config in store
        updateFieldValue(id || "", field.id, value);
      }
    };

    const getIcon = (): JSX.Element => {
      if (field.key === 'capacity') return <Users className="h-5 w-5 text-gray-400 mr-3" />;
      if (field.key === 'area') return <MapPin className="h-5 w-5 text-gray-400 mr-3" />;
      if (field.key === 'pricePerHour') return <Clock className="h-5 w-5 text-gray-400 mr-3" />;
      if (field.key === 'rating') return <span className="text-yellow-500 mr-3">★</span>;
      if (field.key === 'reviewCount') return <span className="text-gray-400 mr-3">📝</span>;
      return <span className="text-gray-400 mr-3">📋</span>;
    };

    const getUnit = (): string => {
      if (field.key === 'capacity') return 'personer';
      if (field.key === 'area') return 'm²';
      if (field.key === 'pricePerHour') return 'kr/time';
      if (field.key === 'rating') return '/5';
      if (field.key === 'reviewCount') return 'anmeldelser';
      return '';
    };

    return (
      <div key={field.id} className="flex items-center">
        {getIcon()}
        <div className="flex items-center">
          <span className="font-medium">{field.label}:</span>
          {field.type === 'number' ? (
            <Input
              type="number"
              value={getFieldValue()}
              onChange={(e) => handleFieldChange(parseInt(e.target.value) || 0)}
              className="ml-2 w-20"
              placeholder={`Sett inn ${field.label.toLowerCase()}...`}
            />
          ) : field.type === 'boolean' ? (
            <div className="ml-2 flex items-center">
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => handleFieldChange(checked)}
              />
              <span className="ml-2 text-sm text-gray-600">
                {field.value ? 'Ja' : 'Nei'}
              </span>
            </div>
          ) : (
            <Input
              value={String(getFieldValue())}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="ml-2 flex-1"
              placeholder={`Sett inn ${field.label.toLowerCase()}...`}
            />
          )}
          {getUnit() && (
            <span className="ml-2 text-gray-600 dark:text-gray-400">{getUnit()}</span>
          )}
        </div>
      </div>
    );
  };


  const handleInputChange = (field: keyof IEditedFacility, value: string | number): void => {
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // First try with Norway restriction
      let response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA&country=NO&limit=1`
      );
      let data = await response.json();
      
      // If no results, try without country restriction
      if (!data.features || data.features.length === 0) {
        response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA&limit=1`
        );
        data = await response.json();
      }
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
    } catch (error) {
      // Handle geocoding error silently
    }
    return null;
  };

  const handleAddressChange = async (address: string): Promise<void> => {
    if (editedFacility) {
      // Update address immediately
      setEditedFacility({
        ...editedFacility,
        address,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      });
      
      // Try to geocode the address
      if (address.length > 5) { // Only geocode if address is long enough
        setIsGeocoding(true);
        const coordinates = await geocodeAddress(address);
        if (coordinates) {
          setEditedFacility(prev => prev ? {
            ...prev,
            coordinates,
            lastUpdated: generateTimestamp(),
            updatedBy: currentAdminUser
          } : null);
          setHasUnsavedChanges(true);
        }
        setIsGeocoding(false);
      }
    }
  };

  const handleImageChange = (): void => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const newImages: string[] = [];
        let processedCount = 0;
        
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            newImages.push(result);
            processedCount++;
            
            // Update facility when all files are processed
            if (processedCount === files.length && editedFacility) {
              setEditedFacility({
                ...editedFacility,
                images: [...editedFacility.images, ...newImages],
                lastUpdated: generateTimestamp(),
                updatedBy: currentAdminUser
              });
              setHasUnsavedChanges(true);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };
    
    input.click();
  };

  const handleRemoveImage = (index: number): void => {
    if (editedFacility) {
      const newImages = editedFacility.images.filter((_, i) => i !== index);
      setEditedFacility({
        ...editedFacility,
        images: newImages,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleMoveImage = (fromIndex: number, toIndex: number): void => {
    if (editedFacility && fromIndex !== toIndex) {
      const newImages = [...editedFacility.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      setEditedFacility({
        ...editedFacility,
        images: newImages,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number): void => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number): void => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    handleMoveImage(dragIndex, dropIndex);
  };

  const addZone = (): void => {
    const facilityId = editedFacility?.id || "new";
    
    const newZone: Zone = {
      id: Date.now().toString(),
      name: "Ny sone",
      facilityId: facilityId,
      capacity: 0,
      pricePerHour: 0,
      area: 0,
      description: "",
      amenities: [],
      availability: {
        monday: { start: "08:00", end: "22:00" },
        tuesday: { start: "08:00", end: "22:00" },
        wednesday: { start: "08:00", end: "22:00" },
        thursday: { start: "08:00", end: "22:00" },
        friday: { start: "08:00", end: "22:00" },
        saturday: { start: "09:00", end: "20:00" },
        sunday: { start: "10:00", end: "18:00" }
      }
    };
    storeAddZone(newZone);
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const updateZone = (zoneId: string, field: keyof Zone, value: string | number | string[]): void => {
    storeUpdateZone(zoneId, { [field]: value });
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const deleteZone = (zoneId: string): void => {
    storeDeleteZone(zoneId);
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const addFaqItem = (): void => {
    const newFaq: IFaqItem = {
      id: Date.now().toString(),
      question: "Nytt spørsmål",
      answer: "Svar her...",
      isEditing: true
    };
    setFaqItems([...faqItems, newFaq]);
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const updateFaqItem = (faqId: string, field: keyof IFaqItem, value: string): void => {
    setFaqItems(faqItems.map((faq: IFaqItem): IFaqItem => 
      faq.id === faqId ? { ...faq, [field]: value } : faq
    ));
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const deleteFaqItem = (faqId: string): void => {
    setFaqItems(faqItems.filter((faq: IFaqItem): boolean => faq.id !== faqId));
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  const handleTagAdd = (newTag: string): void => {
    if (newTag.trim() && editedFacility && !editedFacility.amenities.includes(newTag.trim())) {
      setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
        if (!prev) return null;
        return {
          ...prev,
          amenities: [...prev.amenities, newTag.trim()],
          lastUpdated: generateTimestamp(),
          updatedBy: currentAdminUser
        };
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleTagRemove = (tagToRemove: string): void => {
    setEditedFacility((prev: IEditedFacility | null): IEditedFacility | null => {
      if (!prev) return null;
      return {
        ...prev,
        amenities: prev.amenities.filter((amenity: string): boolean => amenity !== tagToRemove),
        lastUpdated: generateTimestamp(),
        updatedBy: currentAdminUser
      };
    });
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Admin Header with actions */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/facilities")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Tilbake til lokaler
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {id === "new" ? "Nytt lokale" : "Rediger lokale"}
              </h1>
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Ulagrede endringer
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Avbryt
              </Button>
              <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="w-4 h-4 mr-2" />
                Lagre endringer
              </Button>
              <Button variant="outline" onClick={handleViewInApp}>
                <Eye className="w-4 h-4 mr-2" />
                Se i app
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save message */}
      {showSaveMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-400" />
            <p className="ml-3 text-sm text-green-700 dark:text-green-300">
              Endringene er lagret!
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Image Gallery Section */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Bilder</h3>
            <Button
              onClick={handleImageChange}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Legg til bilder
            </Button>
          </div>
          
          {editedFacility.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editedFacility.images.map((image, index) => (
                <div 
                  key={index} 
                  className="relative group cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <img
                    src={image}
                    alt={`${editedFacility.name} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  />
                  <Button
                    onClick={() => handleRemoveImage(index)}
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-blue-600 text-white">Hovedbilde</Badge>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                      Dra for å endre rekkefølge
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">Ingen bilder lagt til</p>
              <Button
                onClick={handleImageChange}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Legg til første bilde
              </Button>
            </div>
          )}
        </div>

        {/* Facility Header - Matches frontend exactly */}
        <div className="mb-8">
          {/* Type badge - under image */}
          <div className="mb-4">
            <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
              <Input
                value={editedFacility.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="bg-transparent border-none text-white p-0 h-auto text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              />
            </Badge>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
                  <Input
                    value={editedFacility.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="text-3xl font-bold border-none p-0 h-auto mb-2 text-gray-900 dark:text-white"
                    placeholder="Sett inn navn på lokalet..."
                  />
              
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="h-5 w-5" />
                <div className="flex-1 relative">
                  <Input
                    value={editedFacility.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="border-none p-0 h-auto text-lg pr-8"
                    placeholder="Sett inn adresse..."
                  />
                  {isGeocoding && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualCoords(!showManualCoords)}
                  className="ml-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {showManualCoords ? 'Skjul' : 'Manuell posisjon'}
                </button>
              </div>
              
              {showManualCoords && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Breddegrad (Latitude)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={editedFacility.coordinates.lat}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          if (!isNaN(lat)) {
                            setEditedFacility(prev => prev ? {
                              ...prev,
                              coordinates: { ...prev.coordinates, lat },
                              lastUpdated: generateTimestamp(),
                              updatedBy: currentAdminUser
                            } : null);
                            setHasUnsavedChanges(true);
                          }
                        }}
                        placeholder="59.744"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lengdegrad (Longitude)
                      </label>
                      <Input
                        type="number"
                        step="any"
                        value={editedFacility.coordinates.lng}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lng)) {
                            setEditedFacility(prev => prev ? {
                              ...prev,
                              coordinates: { ...prev.coordinates, lng },
                              lastUpdated: generateTimestamp(),
                              updatedBy: currentAdminUser
                            } : null);
                            setHasUnsavedChanges(true);
                          }
                        }}
                        placeholder="10.204"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Du kan finne koordinater på <a href="https://www.mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mapbox</a> eller <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenStreetMap</a> ved å høyreklikke på stedet.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Main Content Layout - 70% / 30% - Matches frontend exactly */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-12">
          {/* Left Column - Tabs Content (70%) */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Generell info</TabsTrigger>
                <TabsTrigger value="zones">Soner</TabsTrigger>
                <TabsTrigger value="facilities">Fasiliteter</TabsTrigger>
                <TabsTrigger value="rules">Regler</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Om {editedFacility.name}</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      // onClick={() => setShowFieldConfigModal(true)}
                      className="flex items-center gap-2"
                      title="Rediger informasjonsfelt"
                    >
                      <Settings className="w-4 h-4" />
                      Rediger felt
                    </Button>
                  </div>
                  
                    <textarea
                      value={editedFacility.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-700 leading-relaxed mb-6"
                      placeholder="Sett inn beskrivelse av lokalet..."
                    />
                  
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {/* Dynamic fields from configuration */}
                      {fieldConfigs
                        .filter(field => field.visible)
                        .slice(0, Math.ceil(fieldConfigs.filter(field => field.visible).length / 2))
                        .map(renderField)}
                    </div>
                    
                    <div className="space-y-4">
                      {/* Dynamic fields from configuration - second column */}
                      {fieldConfigs
                        .filter(field => field.visible)
                        .slice(Math.ceil(fieldConfigs.filter(field => field.visible).length / 2))
                        .map(renderField)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="zones" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Soner</h3>
                    <Button onClick={addZone} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Legg til sone
                    </Button>
                  </div>
                  
                  {(() => {
                    const facilityZones = storeGetZonesForFacility(editedFacility?.id || "");
                    return facilityZones.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Ingen soner definert. Legg til en sone for å begynne.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {facilityZones.map((zone) => (
                        <Card key={zone.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Input
                                value={zone.name}
                                onChange={(e) => updateZone(zone.id, "name", e.target.value)}
                                className="text-lg font-semibold border-none p-0 h-auto"
                                placeholder="Sone navn"
                              />
                              <Button
                                onClick={() => deleteZone(zone.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="mb-4">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sone informasjon</label>
                              <textarea
                                value={zone.description || ""}
                                onChange={(e) => updateZone(zone.id, "description", e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                rows={3}
                                placeholder="Beskrivelse av sonen..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kapasitet</label>
                                <Input
                                  type="number"
                                  value={zone.capacity}
                                  onChange={(e) => updateZone(zone.id, "capacity", parseInt(e.target.value) || 0)}
                                  className="mt-1"
                                  placeholder="Antall personer"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pris per time</label>
                                <Input
                                  type="number"
                                  value={zone.pricePerHour}
                                  onChange={(e) => updateZone(zone.id, "pricePerHour", parseInt(e.target.value) || 0)}
                                  className="mt-1"
                                  placeholder="Pris per time"
                                />
                              </div>
                            </div>
                            <div className="mt-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Areal</label>
                                <div className="relative mt-1">
                                  <Input
                                    type="number"
                                    value={zone.area || 0}
                                    onChange={(e) => updateZone(zone.id, "area", parseInt(e.target.value) || 0)}
                                    className="pr-8"
                                    placeholder="0"
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <span className="text-gray-500 text-sm">m²</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="facilities" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Fasiliteter</h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {editedFacility.amenities.map((amenity: string, index: number) => (
                        <Badge
                          key={index}
                          className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          {amenity}
                          <button
                            onClick={() => handleTagRemove(amenity)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Legg til fasilitet..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTagAdd(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          handleTagAdd(input.value);
                          input.value = '';
                        }}
                      >
                        Legg til
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Regler</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bookingregler
                      </label>
                      <textarea
                        value={editedFacility.rules || ""}
                        className="w-full min-h-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        placeholder="Skriv bookingreglene her..."
                        onChange={(e) => handleInputChange("rules", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faq" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">FAQ</h3>
                    <Button onClick={addFaqItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Legg til FAQ
                    </Button>
                  </div>
                  
                  {faqItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Ingen FAQ-spørsmål definert. Legg til spørsmål og svar for å begynne.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {faqItems.map((faq) => (
                        <Card key={faq.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <Input
                                  value={faq.question}
                                  onChange={(e) => updateFaqItem(faq.id, "question", e.target.value)}
                                  className="text-lg font-semibold border-none p-0 h-auto mb-2"
                                  placeholder="Spørsmål"
                                />
                                <textarea
                                  value={faq.answer}
                                  onChange={(e) => updateFaqItem(faq.id, "answer", e.target.value)}
                                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  placeholder="Svar"
                                />
                              </div>
                              <Button
                                onClick={() => deleteFaqItem(faq.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 ml-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Contact Info Sidebar (30%) - Matches frontend exactly */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-6">
              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Kontaktinformasjon
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Anleggsansvarlig</h4>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <Input
                          value={editedFacility.contactEmail || ""}
                          onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                          className="text-sm border-none p-0 h-auto"
                          placeholder="Sett inn e-post adresse..."
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Åpningstider</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={editedFacility.openingHoursStart || "08:00"}
                              onChange={(e) => handleInputChange("openingHoursStart", e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
                            />
                            <span className="text-gray-500">til</span>
                            <Input
                              type="time"
                              value={editedFacility.openingHoursEnd || "22:00"}
                              onChange={(e) => handleInputChange("openingHoursEnd", e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Kalenderen vil kun vise tidsluker innenfor disse åpningstidene
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nødkontakt</h4>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <Input
                          value={editedFacility.emergencyContact || ""}
                          onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                          className="text-sm border-none p-0 h-auto"
                          placeholder="Sett inn nødkontakt..."
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Policies */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Bookingregler</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gratis avbestilling</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={bookingPolicies.freeCancellation}
                          onChange={(e) => setBookingPolicies({...bookingPolicies, freeCancellation: parseInt(e.target.value)})}
                          className="w-16 text-sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">timer før reservert tid</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Minimum booking</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={bookingPolicies.minBooking}
                          onChange={(e) => setBookingPolicies({...bookingPolicies, minBooking: parseInt(e.target.value)})}
                          className="w-16 text-sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">timer</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maksimum booking</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="number"
                          value={bookingPolicies.maxBooking}
                          onChange={(e) => setBookingPolicies({...bookingPolicies, maxBooking: parseInt(e.target.value)})}
                          className="w-16 text-sm"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">timer</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Only Section */}
              <Card className="border-orange-200 dark:border-orange-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-orange-700 dark:text-orange-300">Admin-innstillinger</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select
                        value={editedFacility.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="published">Publisert</option>
                        <option value="draft">Utkast</option>
                        <option value="archived">Arkivert</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Eier</label>
                      <Input
                        value={editedFacility.owner}
                        onChange={(e) => handleInputChange("owner", e.target.value)}
                        className="mt-1 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sist oppdatert</label>
                      <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                        {editedFacility.lastUpdated}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Oppdateres automatisk ved endringer
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Oppdatert av</label>
                      <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                        {editedFacility.updatedBy || "Ikke oppdatert"}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Sist endret av admin-bruker
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Calendar Section - Using ReadOnlyCalendar component */}
        <div className="mt-12">
          <ReadOnlyCalendar
            facilityId={editedFacility.id}
            facilityName={editedFacility.name}
            zones={storeGetZonesForFacility(editedFacility.id)}
            openingHoursStart={editedFacility.openingHoursStart || "08:00"}
            openingHoursEnd={editedFacility.openingHoursEnd || "22:00"}
          />
        </div>
      </div>

      {/* Field Configuration Modal - component not found, removing modal */}
    </div>
  );
};

export default FacilityEditPage;
