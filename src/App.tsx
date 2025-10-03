"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

import { Index } from '@/pages/Index';
import { FacilityDetail } from '@/pages/facilities/[id]';
import { LoginSelection } from '@/pages/LoginSelection';
import { LoginPage } from '@/pages/LoginPage';
import AdminRoutes from '@/pages/AdminRoutes';

export const App = (): React.JSX.Element => {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
            <Route path="/login-selection" element={<LoginSelection />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </LanguageProvider>
  );
};

export default App;