/**
 * Localization Management Hook
 *
 * Provides comprehensive localization management capabilities including:
 * - CRUD operations for translation keys
 * - Multi-language support
 * - Import/export functionality
 * - Search and filtering
 * - Real-time preview
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  LocalizedDbValue,
  LocalizedEntityType,
  LocalizedValueFormData,
  LanguageCode,
} from '@/types/localization';

// ============================================================================
// Types
// ============================================================================

export interface ITranslationKey {
  readonly id: string;
  readonly namespace: string;
  readonly key: string;
  readonly translations: Record<LanguageCode, string>;
  readonly description?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ILanguage {
  readonly code: LanguageCode;
  readonly name: string;
  readonly native_name: string;
  readonly is_default: boolean;
  readonly is_active: boolean;
}

export interface ITranslationFilter {
  readonly namespace?: string;
  readonly language?: LanguageCode;
  readonly search?: string;
  readonly onlyMissing?: boolean;
}

export interface IExportOptions {
  readonly format: 'json' | 'csv' | 'excel';
  readonly languages?: readonly LanguageCode[];
  readonly namespaces?: readonly string[];
}

export interface IImportResult {
  readonly success: number;
  readonly failed: number;
  readonly errors: readonly string[];
}

export interface IUseLocalizationManagementReturn {
  // Data
  readonly translationKeys: readonly ITranslationKey[];
  readonly languages: readonly ILanguage[];
  readonly namespaces: readonly string[];
  readonly selectedLanguage: LanguageCode;
  readonly selectedNamespace: string | null;
  readonly filter: ITranslationFilter;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // UI State
  readonly isModalOpen: boolean;
  readonly editingKey: ITranslationKey | null;
  readonly previewKey: ITranslationKey | null;

  // Statistics
  readonly stats: {
    readonly totalKeys: number;
    readonly translatedKeys: Record<LanguageCode, number>;
    readonly missingTranslations: Record<LanguageCode, number>;
    readonly completionPercentage: Record<LanguageCode, number>;
  };

  // Actions
  readonly setFilter: (filter: Partial<ITranslationFilter>) => void;
  readonly setSelectedLanguage: (language: LanguageCode) => void;
  readonly setSelectedNamespace: (namespace: string | null) => void;
  readonly openModal: (key?: ITranslationKey) => void;
  readonly closeModal: () => void;
  readonly createTranslationKey: (data: Partial<ITranslationKey>) => Promise<void>;
  readonly updateTranslationKey: (id: string, data: Partial<ITranslationKey>) => Promise<void>;
  readonly deleteTranslationKey: (id: string) => Promise<void>;
  readonly addLanguage: (language: Omit<ILanguage, 'is_default'>) => Promise<void>;
  readonly removeLanguage: (code: LanguageCode) => Promise<void>;
  readonly exportTranslations: (options: IExportOptions) => Promise<void>;
  readonly importTranslations: (file: File) => Promise<IImportResult>;
  readonly previewTranslation: (key: ITranslationKey) => void;
  readonly closePreview: () => void;
  readonly refreshData: () => Promise<void>;
}

// ============================================================================
// Mock Data (Replace with actual API calls)
// ============================================================================

const MOCK_LANGUAGES: readonly ILanguage[] = [
  { code: 'en', name: 'English', native_name: 'English', is_default: true, is_active: true },
  { code: 'no', name: 'Norwegian', native_name: 'Norsk', is_default: false, is_active: true },
];

const MOCK_TRANSLATION_KEYS: ITranslationKey[] = [
  {
    id: '1',
    namespace: 'common',
    key: 'welcome',
    translations: { en: 'Welcome', no: 'Velkommen' },
    description: 'Welcome message displayed on home page',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    namespace: 'common',
    key: 'logout',
    translations: { en: 'Logout', no: 'Logg ut' },
    description: 'Logout button text',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    namespace: 'facility',
    key: 'booking.title',
    translations: { en: 'Book Facility', no: 'Bestill anlegg' },
    description: 'Facility booking page title',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    namespace: 'facility',
    key: 'booking.confirm',
    translations: { en: 'Confirm Booking', no: '' },
    description: 'Booking confirmation button',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// Hook Implementation
// ============================================================================

export const useLocalizationManagement = (): IUseLocalizationManagementReturn => {
  const { i18n } = useTranslation();

  // State
  const [translationKeys, setTranslationKeys] = useState<readonly ITranslationKey[]>(MOCK_TRANSLATION_KEYS);
  const [languages, setLanguages] = useState<readonly ILanguage[]>(MOCK_LANGUAGES);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [filter, setFilterState] = useState<ITranslationFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ITranslationKey | null>(null);
  const [previewKey, setPreviewKey] = useState<ITranslationKey | null>(null);

  // Computed values
  const namespaces = useMemo(
    () => Array.from(new Set(translationKeys.map((key) => key.namespace))).sort(),
    [translationKeys]
  );

  const filteredKeys = useMemo(() => {
    let filtered = [...translationKeys];

    if (filter.namespace) {
      filtered = filtered.filter((key) => key.namespace === filter.namespace);
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (key) =>
          key.key.toLowerCase().includes(searchLower) ||
          Object.values(key.translations).some((translation) =>
            translation.toLowerCase().includes(searchLower)
          ) ||
          key.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.onlyMissing && filter.language) {
      filtered = filtered.filter(
        (key) => !key.translations[filter.language as LanguageCode] ||
          key.translations[filter.language as LanguageCode].trim() === ''
      );
    }

    return filtered;
  }, [translationKeys, filter]);

  const stats = useMemo(() => {
    const totalKeys = translationKeys.length;
    const translatedKeys: Record<string, number> = {};
    const missingTranslations: Record<string, number> = {};
    const completionPercentage: Record<string, number> = {};

    languages.forEach((lang) => {
      const translated = translationKeys.filter(
        (key) => key.translations[lang.code] && key.translations[lang.code].trim() !== ''
      ).length;

      translatedKeys[lang.code] = translated;
      missingTranslations[lang.code] = totalKeys - translated;
      completionPercentage[lang.code] = totalKeys > 0 ? Math.round((translated / totalKeys) * 100) : 0;
    });

    return {
      totalKeys,
      translatedKeys,
      missingTranslations,
      completionPercentage,
    };
  }, [translationKeys, languages]);

  // Actions
  const setFilter = useCallback((newFilter: Partial<ITranslationFilter>) => {
    setFilterState((prev) => ({ ...prev, ...newFilter }));
  }, []);

  const openModal = useCallback((key?: ITranslationKey) => {
    setEditingKey(key || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingKey(null);
  }, []);

  const createTranslationKey = useCallback(async (data: Partial<ITranslationKey>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const newKey: ITranslationKey = {
        id: Date.now().toString(),
        namespace: data.namespace || 'common',
        key: data.key || '',
        translations: data.translations || {},
        description: data.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTranslationKeys((prev) => [...prev, newKey]);
      closeModal();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const updateTranslationKey = useCallback(async (id: string, data: Partial<ITranslationKey>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      setTranslationKeys((prev) =>
        prev.map((key) =>
          key.id === id
            ? {
                ...key,
                ...data,
                updated_at: new Date().toISOString(),
              }
            : key
        )
      );
      closeModal();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [closeModal]);

  const deleteTranslationKey = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      setTranslationKeys((prev) => prev.filter((key) => key.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addLanguage = useCallback(async (language: Omit<ILanguage, 'is_default'>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      const newLanguage: ILanguage = {
        ...language,
        is_default: false,
      };

      setLanguages((prev) => [...prev, newLanguage]);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeLanguage = useCallback(async (code: LanguageCode): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Prevent removing default language
      const language = languages.find((lang) => lang.code === code);
      if (language?.is_default) {
        throw new Error('Cannot remove default language');
      }

      // TODO: Replace with actual API call
      setLanguages((prev) => prev.filter((lang) => lang.code !== code));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [languages]);

  const exportTranslations = useCallback(async (options: IExportOptions): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement actual export functionality
      console.log('Exporting translations with options:', options);

      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create download
      const exportData = {
        languages: options.languages || languages.map((lang) => lang.code),
        namespaces: options.namespaces || namespaces,
        keys: translationKeys,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${new Date().toISOString().split('T')[0]}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [languages, namespaces, translationKeys]);

  const importTranslations = useCallback(async (file: File): Promise<IImportResult> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement actual import functionality
      console.log('Importing translations from file:', file.name);

      // Simulate import
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        success: 10,
        failed: 2,
        errors: ['Invalid key format in line 5', 'Duplicate key: common.error'],
      };
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const previewTranslation = useCallback((key: ITranslationKey) => {
    setPreviewKey(key);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewKey(null);
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Reload data from API
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Data
    translationKeys: filteredKeys,
    languages,
    namespaces,
    selectedLanguage,
    selectedNamespace,
    filter,
    isLoading,
    error,

    // UI State
    isModalOpen,
    editingKey,
    previewKey,

    // Statistics
    stats,

    // Actions
    setFilter,
    setSelectedLanguage,
    setSelectedNamespace,
    openModal,
    closeModal,
    createTranslationKey,
    updateTranslationKey,
    deleteTranslationKey,
    addLanguage,
    removeLanguage,
    exportTranslations,
    importTranslations,
    previewTranslation,
    closePreview,
    refreshData,
  };
};
