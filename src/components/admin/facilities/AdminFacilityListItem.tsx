"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Edit, Trash2, Eye, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FacilityMiniMap } from "@/components/map/FacilityMiniMap";

import type { IFacility } from '@/stores/facilityStore';

interface IAdminFacilityListItemProps {
  readonly facility: IFacility;
  readonly onDelete?: (facilityId: string) => void;
  readonly onToggleStatus?: (facilityId: string, newStatus: "published" | "draft" | "archived") => void;
}

const AdminFacilityListItem = ({ facility, onDelete, onToggleStatus }: IAdminFacilityListItemProps): JSX.Element => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

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

  const handleView = (e: React.MouseEvent): void => {
    e.stopPropagation();
    navigate(`/facilities/${facility.id}`);
  };

  const handleInlineEdit = (e: React.MouseEvent, field: string): void => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(field === "name" ? facility.name : field === "address" ? facility.address : facility.description);
  };

  const handleSaveEdit = (): void => {
    // TODO: Implement save functionality
    // Save edit logic will be implemented here
    setIsEditing(false);
  };

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setEditValue("");
  };

  const handleTagClick = (tag: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    // TODO: Open facility editing modal
    // Tag editing logic will be implemented here
  };

  return (
    <>
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-500 hover:translate-y-[-2px] border border-slate-200/60 dark:border-slate-700/60 shadow-md bg-white dark:bg-gray-800 cursor-pointer mb-3 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50" 
      onClick={handleCardClick}
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
      <CardContent className="p-0">
        <div className="grid grid-cols-12">
          {/* Image Section - 3 columns */}
          <div className="col-span-3 relative">
                  <div className="relative h-full overflow-hidden">
                    {facility.images[0] ? (
                      <img
                        src={facility.images[0]}
                        alt={facility.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open image upload modal
                      // Image upload logic will be implemented here
                    }}
                    className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-sm font-medium">Legg til bilde</span>
                  </button>
                </div>
              )}
              
              {/* Type badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600 text-white font-medium px-3 py-1">
                  {facility.type}
                </Badge>
              </div>

              {/* Admin Action Buttons - Identical to gridview */}
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
                  onClick={handleDelete}
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0 bg-red-500/90 backdrop-blur-sm shadow-lg hover:bg-red-600"
                  aria-label="Slett lokale"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content - 6 columns */}
          <div className="col-span-6 p-6 flex flex-col justify-between">
            {/* Top section */}
            <div>
              {/* Facility Name - Clickable for inline editing */}
              <div className="mb-3">
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
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded cursor-pointer transition-colors"
                    onClick={(e) => handleInlineEdit(e, "name")}
                  >
                    {facility.name}
                  </h3>
                )}
              </div>

              {/* Location - Clickable for inline editing */}
              <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/location">
                <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover/location:text-blue-500" />
                <span 
                  className="text-base font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded transition-colors"
                  onClick={(e) => handleInlineEdit(e, "address")}
                >
                  {facility.address}
                </span>
              </div>

              {/* Description - Clickable for inline editing */}
              <p 
                className="text-gray-700 dark:text-gray-300 text-base leading-relaxed mb-4 hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-1 rounded cursor-pointer transition-colors"
                onClick={(e) => handleInlineEdit(e, "description")}
              >
                {facility.description}
              </p>

              {/* Amenities Tags - Clickable for facility editing */}
              {facility.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {facility.amenities.slice(0, 4).map((amenity, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleTagClick(amenity, e)}
                      className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium px-3 py-1 text-sm rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      {amenity}
                    </button>
                  ))}
                  {facility.amenities.length > 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Open all amenities modal
                        // Show all amenities logic will be implemented here
                      }}
                      className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 font-medium px-3 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      +{facility.amenities.length - 4} mer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom section */}
            <div className="flex items-center justify-between">
              {/* Capacity */}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5" />
                <span className="font-medium text-base">{facility.capacity} personer</span>
              </div>

              {/* Admin Action Buttons - aligned to the right */}
            </div>
          </div>

          {/* Map Section - 3 columns */}
          <div className="col-span-3 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
            {facility.coordinates ? (
              <FacilityMiniMap 
                facility={{
                  ...facility,
                  location: facility.address,
                  pricePerHour: 0,
                  availability: {
                    monday: { start: "08:00", end: "22:00" },
                    tuesday: { start: "08:00", end: "22:00" },
                    wednesday: { start: "08:00", end: "22:00" },
                    thursday: { start: "08:00", end: "22:00" },
                    friday: { start: "08:00", end: "22:00" },
                    saturday: { start: "08:00", end: "22:00" },
                    sunday: { start: "08:00", end: "22:00" }
                  },
                  rating: 4.5,
                  reviewCount: 0
                }}
                mapboxToken="pk.eyJ1IjoiYW1pbjA3IiwiYSI6ImNtZzlqcjNnczBmMmsycXM2cm4xYzU0OGwifQ.1Vuiv_9pPIUY478LP3yccA"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Ingen koordinater</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog - Identical to gridview */}
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
            Er du sikker på at du vil slette <strong>{facility.name}</strong>? 
            Alle tilknyttede data vil bli permanent slettet.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              onClick={(): void => setShowDeleteConfirm(false)}
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
    </>
  );
};

export default AdminFacilityListItem;
