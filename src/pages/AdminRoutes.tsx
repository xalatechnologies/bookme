"use client";

import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/layout/AdminLayout";

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
        <Route path="/" element={<AdminLayout><Navigate to="/admin/overview" replace /></AdminLayout>} />
        <Route path="/overview" element={<AdminLayout><Overview /></AdminLayout>} />
        <Route path="/facilities" element={<AdminLayout><FacilitiesPage /></AdminLayout>} />
        <Route path="/facilities/new" element={<AdminLayout><FacilityEditPage /></AdminLayout>} />
        <Route path="/facilities/:id/edit" element={<AdminLayout><FacilityEditPage /></AdminLayout>} />
        <Route path="/bookings" element={<AdminLayout><BookingsPage /></AdminLayout>} />
        <Route path="/approvals" element={<AdminLayout><ApprovalsPage /></AdminLayout>} />
        <Route path="/users-roles" element={<AdminLayout><UsersRolesPage /></AdminLayout>} />
        <Route path="/notifications" element={<AdminLayout><NotificationsPage /></AdminLayout>} />
        <Route path="/integrations" element={<AdminLayout><IntegrationsPage /></AdminLayout>} />
        <Route path="/reports" element={<AdminLayout><ReportsPage /></AdminLayout>} />
        <Route path="/audit-logs" element={<AdminLayout><AuditLogPage /></AdminLayout>} />
        <Route path="/data-retention" element={<AdminLayout><DeletionPlanPage /></AdminLayout>} />
        <Route path="/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;