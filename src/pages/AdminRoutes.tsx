"use client";

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
        <Route path="/" element={<Navigate to="/admin/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/new" element={<FacilityEditPage />} />
        <Route path="/facilities/:id/edit" element={<FacilityEditPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/users-roles" element={<UsersRolesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/audit-logs" element={<AuditLogPage />} />
        <Route path="/data-retention" element={<DeletionPlanPage />} />
        <Route path="/messages" element={<AdminMessages />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
