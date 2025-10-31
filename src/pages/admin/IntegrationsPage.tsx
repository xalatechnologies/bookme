"use client";

import React, { useState, useCallback } from "react";
import {
  Plug,
  Plus,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  TestTube,
  Trash2,
  Filter,
  RefreshCw,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useIntegrationsManagement } from "@/hooks/features/integrations/useIntegrationsManagement";
import type {
  IIntegrationWithProvider,
  IntegrationCategory,
  IConfigField,
} from "@/hooks/features/integrations/useIntegrationsManagement";

interface IIntegrationsPageProps {
  readonly children?: never;
}

const IntegrationsPage = (_props: IIntegrationsPageProps): JSX.Element => {
  const {
    integrations,
    availableProviders,
    categories,
    selectedCategory,
    isLoading,
    stats,
    isModalOpen,
    isTestingConnection,
    selectedIntegration,
    testResult,
    setSelectedCategory,
    openModal,
    closeModal,
    configureIntegration,
    updateIntegration,
    deleteIntegration,
    toggleIntegration,
    testConnection,
    refreshData,
  } = useIntegrationsManagement();

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [configFormData, setConfigFormData] = useState<Record<string, unknown>>({});
  const [isConfigMode, setIsConfigMode] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const handleOpenConfigureModal = useCallback(
    (integration?: IIntegrationWithProvider) => {
      if (integration) {
        setConfigFormData(integration.config);
        setIsConfigMode(false);
      } else {
        setConfigFormData({});
        setIsConfigMode(true);
        setSelectedProvider(null);
      }
      openModal(integration);
    },
    [openModal]
  );

  const handleSaveConfiguration = useCallback(async () => {
    try {
      if (isConfigMode && selectedProvider) {
        await configureIntegration(selectedProvider, configFormData);
      } else if (selectedIntegration) {
        await updateIntegration(selectedIntegration.id, configFormData);
      }
      setConfigFormData({});
      setSelectedProvider(null);
      closeModal();
    } catch (error) {
      console.error("Failed to save integration:", error);
    }
  }, [
    isConfigMode,
    selectedProvider,
    selectedIntegration,
    configFormData,
    configureIntegration,
    updateIntegration,
    closeModal,
  ]);

  const handleDeleteIntegration = useCallback(
    async (id: string) => {
      if (window.confirm("Are you sure you want to delete this integration?")) {
        try {
          await deleteIntegration(id);
        } catch (error) {
          console.error("Failed to delete integration:", error);
        }
      }
    },
    [deleteIntegration]
  );

  const handleTestConnection = useCallback(
    async (id: string) => {
      try {
        await testConnection(id);
      } catch (error) {
        console.error("Connection test failed:", error);
      }
    },
    [testConnection]
  );

  const toggleSecretVisibility = useCallback((key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const getStatusBadge = (status: IIntegrationWithProvider["status"]): JSX.Element => {
    const statusConfig = {
      connected: {
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        label: "Connected",
      },
      disconnected: {
        icon: XCircle,
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
        label: "Disconnected",
      },
      error: {
        icon: AlertTriangle,
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        label: "Error",
      },
      testing: {
        icon: Loader2,
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        label: "Testing",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className={`h-3 w-3 mr-1 ${status === "testing" ? "animate-spin" : ""}`} />
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: IntegrationCategory): string => {
    const icons: Record<IntegrationCategory, string> = {
      payment: "💳",
      email: "✉️",
      sms: "📨",
      analytics: "📊",
      storage: "☁️",
      authentication: "🔐",
    };
    return icons[category] || "🔌";
  };

  const renderStatsCards = (): JSX.Element => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Plug className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected</p>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disconnected</p>
                <p className="text-2xl font-bold text-gray-600">{stats.disconnected}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCategoryFilter = (): JSX.Element => {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="flex items-center gap-2"
              >
                <span>{getCategoryIcon(category)}</span>
                <span className="capitalize">{category}</span>
                {stats.byCategory[category] && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.byCategory[category]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderIntegrationsList = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (integrations.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No integrations found</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {selectedCategory ? "No integrations in this category" : "Start by adding your first integration"}
            </p>
            <Button onClick={() => handleOpenConfigureModal()} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Add Integration
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{integration.provider.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.provider.name}</CardTitle>
                    <p className="text-xs text-gray-500 capitalize">{integration.provider.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(integration.status)}
                  <Switch
                    checked={integration.is_enabled}
                    onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                    aria-label={`Toggle ${integration.provider.name}`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.provider.description}</p>

              {integration.last_tested_at && (
                <p className="text-xs text-gray-500 mb-4">
                  Last tested: {new Date(integration.last_tested_at).toLocaleString()}
                </p>
              )}

              {integration.last_error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{integration.last_error}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenConfigureModal(integration)}
                  className="flex-1 flex items-center gap-2"
                  aria-label={`Configure ${integration.provider.name}`}
                >
                  <Settings className="h-4 w-4" />
                  Configure
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestConnection(integration.id)}
                  disabled={isTestingConnection}
                  aria-label={`Test ${integration.provider.name} connection`}
                >
                  <TestTube className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteIntegration(integration.id)}
                  aria-label={`Delete ${integration.provider.name}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderConfigField = (field: IConfigField): JSX.Element => {
    const value = (configFormData[field.key] as string) || "";

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`config-${field.key}`}>
            {field.label}
            {field.validation?.required && <span className="text-red-600 ml-1">*</span>}
          </Label>
          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
          <Select
            value={value}
            onValueChange={(val) => setConfigFormData({ ...configFormData, [field.key]: val })}
          >
            <SelectTrigger id={`config-${field.key}`}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === "boolean") {
      return (
        <div key={field.key} className="space-y-2">
          <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
            <div>
              <Label htmlFor={`config-${field.key}`}>{field.label}</Label>
              {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
            </div>
            <Switch
              id={`config-${field.key}`}
              checked={Boolean(configFormData[field.key])}
              onCheckedChange={(checked) => setConfigFormData({ ...configFormData, [field.key]: checked })}
            />
          </div>
        </div>
      );
    }

    const isSecret = field.type === "password";

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={`config-${field.key}`}>
          {field.label}
          {field.validation?.required && <span className="text-red-600 ml-1">*</span>}
        </Label>
        {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
        <div className="relative">
          <Input
            id={`config-${field.key}`}
            type={isSecret && !showSecrets[field.key] ? "password" : "text"}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setConfigFormData({ ...configFormData, [field.key]: e.target.value })}
            required={field.validation?.required}
            aria-required={field.validation?.required}
          />
          {isSecret && (
            <button
              type="button"
              onClick={() => toggleSecretVisibility(field.key)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-label={showSecrets[field.key] ? "Hide value" : "Show value"}
            >
              {showSecrets[field.key] ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderConfigModal = (): JSX.Element => {
    if (!isModalOpen) return <></>;

    const provider = isConfigMode && selectedProvider
      ? availableProviders.find((p) => p.id === selectedProvider)
      : selectedIntegration?.provider;

    if (!provider) {
      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-labelledby="provider-select-title"
          aria-modal="true"
        >
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle id="provider-select-title">Select Integration Provider</CardTitle>
              <CardDescription>Choose a provider to configure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                {availableProviders.map((prov) => (
                  <button
                    key={prov.id}
                    onClick={() => setSelectedProvider(prov.id)}
                    className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{prov.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{prov.name}</h3>
                        <p className="text-xs text-gray-500 capitalize mb-2">{prov.category}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{prov.description}</p>
                        {prov.is_popular && (
                          <Badge className="mt-2" variant="secondary">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        role="dialog"
        aria-labelledby="config-modal-title"
        aria-modal="true"
      >
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{provider.icon}</div>
                <div>
                  <CardTitle id="config-modal-title">{provider.name}</CardTitle>
                  <p className="text-sm text-gray-500">{provider.description}</p>
                </div>
              </div>
              <a
                href={provider.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                Docs
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {testResult && (
              <div
                className={`p-4 rounded-lg ${
                  testResult.success
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{testResult.message}</p>
                    {testResult.details && (
                      <pre className="text-xs mt-2 text-gray-600">{JSON.stringify(testResult.details, null, 2)}</pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Required Configuration</h3>
              {provider.required_fields.map(renderConfigField)}
            </div>

            {provider.optional_fields.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Optional Configuration</h3>
                {provider.optional_fields.map(renderConfigField)}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button onClick={handleSaveConfiguration} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Save Configuration
              </Button>
              {!isConfigMode && selectedIntegration && (
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection(selectedIntegration.id)}
                  disabled={isTestingConnection}
                  className="flex items-center gap-2"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={closeModal}>
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
            <Plug className="h-8 w-8 text-blue-600" />
            Integrations Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect external services and manage integration configurations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={refreshData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => handleOpenConfigureModal()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Integrations List */}
      {renderIntegrationsList()}

      {/* Configuration Modal */}
      {renderConfigModal()}
    </div>
  );
};

export default IntegrationsPage;
