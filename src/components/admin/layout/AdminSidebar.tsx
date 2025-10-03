"use client";

import React from "react";
import { NavLink } from "react-router-dom";

interface IMenuItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
}

interface IAdminSidebarProps {
  readonly children?: never;
}

const AdminSidebar = (_props: IAdminSidebarProps): JSX.Element => {
  const menuItems: readonly IMenuItem[] = [
    { id: "overview", label: "Oversikt", path: "/admin/overview" },
    { id: "facilities", label: "Lokaler", path: "/admin/facilities" },
    { id: "bookings", label: "Bookinger", path: "/admin/bookings" },
    { id: "approvals", label: "Godkjenninger", path: "/admin/approvals" },
    { id: "users-roles", label: "Brukere og roller", path: "/admin/users-roles" },
    { id: "notifications", label: "Varsler", path: "/admin/notifications" },
    { id: "integrations", label: "Integrasjoner", path: "/admin/integrations" },
    { id: "reports", label: "Rapporter", path: "/admin/reports" },
    { id: "audit", label: "Revisjonslogg", path: "/admin/audit-logs" },
    { id: "data-retention", label: "Sletteplan", path: "/admin/data-retention" },
    { id: "settings", label: "Innstillinger", path: "/admin/settings" },
  ];

  return (
    <nav className="p-4 space-y-1">
      {menuItems.map(item => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            `block rounded px-3 py-2 text-sm transition-colors ${
              isActive
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminSidebar;