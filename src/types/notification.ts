/**
 * Notification interface for the notification system
 * 
 * Supports various notification types with priority, read status, and action URLs.
 */
export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: 'booking' | 'message' | 'system' | 'payment' | 'reminder';
  readonly title: string;
  readonly content: string;
  readonly priority: 'low' | 'medium' | 'high';
  readonly read: boolean;
  readonly actionUrl?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly readAt?: string;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  readonly userId: string;
  readonly email: {
    readonly bookingConfirmation: boolean;
    readonly bookingReminder: boolean;
    readonly messages: boolean;
    readonly systemUpdates: boolean;
  };
  readonly browser: {
    readonly enabled: boolean;
    readonly bookingReminder: boolean;
    readonly messages: boolean;
  };
}


