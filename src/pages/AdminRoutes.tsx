"use client";

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import Overview from "@/pages/admin/Overview";
import FacilitiesPage from "@/pages/admin/FacilitiesPage";
import FacilityEditPage from "@/pages/admin/FacilityEditPage";
import BookingsPage from "@/pages/admin/BookingsPage";
import SettingsPage from "@/pages/admin/SettingsPage";

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
      <Route path="/users-roles" element={<AdminLayout><div className="p-6">Brukere og roller - Kommer snart</div></AdminLayout>} />
      <Route path="/notifications" element={<AdminLayout><div className="p-6">Varsler - Kommer snart</div></AdminLayout>} />
      <Route path="/integrations" element={<AdminLayout><div className="p-6">Integrasjoner - Kommer snart</div></AdminLayout>} />
      <Route path="/reports" element={<AdminLayout><div className="p-6">Rapporter - Kommer snart</div></AdminLayout>} />
      <Route path="/audit-logs" element={<AdminLayout><div className="p-6">Revisjonslogg - Kommer snart</div></AdminLayout>} />
      <Route path="/data-retention" element={<AdminLayout><div className="p-6">Sletteplan - Kommer snart</div></AdminLayout>} />
      <Route path="/settings" element={<AdminLayout><SettingsPage /></AdminLayout>} />
    </Routes>
  );
};

export default AdminRoutes;