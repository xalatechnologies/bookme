/**
 * useNotifications Hook
 *
 * Custom hook for notification management.
 * Follows Single Responsibility Principle - handles ONLY notification state and actions.
 *
 * @returns Notification state and handlers
 */

import { useState, useCallback } from 'react';

export interface INotification {
  readonly id: string;
  readonly type: 'info' | 'warning' | 'success' | 'error';
  readonly title: string;
  readonly message: string;
  readonly timestamp: string;
  readonly isRead: boolean;
}

interface UseNotificationsReturn {
  readonly isOpen: boolean;
  readonly notifications: readonly INotification[];
  readonly unreadCount: number;
  readonly toggleDropdown: () => void;
  readonly markAsRead: (id: string) => void;
  readonly markAllAsRead: () => void;
  readonly setIsOpen: (isOpen: boolean) => void;
}

export const useNotifications = (
  initialNotifications: readonly INotification[],
  storageKey: string = 'notifications'
): UseNotificationsReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<readonly INotification[]>(
    initialNotifications
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleDropdown = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  const markAsRead = useCallback(
    (id: string): void => {
      try {
        const updatedNotifications = notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        );
        setNotifications(updatedNotifications);

        // Save to localStorage (simulating backend)
        localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));

        alert('Notifikasjon markert som lest!');
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
        alert('Kunne ikke markere notifikasjon som lest. Prøv igjen.');
      }
    },
    [notifications, storageKey]
  );

  const markAllAsRead = useCallback((): void => {
    try {
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
      setNotifications(updatedNotifications);

      // Save to localStorage (simulating backend)
      localStorage.setItem(storageKey, JSON.stringify(updatedNotifications));

      alert('Alle notifikasjoner markert som lest!');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      alert('Kunne ikke markere alle notifikasjoner som lest. Prøv igjen.');
    }
  }, [notifications, storageKey]);

  return {
    isOpen,
    notifications,
    unreadCount,
    toggleDropdown,
    markAsRead,
    markAllAsRead,
    setIsOpen,
  };
};
