"use client";

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Overview from "@/pages/admin/Overview";
import FacilitiesPage from "@/pages/admin/FacilitiesPage";
import FacilityEditPage from "@/pages/admin/FacilityEditPage";
import BookingsPage from "@/pages/admin/BookingsPage";
import UsersRolesPage from "@/pages/admin/UsersRolesPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import NotificationsPage from "@/pages/admin/NotificationsPage";
import IntegrationsPage from "@/pages/admin/IntegrationsPage";
import ReportsPage from "@/pages/admin/ReportsPage";
import AuditLogPage from "@/pages/admin/AuditLogPage";
import DeletionPlanPage from "@/pages/admin/DeletionPlanPage";

interface IAdminRoutesProps {
  readonly children?: never;
}

const AdminRoutes = (_props: IAdminRoutesProps): JSX.Element => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout><Navigate to="/admin/overview" replace /></AdminLayout>} />
      <Route path="/overview" element={<AdminLayout><Overview /></AdminLayout>} />
      <Route path="/facilities" element={<AdminLayout><FacilitiesPage /></AdminLayout>} />
      <Route path="/facilities/new" element={<AdminLayout><FacilityEditPage /></AdminLayout>} />
      <Route path="/facilities/:id/edit" element={<AdminLayout><FacilityEditPage /></AdminLayout>} />
      <Route path="/bookings" element={<AdminLayout><BookingsPage /></AdminLayout>} />
      <Route path="/users-roles" element={<AdminLayout><UsersRolesPage /></AdminLayout>} />
      <Route path="/notifications" element={<AdminLayout><NotificationsPage /></AdminLayout>} />
      <Route path="/integrations" element={<AdminLayout><IntegrationsPage /></AdminLayout>} />
      <Route path="/reports" element={<AdminLayout><ReportsPage /></AdminLayout>} />
      <Route path="/audit-logs" element={<AdminLayout><AuditLogPage /></AdminLayout>} />
      <Route path="/data-retention" element={<AdminLayout><DeletionPlanPage /></AdminLayout>} />
      <Route path="/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
    </Routes>
  );
};

export default AdminRoutes;