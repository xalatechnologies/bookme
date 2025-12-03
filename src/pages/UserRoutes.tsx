"use client";

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/features/auth/components/ProtectedRoute";
import { useRole } from "@/hooks/auth/useRole";
import { useAuth } from "@/contexts/hooks/useAuth";
import UserLayout from "@/components/layouts/UserLayout";
import UserDashboard from "@/pages/user/UserDashboard";
import Bookings from "@/pages/user/Bookings";
import CalendarPage from "@/pages/user/CalendarPage";
import HistoryPage from "@/pages/user/HistoryPage";
import UserReceipts from "@/pages/user/UserReceipts";
import UserFavorites from "@/pages/user/UserFavorites";
import UserProfile from "@/pages/user/UserProfile";
import UserNotifications from "@/pages/user/UserNotifications";
import UserHelp from "@/pages/user/UserHelp";
import UserMessages from "@/pages/user/UserMessages";

const UserRoutes = (): JSX.Element => {
  const { currentOrgId } = useAuth();
  const { role, loading } = useRole(currentOrgId || undefined);

  // Show loading while checking role
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </div>
    );
  }

  // Redirect admin/owner/staff to admin portal - they should not access user portal
  if (role && (role === 'admin' || role === 'owner' || role === 'staff')) {
    return <Navigate to="/admin/overview" replace />;
  }

  return (
    <RequireAuth loginPath="/login?type=user">
      <UserLayout>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/mine-bookinger" element={<Bookings />} />
          <Route path="/mine-foresporsler" element={<Bookings />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/receipts" element={<UserReceipts />} />
          <Route path="/favorites" element={<UserFavorites />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notifications" element={<UserNotifications />} />
          <Route path="/messages" element={<UserMessages />} />
          <Route path="/help" element={<UserHelp />} />
        </Routes>
      </UserLayout>
    </RequireAuth>
  );
};

export default UserRoutes;