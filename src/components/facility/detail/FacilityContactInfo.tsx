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
      alert('Kunne ikke navigere til bookingside. Prøv igjen.');
    }
  };

  const handleContact = (): void => {
    try {
      // Create contact options
      const contactOptions = [
        `Telefon: ${facility.emergencyContact || "+47 32 04 70 00"}`,
        `E-post: ${facility.contactEmail || "booking@drammen.kommune.no"}`,
        `Fasilitet: ${facility.name}`,
        `Lokasjon: ${facility.location}`
      ].join('\n');

      // Show contact information
      const contactChoice = window.confirm(
        `Kontaktinformasjon for ${facility.name}:\n\n${contactOptions}\n\nVil du åpne e-post klient?`
      );

      if (contactChoice) {
        // Open email client
        const subject = `Forespørsel om ${facility.name}`;
        const body = `Hei,\n\nJeg er interessert i å booke ${facility.name}.\n\nKan dere gi meg mer informasjon?\n\nMvh`;

        const mailtoLink = `mailto:${facility.contactEmail || "booking@drammen.kommune.no"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
      } else {
        // Copy contact info to clipboard
        navigator.clipboard.writeText(contactOptions);
        alert('Kontaktinformasjon kopiert til utklippstavle!');
      }
    } catch (error) {
      console.error('Failed to handle contact:', error);
      alert('Kunne ikke åpne kontaktfunksjonalitet. Prøv igjen.');
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
                +{facility.amenities.length - 6} flere
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
