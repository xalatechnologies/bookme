"use client";

import React from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

type TRole = "system-admin" | "org-admin" | "facility-manager" | "case-worker" | "approver" | "analyst";

interface IRequireRoleProps {
  readonly roles: readonly TRole[];
  readonly children: React.ReactNode;
}

export const RequireRole = ({ roles, children }: IRequireRoleProps): JSX.Element => {
  const { user } = useAdminAuth();
  const allowed = user?.roles?.some(r => roles.includes(r as TRole)) ?? false;
  return allowed ? <>{children}</> : <div className="p-6 text-sm text-red-700">Ingen tilgang</div>;
};