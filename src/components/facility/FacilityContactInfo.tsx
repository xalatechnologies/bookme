"use client";

import React from "react";
import { Phone, Mail, Clock, Shield } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FacilityContactInfoProps {
  readonly facilityName: string;
  readonly address: string;
  readonly openingHours: string | readonly any[];
  readonly contactEmail?: string;
  readonly emergencyContact?: string;
}

export const FacilityContactInfo: React.FC<FacilityContactInfoProps> = ({
  facilityName,
  address,
  openingHours,
  contactEmail,
  emergencyContact
}): JSX.Element => {
  const { language } = useLanguage();

  const translations = {
    NO: {
      contactInfo: "Kontaktinformasjon",
      facilityManager: "Anleggsansvarlig",
      openingHours: "Åpningstider",
      emergencyContact: "Nødkontakt",
      bookingPolicies: "Booking regler",
      cancellation: "Gratis avbestilling",
      cancellationPolicy: "opptil 24 timer før reservert tid",
      minBooking: "Minimum booking",
      maxBooking: "Maksimum booking",
      hours: "timer"
    },
    EN: {
      contactInfo: "Contact Information",
      facilityManager: "Facility Manager",
      openingHours: "Opening Hours",
      emergencyContact: "Emergency Contact",
      bookingPolicies: "Booking Policies",
      cancellation: "Free cancellation",
      cancellationPolicy: "up to 24 hours before reserved time",
      minBooking: "Minimum booking",
      maxBooking: "Maximum booking",
      hours: "hours"
    }
  };

  const t = translations[language];

  const formatOpeningHours = (hours: string | readonly any[]): string => {
    if (typeof hours === 'string') {
      return hours;
    }
    // For array format, return a simple string for now
    return "08:00 - 22:00";
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-blue-600" />
          {t.contactInfo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Facility Manager */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{t.facilityManager}</p>
              <p className="text-sm text-gray-600">{contactEmail || "drammen.booking@kommune.no"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Opening Hours */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{t.openingHours}</p>
              <p className="text-sm text-gray-600">{formatOpeningHours(openingHours)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Emergency Contact */}
        <div className="space-y-3">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-gray-400 mr-3" />
            <div>
              <p className="font-semibold text-gray-900">{t.emergencyContact}</p>
              <p className="text-sm text-gray-600">{emergencyContact || "+47 32 04 70 00"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Booking Policies */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">{t.bookingPolicies}</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">{t.cancellation}</p>
                <p className="text-gray-600">{t.cancellationPolicy}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">{t.minBooking}</p>
                <p className="text-gray-600">1 {t.hours}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900">{t.maxBooking}</p>
                <p className="text-gray-600">8 {t.hours}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
