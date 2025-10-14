"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RequireRole } from "@/components/admin/guards/RequireRole";
import ViewToggle from "@/components/admin/facilities/ViewToggle";
import AdminFacilityCard from "@/components/admin/facilities/AdminFacilityCard";
import AdminFacilityListItem from "@/components/admin/facilities/AdminFacilityListItem";
import { useFacilityStore } from "@/stores/facilityStore";
import { Plus, Search, Filter, SortAsc, SortDesc, CheckSquare, Square, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TView = "list" | "grid" | "map" | "calendar";
type TSortBy = "name" | "capacity" | "lastUpdated" | "createdAt";
type TSortOrder = "asc" | "desc";

interface IFacilitiesPageProps {
  readonly children?: never;
}

const FacilitiesPage = (_props: IFacilitiesPageProps): JSX.Element => {
  const navigate = useNavigate();
  const [view, setView] = useState<TView>("grid");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<TSortBy>("name");
  const [sortOrder, setSortOrder] = useState<TSortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<readonly string[]>([]);
  const [typeFilter, setTypeFilter] = useState<readonly string[]>([]);
  const [capacityRange, setCapacityRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [selectedFacilities, setSelectedFacilities] = useState<readonly string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Use the facility store
  const { facilities, addFacility, getFacilityById, deleteFacility } = useFacilityStore();
  const adminFacilities = facilities;

  // Filter and sort facilities
  const filteredFacilities = adminFacilities
    .filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(facility.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(facility.type);
      const matchesCapacity = facility.capacity >= capacityRange.min && facility.capacity <= capacityRange.max;
      
      return matchesSearch && matchesStatus && matchesType && matchesCapacity;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "capacity":
          comparison = a.capacity - b.capacity;
          break;
        case "lastUpdated":
          // Handle relative time strings like "2 timer siden"
          const getTimeValue = (timeStr: string): number => {
            if (timeStr.includes("timer siden")) {
              const hours = parseInt(timeStr.replace(/\D/g, "")) || 0;
              return Date.now() - (hours * 60 * 60 * 1000);
            } else if (timeStr.includes("dager siden")) {
              const days = parseInt(timeStr.replace(/\D/g, "")) || 0;
              return Date.now() - (days * 24 * 60 * 60 * 1000);
            } else if (timeStr.includes("uker siden")) {
              const weeks = parseInt(timeStr.replace(/\D/g, "")) || 0;
              return Date.now() - (weeks * 7 * 24 * 60 * 60 * 1000);
            } else {
              // Try to parse as ISO date
              return new Date(timeStr).getTime() || 0;
            }
          };
          comparison = getTimeValue(a.lastUpdated) - getTimeValue(b.lastUpdated);
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleNewFacility = (): void => {
    navigate("/admin/facilities/new");
  };

  const handleDuplicateFacility = (facilityId: string): void => {
    const originalFacility = getFacilityById(facilityId);
    if (!originalFacility) return;

    // Create a copy with modified name and status
    const duplicatedFacility = {
      ...originalFacility,
      name: `${originalFacility.name} (Kopi)`,
      status: "draft" as const,
      lastUpdated: "Nå",
      updatedBy: "Admin User",
      // Remove id, createdAt, updatedAt to let addFacility generate new ones
      id: undefined as any,
      createdAt: undefined as any,
      updatedAt: undefined as any,
    };

    // Add the duplicated facility
    addFacility(duplicatedFacility);
    
    // Navigate to edit the new facility after a short delay to ensure it's added
    setTimeout(() => {
      const newFacilities = facilities;
      const newFacility = newFacilities.find(f => f.name === `${originalFacility.name} (Kopi)`);
      if (newFacility) {
        navigate(`/admin/facilities/${newFacility.id}/edit`);
      } else {
        // Fallback: navigate to facilities list if new facility not found
        navigate('/admin/facilities');
      }
    }, 100);
  };

  const handleViewChange = (newView: TView): void => {
    setView(newView);
  };

  const handleSelectFacility = (facilityId: string): void => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleSelectAll = (): void => {
    setSelectedFacilities(
      selectedFacilities.length === filteredFacilities.length 
        ? [] 
        : filteredFacilities.map(f => f.id)
    );
  };

  const handleBatchPublish = (): void => {
    // Update selected facilities to published status
    selectedFacilities.forEach(facilityId => {
      const facility = adminFacilities.find(f => f.id === facilityId);
      if (facility) {
        // TODO: Call API to update facility status
      }
    });
    
    // Clear selection after action
    setSelectedFacilities([]);
    
    // Show success message
  };

  const handleBatchUnpublish = (): void => {
    // Update selected facilities to draft status
    selectedFacilities.forEach(facilityId => {
      const facility = adminFacilities.find(f => f.id === facilityId);
      if (facility) {
        // TODO: Call API to update facility status
      }
    });
    
    // Clear selection after action
    setSelectedFacilities([]);
    
    // Show success message
  };

  const handleBatchArchive = (): void => {
    // Update selected facilities to archived status
    selectedFacilities.forEach(facilityId => {
      const facility = adminFacilities.find(f => f.id === facilityId);
      if (facility) {
        // TODO: Call API to update facility status
      }
    });
    
    // Clear selection after action
    setSelectedFacilities([]);
    
    // Show success message
  };

  const handleBatchDelete = (): void => {
    // Confirm deletion
    if (window.confirm(`Er du sikker på at du vil slette ${selectedFacilities.length} lokaler? Denne handlingen kan ikke angres.`)) {
      // Delete selected facilities
      selectedFacilities.forEach(facilityId => {
        deleteFacility(facilityId);
      });
      
      // Clear selection after action
      setSelectedFacilities([]);
      
      // Show success message
    }
  };

  const handleDeleteFacility = (facilityId: string): void => {
    const facility = getFacilityById(facilityId);
    if (!facility) return;

    // Confirm deletion
    if (window.confirm(`Er du sikker på at du vil slette "${facility.name}"? Denne handlingen kan ikke angres.`)) {
      deleteFacility(facilityId);
    }
  };

  const handleToggleStatus = (facilityId: string, newStatus: "published" | "draft" | "archived"): void => {
    // TODO: Implement status toggle
    // Status toggle logic will be implemented here
  };

  const handleSortChange = (newSortBy: TSortBy): void => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const handleStatusFilter = (status: string): void => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleTypeFilter = (type: string): void => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Get unique types for filter
  const uniqueTypes = Array.from(new Set(adminFacilities.map(f => f.type)));
  const uniqueStatuses = ["published", "draft", "archived"];

  return (
    <RequireRole roles={["org-admin","facility-manager"]}>
      <div className="space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lokaler
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administrer lokaler, soner og tilgjengelighet
            </p>
          </div>
          <Button
            onClick={handleNewFacility}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nytt lokale
          </Button>
        </header>

        {/* Controls Section */}
        <div className="space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            {/* Search Field */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Søk etter lokaler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
                {(statusFilter.length > 0 || typeFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {statusFilter.length + typeFilter.length}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  onClick={() => handleSortChange("name")}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "name" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  Navn
                  {sortBy === "name" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => handleSortChange("capacity")}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "capacity" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  Kapasitet
                  {sortBy === "capacity" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => handleSortChange("lastUpdated")}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "lastUpdated" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  Sist oppdatert
                  {sortBy === "lastUpdated" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* View Toggle */}
              <ViewToggle currentView={view} onViewChange={handleViewChange} />
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {uniqueStatuses.map(status => (
                        <Button
                          key={status}
                          onClick={() => handleStatusFilter(status)}
                          variant={statusFilter.includes(status) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {status === "published" ? "Publisert" : 
                           status === "draft" ? "Utkast" : "Arkivert"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTypes.map(type => (
                        <Button
                          key={type}
                          onClick={() => handleTypeFilter(type)}
                          variant={typeFilter.includes(type) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Capacity Range Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kapasitet</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={capacityRange.min}
                          onChange={(e) => setCapacityRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={capacityRange.max}
                          onChange={(e) => setCapacityRange(prev => ({ ...prev, max: parseInt(e.target.value) || 1000 }))}
                          className="w-20"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {filteredFacilities.length} lokaler matcher filteret
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Actions */}
          {selectedFacilities.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {selectedFacilities.length} lokaler valgt
                    </span>
                    <Button
                      onClick={handleSelectAll}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {selectedFacilities.length === filteredFacilities.length ? "Fjern alle" : "Velg alle"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleBatchPublish}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Publiser
                    </Button>
                    <Button
                      onClick={handleBatchUnpublish}
                      size="sm"
                      variant="outline"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      Upubliser
                    </Button>
                    <Button
                      onClick={handleBatchArchive}
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      Arkiver
                    </Button>
                    <Button
                      onClick={handleBatchDelete}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Slett
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredFacilities.length} lokaler funnet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {view === "grid" ? "Rutenett visning" : 
             view === "list" ? "Liste visning" :
             view === "map" ? "Kart visning" : "Kalender visning"}
          </p>
        </div>

        {/* Content Area */}
        {view === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => handleSelectFacility(facility.id)}
                    className="p-1 rounded bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    aria-label={`Velg ${facility.name}`}
                  >
                    {selectedFacilities.includes(facility.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <AdminFacilityCard 
                  facility={facility} 
                  onDelete={handleDeleteFacility}
                  onToggleStatus={handleToggleStatus}
                  onDuplicate={handleDuplicateFacility}
                />
              </div>
            ))}
          </div>
        )}

        {view === "list" && (
          <div className="space-y-4">
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="relative">
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => handleSelectFacility(facility.id)}
                    className="p-1 rounded bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    aria-label={`Velg ${facility.name}`}
                  >
                    {selectedFacilities.includes(facility.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <AdminFacilityListItem 
                  facility={facility} 
                  onDelete={handleDeleteFacility}
                  onToggleStatus={handleToggleStatus}
                  onDuplicate={handleDuplicateFacility}
                />
              </div>
            ))}
          </div>
        )}

        {view === "map" && (
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Kart visning kommer snart...
            </p>
          </div>
        )}

        {view === "calendar" && (
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Kalender visning kommer snart...
            </p>
          </div>
        )}

        {/* Empty State */}
        {filteredFacilities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Ingen lokaler funnet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Prøv å endre søkekriteriene eller opprett et nytt lokale.
            </p>
            <button
              onClick={handleNewFacility}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Opprett første lokale
            </button>
          </div>
        )}
      </div>
    </RequireRole>
  );
};

export default FacilitiesPage;