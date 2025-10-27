import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Creates a test-specific QueryClient with retry disabled for faster tests
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });

interface AllTheProvidersProps {
  readonly children: React.ReactNode;
}

/**
 * Wraps components with all necessary providers for testing
 */
export const AllTheProviders = ({ children }: AllTheProvidersProps): JSX.Element => {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes all providers
 */
export const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): ReturnType<typeof render> => render(ui, { wrapper: AllTheProviders, ...options });

/**
 * Creates a wrapper for renderHook with all providers
 */
export const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Waits for loading states to complete
 */
export const waitForLoadingToFinish = async (): Promise<void> => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    expect(document.querySelector('[data-testid="loading"]')).not.toBeInTheDocument();
  }, { timeout: 3000 });
};

/**
 * Mock user for testing
 */
export const mockUser = {
  id: 'test-user-id',
  email: 'test@drammen.kommune.no',
  role: 'user' as const,
  full_name: 'Test User',
  phone: '+4712345678',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

/**
 * Mock admin user for testing
 */
export const mockAdmin = {
  id: 'test-admin-id',
  email: 'admin@drammen.kommune.no',
  role: 'admin' as const,
  full_name: 'Test Admin',
  phone: '+4787654321',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
