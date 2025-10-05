"use client";

import React from "react";
import { Routes, Route } from "react-router-dom";
import UserLayout from "@/components/user/layout/UserLayout";
import UserDashboard from "@/pages/user/UserDashboard";
import UserFacilities from "@/pages/user/UserFacilities";
import UserBookings from "@/pages/user/UserBookings";
import UserRequests from "@/pages/user/UserRequests";
import UserReceipts from "@/pages/user/UserReceipts";
import UserFavorites from "@/pages/user/UserFavorites";
import UserProfile from "@/pages/user/UserProfile";
import UserNotifications from "@/pages/user/UserNotifications";
import UserHelp from "@/pages/user/UserHelp";

const UserRoutes = (): JSX.Element => {
  return (
    <UserLayout>
      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/facilities" element={<UserFacilities />} />
        <Route path="/bookings" element={<UserBookings />} />
        <Route path="/requests" element={<UserRequests />} />
        <Route path="/receipts" element={<UserReceipts />} />
        <Route path="/favorites" element={<UserFavorites />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/notifications" element={<UserNotifications />} />
        <Route path="/help" element={<UserHelp />} />
      </Routes>
    </UserLayout>
  );
};

export default UserRoutes;
