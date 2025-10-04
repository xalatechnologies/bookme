import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Euro, Phone, Mail, Calendar } from "lucide-react";
import type { IFacility } from "@/stores/facilityStore";
import { useTranslation } from "@/i18n";

interface FacilityContactInfoProps {
  readonly facility: IFacility;
}

export const FacilityContactInfo: React.FC<FacilityContactInfoProps> = ({ facility }) => {
  const { t } = useTranslation();

  const handleBookNow = () => {
    // TODO: Implement booking functionality
    console.log('Book now clicked for facility:', facility.id);
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log('Contact clicked for facility:', facility.id);
  };

  return (
    <div className="space-y-6">
      {/* Quick Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rask info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Euro className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Pris per time</p>
              <p className="font-medium">{facility.pricePerHour} kr</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Lokasjon</p>
              <p className="font-medium">{facility.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Book denne fasiliteten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {facility.pricePerHour} kr
            </div>
            <p className="text-sm text-gray-500">per time</p>
          </div>
          
          <Button 
            onClick={handleBookNow}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Book nå
          </Button>
          
          <Button 
            onClick={handleContact}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Phone className="h-5 w-5 mr-2" />
            Kontakt oss
          </Button>
        </CardContent>
      </Card>

      {/* Opening Hours Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Åpningstider i dag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-green-600">Åpent nå</p>
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
          <CardTitle className="text-lg">Fasiliteter</CardTitle>
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
          <CardTitle className="text-lg">Kontaktinformasjon</CardTitle>
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
