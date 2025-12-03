"use client";

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/features/auth/components/ProtectedRoute";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import AdminLayout from "@/components/layouts/AdminLayout";

// Lazy load admin pages for better performance
const Overview = lazy(() => import("@/pages/admin/Overview"));
const FacilitiesPage = lazy(() => import("@/pages/admin/FacilitiesPage"));
const FacilityEditPage = lazy(() => import("@/pages/admin/FacilityEditPage"));
const BookingsPage = lazy(() => import("@/pages/admin/BookingsPage"));
const ApprovalsPage = lazy(() => import("@/pages/admin/ApprovalsPage"));
const UsersRolesPage = lazy(() => import("@/pages/admin/UsersRolesPage"));
const SettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const NotificationsPage = lazy(() => import("@/pages/admin/NotificationsPage"));
const IntegrationsPage = lazy(() => import("@/pages/admin/IntegrationsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const AuditLogPage = lazy(() => import("@/pages/admin/AuditLogPage"));
const DeletionPlanPage = lazy(() => import("@/pages/admin/DeletionPlanPage"));
const AdminMessages = lazy(() => import("@/pages/admin/AdminMessages"));
const LocalizationManagementPage = lazy(() => import("@/pages/admin/LocalizationManagementPage"));

// Custom unauthorized component for admin portal
const AdminUnauthorizedComponent = (): JSX.Element => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Access Forbidden
        </h2>

        <p className="text-gray-600 mb-6">
          This area is restricted to staff and administrative personnel only. 
          You do not have permission to access the admin portal.
        </p>

        <PrimaryButton
          asChild
        >
          <a href="/">
            Go to Home
          </a>
        </PrimaryButton>
      </div>
    </div>
  );
};

// Loading component
const AdminPageLoader = (): JSX.Element => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

interface IAdminRoutesProps {
  readonly children?: never;
}

const AdminRoutes = (
   
  _props: IAdminRoutesProps
): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute requiredRole="staff" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><Navigate to="/admin/overview" replace /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/overview" element={
        <ProtectedRoute requiredRole="staff" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><Overview /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/facilities" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><FacilitiesPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/facilities/new" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><FacilityEditPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/facilities/:id/edit" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><FacilityEditPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute requiredRole="staff" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><BookingsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/approvals" element={
        <ProtectedRoute requiredRole="staff" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><ApprovalsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/users-roles" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><UsersRolesPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><NotificationsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/integrations" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><IntegrationsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><ReportsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/audit-logs" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><AuditLogPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/data-retention" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><DeletionPlanPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><AdminMessages /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><SettingsPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/localization" element={
        <ProtectedRoute requiredRole="admin" loginPath="/login-selection" unauthorizedComponent={<AdminUnauthorizedComponent />}>
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout><LocalizationManagementPage /></AdminLayout>
          </Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AdminRoutes;