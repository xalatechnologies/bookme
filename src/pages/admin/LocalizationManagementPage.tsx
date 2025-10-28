"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RequireRole } from "@/components/features/auth/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Plus, Edit, Trash2, Save } from "lucide-react";
import { useLocalizedDbValues } from "@/hooks/useLocalizedDbValues";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ENTITY_TYPES = [
  { value: 'facility_type', label: 'Facility Types' },
  { value: 'location', label: 'Locations' },
  { value: 'amenity', label: 'Amenities' },
  { value: 'accessibility', label: 'Accessibility Features' },
  { value: 'capacity_range', label: 'Capacity Ranges' },
  { value: 'booking_status', label: 'Booking Statuses' },
  { value: 'ticket_status', label: 'Ticket Statuses' },
  { value: 'ticket_priority', label: 'Ticket Priorities' },
  { value: 'ticket_category', label: 'Ticket Categories' },
] as const;

interface LocalizedValueForm {
  entity_key: string;
  label_en: string;
  label_no: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

const LocalizationManagementPage = (): JSX.Element => {
  const { t, i18n } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [selectedEntityType, setSelectedEntityType] = useState<string>('facility_type');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<{ entity_key: string; entity_type: string } | null>(null);
  const [formData, setFormData] = useState<LocalizedValueForm>({
    entity_key: '',
    label_en: '',
    label_no: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  const { data: values, isLoading } = useLocalizedDbValues(selectedEntityType);

  const entityTypeLabel = ENTITY_TYPES.find(t => t.value === selectedEntityType)?.label || selectedEntityType;

  const handleOpenAddDialog = () => {
    setEditingValue(null);
    setFormData({
      entity_key: '',
      label_en: '',
      label_no: '',
      description: '',
      sort_order: (values?.length || 0) + 1,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (entityKey: string) => {
    const enValue = values?.find(v => v.entity_key === entityKey);
    const currentLang = i18n.language;
    
    // Need to fetch both EN and NO versions
    Promise.all([
      supabase
        .from('localized_db_values')
        .select('*')
        .eq('entity_type', selectedEntityType)
        .eq('entity_key', entityKey)
        .eq('language_code', 'en')
        .single(),
      supabase
        .from('localized_db_values')
        .select('*')
        .eq('entity_type', selectedEntityType)
        .eq('entity_key', entityKey)
        .eq('language_code', 'no')
        .single(),
    ]).then(([enResult, noResult]) => {
      if (enResult.data && noResult.data) {
        setEditingValue({ entity_key: entityKey, entity_type: selectedEntityType });
        setFormData({
          entity_key: entityKey,
          label_en: enResult.data.label || '',
          label_no: noResult.data.label || '',
          description: enResult.data.description || '',
          sort_order: enResult.data.sort_order || 0,
          is_active: enResult.data.is_active ?? true,
        });
        setIsDialogOpen(true);
      }
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.entity_key || !formData.label_en || !formData.label_no) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Insert/update English translation
      const { error: enError } = await supabase
        .from('localized_db_values')
        .upsert({
          entity_type: selectedEntityType,
          entity_key: formData.entity_key,
          language_code: 'en',
          label: formData.label_en,
          description: formData.description || null,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
        }, {
          onConflict: 'entity_type,entity_key,language_code',
        });

      if (enError) throw enError;

      // Insert/update Norwegian translation
      const { error: noError } = await supabase
        .from('localized_db_values')
        .upsert({
          entity_type: selectedEntityType,
          entity_key: formData.entity_key,
          language_code: 'no',
          label: formData.label_no,
          description: formData.description || null,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
        }, {
          onConflict: 'entity_type,entity_key,language_code',
        });

      if (noError) throw noError;

      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['localized-db-values', selectedEntityType] });
      
      toast.success('Localized value saved successfully');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving localized value:', error);
      toast.error('Failed to save localized value');
    }
  };

  const handleDelete = async (entityKey: string) => {
    if (!confirm('Are you sure you want to delete this value? This will remove translations in all languages.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('localized_db_values')
        .delete()
        .eq('entity_type', selectedEntityType)
        .eq('entity_key', entityKey);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['localized-db-values', selectedEntityType] });
      toast.success('Localized value deleted successfully');
    } catch (error) {
      console.error('Error deleting localized value:', error);
      toast.error('Failed to delete localized value');
    }
  };

  const handleToggleActive = async (entityKey: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('localized_db_values')
        .update({ is_active: !currentActive })
        .eq('entity_type', selectedEntityType)
        .eq('entity_key', entityKey);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['localized-db-values', selectedEntityType] });
      toast.success('Value status updated');
    } catch (error) {
      console.error('Error updating value status:', error);
      toast.error('Failed to update value status');
    }
  };

  return (
    <RequireRole roles={["org-admin", "platform_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Localization Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage translated values for facility types, locations, and other dynamic content
          </p>
        </header>

        {/* Entity Type Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Select Entity Type</CardTitle>
              <Button onClick={handleOpenAddDialog} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Value
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Values List */}
        <Card>
          <CardHeader>
            <CardTitle>{entityTypeLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : !values || values.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No values found. Click "Add New Value" to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {values.map((value) => (
                  <div
                    key={value.entity_key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{value.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {value.entity_key}
                        </Badge>
                      </div>
                      {value.description && (
                        <p className="text-sm text-gray-500 mt-1">{value.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={value.sort_order ? "default" : "secondary"}>
                        Order: {value.sort_order || 'N/A'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(value.entity_key)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(value.entity_key)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingValue ? 'Edit Localized Value' : 'Add New Localized Value'}
              </DialogTitle>
              <DialogDescription>
                Enter translations for both English and Norwegian
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entity_key">Entity Key *</Label>
                <Input
                  id="entity_key"
                  value={formData.entity_key}
                  onChange={(e) => setFormData({ ...formData, entity_key: e.target.value })}
                  placeholder="e.g., basketball_court"
                  disabled={!!editingValue}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label_en">English Label *</Label>
                  <Input
                    id="label_en"
                    value={formData.label_en}
                    onChange={(e) => setFormData({ ...formData, label_en: e.target.value })}
                    placeholder="Basketball Court"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label_no">Norwegian Label *</Label>
                  <Input
                    id="label_no"
                    value={formData.label_no}
                    onChange={(e) => setFormData({ ...formData, label_no: e.target.value })}
                    placeholder="Basketballbane"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireRole>
  );
};

export default LocalizationManagementPage;

