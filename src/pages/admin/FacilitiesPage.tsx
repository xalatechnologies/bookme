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
  const [selectedFacilities, setSelectedFacilities] = useState<readonly string[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Use the facility store
  const { facilities } = useFacilityStore();
  const adminFacilities = facilities;

  // Filter and sort facilities
  const filteredFacilities = adminFacilities
    .filter(facility => {
      const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(facility.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(facility.type);
      
      return matchesSearch && matchesStatus && matchesType;
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
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
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
    // TODO: Implement batch publish
    // Batch publish logic will be implemented here
  };

  const handleBatchUnpublish = (): void => {
    // TODO: Implement batch unpublish
    // Batch unpublish logic will be implemented here
  };

  const handleBatchDelete = (): void => {
    // TODO: Implement batch delete
    // Batch delete logic will be implemented here
  };

  const handleDeleteFacility = (facilityId: string): void => {
    // TODO: Implement delete
    // Delete facility logic will be implemented here
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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