"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CheckCircle,
  Users,
  Bell,
  MessageCircle,
  Plug,
  BarChart3,
  FileText,
  Trash2,
  Globe,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSidebar } from "./index";

interface IMenuItem {
  readonly id: string;
  readonly labelKey: string;
  readonly path: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface IMenuGroup {
  readonly titleKey: string;
  readonly items: readonly IMenuItem[];
}

interface IAdminSidebarProps {
  readonly children?: never;
}

const AdminSidebar = (_props: IAdminSidebarProps): JSX.Element => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { t } = useTranslation('navigation');

  const menuGroups: readonly IMenuGroup[] = [
    {
      titleKey: "overview",
      items: [
        { id: "overview", labelKey: "dashboard", path: "/admin/overview", icon: LayoutDashboard },
      ]
    },
    {
      titleKey: "administration",
      items: [
        { id: "facilities", labelKey: "rooms", path: "/admin/facilities", icon: Building2 },
        { id: "bookings", labelKey: "bookings", path: "/admin/bookings", icon: Calendar },
        { id: "users-roles", labelKey: "users_and_roles", path: "/admin/users-roles", icon: Users },
      ]
    },
    {
      titleKey: "communication",
      items: [
        { id: "messages", labelKey: "messages", path: "/admin/messages", icon: MessageCircle },
        { id: "notifications", labelKey: "alerts", path: "/admin/notifications", icon: Bell },
      ]
    },
    {
      titleKey: "system",
      items: [
        { id: "integrations", labelKey: "integrations", path: "/admin/integrations", icon: Plug },
        { id: "reports", labelKey: "reports", path: "/admin/reports", icon: BarChart3 },
        { id: "audit", labelKey: "audit_log", path: "/admin/audit-logs", icon: FileText },
        { id: "data-retention", labelKey: "data_retention", path: "/admin/data-retention", icon: Trash2 },
        { id: "localization", labelKey: "localization", path: "/admin/localization", icon: Globe },
      ]
    }
  ];


  return (
    <div className={`h-[calc(100vh-73px)] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Navigation Content */}
      <nav className="flex-1 p-4 pt-8 space-y-6 overflow-y-auto">
        {menuGroups.map((group, groupIndex) => (
          <div key={group.titleKey} className="space-y-2">
            {/* Group Title */}
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t(group.titleKey)}
              </h3>
            )}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map(item => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }`
                    }
                    title={isCollapsed ? t(item.labelKey) : undefined}
                  >
                    {/* Active Indicator */}
                    {({ isActive }) => (
                      <>
                        <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-200 ${
                          isActive ? "bg-blue-600" : "bg-transparent"
                        }`} />

                        {/* Icon */}
                        <IconComponent className={`flex-shrink-0 transition-colors ${
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        } ${isCollapsed ? "w-5 h-5 mx-auto" : "w-5 h-5 mr-3"}`} />

                        {/* Label */}
                        {!isCollapsed && (
                          <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          aria-label={isCollapsed ? t('expand_sidebar') : t('collapse_sidebar')}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
