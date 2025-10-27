"use client";

import React, { useState } from 'react';
import { X, Plus, Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FieldConfig {
  readonly id: string;
  readonly label: string;
  readonly key: string;
  readonly type: 'text' | 'number' | 'boolean';
  readonly visible: boolean;
  readonly value: string | number | boolean;
}

interface FieldConfigModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (fields: readonly FieldConfig[]) => void;
  readonly initialFields: readonly FieldConfig[];
  readonly facilityId: string;
  readonly onToggleVisibility: (fieldId: string) => void;
  readonly onUpdateValue: (fieldId: string, value: string | number | boolean) => void;
  readonly onAddField: (field: Omit<FieldConfig, 'id'>) => void;
  readonly onRemoveField: (fieldId: string) => void;
}

export const FieldConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialFields,
  facilityId,
  onToggleVisibility,
  onUpdateValue,
  onAddField,
  onRemoveField
}: FieldConfigModalProps): JSX.Element => {
  const [fields, setFields] = useState<readonly FieldConfig[]>(initialFields);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<{
    label: string;
    key: string;
    type: 'text' | 'number' | 'boolean';
    value: string | number | boolean;
  }>({
    label: '',
    key: '',
    type: 'text',
    value: ''
  });

  const handleToggleVisibility = (fieldId: string): void => {
    onToggleVisibility(fieldId);
    setFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, visible: !field.visible }
        : field
    ));
  };

  const handleFieldValueChange = (fieldId: string, value: string | number | boolean): void => {
    onUpdateValue(fieldId, value);
    setFields(prev => prev.map(field => 
      field.id === fieldId 
        ? { ...field, value: value as any }
        : field
    ));
  };

  const handleAddField = (): void => {
    if (newField.label && newField.key) {
      const field: Omit<FieldConfig, 'id'> = {
        label: newField.label,
        key: newField.key,
        type: newField.type,
        visible: true,
        value: newField.type === 'number' ? 0 : newField.type === 'boolean' ? false : ''
      };
      
      onAddField(field);
      setNewField({ label: '', key: '', type: 'text', value: '' });
      setIsAddingField(false);
    }
  };

  const handleRemoveField = (fieldId: string): void => {
    onRemoveField(fieldId);
    setFields(prev => prev.filter(field => field.id !== fieldId));
  };

  const handleSave = (): void => {
    onSave(fields);
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Konfigurer informasjonsfelt</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[70vh] space-y-6">
          {/* Existing Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Eksisterende felt</h3>
            {fields.map((field) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{field.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {field.key}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {field.type}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Verdi:</Label>
                        {field.type === 'text' && (
                          <Input
                            value={String(field.value)}
                            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                            className="text-sm"
                          />
                        )}
                        {field.type === 'number' && (
                          <Input
                            type="number"
                            value={Number(field.value)}
                            onChange={(e) => handleFieldValueChange(field.id, parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        )}
                        {field.type === 'boolean' && (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => handleFieldValueChange(field.id, checked)}
                            />
                            <Label className="text-sm">
                              {field.value ? 'Ja' : 'Nei'}
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(field.id)}
                      className={field.visible ? 'text-green-600' : 'text-gray-400'}
                    >
                      {field.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    
                    {field.key.startsWith('custom-') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(field.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add New Field */}
          {isAddingField ? (
            <Card className="border-2 border-dashed border-blue-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Legg til nytt felt</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="field-label">Feltnavn</Label>
                      <Input
                        id="field-label"
                        value={newField.label}
                        onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                        placeholder="F.eks. 'Etasje nummer'"
                      />
                    </div>
                    <div>
                      <Label htmlFor="field-key">Nøkkel</Label>
                      <Input
                        id="field-key"
                        value={newField.key}
                        onChange={(e) => setNewField(prev => ({ ...prev, key: e.target.value }))}
                        placeholder="F.eks. 'floorNumber'"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="field-type">Type</Label>
                    <Select
                      value={newField.type}
                      onValueChange={(value: 'text' | 'number' | 'boolean') => 
                        setNewField(prev => ({ 
                          ...prev, 
                          type: value,
                          value: value === 'number' ? 0 : value === 'boolean' ? false : ''
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Tekst</SelectItem>
                        <SelectItem value="number">Nummer</SelectItem>
                        <SelectItem value="boolean">Ja/Nei</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddField} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Legg til
                    </Button>
                    <Button 
                      onClick={() => setIsAddingField(false)} 
                      variant="outline" 
                      size="sm"
                    >
                      Avbryt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              onClick={() => setIsAddingField(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til nytt informasjonsfelt
            </Button>
          )}
        </CardContent>

        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Avbryt
          </Button>
          <Button onClick={handleSave}>
            Lagre endringer
          </Button>
        </div>
      </Card>
    </div>
  );
};
