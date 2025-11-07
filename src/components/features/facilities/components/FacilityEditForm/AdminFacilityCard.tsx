"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { MapPin, Trash2, Eye, Plus, User, Clock, Users, AlertTriangle, CheckCircle, XCircle, Copy, Edit, Save, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Database } from '@/types/database';

type Facility = Database['public']['Tables']['facilities']['Row'] & {
  amenities: string[];
  images: string[];
  type: string;
  owner?: string;
  lastUpdated?: string;
  updatedBy?: string;
};

interface IAdminFacilityCardProps {
  readonly facility: Facility;
  readonly onDelete?: (facilityId: string) => void;
  readonly onToggleStatus?: (facilityId: string, newStatus: "published" | "draft" | "archived") => void;
  readonly onDuplicate?: (facilityId: string) => void;
}

const AdminFacilityCard = ({ facility, onDelete, onToggleStatus, onDuplicate }: IAdminFacilityCardProps): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation(['facility']);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>("");
  const [editField, setEditField] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    address: string;
    description: string;
    capacity: number;
    type: string;
    amenities: string[];
  }>({
    name: facility.name || '',
    address: facility.address || '',
    description: facility.description || '',
    capacity: facility.capacity,
    type: facility.facility_type,
    amenities: facility.amenities ? [...(facility.amenities as string[])] : []
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "published":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "draft":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "archived":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "published":
        return "Publisert";
      case "draft":
        return "Utkast";
      case "archived":
        return "Arkivert";
      default:
        return "Ukjent";
    }
  };

  const handleCardClick = (): void => {
    navigate(`/admin/facilities/${facility.id}/edit`);
  };

  const handleEdit = (e: React.MouseEvent): void => {
    e.stopPropagation();
    navigate(`/admin/facilities/${facility.id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (): void => {
    onDelete?.(facility.id);
    setShowDeleteConfirm(false);
  };

  const handleToggleStatus = (e: React.MouseEvent): void => {
    e.stopPropagation();
    const newStatus = facility.status === "published" ? "draft" : "published";
    onToggleStatus?.(facility.id, newStatus);
  };

  const handleView = (e: React.MouseEvent): void => {
    e.stopPropagation();
    navigate(`/facilities/${facility.id}`);
  };

  const handleDuplicate = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(facility.id);
    }
  };

  const handleInlineEdit = (e: React.MouseEvent, field: string): void => {
    e.stopPropagation();
    setIsEditing(true);
    setEditField(field);
    setEditValue(field === "name" ? (facility.name || '') : field === "address" ? (facility.address || '') : (facility.description || ''));
  };

  const handleSaveEdit = (): void => {
    try {
      // Simulate saving to backend/localStorage
      const updatedFacility = {
        ...facility,
        [editField]: editValue
      };
      
      // Save to localStorage (simulating backend)
      const facilities = JSON.parse(localStorage.getItem('adminFacilities') || '[]');
      const updatedFacilities = facilities.map((f: any) => 
        f.id === facility.id ? updatedFacility : f
      );
      localStorage.setItem('adminFacilities', JSON.stringify(updatedFacilities));
      
      // Show success message
      toast.success(t('facility:admin.messages.updated_success'));
      setIsEditing(false);
      setEditField("");
    } catch (error) {
      console.error('Failed to save facility:', error);
      toast.error(t('facility:admin.messages.save_error'));
    }
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setEditValue("");
    setEditField("");
  };

  const handleTagClick = (tag: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleEditModal = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleSaveModalEdit = (): void => {
    try {
      const updatedFacility = {
        ...facility,
        ...editFormData
      };
      
      // Save to localStorage (simulating backend)
      const facilities = JSON.parse(localStorage.getItem('adminFacilities') || '[]');
      const updatedFacilities = facilities.map((f: any) => 
        f.id === facility.id ? updatedFacility : f
      );
      localStorage.setItem('adminFacilities', JSON.stringify(updatedFacilities));

      toast.success(t('facility:admin.messages.updated_success'));
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to save facility:', error);
      toast.error(t('facility:admin.messages.save_error'));
    }
  };

  const handleImageUpload = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowImageModal(true);
  };

  const handleImageUploadSubmit = (files: FileList | null): void => {
    if (!files || files.length === 0) return;
    
    try {
      // Simulate image upload
      const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      const updatedFacility = {
        ...facility,
        images: [...(facility.images as string[] || []), ...imageUrls]
      };
      
      // Save to localStorage (simulating backend)
      const facilities = JSON.parse(localStorage.getItem('adminFacilities') || '[]');
      const updatedFacilities = facilities.map((f: any) => 
        f.id === facility.id ? updatedFacility : f
      );
      localStorage.setItem('adminFacilities', JSON.stringify(updatedFacilities));

      toast.success(t('facility:admin.messages.images_uploaded_success'));
      setShowImageModal(false);
    } catch (error) {
      console.error('Failed to upload images:', error);
      toast.error(t('facility:admin.messages.image_upload_error'));
    }
  };

  const handleShowAllAmenities = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setShowAmenitiesModal(true);
  };

  return (
    <>
    <Card 
      className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] border-0 shadow-lg bg-white dark:bg-gray-800 relative cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 h-full flex flex-col"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Se detaljer for ${facility.name} på ${facility.address}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Section - Identical to frontend */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={(facility.images && (facility.images as string[])[0]) || '/placeholder.svg'}
                alt={facility.name || ''}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
        
        {/* Type badge - Same as frontend */}
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white font-medium px-3 py-1 rounded-full text-sm">
            {facility.facility_type}
          </span>
        </div>

        {/* Admin Action Buttons - Improved design */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            onClick={handleView}
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
            aria-label="Se i hovedapplikasjon"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDuplicate}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-blue-500/90 backdrop-blur-sm shadow-lg hover:bg-blue-600 text-white border-blue-600"
            aria-label="Dupliser lokale"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDelete}
            size="sm"
            variant="destructive"
            className="h-8 w-8 p-0 bg-red-500/90 backdrop-blur-sm shadow-lg hover:bg-red-600"
            aria-label="Slett lokale"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

              {/* Add image button for missing images */}
              {!(facility.images && (facility.images as string[])[0]) && (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <button
              onClick={handleImageUpload}
              className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Legg til bilde</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Section - Identical structure to frontend */}
      <div className="flex-1 flex flex-col p-6">
        {/* Facility Name - Clickable for inline editing */}
        <div className="mb-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                autoFocus
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
            </div>
          ) : (
            <h3 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded cursor-pointer transition-colors"
              onClick={(e) => handleInlineEdit(e, "name")}
            >
              {facility.name || ''}
            </h3>
          )}
        </div>

        {/* Location - Clickable for inline editing */}
        <div className="flex items-center gap-3 mb-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/location">
          <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover/location:text-blue-500" />
          <span 
            className="text-base font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded transition-colors"
            onClick={(e) => handleInlineEdit(e, "address")}
          >
            {facility.address || ''}
          </span>
        </div>

        {/* Description - Clickable for inline editing */}
        <p 
          className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded cursor-pointer transition-colors"
          onClick={(e) => handleInlineEdit(e, "description")}
        >
          {facility.description || ''}
        </p>

        {/* Amenities Tags - Clickable for facility editing */}
        {facility.amenities && (facility.amenities as string[]).length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {(facility.amenities as string[]).slice(0, 3).map((amenity, index) => (
              <button
                key={index}
                onClick={(e) => handleTagClick(amenity, e)}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium px-3 py-1 text-sm rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {amenity}
              </button>
            ))}
            {(facility.amenities as string[]).length > 3 && (
              <button
                onClick={handleShowAllAmenities}
                className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 font-medium px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                +{(facility.amenities as string[]).length - 3} mer
              </button>
            )}
          </div>
        )}

        {/* Capacity */}
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400 mt-auto">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5" />
            <span className="text-base font-medium">Kapasitet: {facility.capacity}</span>
          </div>
          <Button
            onClick={handleEditModal}
            size="sm"
            variant="outline"
            className="h-8 px-3"
          >
            <Edit className="h-4 w-4 mr-1" />
            Rediger
          </Button>
        </div>

        {/* Admin-only metadata - Improved design */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4 space-y-3">
          {/* Status Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Status:</span>
            <Button
              onClick={handleToggleStatus}
              size="sm"
              variant={facility.status === "published" ? "default" : "outline"}
              className={`text-xs h-6 ${
                facility.status === "published" 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {facility.status === "published" ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Publisert
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Upublisert
                </>
              )}
            </Button>
          </div>
          
          {/* Owner */}
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Eier: {facility.owner || ''}
            </span>
          </div>
          
          {/* Last Updated */}
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Sist oppdatert: {facility.lastUpdated || ''}
            </span>
          </div>

          {/* Updated By */}
          {facility.updatedBy && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Oppdatert av: {facility.updatedBy || ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div
        className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 transition-colors duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </Card>

    {/* Delete Confirmation Dialog */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Slett lokale
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Denne handlingen kan ikke angres
              </p>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Er du sikker på at du vil slette <strong>{facility.name || ''}</strong>? 
            Alle tilknyttede data vil bli permanent slettet.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              size="sm"
            >
              Avbryt
            </Button>
            <Button
              onClick={confirmDelete}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Slett
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Modal */}
    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Rediger fasilitet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Navn
            </Label>
            <Input
              id="edit-name"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-address" className="text-right">
              Adresse
            </Label>
            <Input
              id="edit-address"
              value={editFormData.address}
              onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right">
              Type
            </Label>
            <Input
              id="edit-type"
              value={editFormData.type}
              onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-capacity" className="text-right">
              Kapasitet
            </Label>
            <Input
              id="edit-capacity"
              type="number"
              value={editFormData.capacity}
              onChange={(e) => setEditFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-description" className="text-right pt-2">
              Beskrivelse
            </Label>
            <Textarea
              id="edit-description"
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(false)}
          >
            Avbryt
          </Button>
          <Button onClick={handleSaveModalEdit}>
            <Save className="h-4 w-4 mr-2" />
            Lagre endringer
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Image Upload Modal */}
    <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Last opp bilder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUploadSubmit(e.target.files)}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Plus className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Klikk for å velge bilder
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF opptil 10MB
              </span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowImageModal(false)}
          >
            Avbryt
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* All Amenities Modal */}
    <Dialog open={showAmenitiesModal} onOpenChange={setShowAmenitiesModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alle fasiliteter</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-wrap gap-2">
            {facility.amenities && (facility.amenities as string[]).map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium px-3 py-1 text-sm rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAmenitiesModal(false)}
          >
            Lukk
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AdminFacilityCard;
