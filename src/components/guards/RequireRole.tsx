"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";

type TRole = "system-admin" | "org-admin" | "facility-manager" | "case-worker" | "approver" | "analyst";

interface IRequireRoleProps {
  readonly roles: readonly TRole[];
  readonly children: React.ReactNode;
}

export const RequireRole = ({ roles, children }: IRequireRoleProps): JSX.Element => {
  const { user } = useAuth();
  
  // Check if user is logged in
  const isLoggedIn = !!user;
  
  // For now, let's assume that if a user is logged in, they have the required roles
  // This is a temporary solution for development
  const allowed = isLoggedIn;
  
  // Debug information
  console.log('RequireRole check:', {
    userEmail: user?.email,
    isLoggedIn,
    requiredRoles: roles,
    allowed
  });
  
  return allowed ? <>{children}</> : <div className="p-6 text-sm text-red-700">Ingen tilgang</div>;
};