"use client";

import React, { useState, useCallback } from "react";
import {
  Languages,
  Plus,
  Search,
  Download,
  Upload,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Filter,
  Globe,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocalizationManagement } from "@/hooks/features/localization/useLocalizationManagement";
import type { ITranslationKey, IExportOptions } from "@/hooks/features/localization/useLocalizationManagement";

interface ILocalizationManagementPageProps {
  readonly children?: never;
}

const LocalizationManagementPage = (_props: ILocalizationManagementPageProps): JSX.Element => {
  const {
    translationKeys,
    languages,
    namespaces,
    selectedLanguage,
    selectedNamespace,
    filter,
    isLoading,
    stats,
    isModalOpen,
    editingKey,
    setFilter,
    setSelectedLanguage,
    setSelectedNamespace,
    openModal,
    closeModal,
    createTranslationKey,
    updateTranslationKey,
    deleteTranslationKey,
    exportTranslations,
    importTranslations,
    refreshData,
  } = useLocalizationManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyMissing, setShowOnlyMissing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Form state for create/edit modal
  const [formData, setFormData] = useState<Partial<ITranslationKey>>({
    namespace: "common",
    key: "",
    translations: {},
    description: "",
  });

  const handleSearch = useCallback(() => {
    setFilter({
      search: searchTerm,
      namespace: selectedNamespace || undefined,
      language: selectedLanguage,
      onlyMissing: showOnlyMissing,
    });
  }, [searchTerm, selectedNamespace, selectedLanguage, showOnlyMissing, setFilter]);

  const handleOpenCreateModal = useCallback(() => {
    setFormData({
      namespace: selectedNamespace || "common",
      key: "",
      translations: {},
      description: "",
    });
    openModal();
  }, [selectedNamespace, openModal]);

  const handleOpenEditModal = useCallback(
    (key: ITranslationKey) => {
      setFormData(key);
      openModal(key);
    },
    [openModal]
  );

  const handleSaveTranslation = useCallback(async () => {
    try {
      if (editingKey) {
        await updateTranslationKey(editingKey.id, formData);
      } else {
        await createTranslationKey(formData);
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save translation:", error);
    }
  }, [editingKey, formData, createTranslationKey, updateTranslationKey, closeModal]);

  const handleDeleteTranslation = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this translation key?")) {
        try {
          await deleteTranslationKey(id);
        } catch (error) {
          console.error("Failed to delete translation:", error);
        }
      }
    },
    [deleteTranslationKey]
  );

  const handleExport = useCallback(
    async (options: IExportOptions) => {
      try {
        await exportTranslations(options);
        setIsExportModalOpen(false);
      } catch (error) {
        console.error("Failed to export translations:", error);
      }
    },
    [exportTranslations]
  );

  const handleImportFile = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const result = await importTranslations(file);
        alert(
          `Import completed!\nSuccess: ${result.success}\nFailed: ${result.failed}\n${
            result.errors.length > 0 ? "\nErrors:\n" + result.errors.join("\n") : ""
          }`
        );
      } catch (error) {
        console.error("Failed to import translations:", error);
      }
    },
    [importTranslations]
  );

  const renderStatsCards = (): JSX.Element => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Keys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalKeys}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {languages.slice(0, 3).map((lang) => (
          <Card key={lang.code}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lang.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.completionPercentage[lang.code]}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.translatedKeys[lang.code]}/{stats.totalKeys} translated
                  </p>
                </div>
                <Globe className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${stats.completionPercentage[lang.code]}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFilters = (): JSX.Element => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Search keys or translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                  aria-label="Search translation keys"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace</Label>
              <Select
                value={selectedNamespace || "all"}
                onValueChange={(value) => setSelectedNamespace(value === "all" ? null : value)}
              >
                <SelectTrigger id="namespace" aria-label="Select namespace">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger id="language" aria-label="Select language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.native_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex items-center justify-between h-10 px-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                <span className="text-sm">Only Missing</span>
                <Switch checked={showOnlyMissing} onCheckedChange={setShowOnlyMissing} />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedNamespace(null);
                setShowOnlyMissing(false);
                setFilter({});
              }}
            >
              Clear Filters
            </Button>
            <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTranslationsList = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (translationKeys.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Languages className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No translations found</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {filter.search || filter.namespace
                ? "Try adjusting your filters"
                : "Start by creating your first translation key"}
            </p>
            <Button onClick={handleOpenCreateModal} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Translation Key
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Translation Keys ({translationKeys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translationKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{key.namespace}</Badge>
                      <code className="text-sm font-mono text-gray-900 dark:text-white">{key.key}</code>
                    </div>
                    {key.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{key.description}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {languages.map((lang) => (
                        <div key={lang.code} className="flex items-start gap-2">
                          <Badge className="flex-shrink-0">{lang.code.toUpperCase()}</Badge>
                          <div className="flex-1 min-w-0">
                            {key.translations[lang.code] ? (
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {key.translations[lang.code]}
                              </p>
                            ) : (
                              <div className="flex items-center gap-1 text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span className="text-xs">Missing</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(key)}
                      aria-label={`Edit ${key.key}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTranslation(key.id)}
                      aria-label={`Delete ${key.key}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCreateEditModal = (): JSX.Element => {
    if (!isModalOpen) return <></>;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle id="modal-title" className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {editingKey ? "Edit Translation Key" : "Create Translation Key"}
            </CardTitle>
            <CardDescription>
              {editingKey ? "Update the translation key and its values" : "Add a new translation key to the system"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-namespace">Namespace</Label>
                <Select
                  value={formData.namespace || "common"}
                  onValueChange={(value) => setFormData({ ...formData, namespace: value })}
                >
                  <SelectTrigger id="modal-namespace">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {namespaces.map((ns) => (
                      <SelectItem key={ns} value={ns}>
                        {ns}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-key">Key</Label>
                <Input
                  id="modal-key"
                  placeholder="e.g., button.save"
                  value={formData.key || ""}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-description">Description (Optional)</Label>
              <Input
                id="modal-description"
                placeholder="Describe where this translation is used"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <Label>Translations</Label>
              {languages.map((lang) => (
                <div key={lang.code} className="space-y-2">
                  <Label htmlFor={`modal-translation-${lang.code}`}>
                    {lang.name} ({lang.native_name})
                    {lang.is_default && <Badge className="ml-2">Default</Badge>}
                  </Label>
                  <Input
                    id={`modal-translation-${lang.code}`}
                    placeholder={`Enter ${lang.name} translation...`}
                    value={(formData.translations?.[lang.code] as string) || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        translations: {
                          ...formData.translations,
                          [lang.code]: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleSaveTranslation} disabled={!formData.key} className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                {editingKey ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={closeModal} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderExportModal = (): JSX.Element => {
    if (!isExportModalOpen) return <></>;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-labelledby="export-modal-title"
        aria-modal="true"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle id="export-modal-title" className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Translations
            </CardTitle>
            <CardDescription>Choose export format and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button onClick={() => handleExport({ format: "json" })} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Languages className="h-8 w-8 text-blue-600" />
            Localization Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage translation keys, add languages, and export/import translations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="import-file">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <Upload className="h-4 w-4" />
                Import
              </span>
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json,.csv"
              onChange={handleImportFile}
              className="hidden"
              aria-label="Import translations file"
            />
          </label>
          <Button variant="outline" onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Translation
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Filters */}
      {renderFilters()}

      {/* Translations List */}
      {renderTranslationsList()}

      {/* Create/Edit Modal */}
      {renderCreateEditModal()}

      {/* Export Modal */}
      {renderExportModal()}
    </div>
  );
};

export default LocalizationManagementPage;
