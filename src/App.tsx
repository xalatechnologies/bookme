"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';
import ScrollToTop from '@/components/ScrollToTop';

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
      <AuthProvider>
        <LanguageProvider>
          <AdminAuthProvider>
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
          </AdminAuthProvider>
        </LanguageProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;