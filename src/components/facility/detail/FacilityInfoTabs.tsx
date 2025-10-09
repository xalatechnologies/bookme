"use client";

import React from 'react';
import { CheckCircle, XCircle, Users, MapPin, Wifi, Car, Camera, Volume2, Calendar } from 'lucide-react';

import type { Zone } from '@/components/booking/types';
import { useTranslation } from '@/i18n';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FacilityInfoTabsProps {
  readonly description: string;
  readonly capacity: number;
  readonly equipment: readonly string[];
  readonly zones: readonly Zone[];
  readonly amenities: readonly string[];
  readonly address: string;
  readonly area: string;
  readonly suitableFor: readonly string[];
  readonly facilityId: string;
  readonly facilityName: string;
}

export const FacilityInfoTabs: React.FC<FacilityInfoTabsProps> = ({ 
  description, 
  capacity, 
  equipment, 
  zones, 
  amenities, 
  address,
  area,
  suitableFor,
  facilityId,
  facilityName
}): JSX.Element => {
  const { t } = useTranslation();
  
  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facilityId);

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internett')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('parkering')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('lyd') || amenityLower.includes('sound')) return <Volume2 className="h-4 w-4" />;
    if (amenityLower.includes('kamera') || amenityLower.includes('photo')) return <Camera className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general">Generell info</TabsTrigger>
        <TabsTrigger value="zones">Soner</TabsTrigger>
        <TabsTrigger value="facilities">Fasiliteter</TabsTrigger>
        <TabsTrigger value="rules">Regler</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Om {facilityName}</h3>
          <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Dynamic fields from configuration - first column */}
              {fieldConfigs
                .filter(field => field.visible)
                .slice(0, Math.ceil(fieldConfigs.filter(field => field.visible).length / 2))
                .map(field => {
                  const getFieldValue = (): string | number => {
                    if (field.key === 'capacity') return capacity;
                    if (field.key === 'area') return area;
                    if (field.key === 'pricePerHour') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    if (field.key === 'rating') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    if (field.key === 'reviewCount') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                  };

                  const getIcon = (): JSX.Element => {
                    if (field.key === 'capacity') return <Users className="h-5 w-5 text-gray-400 mr-3" />;
                    if (field.key === 'area') return <MapPin className="h-5 w-5 text-gray-400 mr-3" />;
                    if (field.key === 'pricePerHour') return <span className="text-gray-400 mr-3">💰</span>;
                    if (field.key === 'rating') return <span className="text-yellow-500 mr-3">★</span>;
                    if (field.key === 'reviewCount') return <span className="text-gray-400 mr-3">📝</span>;
                    return <span className="text-gray-400 mr-3">📋</span>;
                  };

                  const getUnit = (): string => {
                    if (field.key === 'capacity') return 'personer';
                    if (field.key === 'area') return 'm²';
                    if (field.key === 'pricePerHour') return 'kr/time';
                    if (field.key === 'rating') return '/5';
                    if (field.key === 'reviewCount') return 'anmeldelser';
                    return '';
                  };

                  return (
                    <div key={field.id} className="flex items-center">
                      {getIcon()}
                      <div>
                        <span className="font-medium">{field.label}:</span>
                        <span className="ml-2 text-gray-600">
                          {getFieldValue()}
                          {getUnit() && ` ${getUnit()}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <div className="space-y-4">
              {/* Dynamic fields from configuration - second column */}
              {fieldConfigs
                .filter(field => field.visible)
                .slice(Math.ceil(fieldConfigs.filter(field => field.visible).length / 2))
                .map(field => {
                  const getFieldValue = (): string | number => {
                    if (field.key === 'capacity') return capacity;
                    if (field.key === 'area') return area;
                    if (field.key === 'pricePerHour') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    if (field.key === 'rating') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    if (field.key === 'reviewCount') return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                    return typeof field.value === 'boolean' ? (field.value ? 'Ja' : 'Nei') : field.value;
                  };

                  const getIcon = (): JSX.Element => {
                    if (field.key === 'capacity') return <Users className="h-5 w-5 text-gray-400 mr-3" />;
                    if (field.key === 'area') return <MapPin className="h-5 w-5 text-gray-400 mr-3" />;
                    if (field.key === 'pricePerHour') return <span className="text-gray-400 mr-3">💰</span>;
                    if (field.key === 'rating') return <span className="text-yellow-500 mr-3">★</span>;
                    if (field.key === 'reviewCount') return <span className="text-gray-400 mr-3">📝</span>;
                    return <span className="text-gray-400 mr-3">📋</span>;
                  };

                  const getUnit = (): string => {
                    if (field.key === 'capacity') return 'personer';
                    if (field.key === 'area') return 'm²';
                    if (field.key === 'pricePerHour') return 'kr/time';
                    if (field.key === 'rating') return '/5';
                    if (field.key === 'reviewCount') return 'anmeldelser';
                    return '';
                  };

                  return (
                    <div key={field.id} className="flex items-center">
                      {getIcon()}
                      <div>
                        <span className="font-medium">{field.label}:</span>
                        <span className="ml-2 text-gray-600">
                          {getFieldValue()}
                          {getUnit() && ` ${getUnit()}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              
              {equipment.length > 0 && (
                <div>
                  <span className="font-medium">Utstyr:</span>
                  <span className="ml-2 text-gray-600">{equipment.slice(0, 2).join(', ')}</span>
                  {equipment.length > 2 && <span className="text-gray-500"> +{equipment.length - 2} mer</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="zones" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Tilgjengelige soner</h3>
          {zones.length > 0 ? (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <h4 className="font-semibold text-lg">{zone.name}</h4>
                  </div>
                  <p className="text-gray-600 mb-4">{zone.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Kapasitet:</span>
                      <span className="ml-2">{zone.capacity} personer</span>
                    </div>
                    <div>
                      <span className="font-medium">Pris:</span>
                      <span className="ml-2">{zone.pricePerHour} kr/time</span>
                    </div>
                    <div>
                      <span className="font-medium">Areal:</span>
                      <span className="ml-2">{zone.area}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-lg">Hele lokalet</h4>
              </div>
              <p className="text-gray-600 mb-4">
                Book hele {facilityName} for ditt arrangement. Perfekt for større grupper og spesielle anledninger.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Kapasitet:</span>
                  <span className="ml-2">{capacity} personer</span>
                </div>
                <div>
                  <span className="font-medium">Areal:</span>
                  <span className="ml-2">{area}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="facilities" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Tilgjengelige fasiliteter</h3>
          {amenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-green-500 mr-3">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Ingen spesielle fasiliteter registrert.</p>
          )}
          
          {equipment.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Tilgjengelig utstyr</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipment.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {suitableFor.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Egnet for</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suitableFor.map((activity, index) => (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 mr-3">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="rules" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Regler og retningslinjer</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Røykeforbud</p>
                <p className="text-gray-600 text-sm">Røyking er ikke tillatt inne i lokalet.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Rydding etter bruk</p>
                <p className="text-gray-600 text-sm">Lokalet må ryddes og rengjøres etter bruk.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Støy etter kl. 22:00</p>
                <p className="text-gray-600 text-sm">Høy musikk og støy er ikke tillatt etter kl. 22:00.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Avbestilling</p>
                <p className="text-gray-600 text-sm">Gratis avbestilling inntil 48 timer før arrangementet.</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="faq" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Ofte stilte spørsmål</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Hvor lang tid i forveien kan jeg booke?</h4>
              <p className="text-gray-600">Du kan booke inntil 90 dager i forveien.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Kan jeg avbestille bookingen min?</h4>
              <p className="text-gray-600">Ja, du kan avbestille gratis inntil 48 timer før arrangementet starter.</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Er det parkering tilgjengelig?</h4>
              <p className="text-gray-600">
                {amenities.some(a => a.toLowerCase().includes('parkering')) 
                  ? 'Ja, det er parkering tilgjengelig ved lokalet.' 
                  : 'Kontakt oss for informasjon om parkeringsmuligheter i området.'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Kan jeg ta med egen mat og drikke?</h4>
              <p className="text-gray-600">Ja, du kan ta med egen mat og drikke. Husk å rydde opp etter deg.</p>
            </div>
          </div>
        </div>
      </TabsContent>

    </Tabs>
  );
};