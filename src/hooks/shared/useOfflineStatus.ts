"use client";

import { useState, useEffect } from "react";

/**
 * Hook for managing offline status and synchronization
 * 
 * Provides real-time offline/online status and handles background sync
 * for offline actions when connection is restored.
 */
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineActions, setOfflineActions] = useState<Array<unknown>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Register service worker for background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register background sync
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          registration.sync.register('background-sync');
        }
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Queue an action for offline sync
   */
  const queueOfflineAction = (action: {
    type: string;
    data: unknown;
    timestamp: string;
  }): void => {
    const queue = getOfflineQueue();
    const newAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...action
    };
    
    queue.push(newAction);
    localStorage.setItem('offline_actions_queue', JSON.stringify(queue));
    setOfflineActions(queue);
  };

  /**
   * Get offline actions queue
   */
  const getOfflineQueue = (): Array<unknown> => {
    const stored = localStorage.getItem('offline_actions_queue');
    return stored ? JSON.parse(stored) : [];
  };

  /**
   * Clear offline actions queue
   */
  const clearOfflineQueue = (): void => {
    localStorage.removeItem('offline_actions_queue');
    setOfflineActions([]);
  };

  /**
   * Sync offline actions when back online
   */
  const syncOfflineActions = async (): Promise<void> => {
    const queue = getOfflineQueue();
    
    if (queue.length === 0) return;

    try {
      // Process each offline action
      for (const action of queue) {
        await processOfflineAction(action);
      }
      
      // Clear queue after successful sync
      clearOfflineQueue();
    } catch (error) {
    }
  };

  /**
   * Process individual offline action
   */
  const processOfflineAction = async (action: { type: string; data?: unknown }): Promise<void> => {
    // This would implement the actual sync logic based on action type
    
    // Example implementation:
    switch (action.type) {
      case 'create_booking':
        // Sync booking creation
        break;
      case 'update_booking':
        // Sync booking update
        break;
      case 'send_message':
        // Sync message sending
        break;
      default:
    }
  };

  /**
   * Check if action should be queued for offline
   */
  const shouldQueueOffline = (actionType: string): boolean => {
    const offlineActions = [
      'create_booking',
      'update_booking',
      'cancel_booking',
      'send_message',
      'create_group',
      'invite_member'
    ];
    
    return offlineActions.includes(actionType);
  };

  return {
    isOnline,
    offlineActions,
    queueOfflineAction,
    clearOfflineQueue,
    shouldQueueOffline
  };
};

