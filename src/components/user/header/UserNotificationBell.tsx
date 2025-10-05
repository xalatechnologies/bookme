"use client";

import React, { useState } from "react";
import { Bell, X, CheckCircle, AlertTriangle, Info, Calendar, Building2 } from "lucide-react";

interface INotification {
  readonly id: string;
  readonly type: "info" | "warning" | "success" | "error";
  readonly title: string;
  readonly message: string;
  readonly timestamp: string;
  readonly isRead: boolean;
}

interface IUserNotificationBellProps {
  readonly children?: never;
}

const UserNotificationBell = (_props: IUserNotificationBellProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications] = useState<readonly INotification[]>([
    {
      id: "1",
      type: "success",
      title: "Booking bekreftet",
      message: "Din booking for Drammen Idrettshall er bekreftet for i morgen kl. 14:00.",
      timestamp: "2 timer siden",
      isRead: false
    },
    {
      id: "2",
      type: "info",
      title: "Påminnelse om booking",
      message: "Du har en booking i morgen kl. 10:00 på Solberghallen.",
      timestamp: "1 dag siden",
      isRead: true
    },
    {
      id: "3",
      type: "warning",
      title: "Booking avlyst",
      message: "Din booking for Kulturhuset er avlyst på grunn av vedlikehold.",
      timestamp: "3 dager siden",
      isRead: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string): string => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id: string): void => {
    // TODO: Implement mark as read functionality
    // Mark as read logic will be implemented here
  };

  const markAllAsRead = (): void => {
    // TODO: Implement mark all as read functionality
    // Mark all as read logic will be implemented here
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        aria-label="Åpne notifikasjoner"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifikasjoner
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Marker alle som lest
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Ingen notifikasjoner
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead 
                                ? "text-gray-900 dark:text-white" 
                                : "text-gray-700 dark:text-gray-300"
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {notification.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserNotificationBell;
