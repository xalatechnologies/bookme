"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Save,
  TestTube,
  Edit3,
  Eye,
  User,
  Check,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNotificationPreferences } from "@/hooks/features/notifications";
import type { INotificationPreference } from "@/hooks/features/notifications";

const UserNotifications = (): JSX.Element => {
  const {
    // State
    preferences,
    groupedPreferences,
    templates,
    contactInfo,
    isEditingContact,
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
  } = useNotificationPreferences();

  const getChannelIcon = (channel: "email" | "sms" | "push"): JSX.Element => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Bell
    };
    const Icon = icons[channel];
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Varsler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administrer hvordan du vil motta varsler og meldinger
          </p>
        </div>

        {hasChanges && (
          <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700 transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Lagre endringer
          </Button>
        )}
      </div>

      {/* Success Messages */}
      {successMessages.length > 0 && (
        <div className="space-y-2">
          {successMessages.map((msg) => (
            <div key={msg.id} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-200 dark:border-green-800">
              <Check className="h-4 w-4" />
              {msg.message}
            </div>
          ))}
        </div>
      )}

      {/* Contact Information */}
      <Card className="bg-muted/30 border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Kontaktinformasjon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingContact ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  E-postadresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefonnummer
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => {
                  saveContactInfo();
                  addSuccessMessage("Kontaktinformasjon lagret");
                }} size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Lagre
                </Button>
                <Button
                  onClick={() => setIsEditingContact(false)}
                  variant="outline"
                  size="sm"
                >
                  Avbryt
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">E-postadresse</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.email}</p>
                </div>
                <Button
                  onClick={() => setIsEditingContact(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Telefonnummer</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contactInfo.phone}</p>
                </div>
                <Button
                  onClick={() => setIsEditingContact(true)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences with Visual Hierarchy */}
      <div className="space-y-6">
        {/* Desktop View */}
        <div className="hidden md:block space-y-6">
          {Object.entries(groupedPreferences).map(([category, prefs]) => (
            <Card key={category} className={`${getCategoryAccentColor(category as INotificationPreference["category"])} border-l-4 transition-all duration-200 hover:shadow-md`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  {getCategoryIcon(category as INotificationPreference["category"])}
                  <span className={getCategoryColor(category as INotificationPreference["category"])}>
                    {getCategoryLabel(category as INotificationPreference["category"])}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {prefs.filter(p => p.email || p.sms || p.push).length} aktive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prefs.map((preference) => (
                  <div key={preference.id} className="group p-4 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/50 transition-all duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                          {preference.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {preference.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 ml-4">
                        {(["email", "sms", "push"] as const).map((channel) => (
                          <div key={channel} className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-md transition-colors ${
                              preference[channel]
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500"
                            }`}>
                              {getChannelIcon(channel)}
                            </div>
                            <Switch
                              checked={preference[channel]}
                              onCheckedChange={() => {
                                togglePreference(preference.id, channel);
                                addSuccessMessage(`${channel === "email" ? "E-post" : channel === "sms" ? "SMS" : "Push"}-varsler ${preference[channel] ? "deaktivert" : "aktivert"}`);
                              }}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile View with Accordion */}
        <div className="md:hidden">
          <Accordion type="multiple" className="space-y-4">
            {Object.entries(groupedPreferences).map(([category, prefs]) => (
              <AccordionItem key={category} value={category} className="border border-border/60 rounded-lg">
                <AccordionTrigger className={`${getCategoryAccentColor(category as INotificationPreference["category"])} px-4 py-3 hover:no-underline`}>
                  <div className="flex items-center gap-3 text-left">
                    {getCategoryIcon(category as INotificationPreference["category"])}
                    <span className={getCategoryColor(category as INotificationPreference["category"])}>
                      {getCategoryLabel(category as INotificationPreference["category"])}
                    </span>
                    <Badge variant="secondary" className="ml-2">
                      {prefs.filter(p => p.email || p.sms || p.push).length} aktive
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3 pt-2">
                    {prefs.map((preference) => (
                      <div key={preference.id} className="group p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-muted/50 transition-all duration-150">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {preference.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {preference.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {(["email", "sms", "push"] as const).map((channel) => (
                              <div key={channel} className="flex items-center gap-2 min-w-0 flex-1">
                                <div className={`p-1.5 rounded-md transition-colors ${
                                  preference[channel]
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}>
                                  {getChannelIcon(channel)}
                                </div>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {channel === "email" ? "E-post" : channel === "sms" ? "SMS" : "Push"}
                                </span>
                                <Switch
                                  checked={preference[channel]}
                                  onCheckedChange={() => {
                                    togglePreference(preference.id, channel);
                                    addSuccessMessage(`${channel === "email" ? "E-post" : channel === "sms" ? "SMS" : "Push"}-varsler ${preference[channel] ? "deaktivert" : "aktivert"}`);
                                  }}
                                  className="data-[state=checked]:bg-blue-600 ml-auto"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Notification Templates */}
      <Card className="bg-muted/30 border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Varselmaler
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Standardtekster for e-post og SMS som sendes ved hendelser
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-border/60 rounded-lg overflow-hidden">
              <div className="p-4 bg-background/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.title}
                    </h3>
                    <Badge variant={template.type === "email" ? "default" : "secondary"}>
                      {template.type === "email" ? "E-post" : "SMS"}
                    </Badge>
                    {template.enabled ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Aktiv
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Deaktivert
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        testNotification(template.id);
                        addSuccessMessage(`Test sendt til ${contactInfo.email} – sjekk innboksen`);
                      }}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 sm:flex-none"
                    >
                      <TestTube className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Forhåndsvisning: {template.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">E-post forhåndsvisning</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Til:</strong> {contactInfo.email}</p>
                              <p><strong>Emne:</strong> {template.subject}</p>
                              <div className="border-t pt-2">
                                <div className="whitespace-pre-wrap">
                                  {template.content.replace(/\{(\w+)\}/g, (match, key) => {
                                    const exampleData = getExampleData(template.id);
                                    return exampleData[key] || match;
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">SMS forhåndsvisning</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Til:</strong> {contactInfo.phone}</p>
                              <div className="border-t pt-2">
                                <div className="whitespace-pre-wrap">
                                  {template.smsContent?.replace(/\{(\w+)\}/g, (match, key) => {
                                    const exampleData = getExampleData(template.id);
                                    return exampleData[key] || match;
                                  }) || "Ingen SMS-mal definert"}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <p><strong>Eksempeldata brukt:</strong></p>
                            <ul className="list-disc list-inside mt-1">
                              {Object.entries(getExampleData(template.id)).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Switch
                      checked={template.enabled}
                      onCheckedChange={() => {
                        toggleTemplate(template.id);
                        addSuccessMessage(`Mal "${template.title}" ${template.enabled ? "deaktivert" : "aktivert"}`);
                      }}
                    />
                  </div>
                </div>

                {template.lastSent && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Sist sendt: {formatDate(template.lastSent)}
                  </p>
                )}
              </div>

              {expandedTemplates.includes(template.id) && (
                <div className="p-4 border-t border-border/60 bg-muted/20">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Maltekst</Label>
                      <div className="mt-1 p-3 bg-background border border-border/60 rounded-md text-sm font-mono break-words">
                        {template.description}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Variabler: {"{facility}"}, {"{date}"}, {"{time}"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserNotifications;
