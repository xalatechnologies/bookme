"use client";

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  History,
  Receipt,
  Heart,
  User,
  Bell,
  MessageCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useSidebar } from "./index";

interface IMenuItem {
  readonly id: string;
  readonly labelKey: "skip_to_content" | "home" | "facilities" | "bookings" | "my_bookings" | "profile" | "settings" | "help" | "admin" | "dashboard" | "users" | "reports" | "notifications" | "calendar" | "history" | "favorites" | "receipts" | "logout" | "login" | "signup" | "back" | "next" | "previous" | "close" | "menu" | "overview" | "administration" | "rooms" | "users_and_roles" | "communication" | "messages" | "alerts" | "system" | "integrations" | "audit_log" | "data_retention" | "localization" | "booking" | "explore_facilities" | "account" | "support" | "help_and_contact" | "expand_sidebar" | "collapse_sidebar" | "privacy" | "language" | "my_profile";
  readonly path: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface IMenuGroup {
  readonly titleKey: "skip_to_content" | "home" | "facilities" | "bookings" | "my_bookings" | "profile" | "settings" | "help" | "admin" | "dashboard" | "users" | "reports" | "notifications" | "calendar" | "history" | "favorites" | "receipts" | "logout" | "login" | "signup" | "back" | "next" | "previous" | "close" | "menu" | "overview" | "administration" | "rooms" | "users_and_roles" | "communication" | "messages" | "alerts" | "system" | "integrations" | "audit_log" | "data_retention" | "localization" | "booking" | "explore_facilities" | "account" | "support" | "help_and_contact" | "expand_sidebar" | "collapse_sidebar" | "privacy" | "language" | "my_profile";
  readonly items: readonly IMenuItem[];
}

interface IUserSidebarProps {
  readonly children?: never;
  readonly onMobileMenuItemClick?: () => void;
}

const UserSidebar = (
  { onMobileMenuItemClick }: IUserSidebarProps
): JSX.Element => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { t } = useTranslation('navigation');
  const location = useLocation();

  const menuGroups: readonly IMenuGroup[] = [
    {
      titleKey: "overview",
      items: [
        { id: "dashboard", labelKey: "dashboard", path: "/user", icon: LayoutDashboard },
      ]
    },
    {
      titleKey: "booking",
      items: [
        { id: "bookings", labelKey: "bookings", path: "/user/bookings", icon: Calendar },
        { id: "calendar", labelKey: "calendar", path: "/user/calendar", icon: Calendar },
        { id: "history", labelKey: "history", path: "/user/history", icon: History },
        { id: "receipts", labelKey: "receipts", path: "/user/receipts", icon: Receipt },
      ]
    },
    {
      titleKey: "explore_facilities",
      items: [
        { id: "facilities", labelKey: "rooms", path: "/facilities", icon: Building2 },
        { id: "favorites", labelKey: "favorites", path: "/user/favorites", icon: Heart },
      ]
    },
    {
      titleKey: "account",
      items: [
        { id: "profile", labelKey: "settings", path: "/user/profile", icon: User },
        { id: "notifications", labelKey: "alerts", path: "/user/notifications", icon: Bell },
        { id: "messages", labelKey: "messages", path: "/user/messages", icon: MessageCircle },
      ]
    },
    {
      titleKey: "support",
      items: [
        { id: "help", labelKey: "help_and_contact", path: "/user/help", icon: HelpCircle },
      ]
    }
  ];


  const isActive = (path: string): boolean => {
    if (path === "/user") {
      return location.pathname === "/user";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`h-[calc(100vh-73px)] flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    }`}>
      {/* Navigation Content */}
      <nav className="flex-1 p-4 pt-8 space-y-6 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.titleKey} className="space-y-2">
            {/* Group Title */}
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {t(group.titleKey as any)}
              </h3>
            )}

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map(item => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => onMobileMenuItemClick?.()}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={
                      isCollapsed 
                        ? /* eslint-disable-next-line @typescript-eslint/no-explicit-any */ 
                          t(item.labelKey as any) 
                        : undefined
                    }
                  >
                    {/* Active Indicator */}
                    <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-200 ${
                      active ? "bg-blue-600" : "bg-transparent"
                    }`} />

                    {/* Icon */}
                    <IconComponent className={`flex-shrink-0 transition-colors ${
                      active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    } ${isCollapsed ? "w-5 h-5 mx-auto" : "w-5 h-5 mr-3"}`} />

                    {/* Label */}
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {t(item.labelKey as any)}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Button - Desktop Only */}
      <div className="hidden lg:block p-4 border-t border-gray-200 dark:border-gray-700">
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

export default UserSidebar;
