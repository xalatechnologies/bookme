"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import ScrollToTop from '@/components/ScrollToTop';

import { Index } from '@/pages/Index';
import { FacilityDetail } from '@/pages/facilities/[id]';
import { LoginSelection } from '@/pages/LoginSelection';
import AdminRoutes from '@/pages/AdminRoutes';
import UserRoutes from '@/pages/UserRoutes';

export const App = (): React.JSX.Element => {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
            <Route path="/login-selection" element={<LoginSelection />} />
            <Route path="/user/*" element={<UserRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
};

export default App;