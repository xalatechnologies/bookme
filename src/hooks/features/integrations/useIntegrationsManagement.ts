/**
 * Integrations Management Hook
 *
 * Provides comprehensive integration management capabilities including:
 * - View available integrations
 * - Configure integration settings
 * - Test connections
 * - Enable/disable integrations
 * - Monitor connection status
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOrganizationId } from '@/hooks/useOrganizationId';

// ============================================================================
// Types
// ============================================================================

export type IntegrationCategory = 'payment' | 'email' | 'sms' | 'analytics' | 'storage' | 'authentication';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface IIntegrationProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: IntegrationCategory;
  readonly icon: string;
  readonly website: string;
  readonly documentation_url: string;
  readonly is_popular: boolean;
  readonly required_fields: readonly IConfigField[];
  readonly optional_fields: readonly IConfigField[];
}

export interface IConfigField {
  readonly key: string;
  readonly label: string;
  readonly type: 'text' | 'password' | 'url' | 'number' | 'boolean' | 'select';
  readonly description?: string;
  readonly placeholder?: string;
  readonly validation?: {
    readonly required?: boolean;
    readonly pattern?: string;
    readonly min?: number;
    readonly max?: number;
  };
  readonly options?: readonly { value: string; label: string }[];
}

export interface IIntegration {
  readonly id: string;
  readonly provider_id: string;
  readonly organization_id: string;
  readonly status: IntegrationStatus;
  readonly is_enabled: boolean;
  readonly config: Record<string, unknown>;
  readonly last_tested_at: string | null;
  readonly last_error: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface IIntegrationWithProvider extends IIntegration {
  readonly provider: IIntegrationProvider;
}

export interface ITestResult {
  readonly success: boolean;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface IUseIntegrationsManagementReturn {
  // Data
  readonly integrations: readonly IIntegrationWithProvider[];
  readonly availableProviders: readonly IIntegrationProvider[];
  readonly categories: readonly IntegrationCategory[];
  readonly selectedCategory: IntegrationCategory | null;
  readonly isLoading: boolean;
  readonly error: Error | null;

  // UI State
  readonly isModalOpen: boolean;
  readonly isTestingConnection: boolean;
  readonly selectedIntegration: IIntegrationWithProvider | null;
  readonly testResult: ITestResult | null;

  // Statistics
  readonly stats: {
    readonly total: number;
    readonly connected: number;
    readonly disconnected: number;
    readonly errors: number;
    readonly byCategory: Record<IntegrationCategory, number>;
  };

  // Actions
  readonly setSelectedCategory: (category: IntegrationCategory | null) => void;
  readonly openModal: (integration?: IIntegrationWithProvider) => void;
  readonly closeModal: () => void;
  readonly configureIntegration: (providerId: string, config: Record<string, unknown>) => Promise<void>;
  readonly updateIntegration: (id: string, config: Record<string, unknown>) => Promise<void>;
  readonly deleteIntegration: (id: string) => Promise<void>;
  readonly toggleIntegration: (id: string, enabled: boolean) => Promise<void>;
  readonly testConnection: (id: string) => Promise<ITestResult>;
  readonly refreshData: () => Promise<void>;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_PROVIDERS: readonly IIntegrationProvider[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments online with credit cards, digital wallets, and more',
    category: 'payment',
    icon: '💳',
    website: 'https://stripe.com',
    documentation_url: 'https://stripe.com/docs',
    is_popular: true,
    required_fields: [
      {
        key: 'publishable_key',
        label: 'Publishable Key',
        type: 'text',
        description: 'Your Stripe publishable API key',
        placeholder: 'pk_test_...',
        validation: { required: true, pattern: '^pk_(test|live)_' },
      },
      {
        key: 'secret_key',
        label: 'Secret Key',
        type: 'password',
        description: 'Your Stripe secret API key',
        placeholder: 'sk_test_...',
        validation: { required: true, pattern: '^sk_(test|live)_' },
      },
    ],
    optional_fields: [
      {
        key: 'webhook_secret',
        label: 'Webhook Secret',
        type: 'password',
        description: 'Webhook signing secret for event verification',
        placeholder: 'whsec_...',
      },
    ],
  },
  {
    id: 'vipps',
    name: 'Vipps',
    description: 'Norwegian mobile payment solution',
    category: 'payment',
    icon: '📱',
    website: 'https://vipps.no',
    documentation_url: 'https://vipps.no/developer',
    is_popular: true,
    required_fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        description: 'Your Vipps client ID',
        validation: { required: true },
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        description: 'Your Vipps client secret',
        validation: { required: true },
      },
      {
        key: 'merchant_serial_number',
        label: 'Merchant Serial Number',
        type: 'text',
        description: 'Your Vipps merchant serial number',
        validation: { required: true },
      },
    ],
    optional_fields: [
      {
        key: 'subscription_key',
        label: 'Subscription Key',
        type: 'password',
        description: 'Vipps subscription key',
      },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email delivery service for sending transactional and marketing emails',
    category: 'email',
    icon: '✉️',
    website: 'https://sendgrid.com',
    documentation_url: 'https://docs.sendgrid.com',
    is_popular: true,
    required_fields: [
      {
        key: 'api_key',
        label: 'API Key',
        type: 'password',
        description: 'Your SendGrid API key',
        placeholder: 'SG.xxx',
        validation: { required: true },
      },
      {
        key: 'from_email',
        label: 'From Email',
        type: 'text',
        description: 'Default sender email address',
        placeholder: 'noreply@example.com',
        validation: { required: true },
      },
    ],
    optional_fields: [
      {
        key: 'from_name',
        label: 'From Name',
        type: 'text',
        description: 'Default sender name',
        placeholder: 'My Organization',
      },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS and voice communication platform',
    category: 'sms',
    icon: '📨',
    website: 'https://twilio.com',
    documentation_url: 'https://www.twilio.com/docs',
    is_popular: true,
    required_fields: [
      {
        key: 'account_sid',
        label: 'Account SID',
        type: 'text',
        description: 'Your Twilio account SID',
        validation: { required: true },
      },
      {
        key: 'auth_token',
        label: 'Auth Token',
        type: 'password',
        description: 'Your Twilio auth token',
        validation: { required: true },
      },
      {
        key: 'phone_number',
        label: 'Phone Number',
        type: 'text',
        description: 'Your Twilio phone number',
        placeholder: '+1234567890',
        validation: { required: true },
      },
    ],
    optional_fields: [],
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Web analytics service for tracking and reporting website traffic',
    category: 'analytics',
    icon: '📊',
    website: 'https://analytics.google.com',
    documentation_url: 'https://developers.google.com/analytics',
    is_popular: true,
    required_fields: [
      {
        key: 'tracking_id',
        label: 'Tracking ID',
        type: 'text',
        description: 'Your Google Analytics tracking ID',
        placeholder: 'G-XXXXXXXXXX',
        validation: { required: true },
      },
    ],
    optional_fields: [
      {
        key: 'anonymize_ip',
        label: 'Anonymize IP',
        type: 'boolean',
        description: 'Enable IP anonymization for GDPR compliance',
      },
    ],
  },
  {
    id: 'aws_s3',
    name: 'Amazon S3',
    description: 'Cloud storage service for storing and retrieving files',
    category: 'storage',
    icon: '☁️',
    website: 'https://aws.amazon.com/s3',
    documentation_url: 'https://docs.aws.amazon.com/s3',
    is_popular: true,
    required_fields: [
      {
        key: 'access_key_id',
        label: 'Access Key ID',
        type: 'text',
        description: 'Your AWS access key ID',
        validation: { required: true },
      },
      {
        key: 'secret_access_key',
        label: 'Secret Access Key',
        type: 'password',
        description: 'Your AWS secret access key',
        validation: { required: true },
      },
      {
        key: 'bucket_name',
        label: 'Bucket Name',
        type: 'text',
        description: 'S3 bucket name',
        validation: { required: true },
      },
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        description: 'AWS region',
        validation: { required: true },
        options: [
          { value: 'eu-north-1', label: 'Europe (Stockholm)' },
          { value: 'eu-west-1', label: 'Europe (Ireland)' },
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
        ],
      },
    ],
    optional_fields: [],
  },
] as const;

const MOCK_INTEGRATIONS: IIntegration[] = [
  {
    id: '1',
    provider_id: 'stripe',
    organization_id: 'org-1',
    status: 'connected',
    is_enabled: true,
    config: {
      publishable_key: 'pk_test_xxxxx',
      secret_key: 'sk_test_xxxxx',
    },
    last_tested_at: '2025-01-29T10:00:00Z',
    last_error: null,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2025-01-29T10:00:00Z',
  },
  {
    id: '2',
    provider_id: 'sendgrid',
    organization_id: 'org-1',
    status: 'disconnected',
    is_enabled: false,
    config: {},
    last_tested_at: null,
    last_error: null,
    created_at: '2025-01-20T00:00:00Z',
    updated_at: '2025-01-20T00:00:00Z',
  },
];

// ============================================================================
// Hook Implementation
// ============================================================================

export const useIntegrationsManagement = (): IUseIntegrationsManagementReturn => {
  const orgId = useOrganizationId();

  // State
  const [integrations, setIntegrations] = useState<readonly IIntegration[]>(MOCK_INTEGRATIONS);
  const [availableProviders] = useState<readonly IIntegrationProvider[]>(MOCK_PROVIDERS);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IIntegrationWithProvider | null>(null);
  const [testResult, setTestResult] = useState<ITestResult | null>(null);

  // Computed values
  const categories = useMemo(
    () => Array.from(new Set(availableProviders.map((provider) => provider.category))).sort(),
    [availableProviders]
  );

  const integrationsWithProviders = useMemo((): readonly IIntegrationWithProvider[] => {
    return integrations
      .map((integration) => {
        const provider = availableProviders.find((p) => p.id === integration.provider_id);
        if (!provider) return null;
        return { ...integration, provider };
      })
      .filter((integration): integration is IIntegrationWithProvider => integration !== null);
  }, [integrations, availableProviders]);

  const filteredIntegrations = useMemo(() => {
    if (!selectedCategory) return integrationsWithProviders;
    return integrationsWithProviders.filter((int) => int.provider.category === selectedCategory);
  }, [integrationsWithProviders, selectedCategory]);

  const stats = useMemo(() => {
    const total = integrations.length;
    const connected = integrations.filter((int) => int.status === 'connected').length;
    const disconnected = integrations.filter((int) => int.status === 'disconnected').length;
    const errors = integrations.filter((int) => int.status === 'error').length;

    const byCategory: Record<string, number> = {};
    integrationsWithProviders.forEach((integration) => {
      const category = integration.provider.category;
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      total,
      connected,
      disconnected,
      errors,
      byCategory: byCategory as Record<IntegrationCategory, number>,
    };
  }, [integrations, integrationsWithProviders]);

  // Actions
  const openModal = useCallback((integration?: IIntegrationWithProvider) => {
    setSelectedIntegration(integration || null);
    setTestResult(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIntegration(null);
    setTestResult(null);
  }, []);

  const configureIntegration = useCallback(
    async (providerId: string, config: Record<string, unknown>): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        const newIntegration: IIntegration = {
          id: Date.now().toString(),
          provider_id: providerId,
          organization_id: orgId || 'org-1',
          status: 'disconnected',
          is_enabled: false,
          config,
          last_tested_at: null,
          last_error: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setIntegrations((prev) => [...prev, newIntegration]);
        closeModal();
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [orgId, closeModal]
  );

  const updateIntegration = useCallback(
    async (id: string, config: Record<string, unknown>): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API call
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === id
              ? {
                  ...integration,
                  config: { ...integration.config, ...config },
                  updated_at: new Date().toISOString(),
                }
              : integration
          )
        );
        closeModal();
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [closeModal]
  );

  const deleteIntegration = useCallback(async (id: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      setIntegrations((prev) => prev.filter((integration) => integration.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleIntegration = useCallback(async (id: string, enabled: boolean): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === id
            ? {
                ...integration,
                is_enabled: enabled,
                updated_at: new Date().toISOString(),
              }
            : integration
        )
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (id: string): Promise<ITestResult> => {
    try {
      setIsTestingConnection(true);
      setTestResult(null);

      const integration = integrations.find((int) => int.id === id);
      if (!integration) {
        throw new Error('Integration not found');
      }

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate test result
      const success = Math.random() > 0.3;
      const result: ITestResult = {
        success,
        message: success
          ? 'Connection successful! Integration is working correctly.'
          : 'Connection failed. Please check your credentials.',
        details: success
          ? { response_time: '234ms', api_version: '2024-01-01' }
          : { error_code: 'AUTH_FAILED', status: 401 },
      };

      // Update integration status
      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === id
            ? {
                ...int,
                status: success ? 'connected' : 'error',
                last_tested_at: new Date().toISOString(),
                last_error: success ? null : result.message,
              }
            : int
        )
      );

      setTestResult(result);
      return result;
    } catch (err) {
      const errorResult: ITestResult = {
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      };
      setTestResult(errorResult);
      return errorResult;
    } finally {
      setIsTestingConnection(false);
    }
  }, [integrations]);

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
    integrations: filteredIntegrations,
    availableProviders,
    categories,
    selectedCategory,
    isLoading,
    error,

    // UI State
    isModalOpen,
    isTestingConnection,
    selectedIntegration,
    testResult,

    // Statistics
    stats,

    // Actions
    setSelectedCategory,
    openModal,
    closeModal,
    configureIntegration,
    updateIntegration,
    deleteIntegration,
    toggleIntegration,
    testConnection,
    refreshData,
  };
};
