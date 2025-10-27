"use client";

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';

import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import ScrollToTop from '@/components/ScrollToTop';
import i18n from '@/i18n/config';

import { Index } from '@/pages/Index';
import { FacilityDetail } from '@/pages/facilities/[id]';
import { FacilityBooking } from '@/pages/facilities/[id]/book';
import Checkout from './pages/Checkout';
import { LoginSelection } from '@/pages/LoginSelection';
import { Login } from '@/pages/Login';
import AdminRoutes from '@/pages/AdminRoutes';
import UserRoutes from '@/pages/UserRoutes';

export const App = (): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-4 text-gray-600">Loading...</p></div></div>}>
          <AuthProvider>
            <LanguageProvider>
              <CartProvider>
                <UserProfileProvider>
                  <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/facilities/:id" element={<FacilityDetail />} />
                      <Route path="/facilities/:id/book" element={<FacilityBooking />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login-selection" element={<LoginSelection />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/user/*" element={<UserRoutes />} />
                      <Route path="/admin/*" element={<AdminRoutes />} />
                    </Routes>
                  </BrowserRouter>
                </UserProfileProvider>
              </CartProvider>
            </LanguageProvider>
          </AuthProvider>
        </Suspense>
      </I18nextProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;