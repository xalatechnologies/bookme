"use client";

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AppProviders } from '@/providers/AppProviders';
import ScrollToTop from '@/components/common/navigation/ScrollToTop';
import { ErrorBoundary } from '@/components/common/error/ErrorBoundary';
import { LoadingState } from '@/components/common/states/LoadingState';

// Lazy load route components for better performance
const Index = lazy(() => import('@/pages/Index'));
const FacilityDetail = lazy(() => import('@/pages/facilities/[id]'));
const FacilityBooking = lazy(() => import('@/pages/facilities/[id]/book'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const LoginSelection = lazy(() => import('@/pages/LoginSelection'));
const Login = lazy(() => import('@/pages/Login'));
const AdminRoutes = lazy(() => import('@/pages/AdminRoutes'));
const UserRoutes = lazy(() => import('@/pages/UserRoutes'));

export const App = (): React.JSX.Element => {
  return (
    <AppProviders>
      <Suspense fallback={<LoadingState type="spinner" size="lg" fullScreen={true} message="Laster inn..." />}>
        <BrowserRouter>
          <ScrollToTop />
          <ErrorBoundary>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <Index />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/facilities"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <Index />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/facilities/:id"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <FacilityDetail />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/facilities/:id/book"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <FacilityBooking />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/checkout"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <Checkout />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/login-selection"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <LoginSelection />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/login"
                          element={
                            <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                              <Login />
                            </Suspense>
                          }
                        />
                        <Route
                          path="/user/*"
                          element={
                            <ErrorBoundary>
                              <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                                <UserRoutes />
                              </Suspense>
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/admin/*"
                          element={
                            <ErrorBoundary>
                              <Suspense fallback={<LoadingState type="spinner" size="md" />}>
                                <AdminRoutes />
                              </Suspense>
                            </ErrorBoundary>
                          }
                        />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </Suspense>
    </AppProviders>
  );
};

export default App;