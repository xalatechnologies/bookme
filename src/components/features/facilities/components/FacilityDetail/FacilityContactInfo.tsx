import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, Phone, Mail, Calendar } from "lucide-react";
import type { IFacility } from "@/stores/facilityStore";
import { useTranslation } from "react-i18next";

interface FacilityContactInfoProps {
  readonly facility: IFacility;
}

export const FacilityContactInfo: React.FC<FacilityContactInfoProps> = ({ facility }) => {
  const { t } = useTranslation(['facilities', 'common']);

  const handleBookNow = (): void => {
    try {
      // Navigate to booking page
      window.location.href = `/facilities/${facility.id}/book`;
    } catch (error) {
      console.error('Failed to navigate to booking:', error);
      alert(t('facilities:contact.booking_failed'));
    }
  };

  const handleContact = (): void => {
    try {
      // Create contact options
      const contactOptions = [
        `${t('facilities:contact.phone')}: ${facility.emergencyContact || "+47 32 04 70 00"}`,
        `${t('facilities:contact.email')}: ${facility.contactEmail || "booking@drammen.kommune.no"}`,
        `${t('facilities:contact.facility')}: ${facility.name}`,
        `${t('facilities:contact.location')}: ${facility.location}`
      ].join('\n');

      // Show contact information
      const contactChoice = window.confirm(
        `${t('facilities:contact.contact_info_for', { name: facility.name })}\n\n${contactOptions}\n\n${t('facilities:contact.open_email_client')}`
      );

      if (contactChoice) {
        // Open email client
        const subject = t('facilities:contact.inquiry_about', { name: facility.name });
        const body = t('facilities:contact.email_template', { name: facility.name });

        const mailtoLink = `mailto:${facility.contactEmail || "booking@drammen.kommune.no"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
      } else {
        // Copy contact info to clipboard
        navigator.clipboard.writeText(contactOptions);
        alert(t('facilities:contact.contact_copied'));
      }
    } catch (error) {
      console.error('Failed to handle contact:', error);
      alert(t('facilities:contact.contact_error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('details.quick_info', { ns: 'facilities' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Euro className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">{t('fields.price_per_hour', { ns: 'facilities' })}</p>
              <p className="font-medium">{facility.pricePerHour} kr</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">{t('fields.location', { ns: 'facilities' })}</p>
              <p className="font-medium">{facility.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('details.book_facility', { ns: 'facilities' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {facility.pricePerHour} kr
            </div>
            <p className="text-sm text-gray-500">{t('details.per_hour', { ns: 'facilities' })}</p>
          </div>

          <Button
            onClick={handleBookNow}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Calendar className="h-5 w-5 mr-2" />
            {t('actions.book_now', { ns: 'common' })}
          </Button>

          <Button
            onClick={handleContact}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            {t('actions.contact_us', { ns: 'common' })}
          </Button>
        </CardContent>
      </Card>

      {/* Opening Hours Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('details.opening_hours_today', { ns: 'facilities' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-green-600">{t('status.open_now', { ns: 'facilities' })}</p>
              <p className="text-sm text-gray-500">
                {facility.availability.monday.start} - {facility.availability.monday.end}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('details.facilities', { ns: 'facilities' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {facility.amenities.slice(0, 6).map((amenity, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
              >
                {amenity}
              </Badge>
            ))}
            {facility.amenities.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{facility.amenities.length - 6} {t('facilities:card.more')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('details.contact_info', { ns: 'facilities' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{facility.emergencyContact || "+47 32 04 70 00"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{facility.contactEmail || "booking@drammen.kommune.no"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
