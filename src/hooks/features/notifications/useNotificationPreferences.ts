/**
 * Notification Preferences Hook
 *
 * Manages notification preferences, templates, and contact information.
 * Handles business logic for user notification settings.
 * Follows clean architecture principles with clear separation of concerns.
 */

import { useState, useCallback, useMemo } from 'react';
import { Calendar, Wrench, Megaphone, type LucideIcon } from 'lucide-react';

export interface INotificationPreference {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly email: boolean;
  readonly sms: boolean;
  readonly push: boolean;
  readonly category: "booking" | "system" | "marketing";
}

export interface INotificationTemplate {
  readonly id: string;
  readonly title: string;
  readonly name: string;
  readonly description: string;
  readonly type: "email" | "sms";
  readonly enabled: boolean;
  readonly lastSent?: string;
  readonly subject: string;
  readonly content: string;
  readonly smsContent?: string;
}

export interface IContactInfo {
  readonly email: string;
  readonly phone: string;
}

export interface ISuccessMessage {
  readonly id: string;
  readonly message: string;
  readonly timestamp: number;
}

export interface IUseNotificationPreferencesReturn {
  // Preferences state
  readonly preferences: readonly INotificationPreference[];
  readonly groupedPreferences: Record<string, INotificationPreference[]>;

  // Templates state
  readonly templates: readonly INotificationTemplate[];

  // Contact info state
  readonly contactInfo: IContactInfo;
  readonly isEditingContact: boolean;

  // UI state
  readonly hasChanges: boolean;
  readonly successMessages: readonly ISuccessMessage[];
  readonly expandedTemplates: readonly string[];

  // Preference actions
  readonly togglePreference: (preferenceId: string, channel: "email" | "sms" | "push") => void;
  readonly saveNotificationPreferences: () => void;

  // Template actions
  readonly toggleTemplate: (templateId: string) => void;
  readonly saveNotificationTemplates: () => void;
  readonly toggleTemplateExpansion: (templateId: string) => void;
  readonly testNotification: (templateId: string) => void;
  readonly getExampleData: (templateId: string) => Record<string, string>;

  // Contact actions
  readonly setContactInfo: (info: IContactInfo | ((prev: IContactInfo) => IContactInfo)) => void;
  readonly setIsEditingContact: (isEditing: boolean) => void;
  readonly saveContactInfo: () => void;

  // General actions
  readonly saveChanges: () => void;
  readonly addSuccessMessage: (message: string) => void;

  // Utility functions
  readonly formatDate: (dateString: string) => string;
  readonly getCategoryIcon: (category: INotificationPreference["category"]) => LucideIcon;
  readonly getCategoryColor: (category: INotificationPreference["category"]) => string;
  readonly getCategoryAccentColor: (category: INotificationPreference["category"]) => string;
  readonly getCategoryLabel: (category: INotificationPreference["category"]) => string;
}

const INITIAL_PREFERENCES: readonly INotificationPreference[] = [
  {
    id: "1",
    title: "Booking bekreftet",
    description: "Varsle meg når en booking bekreftes",
    email: true,
    sms: false,
    push: true,
    category: "booking"
  },
  {
    id: "2",
    title: "Booking avlyst",
    description: "Varsle meg hvis en booking avlyses",
    email: true,
    sms: true,
    push: true,
    category: "booking"
  },
  {
    id: "3",
    title: "Påminnelse om booking",
    description: "Få påminnelse 24 timer før",
    email: true,
    sms: false,
    push: true,
    category: "booking"
  },
  {
    id: "4",
    title: "Systemvedlikehold",
    description: "Få beskjed om planlagt vedlikehold",
    email: true,
    sms: false,
    push: false,
    category: "system"
  },
  {
    id: "5",
    title: "Nye lokaler",
    description: "Få beskjed om nye lokaler i ditt område",
    email: false,
    sms: false,
    push: false,
    category: "marketing"
  },
  {
    id: "6",
    title: "Tilbud og kampanjer",
    description: "Få beskjed om tilbud og kampanjer",
    email: false,
    sms: false,
    push: false,
    category: "marketing"
  }
];

const INITIAL_TEMPLATES: readonly INotificationTemplate[] = [
  {
    id: "booking-confirmation",
    title: "Booking bekreftet",
    name: "Booking bekreftet",
    description: "Din booking for {facilityName} er bekreftet for {date} kl. {time}",
    type: "email",
    enabled: true,
    lastSent: "2024-01-20T14:30:00Z",
    subject: "Booking bekreftet - {facilityName}",
    content: "Hei {contactPerson}!\n\nDin booking for {facilityName} er bekreftet:\n\n📅 Dato: {date}\n🕐 Tid: {time}\n📍 Sted: {facilityName}\n\nBooking-ID: {bookingId}\n\nVi gleder oss til å se deg!\n\nMed vennlig hilsen\nBookMe Team",
    smsContent: "Booking bekreftet! {facilityName} {date} kl. {time}. ID: {bookingId}"
  },
  {
    id: "booking-reminder",
    title: "Påminnelse om booking",
    name: "Påminnelse om booking",
    description: "Husk at du har en booking i morgen kl. {time} på {facilityName}",
    type: "sms",
    enabled: true,
    lastSent: "2024-01-19T18:00:00Z",
    subject: "Påminnelse: Booking i morgen",
    content: "Hei {contactPerson}!\n\nDette er en påminnelse om at du har en booking i morgen:\n\n📅 Dato: {date}\n🕐 Tid: {time}\n📍 Sted: {facilityName}\n\nBooking-ID: {bookingId}\n\nVi gleder oss til å se deg!\n\nMed vennlig hilsen\nBookMe Team",
    smsContent: "Påminnelse: {facilityName} {date} kl. {time}. ID: {bookingId}"
  },
  {
    id: "booking-cancelled",
    title: "Booking avlyst",
    name: "Booking avlyst",
    description: "Din booking for {facilityName} den {date} kl. {time} er avlyst",
    type: "email",
    enabled: true,
    lastSent: "2024-01-18T10:15:00Z",
    subject: "Booking avlyst - {facilityName}",
    content: "Hei {contactPerson}!\n\nDin booking for {facilityName} er dessverre avlyst:\n\n📅 Dato: {date}\n🕐 Tid: {time}\n📍 Sted: {facilityName}\n\nBooking-ID: {bookingId}\n\nVi beklager uleiligheten. Vennligst kontakt oss hvis du har spørsmål.\n\nMed vennlig hilsen\nBookMe Team",
    smsContent: "Booking avlyst: {facilityName} {date} kl. {time}. ID: {bookingId}"
  }
];

const EXAMPLE_DATA: Record<string, Record<string, string>> = {
  "booking-confirmation": {
    facilityName: "Drammen Idrettshall",
    date: "15. november 2024",
    time: "18:00 - 20:00",
    bookingId: "BK-12345",
    contactPerson: "Anna Hansen",
    phone: "+47 123 45 678"
  },
  "booking-reminder": {
    facilityName: "Strømsø Kulturhus",
    date: "20. november 2024",
    time: "19:00 - 21:00",
    bookingId: "BK-12346",
    contactPerson: "Erik Larsen",
    phone: "+47 987 65 432"
  },
  "booking-cancelled": {
    facilityName: "Bragernes Møterom",
    date: "25. november 2024",
    time: "14:00 - 16:00",
    bookingId: "BK-12347",
    contactPerson: "Maria Olsen",
    phone: "+47 555 12 34"
  }
};

/**
 * Hook for managing notification preferences and templates
 *
 * Provides comprehensive functionality for:
 * - Managing notification channel preferences (email, SMS, push)
 * - Managing notification templates
 * - Managing contact information
 * - Auto-saving with localStorage
 * - Success message toasts
 *
 * @returns Complete notification preferences management interface
 *
 * @example
 * ```tsx
 * function NotificationSettings() {
 *   const {
 *     preferences,
 *     togglePreference,
 *     saveNotificationPreferences,
 *   } = useNotificationPreferences();
 *
 *   return (
 *     <div>
 *       {preferences.map(pref => (
 *         <PreferenceToggle
 *           key={pref.id}
 *           preference={pref}
 *           onToggle={togglePreference}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useNotificationPreferences = (): IUseNotificationPreferencesReturn => {
  // Preferences state
  const [preferences, setPreferences] = useState<readonly INotificationPreference[]>(INITIAL_PREFERENCES);

  // Templates state
  const [templates, setTemplates] = useState<readonly INotificationTemplate[]>(INITIAL_TEMPLATES);

  // Contact info state
  const [contactInfo, setContactInfo] = useState<IContactInfo>({
    email: "amin@example.com",
    phone: "+47 123 45 678"
  });

  // UI state
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [successMessages, setSuccessMessages] = useState<readonly ISuccessMessage[]>([]);
  const [expandedTemplates, setExpandedTemplates] = useState<readonly string[]>([]);

  // Group preferences by category
  const groupedPreferences = useMemo(() => {
    return preferences.reduce((acc, pref) => {
      if (!acc[pref.category]) {
        acc[pref.category] = [];
      }
      acc[pref.category]!.push(pref);
      return acc;
    }, {} as Record<string, INotificationPreference[]>);
  }, [preferences]);

  // Preference actions
  const togglePreference = useCallback((preferenceId: string, channel: "email" | "sms" | "push"): void => {
    setPreferences(prev =>
      prev.map(pref =>
        pref.id === preferenceId
          ? { ...pref, [channel]: !pref[channel] }
          : pref
      )
    );

    setHasChanges(true);

    // Auto-save after 2 seconds
    setTimeout(() => {
      try {
        const currentPrefs = JSON.parse(localStorage.getItem('notificationPreferences') || '[]');
        const updatedPrefs = currentPrefs.map((pref: INotificationPreference) =>
          pref.id === preferenceId
            ? { ...pref, [channel]: !pref[channel] }
            : pref
        );
        localStorage.setItem('notificationPreferences', JSON.stringify(updatedPrefs));
      } catch (error) {
        console.error('Failed to auto-save preference:', error);
      }
    }, 2000);
  }, []);

  const saveNotificationPreferences = useCallback((): void => {
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }, [preferences]);

  // Template actions
  const toggleTemplate = useCallback((templateId: string): void => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === templateId
          ? { ...template, enabled: !template.enabled }
          : template
      )
    );

    setHasChanges(true);

    // Auto-save after 2 seconds
    setTimeout(() => {
      try {
        const currentTemplates = JSON.parse(localStorage.getItem('notificationTemplates') || '[]');
        const updatedTemplates = currentTemplates.map((template: INotificationTemplate) =>
          template.id === templateId
            ? { ...template, enabled: !template.enabled }
            : template
        );
        localStorage.setItem('notificationTemplates', JSON.stringify(updatedTemplates));
      } catch (error) {
        console.error('Failed to auto-save template:', error);
      }
    }, 2000);
  }, []);

  const saveNotificationTemplates = useCallback((): void => {
    try {
      localStorage.setItem('notificationTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save notification templates:', error);
    }
  }, [templates]);

  const toggleTemplateExpansion = useCallback((templateId: string): void => {
    setExpandedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  }, []);

  const testNotification = useCallback((templateId: string): void => {
    // In a real app, this would send a test notification
    console.log('Testing notification:', templateId);
  }, []);

  const getExampleData = useCallback((templateId: string): Record<string, string> => {
    return EXAMPLE_DATA[templateId as keyof typeof EXAMPLE_DATA] || EXAMPLE_DATA["booking-confirmation"];
  }, []);

  // Contact actions
  const saveContactInfo = useCallback((): void => {
    try {
      localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
      setIsEditingContact(false);
    } catch (error) {
      console.error('Failed to save contact info:', error);
    }
  }, [contactInfo]);

  // General actions
  const saveChanges = useCallback((): void => {
    saveNotificationPreferences();
    saveNotificationTemplates();
    setHasChanges(false);
  }, [saveNotificationPreferences, saveNotificationTemplates]);

  const addSuccessMessage = useCallback((message: string): void => {
    const id = Date.now().toString();
    setSuccessMessages(prev => [...prev, { id, message, timestamp: Date.now() }]);

    // Remove message after 3 seconds
    setTimeout(() => {
      setSuccessMessages(prev => prev.filter(msg => msg.id !== id));
    }, 3000);
  }, []);

  // Utility functions
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getCategoryIcon = useCallback((category: INotificationPreference["category"]): LucideIcon => {
    const icons: Record<INotificationPreference["category"], LucideIcon> = {
      booking: Calendar,
      system: Wrench,
      marketing: Megaphone
    };
    return icons[category];
  }, []);

  const getCategoryColor = useCallback((category: INotificationPreference["category"]): string => {
    const colors = {
      booking: "text-green-600 dark:text-green-400",
      system: "text-orange-600 dark:text-orange-400",
      marketing: "text-blue-600 dark:text-blue-400"
    };
    return colors[category];
  }, []);

  const getCategoryAccentColor = useCallback((category: INotificationPreference["category"]): string => {
    const colors = {
      booking: "border-l-green-500 bg-green-50/50 dark:bg-green-900/10",
      system: "border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/10",
      marketing: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
    };
    return colors[category];
  }, []);

  const getCategoryLabel = useCallback((category: INotificationPreference["category"]): string => {
    const labels = {
      booking: "Booking",
      system: "System",
      marketing: "Markedsføring"
    };
    return labels[category];
  }, []);

  return {
    // Preferences state
    preferences,
    groupedPreferences,

    // Templates state
    templates,

    // Contact info state
    contactInfo,
    isEditingContact,

    // UI state
    hasChanges,
    successMessages,
    expandedTemplates,

    // Preference actions
    togglePreference,
    saveNotificationPreferences,

    // Template actions
    toggleTemplate,
    saveNotificationTemplates,
    toggleTemplateExpansion,
    testNotification,
    getExampleData,

    // Contact actions
    setContactInfo,
    setIsEditingContact,
    saveContactInfo,

    // General actions
    saveChanges,
    addSuccessMessage,

    // Utility functions
    formatDate,
    getCategoryIcon,
    getCategoryColor,
    getCategoryAccentColor,
    getCategoryLabel,
  };
};
