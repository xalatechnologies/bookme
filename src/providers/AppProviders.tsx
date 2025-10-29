/**
 * AppProviders - Consolidated Application Providers
 *
 * Combines all application-level context providers into a single component
 * to reduce nesting and improve performance through better composition.
 *
 * Benefits:
 * - Reduced component tree depth
 * - Single render cycle for all providers
 * - Easier to manage provider order
 * - Better code organization
 *
 * @example
 * ```tsx
 * <AppProviders>
 *   <App />
 * </AppProviders>
 * ```
 */

import React, { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';

import { queryClient } from '@/lib/clients/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import i18n from '@/i18n/config';

interface AppProvidersProps {
  readonly children: ReactNode;
}

/**
 * Consolidated application providers component
 *
 * Order matters:
 * 1. QueryClientProvider - Server state management (needed by most providers)
 * 2. I18nextProvider - Translations (needed for UI text)
 * 3. AuthProvider - Authentication (needed for protected resources)
 * 4. LanguageProvider - Language switching (depends on i18n)
 * 5. CartProvider - Shopping cart state
 * 6. UserProfileProvider - User profile management
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <LanguageProvider>
            <CartProvider>
              <UserProfileProvider>
                {children}
              </UserProfileProvider>
            </CartProvider>
          </LanguageProvider>
        </AuthProvider>
      </I18nextProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default AppProviders;
