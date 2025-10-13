"use client";

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

interface IMenuItem {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

interface IMenuGroup {
  readonly title: string;
  readonly items: readonly IMenuItem[];
}

interface IUserSidebarProps {
  readonly children?: never;
}

const UserSidebar = (_props: IUserSidebarProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const location = useLocation();

  const menuGroups: readonly IMenuGroup[] = [
    {
      title: "Oversikt",
      items: [
        { id: "dashboard", label: "Dashboard", path: "/user", icon: LayoutDashboard },
      ]
    },
    {
      title: "Booking",
      items: [
        { id: "bookings", label: "Bookinger", path: "/user/bookings", icon: Calendar },
        { id: "calendar", label: "Kalender", path: "/user/calendar", icon: Calendar },
        { id: "history", label: "Historikk", path: "/user/history", icon: History },
        { id: "receipts", label: "Kvitteringer", path: "/user/receipts", icon: Receipt },
      ]
    },
    {
      title: "Utforsk lokaler",
      items: [
        { id: "facilities", label: "Lokaler", path: "/user/facilities", icon: Building2 },
        { id: "favorites", label: "Favoritter", path: "/user/favorites", icon: Heart },
      ]
    },
    {
      title: "Konto",
      items: [
        { id: "profile", label: "Innstillinger", path: "/user/profile", icon: User },
        { id: "notifications", label: "Varsler", path: "/user/notifications", icon: Bell },
        { id: "messages", label: "Meldinger", path: "/user/messages", icon: MessageCircle },
      ]
    },
    {
      title: "Support",
      items: [
        { id: "help", label: "Hjelp & kontakt", path: "/user/help", icon: HelpCircle },
      ]
    }
  ];

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string): boolean => {
    if (path === "/user") {
      return location.pathname === "/user";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-72"
    }`}>
      {/* Navigation Content */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-2">
            {/* Group Title */}
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.title}
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
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    title={isCollapsed ? item.label : undefined}
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
                      <span className="whitespace-nowrap">{item.label}</span>
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
          aria-label={isCollapsed ? "Utvid sidebar" : "Kollaps sidebar"}
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
