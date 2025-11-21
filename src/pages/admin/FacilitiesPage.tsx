import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import ViewToggle from "@/components/features/facilities/components/FacilityEditForm/ViewToggle";
import AdminFacilityCard from "@/components/features/facilities/components/FacilityEditForm/AdminFacilityCard";
import AdminFacilityListItem from "@/components/features/facilities/components/FacilityEditForm/AdminFacilityListItem";
import { FacilityEditForm } from "@/components/features/facilities/components/FacilityEditForm/FacilityEditForm";
import { Plus, Search, Filter, SortAsc, SortDesc, CheckSquare, Square, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapView } from "@/components/features/facilities/components/FacilityMap/MapView";
import { useFacilityManagement } from "@/hooks/features/useFacilityManagement";
import type { Database } from "@/types/database";
import type { FacilityWithCoords } from "@/types/facility";

type Facility = Database['public']['Tables']['facilities']['Row'];
type TView = "grid" | "list" | "map";

// Extended facility type for AdminFacilityCard component
type AdminFacility = Facility & {
  amenities: string[];
  images: string[];
  type: string;
};

interface IFacilitiesPageProps {
  readonly children?: never;
}

const FacilitiesPage = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _props: IFacilitiesPageProps
): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation('admin');
  
  // ALL business logic and state management delegated to this hook
  const {
    filteredFacilities,
    isLoading,
    uniqueTypes,
    uniqueStatuses,
    view,
    showFilters,
    searchTerm,
    statusFilter,
    typeFilter,
    capacityRange,
    sortBy,
    sortOrder,
    selectedFacilityIds,
    setView,
    toggleFilters,
    setSearchTerm,
    toggleStatusFilter,
    toggleTypeFilter,
    setCapacityRange,
    toggleSort,
    toggleFacilitySelection,
    selectAllFacilities,
    clearSelection,
    deleteFacility,
    batchDeleteFacilities,
    updateFacilityStatus,
    batchUpdateStatus,
  } = useFacilityManagement();

  // Local UI-only state (not business logic)
  const [selectedFacility, setSelectedFacility] = useState<FacilityWithCoords | null>(null);

  // Event handlers (delegation only, no logic)
  const handleNewFacility = (): void => {
    navigate("/admin/facilities/new");
  };

  const handleDuplicateFacility = (facilityId: string): void => {
    // TODO: Implement duplicate functionality
    navigate("/admin/facilities/new");
  };

  const handleViewChange = (newView: TView): void => {
    setView(newView);
    if (newView !== "map") {
      setSelectedFacility(null);
    }
  };

  const handleSelectAll = (): void => {
    if (selectedFacilityIds.length === filteredFacilities.length) {
      clearSelection();
    } else {
      selectAllFacilities();
    }
  };

  const handleBatchPublish = async (): Promise<void> => {
    try {
      await batchUpdateStatus(selectedFacilityIds, 'published');
    } catch (error) {
      console.error('Failed to publish facilities:', error);
    }
  };

  const handleBatchUnpublish = async (): Promise<void> => {
    try {
      await batchUpdateStatus(selectedFacilityIds, 'draft');
    } catch (error) {
      console.error('Failed to unpublish facilities:', error);
    }
  };

  const handleBatchArchive = async (): Promise<void> => {
    try {
      await batchUpdateStatus(selectedFacilityIds, 'archived');
    } catch (error) {
      console.error('Failed to archive facilities:', error);
    }
  };

  const handleBatchDelete = async (): Promise<void> => {
    // Using a generic confirmation message since the specific key doesn't exist
    if (window.confirm(t('messages.warning.facility_delete', { ns: 'admin' }))) {
      try {
        await batchDeleteFacilities(selectedFacilityIds);
      } catch (error) {
        console.error('Failed to delete facilities:', error);
      }
    }
  };

  const handleDeleteFacility = async (facilityId: string): Promise<void> => {
    const facility = filteredFacilities.find(f => f.id === facilityId);
    if (!facility) return;

    // Using a generic confirmation message since the specific key doesn't exist
    if (window.confirm(t('messages.warning.facility_delete', { ns: 'admin' }))) {
      try {
        await deleteFacility(facilityId);
      } catch (error) {
        console.error('Failed to delete facility:', error);
      }
    }
  };

  const handleToggleStatus = async (facilityId: string, newStatus: "published" | "draft" | "archived"): Promise<void> => {
    try {
      await updateFacilityStatus(facilityId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleMarkerClick = (facility: FacilityWithCoords): void => {
    setSelectedFacility(facility);
  };

  const handleCloseEditForm = (): void => {
    setSelectedFacility(null);
  };

  const handleFacilityUpdate = (): void => {
    // Refresh happens automatically via React Query
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Function to get status translation
  const getStatusTranslation = (status: string): string => {
    // Use a switch statement with direct string returns to avoid TypeScript errors
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'confirmed':
        return 'Confirmed';
      case 'draft':
        return 'Draft';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      case 'deleted':
        return 'Deleted';
      case 'expired':
        return 'Expired';
      case 'scheduled':
        return 'Scheduled';
      case 'inProgress':
        return 'In Progress';
      case 'onHold':
        return 'On Hold';
      case 'failed':
        return 'Failed';
      case 'success':
        return 'Success';
      default:
        return status;
    }
  };

  return (
    <RequireRole minRole="admin">
      <div className="space-y-6">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('pages.facilities.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('pages.facilities.subtitle')}
            </p>
          </div>
          <PrimaryButton
            onClick={handleNewFacility}
          >
            <Plus className="w-4 h-4" />
            {t('pages.facilities.create_new')}
          </PrimaryButton>
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
                placeholder={t('pages.facilities.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {t('common.actions.filter')}
                {(statusFilter.length > 0 || typeFilter.length > 0) && (
                  <Badge variant="secondary" className="ml-1">
                    {statusFilter.length + typeFilter.length}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-1">
                <Button
                  onClick={() => toggleSort("name" as any)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "name" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  {t('pages.facilities.sort.name')}
                  {sortBy === "name" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => toggleSort("capacity" as any)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "capacity" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  {t('pages.facilities.sort.capacity')}
                  {sortBy === "capacity" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  onClick={() => toggleSort("updated_at" as any)}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${sortBy === "updated_at" ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                >
                  {t('pages.facilities.sort.last_updated')}
                  {sortBy === "updated_at" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
              </div>

              {/* View Toggle */}
              <ViewToggle currentView={view as TView} onViewChange={handleViewChange} />
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
                          onClick={() => toggleStatusFilter(status)}
                          variant={statusFilter.includes(status) ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {getStatusTranslation(status)}
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
                          onClick={() => toggleTypeFilter(type)}
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
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('pages.facilities.sort.capacity')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={capacityRange.min}
                          onChange={(e) => setCapacityRange({ ...capacityRange, min: parseInt(e.target.value) || 0 })}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={capacityRange.max}
                          onChange={(e) => setCapacityRange({ ...capacityRange, max: parseInt(e.target.value) || 1000 })}
                          className="w-20"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('pages.facilities.results.count', { count: filteredFacilities.length })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch Actions */}
          {selectedFacilityIds.length > 0 && (
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {selectedFacilityIds.length} selected
                    </span>
                    <Button
                      onClick={handleSelectAll}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {selectedFacilityIds.length === filteredFacilities.length ? 
                        "Clear all" : 
                        "Select all"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleBatchPublish}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t('common.actions.edit')}
                    </Button>
                    <Button
                      onClick={handleBatchUnpublish}
                      size="sm"
                      variant="outline"
                    >
                      <EyeOff className="w-4 h-4 mr-1" />
                      {t('common.actions.cancel')}
                    </Button>
                    <Button
                      onClick={handleBatchArchive}
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Square className="w-4 h-4 mr-1" />
                      {t('common.status.inactive')}
                    </Button>
                    <Button
                      onClick={handleBatchDelete}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('common.actions.delete')}
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
            {t('pages.facilities.results.count', { count: filteredFacilities.length })}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {view === "grid" ? t('pages.facilities.view_modes.grid') :
             view === "list" ? t('pages.facilities.view_modes.list') : 
             "Map View"}
          </p>
        </div>

        {/* Content Area */}
        {view === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFacilities.map((facility) => (
              <div key={facility.id} className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleFacilitySelection(facility.id)}
                    className="p-1 rounded bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    aria-label={`Select ${facility.name}`}
                  >
                    {selectedFacilityIds.includes(facility.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <AdminFacilityCard
                  facility={{
                    ...facility,
                    amenities: (facility.amenities as string[]) || [],
                    images: (facility.images as string[]) || [],
                    type: facility.facility_type || ''
                  } as AdminFacility}
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
                <div className="absolute top-2 left-2 z-10">
                  <button
                    onClick={() => toggleFacilitySelection(facility.id)}
                    className="p-1 rounded bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
                    aria-label={`Select ${facility.name}`}
                  >
                    {selectedFacilityIds.includes(facility.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <AdminFacilityListItem
                  facility={{
                    ...facility,
                    amenities: (facility.amenities as string[]) || [],
                    images: (facility.images as string[]) || [],
                    type: facility.facility_type || ''
                  } as AdminFacility}
                  onDelete={handleDeleteFacility}
                  onToggleStatus={handleToggleStatus}
                  onDuplicate={handleDuplicateFacility}
                />
              </div>
            ))}
          </div>
        )}

        {view === "map" && (
          <div className="flex gap-4">
            <div className={selectedFacility ? "w-2/3" : "w-full"}>
              <MapView
                facilityType="all"
                location="all"
                viewMode={view as "grid" | "map" | "list"}
                setViewMode={setView}
                showAllFacilities={true}
                showHeader={false}
                onMarkerClick={handleMarkerClick}
              />
            </div>

            {selectedFacility && (
              <div className="w-1/3">
                <FacilityEditForm
                  facility={selectedFacility as any}
                  onClose={handleCloseEditForm}
                  onUpdate={handleFacilityUpdate}
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredFacilities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('pages.bookings.empty.no_bookings')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('pages.bookings.empty.try_different_criteria')}
            </p>
            <PrimaryButton
              onClick={handleNewFacility}
            >
              <Plus className="w-4 h-4" />
              {t('pages.facilities.create_new')}
            </PrimaryButton>
          </div>
        )}
      </div>
    </RequireRole>
  );
};

export default FacilitiesPage;