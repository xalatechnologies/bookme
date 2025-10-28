"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface FieldConfig {
  readonly id: string;
  readonly label: string;
  readonly key: string;
  readonly type: 'text' | 'number' | 'boolean';
  readonly visible: boolean;
  readonly value: string | number | boolean;
}

interface FieldConfigState {
  readonly fieldConfigs: readonly FieldConfig[];
  readonly facilityFieldConfigs: Record<string, readonly FieldConfig[]>;
}

interface FieldConfigActions {
  readonly updateFieldConfig: (facilityId: string, fieldId: string, updates: Partial<FieldConfig>) => void;
  readonly toggleFieldVisibility: (facilityId: string, fieldId: string) => void;
  readonly updateFieldValue: (facilityId: string, fieldId: string, value: string | number | boolean) => void;
  readonly addCustomField: (facilityId: string, field: Omit<FieldConfig, 'id'>) => void;
  readonly removeField: (facilityId: string, fieldId: string) => void;
  readonly getFieldConfigsForFacility: (facilityId: string) => readonly FieldConfig[];
  readonly resetToDefault: (facilityId: string) => void;
}

type FieldConfigStore = FieldConfigState & FieldConfigActions;

// Default field configurations
// Note: labels use translation keys from facilities namespace (facilities:fields.*)
const defaultFieldConfigs: readonly FieldConfig[] = [
  {
    id: 'capacity',
    label: 'facilities:fields.capacity',
    key: 'capacity',
    type: 'number',
    visible: true,
    value: 0
  },
  {
    id: 'area',
    label: 'facilities:fields.area',
    key: 'area',
    type: 'text',
    visible: false,
    value: ''
  },
  {
    id: 'pricePerHour',
    label: 'facilities:fields.pricePerHour',
    key: 'pricePerHour',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'rating',
    label: 'facilities:fields.rating',
    key: 'rating',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'reviewCount',
    label: 'facilities:fields.reviewCount',
    key: 'reviewCount',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'floor',
    label: 'facilities:fields.floor',
    key: 'floor',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'accessibility',
    label: 'facilities:fields.accessibility',
    key: 'accessibility',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'parking',
    label: 'facilities:fields.parking',
    key: 'parking',
    type: 'text',
    visible: false,
    value: ''
  },
  {
    id: 'wifi',
    label: 'facilities:fields.wifi',
    key: 'wifi',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'projector',
    label: 'facilities:fields.projector',
    key: 'projector',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'whiteboard',
    label: 'facilities:fields.whiteboard',
    key: 'whiteboard',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'soundSystem',
    label: 'facilities:fields.soundSystem',
    key: 'soundSystem',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'airConditioning',
    label: 'facilities:fields.airConditioning',
    key: 'airConditioning',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'heating',
    label: 'facilities:fields.heating',
    key: 'heating',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'naturalLight',
    label: 'facilities:fields.naturalLight',
    key: 'naturalLight',
    type: 'boolean',
    visible: false,
    value: false
  },
  {
    id: 'windows',
    label: 'facilities:fields.windows',
    key: 'windows',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'doors',
    label: 'facilities:fields.doors',
    key: 'doors',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'ceilingHeight',
    label: 'facilities:fields.ceilingHeight',
    key: 'ceilingHeight',
    type: 'number',
    visible: false,
    value: 0
  },
  {
    id: 'floorType',
    label: 'facilities:fields.floorType',
    key: 'floorType',
    type: 'text',
    visible: false,
    value: ''
  },
  {
    id: 'wallColor',
    label: 'facilities:fields.wallColor',
    key: 'wallColor',
    type: 'text',
    visible: false,
    value: ''
  }
] as const;

export const useFieldConfigStore = create<FieldConfigStore>()(
  devtools(
    persist(
      (set, get) => ({
        fieldConfigs: defaultFieldConfigs,
        facilityFieldConfigs: {},

        updateFieldConfig: (facilityId: string, fieldId: string, updates: Partial<FieldConfig>): void => {
          set((state) => {
            const facilityConfigs = state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
            const updatedConfigs = facilityConfigs.map((field) =>
              field.id === fieldId ? { ...field, ...updates } : field
            );

            return {
              facilityFieldConfigs: {
                ...state.facilityFieldConfigs,
                [facilityId]: updatedConfigs
              }
            };
          });
        },

        toggleFieldVisibility: (facilityId: string, fieldId: string): void => {
          set((state) => {
            const facilityConfigs = state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
            const updatedConfigs = facilityConfigs.map((field) =>
              field.id === fieldId ? { ...field, visible: !field.visible } : field
            );

            return {
              facilityFieldConfigs: {
                ...state.facilityFieldConfigs,
                [facilityId]: updatedConfigs
              }
            };
          });
        },

        updateFieldValue: (facilityId: string, fieldId: string, value: string | number | boolean): void => {
          set((state) => {
            const facilityConfigs = state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
            const updatedConfigs = facilityConfigs.map((field) =>
              field.id === fieldId ? { ...field, value } : field
            );

            return {
              facilityFieldConfigs: {
                ...state.facilityFieldConfigs,
                [facilityId]: updatedConfigs
              }
            };
          });
        },

        addCustomField: (facilityId: string, field: Omit<FieldConfig, 'id'>): void => {
          set((state) => {
            const facilityConfigs = state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
            const newField: FieldConfig = {
              ...field,
              id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };

            return {
              facilityFieldConfigs: {
                ...state.facilityFieldConfigs,
                [facilityId]: [...facilityConfigs, newField]
              }
            };
          });
        },

        removeField: (facilityId: string, fieldId: string): void => {
          set((state) => {
            const facilityConfigs = state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
            const updatedConfigs = facilityConfigs.filter((field) => field.id !== fieldId);

            return {
              facilityFieldConfigs: {
                ...state.facilityFieldConfigs,
                [facilityId]: updatedConfigs
              }
            };
          });
        },

        getFieldConfigsForFacility: (facilityId: string): readonly FieldConfig[] => {
          const state = get();
          return state.facilityFieldConfigs[facilityId] || defaultFieldConfigs;
        },

        resetToDefault: (facilityId: string): void => {
          set((state) => ({
            facilityFieldConfigs: {
              ...state.facilityFieldConfigs,
              [facilityId]: defaultFieldConfigs
            }
          }));
        }
      }),
      {
        name: "field-config-store",
        partialize: (state) => ({
          facilityFieldConfigs: state.facilityFieldConfigs
        })
      }
    ),
    {
      name: "field-config-store"
    }
  )
);
