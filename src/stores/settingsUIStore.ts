/**
 * Settings UI State Management Store
 *
 * Manages UI-specific state for settings pages.
 * Separated from business logic and data fetching.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type TSettingsTab = 'general' | 'email' | 'payment' | 'notifications' | 'security';

interface ISettingsUIState {
  // Tab state
  readonly activeTab: TSettingsTab;

  // Form state
  readonly unsavedChanges: boolean;
  readonly isSaving: boolean;
  readonly saveSuccess: boolean;
  readonly saveError: string | null;

  // Validation state
  readonly validationErrors: Record<string, string[]>;

  // Modal state
  readonly modals: {
    readonly saveConfirmation: boolean;
    readonly discardChanges: boolean;
    readonly testEmail: boolean;
    readonly testPayment: boolean;
  };

  // Collapsed sections for better UX
  readonly collapsedSections: readonly string[];

  // Actions
  readonly setActiveTab: (tab: TSettingsTab) => void;

  readonly setUnsavedChanges: (hasChanges: boolean) => void;
  readonly setIsSaving: (saving: boolean) => void;
  readonly setSaveSuccess: (success: boolean) => void;
  readonly setSaveError: (error: string | null) => void;

  readonly setValidationErrors: (errors: Record<string, string[]>) => void;
  readonly clearValidationErrors: () => void;

  readonly openModal: (modal: keyof ISettingsUIState['modals']) => void;
  readonly closeModal: (modal: keyof ISettingsUIState['modals']) => void;
  readonly closeAllModals: () => void;

  readonly toggleSection: (section: string) => void;
  readonly expandAllSections: () => void;
  readonly collapseAllSections: () => void;

  readonly resetAll: () => void;
}

const initialState = {
  activeTab: 'general' as TSettingsTab,
  unsavedChanges: false,
  isSaving: false,
  saveSuccess: false,
  saveError: null as string | null,
  validationErrors: {} as Record<string, string[]>,
  modals: {
    saveConfirmation: false,
    discardChanges: false,
    testEmail: false,
    testPayment: false,
  } as const,
  collapsedSections: [] as readonly string[],
};

export const useSettingsUIStore = create<ISettingsUIState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Tab actions
        setActiveTab: (activeTab) => set({ activeTab }),

        // Form state actions
        setUnsavedChanges: (unsavedChanges) => set({ unsavedChanges }),
        setIsSaving: (isSaving) => set({ isSaving }),
        setSaveSuccess: (saveSuccess) => {
          set({ saveSuccess });
          if (saveSuccess) {
            // Auto-hide success message after 3 seconds
            setTimeout(() => {
              set({ saveSuccess: false });
            }, 3000);
          }
        },
        setSaveError: (saveError) => set({ saveError }),

        // Validation actions
        setValidationErrors: (validationErrors) => set({ validationErrors }),
        clearValidationErrors: () => set({ validationErrors: {} }),

        // Modal actions
        openModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: true },
          })),

        closeModal: (modal) =>
          set((state) => ({
            modals: { ...state.modals, [modal]: false },
          })),

        closeAllModals: () =>
          set({
            modals: {
              saveConfirmation: false,
              discardChanges: false,
              testEmail: false,
              testPayment: false,
            },
          }),

        // Section collapse actions
        toggleSection: (section) =>
          set((state) => ({
            collapsedSections: state.collapsedSections.includes(section)
              ? state.collapsedSections.filter((s) => s !== section)
              : [...state.collapsedSections, section],
          })),

        expandAllSections: () => set({ collapsedSections: [] }),

        collapseAllSections: () =>
          set({
            collapsedSections: [
              'general',
              'email',
              'payment',
              'notifications',
              'security',
            ],
          }),

        // Reset action
        resetAll: () => set(initialState),
      }),
      {
        name: 'settings-ui-store',
        version: 1,
        partialize: (state) => ({
          activeTab: state.activeTab,
          collapsedSections: state.collapsedSections,
        }),
      }
    ),
    { name: 'SettingsUIStore' }
  )
);
