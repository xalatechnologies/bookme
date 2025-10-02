"use client";

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { LanguageProvider } from '@/contexts/LanguageContext';

import { Index } from '@/pages/Index';
import { FacilityDetail } from '@/pages/facilities/[id]';
import { LoginSelection } from '@/pages/LoginSelection';
import { LoginPage } from '@/pages/LoginPage';

export const App = (): React.JSX.Element => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/facilities/:id" element={<FacilityDetail />} />
          <Route path="/login-selection" element={<LoginSelection />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;