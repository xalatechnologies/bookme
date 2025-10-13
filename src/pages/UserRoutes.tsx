"use client";

import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "@/components/user/layout/UserLayout";
import UserDashboard from "@/pages/user/UserDashboard";
import UserFacilities from "@/pages/user/UserFacilities";
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
  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/facilities" element={<UserFacilities />} />
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
  );
};

export default UserRoutes;
