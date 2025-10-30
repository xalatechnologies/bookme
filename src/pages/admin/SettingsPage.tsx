"use client";

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Settings,
  Mail,
  CreditCard,
  Bell,
  Shield,
  Save,
  X,
  AlertTriangle,
  Check,
  Info,
  Eye,
  EyeOff,
  TestTube,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSettingsManagement } from "@/hooks/features/settings/useSettingsManagement";

// Settings tab type (moved from settingsUIStore)
type TSettingsTab = 'general' | 'email' | 'payment' | 'notifications' | 'security';

interface ISettingsPageProps {
  readonly children?: never;
}

const SettingsPage = (_props: ISettingsPageProps): JSX.Element => {
  const { t } = useTranslation();
  const [showSmtpPassword, setShowSmtpPassword] = React.useState(false);
  const [showPaymentKeys, setShowPaymentKeys] = React.useState(false);

  const {
    settings,
    isLoading,
    error,
    activeTab,
    unsavedChanges,
    isSaving,
    saveSuccess,
    saveError,
    validationErrors,
    availableTimezones,
    availableCurrencies,
    availableLanguages,
    setActiveTab,
    updateSettings,
    saveSettings,
    discardChanges,
    testEmailConnection,
    testPaymentConnection,
  } = useSettingsManagement();

  const [isTestingEmail, setIsTestingEmail] = React.useState(false);
  const [isTestingPayment, setIsTestingPayment] = React.useState(false);

  const handleSave = useCallback(async () => {
    try {
      await saveSettings();
    } catch (err) {
      // Error is already handled in the hook
      console.error('Failed to save settings:', err);
    }
  }, [saveSettings]);

  const handleTestEmail = useCallback(async () => {
    setIsTestingEmail(true);
    try {
      const success = await testEmailConnection();
      if (success) {
        alert('Email connection successful!');
      } else {
        alert('Email connection failed. Please check your settings.');
      }
    } finally {
      setIsTestingEmail(false);
    }
  }, [testEmailConnection]);

  const handleTestPayment = useCallback(async () => {
    setIsTestingPayment(true);
    try {
      const success = await testPaymentConnection();
      if (success) {
        alert('Payment connection successful!');
      } else {
        alert('Payment connection failed. Please check your settings.');
      }
    } finally {
      setIsTestingPayment(false);
    }
  }, [testPaymentConnection]);

  const tabs: Array<{ id: TSettingsTab; label: string; icon: typeof Settings }> = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "email", label: "Email Configuration", icon: Mail },
    { id: "payment", label: "Payment Settings", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  const renderGeneralSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic organization settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={settings.general.timezone}
                  onValueChange={(value) =>
                    updateSettings("general", { timezone: value })
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimezones.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.general?.includes('Timezone is required') && (
                  <p className="text-sm text-red-600">Timezone is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={settings.general.language}
                  onValueChange={(value) =>
                    updateSettings("general", { language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.general.dateFormat}
                  onValueChange={(value) =>
                    updateSettings("general", { dateFormat: value })
                  }
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd.mm.yyyy">DD.MM.YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={settings.general.timeFormat}
                  onValueChange={(value) =>
                    updateSettings("general", { timeFormat: value })
                  }
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24-hour (14:30)</SelectItem>
                    <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={settings.general.currency}
                  onValueChange={(value) =>
                    updateSettings("general", { currency: value })
                  }
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCurrencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessHoursStart">Start Time</Label>
                  <Input
                    id="businessHoursStart"
                    type="time"
                    value={settings.general.businessHoursStart}
                    onChange={(e) =>
                      updateSettings("general", {
                        businessHoursStart: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessHoursEnd">End Time</Label>
                  <Input
                    id="businessHoursEnd"
                    type="time"
                    value={settings.general.businessHoursEnd}
                    onChange={(e) =>
                      updateSettings("general", {
                        businessHoursEnd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEmailSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure SMTP settings for sending emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Email Status
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {settings.email.enabled ? "Email sending is enabled" : "Email sending is disabled"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={(checked) =>
                  updateSettings("email", { enabled: checked })
                }
              />
            </div>

            {settings.email.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      placeholder="smtp.example.com"
                      value={settings.email.smtpHost}
                      onChange={(e) =>
                        updateSettings("email", { smtpHost: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      placeholder="587"
                      value={settings.email.smtpPort}
                      onChange={(e) =>
                        updateSettings("email", { smtpPort: parseInt(e.target.value) || 587 })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      placeholder="user@example.com"
                      value={settings.email.smtpUser}
                      onChange={(e) =>
                        updateSettings("email", { smtpUser: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showSmtpPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={settings.email.smtpPassword}
                        onChange={(e) =>
                          updateSettings("email", { smtpPassword: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      placeholder="noreply@example.com"
                      value={settings.email.fromEmail}
                      onChange={(e) =>
                        updateSettings("email", { fromEmail: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      placeholder="Your Organization"
                      value={settings.email.fromName}
                      onChange={(e) =>
                        updateSettings("email", { fromName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Use SSL</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable SSL encryption for SMTP connection
                      </p>
                    </div>
                    <Switch
                      checked={settings.email.useSSL}
                      onCheckedChange={(checked) =>
                        updateSettings("email", { useSSL: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Use TLS</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable TLS encryption for SMTP connection
                      </p>
                    </div>
                    <Switch
                      checked={settings.email.useTLS}
                      onCheckedChange={(checked) =>
                        updateSettings("email", { useTLS: checked })
                      }
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    {isTestingEmail ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Email Connection
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPaymentSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Configuration
            </CardTitle>
            <CardDescription>
              Configure payment provider and processing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">
                    Payment Status
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {settings.payment.enabled ? "Payment processing is enabled" : "Payment processing is disabled"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.payment.enabled}
                onCheckedChange={(checked) =>
                  updateSettings("payment", { enabled: checked })
                }
              />
            </div>

            {settings.payment.enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentProvider">Payment Provider</Label>
                  <Select
                    value={settings.payment.provider || ""}
                    onValueChange={(value) =>
                      updateSettings("payment", { provider: value })
                    }
                  >
                    <SelectTrigger id="paymentProvider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="vipps">Vipps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicKey">Public Key</Label>
                  <Input
                    id="publicKey"
                    placeholder="pk_test_..."
                    value={settings.payment.publicKey}
                    onChange={(e) =>
                      updateSettings("payment", { publicKey: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="secretKey"
                      type={showPaymentKeys ? "text" : "password"}
                      placeholder="sk_test_..."
                      value={settings.payment.secretKey}
                      onChange={(e) =>
                        updateSettings("payment", { secretKey: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPaymentKeys(!showPaymentKeys)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPaymentKeys ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook Secret</Label>
                  <Input
                    id="webhookSecret"
                    type={showPaymentKeys ? "text" : "password"}
                    placeholder="whsec_..."
                    value={settings.payment.webhookSecret}
                    onChange={(e) =>
                      updateSettings("payment", { webhookSecret: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentCurrency">Currency</Label>
                  <Select
                    value={settings.payment.currency}
                    onValueChange={(value) =>
                      updateSettings("payment", { currency: value })
                    }
                  >
                    <SelectTrigger id="paymentCurrency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies.map((curr) => (
                        <SelectItem key={curr} value={curr}>
                          {curr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use test API keys and simulate payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.testMode}
                    onCheckedChange={(checked) =>
                      updateSettings("payment", { testMode: checked })
                    }
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleTestPayment}
                    disabled={isTestingPayment}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    {isTestingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Payment Connection
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotificationSettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Created</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications when new bookings are created
                </p>
              </div>
              <Switch
                checked={settings.notifications.bookingCreated}
                onCheckedChange={(checked) =>
                  updateSettings("notifications", { bookingCreated: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Cancelled</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications when bookings are cancelled
                </p>
              </div>
              <Switch
                checked={settings.notifications.bookingCancelled}
                onCheckedChange={(checked) =>
                  updateSettings("notifications", { bookingCancelled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Booking Modified</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications when bookings are modified
                </p>
              </div>
              <Switch
                checked={settings.notifications.bookingModified}
                onCheckedChange={(checked) =>
                  updateSettings("notifications", { bookingModified: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Received</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive notifications when payments are received
                </p>
              </div>
              <Switch
                checked={settings.notifications.paymentReceived}
                onCheckedChange={(checked) =>
                  updateSettings("notifications", { paymentReceived: checked })
                }
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications about system updates and maintenance
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", { systemUpdates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="font-medium">Security Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications about security events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", { securityAlerts: checked })
                  }
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enable push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", { pushEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="font-medium">Notification Sound</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Play sound for push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.pushSound}
                  onCheckedChange={(checked) =>
                    updateSettings("notifications", { pushSound: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSecuritySettings = (): JSX.Element => {
    if (!settings) return <></>;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Require two-factor authentication for login
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactorEnabled}
                onCheckedChange={(checked) =>
                  updateSettings("security", { twoFactorEnabled: checked })
                }
              />
            </div>

            {settings.security.twoFactorEnabled && (
              <div className="space-y-2">
                <Label htmlFor="twoFactorMethod">Two-Factor Method</Label>
                <Select
                  value={settings.security.twoFactorMethod || ""}
                  onValueChange={(value) =>
                    updateSettings("security", { twoFactorMethod: value })
                  }
                >
                  <SelectTrigger id="twoFactorMethod">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="app">Authenticator App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="1440"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  updateSettings("security", {
                    sessionTimeout: parseInt(e.target.value) || 30,
                  })
                }
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Auto-logout after period of inactivity (5-1440 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
              <Input
                id="passwordExpiry"
                type="number"
                min="0"
                max="365"
                value={settings.security.passwordExpiryDays}
                onChange={(e) =>
                  updateSettings("security", {
                    passwordExpiryDays: parseInt(e.target.value) || 90,
                  })
                }
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Force password change after specified days (0 = never)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Password Change</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Users must change password on next login
                </p>
              </div>
              <Switch
                checked={settings.security.requirePasswordChange}
                onCheckedChange={(checked) =>
                  updateSettings("security", { requirePasswordChange: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderTabContent = (): JSX.Element => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "email":
        return renderEmailSettings();
      case "payment":
        return renderPaymentSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-red-600">Failed to load settings</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Organization Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your organization configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          {unsavedChanges && (
            <Button
              onClick={discardChanges}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Discard
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!unsavedChanges || isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-300 font-medium">
            Settings saved successfully!
          </span>
        </div>
      )}

      {/* Error Message */}
      {saveError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300 font-medium">
            {saveError}
          </span>
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-700 dark:text-red-300 mb-2">
                Validation Errors
              </p>
              <ul className="space-y-1 text-sm text-red-600 dark:text-red-400">
                {Object.entries(validationErrors).map(([section, errors]) =>
                  errors.map((error, index) => (
                    <li key={`${section}-${index}`}>
                      {section}: {error}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      aria-label={`Switch to ${tab.label} tab`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
