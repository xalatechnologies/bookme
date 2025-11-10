"use client";

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/features/auth/components/ProtectedRoute";
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

        <a
          href="/"
          className="inline-block h-12 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Go to Home
        </a>
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

const AdminRoutes = (_props: IAdminRoutesProps): JSX.Element => {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><Navigate to="/admin/overview" replace /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/overview" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><Overview /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/facilities" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><FacilitiesPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/facilities/new" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><FacilityEditPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/facilities/:id/edit" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><FacilityEditPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><BookingsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/approvals" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><ApprovalsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/users-roles" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><UsersRolesPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><NotificationsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/integrations" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><IntegrationsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><ReportsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/audit-logs" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><AuditLogPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/data-retention" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><DeletionPlanPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><AdminMessages /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><SettingsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/localization" element={
          <ProtectedRoute requiredRole="admin" unauthorizedComponent={<AdminUnauthorizedComponent />}>
            <AdminLayout><LocalizationManagementPage /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;