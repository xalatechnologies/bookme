"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, X, ArrowLeft, Eye, MapPin, Plus, Trash2, Check, X as XIcon } from "lucide-react";
import type { Database } from "@/types/database";
import { useUpdateFacility, useCreateFacility, useFacilityAvailability, useUpdateFacilityAvailability } from "@/services/supabase/facilities.service";
import { useFacilityRules, useCreateFacilityRule, useUpdateFacilityRule, useDeleteFacilityRule, type FacilityRule } from "@/services/supabase/facilityRules.service";
import { useFacility } from "@/components/features/facilities/hooks/useFacility";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useFieldConfigStore } from "@/stores/fieldConfigStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
import { FieldConfigModal } from "@/components/features/facilities/components/FacilityEditForm/FieldConfigModal";
import { ConfirmationModal } from "@/components/common/modals/ConfirmationModal";
import { Zone } from "@/types/booking";
import { useZoneStore } from "@/stores/zoneStore";
import { extractContactInfo, cleanDescription, formatContactInfo } from "@/utils/facility/contactUtils";
import { toast } from "react-toastify";
import { MAPBOX_TOKEN } from '@/lib/clients/mapbox';

type Facility = Database['public']['Tables']['facilities']['Row'];

// interface IFacilityEditPageProps {
  // readonly children?: never;
// }

// Use Zone type from types/booking.ts


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

// interface IBookingPolicies {
  // readonly freeCancellation: number;
  // readonly minBooking: number;
  // readonly maxBooking: number;
  // readonly advanceBooking: number;
// }

type FacilityInsert = Omit<Facility, 'id' | 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

const FacilityEditPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orgId = useOrganizationId();
  // const [isEditing] = useState<boolean>(true);
  const [editedFacility, setEditedFacility] = useState<Partial<Facility> | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showSaveMessage] = useState<boolean>(false);
  const [showFieldConfigModal, setShowFieldConfigModal] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);
  const [imageVersion, setImageVersion] = useState<number>(0); // For forcing re-renders when images change
  const [showDeleteImageModal, setShowDeleteImageModal] = useState<boolean>(false);
  const [imageToDeleteIndex, setImageToDeleteIndex] = useState<number | null>(null);

  // Use Supabase hooks
  const { facility: supabaseFacility, loading: isLoading } = useFacility(id || "");
  // Only fetch availability when we have the actual facility ID
  useFacilityAvailability(supabaseFacility?.id || "", !!supabaseFacility?.id);
  const updateFacilityMutation = useUpdateFacility();
  const createFacilityMutation = useCreateFacility();
  const updateAvailabilityMutation = useUpdateFacilityAvailability();

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


  // Helper function to generate timestamp


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

  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string }>({
    email: '',
    phone: ''
  });

  // Fetch facility rules
  const { data: facilityRules = [], isLoading: rulesLoading } = useFacilityRules(editedFacility?.id || '', !!editedFacility?.id);
  const createRuleMutation = useCreateFacilityRule();
  const updateRuleMutation = useUpdateFacilityRule();
  const deleteRuleMutation = useDeleteFacilityRule();

  // Debounce timer for rule updates
  const ruleUpdateTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Local state for rule text inputs (to avoid lag)
  const [ruleTexts, setRuleTexts] = useState<{ [key: string]: string }>({});

  // Helper function to create new facility template
  const createNewFacilityTemplate = useCallback((): Partial<Facility> => ({
    name: "",
    description: "",
    facility_type: "møterom",
    address: "",
    city: "Drammen",
    postal_code: "",
    country: "NO",
    capacity: 0,
    amenities: [],
    images: [],
    location: null, // Set to null instead of object for PostGIS compatibility
    rating: 0,
    review_count: 0,
    area_description: "",
    status: "draft",
    org_id: orgId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }), [orgId]);

  // Load facility from Supabase or create new facility
  useEffect(() => {
    if (id === "new" || window.location.pathname.includes('/facilities/new')) {
      // Create new facility template
      const newFacility = createNewFacilityTemplate();
      setEditedFacility(newFacility);
    } else if (supabaseFacility && !editedFacility) {
      setEditedFacility(supabaseFacility);

      // Redirect to slug-based URL if facility has a slug and we're using ID
      if (supabaseFacility.slug && id && id !== supabaseFacility.slug) {
        // Check if the current ID is a UUID (not a slug)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(id)) {
          // Replace the current history entry with the slug-based URL
          navigate(`/admin/facilities/${supabaseFacility.slug}/edit`, { replace: true });
        }
      }

      // Extract contact info from separate fields if available, otherwise from description
      const { email, phone } = extractContactInfo(
        supabaseFacility.description || '',
        supabaseFacility.contact_email,
        supabaseFacility.contact_phone
      );
      setContactInfo({ email, phone });

      // Update field configs with facility values
      fieldConfigs.forEach(field => {
        let value: string | number | boolean = field.value;
        if (field.key === 'capacity') value = supabaseFacility.capacity || 0;
        // These fields don't exist in the facility table, so we'll keep the default values
        // if (field.key === 'area') value = supabaseFacility.area || '';
        // if (field.key === 'pricePerHour') value = supabaseFacility.pricePerHour || 0;
        if (field.key === 'rating') value = supabaseFacility.rating || 0;
        if (field.key === 'reviewCount') value = supabaseFacility.review_count || 0;

        if (value !== field.value) {
          updateFieldValue(id || "", field.id, value);
        }
      });
    }
  }, [id, supabaseFacility, editedFacility, fieldConfigs, navigate, updateFieldValue, orgId, createNewFacilityTemplate]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timers when component unmounts
      Object.values(ruleUpdateTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Initialize local rule text state when rules load
  useEffect(() => {
    if (facilityRules.length > 0) {
      const textMap: { [key: string]: string } = {};
      facilityRules.forEach(rule => {
        if (!ruleTexts[rule.id]) {
          textMap[rule.id] = rule.rule_text;
        }
      });
      if (Object.keys(textMap).length > 0) {
        setRuleTexts(prev => ({ ...prev, ...textMap }));
      }
    }
  }, [facilityRules]); // Simplified dependency

  // If we're using a slug and the facility hasn't loaded yet, don't show "not found" immediately
  const isUsingSlug = id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const shouldShowNotFound = !editedFacility && id !== "new" && !window.location.pathname.includes('/facilities/new') && !isLoading && !isUsingSlug;

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

  if (shouldShowNotFound) {
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

  const handleSave = async (): Promise<void> => {
    if (!editedFacility) return;

    try {
      // Format contact information before saving
      const formattedContactInfo = formatContactInfo(contactInfo);

      // Clean description by removing any existing contact information
      const cleanedDescription = cleanDescription(editedFacility.description || '');

      // Prepare facility data, ensuring proper formatting
      const facilityData: Partial<FacilityInsert> = {
        ...editedFacility,
        org_id: editedFacility.org_id || orgId, // Ensure org_id is always present
        facility_type: editedFacility.facility_type?.toLowerCase() || "møterom", // Ensure lowercase facility_type
        description: cleanedDescription,
        contact_email: formattedContactInfo.email || null,
        contact_phone: formattedContactInfo.phone || null,
        updated_at: new Date().toISOString(),
      };

      // Handle location field for PostGIS compatibility
      // For now, we're setting it to null to avoid geometry parsing errors
      // In a real implementation, you would convert coordinates to PostGIS format
      facilityData.location = null;

      // Remove any fields that shouldn't be sent to the database
      // Remove id from updates as it's used in the URL
      if ('id' in facilityData) {
        delete facilityData.id;
      }

      // Remove created_at from updates as it shouldn't be changed
      if ('created_at' in facilityData) {
        delete facilityData.created_at;
      }

      console.log("Saving facility data:", facilityData); // Debug log

      // Prepare availability data
      const dayMap: { [key in keyof IOpeningHoursMap]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };

      const availabilityData = Object.entries(openingHours).map(([day, hours]) => ({
        day_of_week: dayMap[day as keyof IOpeningHoursMap],
        starts_time: hours.start,
        ends_time: hours.end
      }));

      console.log("Availability data:", availabilityData); // Debug log

      if (id === "new" || window.location.pathname.includes('/facilities/new')) {
        // Create new facility
        console.log("Creating new facility with data:", facilityData); // Debug log

        // Validate required fields before creating
        if (!facilityData.name || facilityData.name.trim() === '') {
          throw new Error("Navn på lokalet er påkrevd");
        }

        if (!facilityData.facility_type || facilityData.facility_type.trim() === '') {
          throw new Error("Type lokale er påkrevd");
        }

        // Additional validation for facility_type to ensure it's a valid value
        const validFacilityTypes = ["møterom", "idrettshall", "konferanserom", "workshop", "studio", "auditorium", "fotballbane", "svømmehall", "kulturhus", "tennisbane"];
        if (!validFacilityTypes.includes(facilityData.facility_type)) {
          throw new Error(`Ugyldig type lokale: ${facilityData.facility_type}. Må være en av: ${validFacilityTypes.join(", ")}`);
        }

        const createdFacility = await createFacilityMutation.mutateAsync(facilityData as FacilityInsert);
        console.log("Created facility:", createdFacility); // Debug log

        // Save availability data for new facility
        if (createdFacility.id) {
          console.log("Updating availability for facility:", createdFacility.id); // Debug log
          await updateAvailabilityMutation.mutateAsync({
            facilityId: createdFacility.id,
            availability: availabilityData.map(item => ({
              ...item,
              facility_id: createdFacility.id
            })) as Database['public']['Tables']['facility_availability']['Row'][]
          });
        }

        toast.success("Lokale opprettet!");
        navigate("/admin/facilities");
      } else {
        // Update existing facility
        console.log("Updating existing facility:", id, "with data:", facilityData); // Debug log

        // Validate required fields before sending
        if (!facilityData.name || facilityData.name.trim() === '') {
          throw new Error("Navn på lokalet er påkrevd");
        }

        if (!facilityData.facility_type || facilityData.facility_type.trim() === '') {
          throw new Error("Type lokale er påkrevd");
        }

        // Additional validation for facility_type to ensure it's a valid value
        const validFacilityTypes = ["møterom", "idrettshall", "konferanserom", "workshop", "studio", "auditorium", "fotballbane", "svømmehall", "kulturhus", "tennisbane"];
        if (!validFacilityTypes.includes(facilityData.facility_type)) {
          throw new Error(`Ugyldig type lokale: ${facilityData.facility_type}. Må være en av: ${validFacilityTypes.join(", ")}`);
        }

        const updatedFacility = await updateFacilityMutation.mutateAsync({
          id: supabaseFacility?.id || id || "",
          updates: facilityData
        });

        // Update availability data
        console.log("Updating availability for facility:", id); // Debug log
        await updateAvailabilityMutation.mutateAsync({
          facilityId: supabaseFacility?.id || id || "",
          availability: availabilityData.map(item => ({
            ...item,
            facility_id: supabaseFacility?.id || id || ""
          })) as Database['public']['Tables']['facility_availability']['Row'][]
        });

        // Update the local state with the returned data to ensure UI reflects the saved state
        setEditedFacility({ ...updatedFacility });
        setImageVersion(prev => prev + 1); // Increment to force re-render after save

        toast.success("Lokale lagret!");
        setHasUnsavedChanges(false);
      }
    } catch (error: unknown) {
      console.error("Error saving facility:", error);
      const err = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error("Error details:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });

      // Show more detailed error message to user
      let errorMessage = "Feil ved lagring av lokale. Vennligst prøv igjen.";
      if (err.message) {
        errorMessage = `Feil ved lagring: ${err.message}`;
      }

      // If it's a Supabase error with more details, include those
      if (err.code && err.hint) {
        errorMessage += ` (Feilkode: ${err.code}. Hint: ${err.hint})`;
      }

      toast.error(errorMessage);
    }
  };

  const handleCancel = (): void => {
    if (hasUnsavedChanges) {
      if (window.confirm("Du har ulagrede endringer. Er du sikker på at du vil avbryte?")) {
        // Reset to original data from Supabase
        if (supabaseFacility) {
          setEditedFacility(supabaseFacility);
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
  // const _renderField = (field: {
  //   readonly id: string;
  //   readonly key: string;
  //   readonly label: string;
  //   readonly type: string;
  //   readonly visible: boolean;
  //   readonly value: string | number | boolean;
  //   readonly required?: boolean;
  //   readonly placeholder?: string;
  //   readonly options?: readonly { readonly value: string; readonly label: string }[];
  // }): JSX.Element | null => {
  //   if (!field.visible) return null;

  //   const getFieldValue = (): string | number => {
  //     if (field.key === 'capacity') return editedFacility?.capacity || 0;
  //     // These fields don't exist in the facility table, so we'll use the field config value
  //     // if (field.key === 'area') return editedFacility?.area || '';
  //     // if (field.key === 'pricePerHour') return editedFacility?.pricePerHour || 0;
  //     if (field.key === 'rating') return editedFacility?.rating || 0;
  //     if (field.key === 'reviewCount') return editedFacility?.review_count || 0;
  //     return field.value as string | number;
  //   };

  //   const handleFieldChange = (value: string | number | boolean): void => {
  //     if (field.key === 'capacity') {
  //       handleInputChange('capacity', typeof value === 'number' ? value : parseInt(String(value)) || 0);
  //     }
  //     // These fields don't exist in the facility table, so we'll update the field config instead
  //     // else if (field.key === 'area') {
  //     //   handleInputChange('area', String(value));
  //     // } else if (field.key === 'pricePerHour') {
  //     //   handleInputChange('pricePerHour', typeof value === 'number' ? value : parseInt(String(value)) || 0);
  //     // } 
  //     else if (field.key === 'rating') {
  //       handleInputChange('rating', typeof value === 'number' ? value : parseFloat(String(value)) || 0);
  //     } else if (field.key === 'reviewCount') {
  //       handleInputChange('review_count', typeof value === 'number' ? value : parseInt(String(value)) || 0);
  //     } else {
  //       // For custom fields, update the field config in store
  //       updateFieldValue(id || "", field.id, value);
  //     }
  //   };

  //   const getIcon = (): JSX.Element => {
  //     if (field.key === 'capacity') return <Users className="h-5 w-5 text-gray-400 mr-3" />;
  //     if (field.key === 'area') return <MapPin className="h-5 w-5 text-gray-400 mr-3" />;
  //     if (field.key === 'pricePerHour') return <Clock className="h-5 w-5 text-gray-400 mr-3" />;
  //     if (field.key === 'rating') return <span className="text-yellow-500 mr-3">★</span>;
  //     if (field.key === 'reviewCount') return <span className="text-gray-400 mr-3">📝</span>;
  //     return <span className="text-gray-400 mr-3">📋</span>;
  //   };

  //   const getUnit = (): string => {
  //     if (field.key === 'capacity') return 'personer';
  //     if (field.key === 'area') return 'm²';
  //     if (field.key === 'pricePerHour') return 'kr/time';
  //     if (field.key === 'rating') return '/5';
  //     if (field.key === 'reviewCount') return 'anmeldelser';
  //     return '';
  //   };

  //   return (
  //     <div key={field.id} className="flex items-center">
  //       {getIcon()}
  //       <div className="flex items-center">
  //         <span className="font-medium">{field.label}:</span>
  //         {field.type === 'number' ? (
  //           <Input
  //             type="number"
  //             value={getFieldValue()}
  //             onChange={(e) => handleFieldChange(parseInt(e.target.value) || 0)}
  //             className="ml-2 w-20"
  //             placeholder={`Sett inn ${field.label.toLowerCase()}...`}
  //           />
  //         ) : field.type === 'boolean' ? (
  //           <div className="ml-2 flex items-center">
  //             <Switch
  //               checked={Boolean(field.value)}
  //               onCheckedChange={(checked) => handleFieldChange(checked)}
  //             />
  //             <span className="ml-2 text-sm text-gray-600">
  //               {field.value ? 'Ja' : 'Nei'}
  //             </span>
  //           </div>
  //         ) : (
  //           <Input
  //             value={String(getFieldValue())}
  //             onChange={(e) => handleFieldChange(e.target.value)}
  //             className="ml-2 flex-1"
  //             placeholder={`Sett inn ${field.label.toLowerCase()}...`}
  //           />
  //         )}
  //         {getUnit() && (
  //           <span className="ml-2 text-gray-600 dark:text-gray-400">{getUnit()}</span>
  //         )}
  //       </div>
  //     </div>
  //   );
  // };


  const handleInputChange = (field: keyof Facility, value: string | number): void => {
    setEditedFacility((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: value
        // Removed lastUpdated and updatedBy as they're not part of the facility type
      };
    });
    setHasUnsavedChanges(true);
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // First try with Norway restriction
      let response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&country=NO&limit=1`
      );
      let data = await response.json();

      // If no results, try without country restriction
      if (!data.features || data.features.length === 0) {
        response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        );
        data = await response.json();
      }

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
    } catch {
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
        // Removed lastUpdated and updatedBy as they're not part of the facility type
      });

      // Try to geocode the address
      if (address.length > 5) { // Only geocode if address is long enough
        setIsGeocoding(true);
        const coordinates = await geocodeAddress(address);
        if (coordinates) {
          setEditedFacility(prev => prev ? {
            ...prev,
            location: coordinates,
            // Removed lastUpdated and updatedBy as they're not part of the facility type
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
                images: editedFacility.images ? [...editedFacility.images as string[], ...newImages] : newImages,
                // Removed lastUpdated and updatedBy as they're not part of the facility type
              });
              setHasUnsavedChanges(true);
              setImageVersion(prev => prev + 1); // Increment to force re-render
            }
          };
          reader.readAsDataURL(file);
        });
      }
    };

    input.click();
  };

  const handleRemoveImage = (index: number): void => {
    // Show confirmation modal before deleting image
    setImageToDeleteIndex(index);
    setShowDeleteImageModal(true);
  };

  const confirmDeleteImage = (): void => {
    if (imageToDeleteIndex === null) return;

    if (editedFacility && editedFacility.images) {
      const newImages = (editedFacility.images as string[]).filter((_: string, i: number) => i !== imageToDeleteIndex);
      setEditedFacility({
        ...editedFacility,
        images: newImages,
        // Removed lastUpdated and updatedBy as they're not part of the facility type
      });
      setHasUnsavedChanges(true);
      setImageVersion(prev => prev + 1); // Increment to force re-render
    }

    // Reset modal state
    setShowDeleteImageModal(false);
    setImageToDeleteIndex(null);
  };

  const cancelDeleteImage = (): void => {
    setShowDeleteImageModal(false);
    setImageToDeleteIndex(null);
  };

  const handleMoveImage = (fromIndex: number, toIndex: number): void => {
    if (editedFacility && editedFacility.images && fromIndex !== toIndex) {
      const newImages = [...editedFacility.images as string[]];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      setEditedFacility({
        ...editedFacility,
        images: newImages,
        // Removed lastUpdated and updatedBy as they're not part of the facility type
      });
      setHasUnsavedChanges(true);
      setImageVersion(prev => prev + 1); // Increment to force re-render
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
      name: "Navn på ny sone...",
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
    // Removed updating lastUpdated as it's not part of the facility type
    setHasUnsavedChanges(true);
  };

  const updateZone = (zoneId: string, field: keyof Zone, value: string | number | string[]): void => {
    storeUpdateZone(zoneId, { [field]: value });
    // Removed updating lastUpdated as it's not part of the facility type
    setHasUnsavedChanges(true);
  };

  const deleteZone = (zoneId: string): void => {
    storeDeleteZone(zoneId);
    // Removed updating lastUpdated as it's not part of the facility type
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
    // Removed updating lastUpdated as it's not part of the facility type
    setHasUnsavedChanges(true);
  };

  const updateFaqItem = (faqId: string, field: keyof IFaqItem, value: string): void => {
    setFaqItems(faqItems.map((faq: IFaqItem): IFaqItem =>
      faq.id === faqId ? { ...faq, [field]: value } : faq
    ));
    // Removed updating lastUpdated as it's not part of the facility type
    setHasUnsavedChanges(true);
  };

  const deleteFaqItem = (faqId: string): void => {
    setFaqItems(faqItems.filter((faq: IFaqItem): boolean => faq.id !== faqId));
    // Removed updating lastUpdated as it's not part of the facility type
    setHasUnsavedChanges(true);
  };

  // Rule management functions
  const addRule = (): void => {
    if (!editedFacility?.id) {
      toast.error('Lagre lokalet først før du legger til regler');
      return;
    }

    const maxSortOrder = facilityRules.length > 0
      ? Math.max(...facilityRules.map(r => r.sort_order))
      : -1;

    createRuleMutation.mutate({
      facility_id: editedFacility.id,
      rule_text: 'Ny regel...',
      rule_type: 'booking',
      is_required: true,
      sort_order: maxSortOrder + 1,
    }, {
      onSuccess: () => {
        toast.success('Regel lagt til');
      },
      onError: (error) => {
        console.error('Error creating rule:', error);
        toast.error('Kunne ikke legge til regel');
      },
    });
  };

  const updateRule = (ruleId: string, updates: Partial<FacilityRule>): void => {
    // Clear existing timer for this rule
    if (ruleUpdateTimers.current[ruleId]) {
      clearTimeout(ruleUpdateTimers.current[ruleId]);
    }

    // Set new timer to update after 500ms of no typing
    ruleUpdateTimers.current[ruleId] = setTimeout(() => {
      updateRuleMutation.mutate({
        id: ruleId,
        updates,
      }, {
        onSuccess: () => {
          // Silent success - no toast for better UX
        },
        onError: (error) => {
          console.error('Error updating rule:', error);
          toast.error('Kunne ikke oppdatere regel');
        },
      });
    }, 500); // Wait 500ms after user stops typing
  };

  const handleRuleTextChange = (ruleId: string, newText: string): void => {
    // Update local state immediately for responsive UI
    setRuleTexts(prev => ({
      ...prev,
      [ruleId]: newText
    }));
    // Debounce the database update
    updateRule(ruleId, { rule_text: newText });
  };

  const deleteRule = (ruleId: string): void => {
    if (!editedFacility?.id) return;

    deleteRuleMutation.mutate({
      id: ruleId,
      facilityId: editedFacility.id,
    }, {
      onSuccess: () => {
        toast.success('Regel slettet');
      },
      onError: (error) => {
        console.error('Error deleting rule:', error);
        toast.error('Kunne ikke slette regel');
      },
    });
  };

  const handleTagAdd = (newTag: string): void => {
    if (newTag.trim() && editedFacility) {
      const currentAmenities = editedFacility.amenities
        ? (Array.isArray(editedFacility.amenities)
          ? editedFacility.amenities
          : (typeof editedFacility.amenities === 'object' && editedFacility.amenities !== null
            ? Object.values(editedFacility.amenities) as string[]
            : []))
        : [];

      if (!currentAmenities.includes(newTag.trim())) {
        setEditedFacility((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            amenities: [...currentAmenities, newTag.trim()],
            // Removed lastUpdated and updatedBy as they're not part of the facility type
          };
        });
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleTagRemove = (tagToRemove: string): void => {
    setEditedFacility((prev) => {
      if (!prev) return null;
      const currentAmenities = prev.amenities
        ? (Array.isArray(prev.amenities)
          ? prev.amenities
          : (typeof prev.amenities === 'object' && prev.amenities !== null
            ? Object.values(prev.amenities) as string[]
            : []))
        : [];

      return {
        ...prev,
        amenities: currentAmenities.filter((amenity): boolean => {
          if (typeof amenity === 'string') {
            return amenity !== tagToRemove;
          }
          return true;
        }),
        // Removed lastUpdated and updatedBy as they're not part of the facility type
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

          {editedFacility.images && Array.isArray(editedFacility.images) && editedFacility.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" key={imageVersion}>
              {editedFacility.images.map((image: string | Database['public']['Tables']['facilities']['Row']['images'] | unknown, index: number) => (
                <div
                  key={`${typeof image === 'string' ? image.substring(0, 50) : JSON.stringify(image)}-${index}`}
                  className="relative group cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <img
                    src={typeof image === 'string' ? image : ''}
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
              <select
                value={editedFacility.facility_type || "møterom"}
                onChange={(e) => handleInputChange("facility_type", e.target.value)}
                className="bg-transparent border-none text-white p-0 h-auto text-sm font-medium"
              >
                <option value="møterom">Møterom</option>
                <option value="idrettshall">Idrettshall</option>
                <option value="konferanserom">Konferanserom</option>
                <option value="workshop">Workshop</option>
                <option value="studio">Studio</option>
                <option value="auditorium">Auditorium</option>
                <option value="fotballbane">Fotballbane</option>
                <option value="svømmehall">Svømmehall</option>
                <option value="kulturhus">Kulturhus</option>
                <option value="tennisbane">Tennisbane</option>
              </select>
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
                    value={editedFacility.address || ''}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="border-none p-0 h-auto text-lg pr-8"
                    placeholder="Sett inn adresseresse..."
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
                        value={typeof editedFacility.location === 'object' && editedFacility.location !== null && 'lat' in editedFacility.location ? (editedFacility.location.lat as number).toString() : ''}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          if (!isNaN(lat)) {
                            setEditedFacility(prev => prev ? {
                              ...prev,
                              location: { ...(typeof prev.location === 'object' ? prev.location : {}), lat },
                              // Removed lastUpdated and updatedBy as they're not part of the facility type
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
                        value={typeof editedFacility.location === 'object' && editedFacility.location !== null && 'lng' in editedFacility.location ? (editedFacility.location.lng as number).toString() : ''}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lng)) {
                            setEditedFacility(prev => prev ? {
                              ...prev,
                              location: { ...(typeof prev.location === 'object' ? prev.location : {}), lng },
                              // Removed lastUpdated and updatedBy as they're not part of the facility type
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

        {/* Full Width Tabs Layout */}
        <div className="mb-12">
          <div className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Generell info</TabsTrigger>
                <TabsTrigger value="zones">Soner</TabsTrigger>
                <TabsTrigger value="rules">Regler</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left column: Description and Capacity */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Beskrivelse</h3>
                        <textarea
                          value={editedFacility.description || ''}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-gray-700 leading-relaxed"
                          placeholder="Sett inn beskrivelse av lokalet..."
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Kapasitet</h3>
                        <div className="flex items-center">
                          <span className="text-gray-600 dark:text-gray-400 mr-2">Maks tillatt:</span>
                          <Input
                            type="number"
                            value={editedFacility.capacity || 0}
                            onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                            className="w-24"
                            placeholder="0"
                          />
                          <span className="ml-2 text-gray-600 dark:text-gray-400">personer</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Fasiliteter</h3>

                        <div className="space-y-4">
                          {editedFacility.amenities && Array.isArray(editedFacility.amenities) ? (
                            <div className="flex flex-wrap gap-2">
                              {editedFacility.amenities.map((amenity: string | unknown, index: number) => (
                                <Badge
                                  key={index}
                                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                >
                                  {typeof amenity === 'string' ? amenity : JSON.stringify(amenity)}
                                  <button
                                    onClick={() => typeof amenity === 'string' ? handleTagRemove(amenity) : null}
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                  >
                                    <XIcon className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          <div className="flex gap-2">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleTagAdd(e.target.value);
                                  e.target.value = ''; // Reset selection
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="">Velg en fasilitet...</option>
                              <option value="garderober">Garderober</option>
                              <option value="dusj">Dusj</option>
                              <option value="parkering">Parkering</option>
                              <option value="lyd-lys">Lyd/lys</option>
                              <option value="tribuner">Tribuner</option>
                              <option value="scene">Scene</option>
                              <option value="projektor">Projektor</option>
                              <option value="kjøkken">Kjøkken</option>
                              <option value="kunstgress">Kunstgress</option>
                              <option value="flombelysning">Flombelysning</option>
                              <option value="25m-basseng">25m basseng</option>
                              <option value="cafeteria">Cafeteria</option>
                              <option value="innendørs">Innendørs</option>
                              <option value="profesjonell-underlag">Profesjonell underlag</option>
                              <option value="utstyr-utleie">Utstyr utleie</option>
                              <option value="redningsutstyr">Redningsutstyr</option>
                              <option value="wifi">WiFi</option>
                              <option value="whiteboard">Whiteboard</option>
                              <option value="fotball">Fotball</option>
                              <option value="basketball">Basketball</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Contact Information and Opening Hours */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Kontaktinformasjon</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              E-post
                            </label>
                            <Input
                              value={contactInfo.email}
                              onChange={(e) => {
                                setContactInfo({ ...contactInfo, email: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full"
                              placeholder="Sett inn e-post adresse..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Telefon
                            </label>
                            <Input
                              value={contactInfo.phone}
                              onChange={(e) => {
                                setContactInfo({ ...contactInfo, phone: e.target.value });
                                setHasUnsavedChanges(true);
                              }}
                              className="w-full"
                              placeholder="Sett inn telefonnummer..."
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-3">Åpningstider</h3>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">Mandag-Fredag</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={openingHours.monday.start}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      monday: { ...prev.monday, start: e.target.value },
                                      tuesday: { ...prev.tuesday, start: e.target.value },
                                      wednesday: { ...prev.wednesday, start: e.target.value },
                                      thursday: { ...prev.thursday, start: e.target.value },
                                      friday: { ...prev.friday, start: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                                <span className="text-gray-500">-</span>
                                <Input
                                  type="time"
                                  value={openingHours.monday.end}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      monday: { ...prev.monday, end: e.target.value },
                                      tuesday: { ...prev.tuesday, end: e.target.value },
                                      wednesday: { ...prev.wednesday, end: e.target.value },
                                      thursday: { ...prev.thursday, end: e.target.value },
                                      friday: { ...prev.friday, end: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">Lørdag</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={openingHours.saturday.start}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      saturday: { ...prev.saturday, start: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                                <span className="text-gray-500">-</span>
                                <Input
                                  type="time"
                                  value={openingHours.saturday.end}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      saturday: { ...prev.saturday, end: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-300">Søndag</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="time"
                                  value={openingHours.sunday.start}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      sunday: { ...prev.sunday, start: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                                <span className="text-gray-500">-</span>
                                <Input
                                  type="time"
                                  value={openingHours.sunday.end}
                                  onChange={(e) => {
                                    setOpeningHours(prev => ({
                                      ...prev,
                                      sunday: { ...prev.sunday, end: e.target.value }
                                    }));
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="w-24 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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



              <TabsContent value="rules" className="space-y-6 mt-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Regler</h3>
                    <Button onClick={addRule} size="sm" disabled={!editedFacility?.id}>
                      <Plus className="w-4 h-4 mr-2" />
                      Legg til regel
                    </Button>
                  </div>

                  {!editedFacility?.id && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md">
                      Lagre lokalet først for å legge til regler.
                    </div>
                  )}

                  {editedFacility?.id && rulesLoading && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Laster regler...
                    </div>
                  )}

                  {editedFacility?.id && !rulesLoading && facilityRules.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Ingen regler definert. Legg til en regel for å begynne.
                    </div>
                  )}

                  {editedFacility?.id && !rulesLoading && facilityRules.length > 0 && (
                    <div className="space-y-4">
                      {facilityRules.map((rule) => (
                        <Card key={rule.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                  <select
                                    value={rule.rule_type}
                                    onChange={(e) => updateRule(rule.id, { rule_type: e.target.value as FacilityRule['rule_type'] })}
                                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                  >
                                    <option value="booking">Booking</option>
                                    <option value="safety">Sikkerhet</option>
                                    <option value="general">Generelt</option>
                                    <option value="cancellation">Kansellering</option>
                                  </select>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={rule.is_required}
                                      onChange={(e) => updateRule(rule.id, { is_required: e.target.checked })}
                                      className="rounded border-gray-300 dark:border-gray-600"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">Påkrevd</span>
                                  </label>
                                </div>
                                <textarea
                                  value={ruleTexts[rule.id] ?? rule.rule_text}
                                  onChange={(e) => handleRuleTextChange(rule.id, e.target.value)}
                                  className="w-full min-h-[80px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                  placeholder="Skriv regeltekst her..."
                                />
                              </div>
                              <Button
                                onClick={() => deleteRule(rule.id)}
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
        </div>
      </div>

      {/* Admin Settings Card at the bottom */}
      <div className="container mx-auto px-4 py-6 max-w-7xl mt-8">
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Opprettet</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {editedFacility.created_at ? new Date(editedFacility.created_at).toLocaleString('no-NO') : 'Ikke satt'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Når lokalet ble opprettet
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sist oppdatert</label>
                <div className="mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white">
                  {editedFacility.updated_at ? new Date(editedFacility.updated_at).toLocaleString('no-NO') : 'Ikke oppdatert'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Oppdateres automatisk ved endringer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteImageModal}
        onClose={cancelDeleteImage}
        onConfirm={confirmDeleteImage}
        title="Slett bilde"
        message="Er du sikker på at du vil slette dette bildet?"
        confirmText="Slett"
        cancelText="Avbryt"
      />

      {/* Field Configuration Modal */}
      <FieldConfigModal
        isOpen={showFieldConfigModal}
        onClose={() => setShowFieldConfigModal(false)}
        onSave={(fields) => {
          // Update each field in the store
          fields.forEach(field => {
            updateFieldConfig(id || "", field.id, field);
          });
          setHasUnsavedChanges(true);
        }}
        initialFields={fieldConfigs}
        facilityId={id || ""}
        onToggleVisibility={(fieldId) => toggleFieldVisibility(id || "", fieldId)}
        onUpdateValue={(fieldId, value) => updateFieldValue(id || "", fieldId, value)}
        onAddField={(field) => addCustomField(id || "", field)}
        onRemoveField={(fieldId) => removeField(id || "", fieldId)}
      />
    </div>
  );
};

export default FacilityEditPage;
