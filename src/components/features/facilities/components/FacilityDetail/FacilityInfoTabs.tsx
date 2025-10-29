"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, Users, MapPin, Wifi, Car, Camera, Volume2, Calendar, ChevronDown, ChevronRight, Phone, Mail } from 'lucide-react';

import type { Zone } from '@/types/booking';
import type { IFacility } from '@/stores/facilityStore';
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
  readonly contactInfo?: IFacility;
}

/**
 * Get icon for amenity based on amenity name
 */
const getAmenityIcon = (amenity: string): JSX.Element => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes('wifi') || amenityLower.includes('internett')) {
    return <Wifi className="h-4 w-4" />;
  }
  if (amenityLower.includes('parkering') || amenityLower.includes('parking')) {
    return <Car className="h-4 w-4" />;
  }
  if (amenityLower.includes('lyd') || amenityLower.includes('sound') || amenityLower.includes('audio')) {
    return <Volume2 className="h-4 w-4" />;
  }
  if (amenityLower.includes('kamera') || amenityLower.includes('photo') || amenityLower.includes('camera')) {
    return <Camera className="h-4 w-4" />;
  }
  return <CheckCircle className="h-4 w-4" />;
};

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
  facilityName,
  contactInfo
}): JSX.Element => {
  const { t } = useTranslation(['common', 'facility']);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (faqId: string): void => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facilityId);

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general">{t('common:tabs.general')}</TabsTrigger>
        <TabsTrigger value="zones">{t('common:tabs.zones')}</TabsTrigger>
        <TabsTrigger value="facilities">{t('common:tabs.facilities')}</TabsTrigger>
        <TabsTrigger value="rules">{t('common:tabs.rules')}</TabsTrigger>
        <TabsTrigger value="faq">{t('common:tabs.faq')}</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('common:about')} {facilityName}</h3>
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
                    if (field.key === 'pricePerHour') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    if (field.key === 'rating') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    if (field.key === 'reviewCount') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
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
                    if (field.key === 'capacity') return t('facility:card.people');
                    if (field.key === 'area') return t('facility:card.squareMeters');
                    if (field.key === 'pricePerHour') return t('facility:card.pricePerHour');
                    if (field.key === 'rating') return t('facility:card.outOf5');
                    if (field.key === 'reviewCount') return t('facility:card.reviewCount');
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
                    if (field.key === 'pricePerHour') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    if (field.key === 'rating') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    if (field.key === 'reviewCount') return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
                    return typeof field.value === 'boolean' ? (field.value ? t('facility:card.yes') : t('facility:card.no')) : field.value;
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
                    if (field.key === 'capacity') return t('facility:card.people');
                    if (field.key === 'area') return t('facility:card.squareMeters');
                    if (field.key === 'pricePerHour') return t('facility:card.pricePerHour');
                    if (field.key === 'rating') return t('facility:card.outOf5');
                    if (field.key === 'reviewCount') return t('facility:card.reviewCount');
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
                  <span className="font-medium">{t('facility:fields.equipment')}:</span>
                  <span className="ml-2 text-gray-600">{equipment.slice(0, 2).join(', ')}</span>
                  {equipment.length > 2 && <span className="text-gray-500"> +{equipment.length - 2} {t('facility:card.moreAmenities')}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Contact Information Fields - Added at the bottom of the general tab */}
          {contactInfo && (contactInfo.contactEmail || contactInfo.emergencyContact) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold mb-4">{t('facility:details.contact_info')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {contactInfo.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="font-medium">{t('facility:contact.email')}</span>
                      <span className="ml-2 text-gray-600">{contactInfo.contactEmail}</span>
                    </div>
                  </div>
                )}
                
                {contactInfo.emergencyContact && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <span className="font-medium">{t('facility:contact.phone')}</span>
                      <span className="ml-2 text-gray-600">{contactInfo.emergencyContact}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="zones" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('common:available_zones')}</h3>
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
                      <span className="font-medium">{t('facility:fields.capacity')}:</span>
                      <span className="ml-2">{zone.capacity} {t('facility:card.people')}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t('facility:fields.price')}:</span>
                      <span className="ml-2">{zone.pricePerHour} {t('facility:card.pricePerHour')}</span>
                    </div>
                    <div>
                      <span className="font-medium">{t('facility:fields.area')}:</span>
                      <span className="ml-2">{zone.area} {t('facility:card.squareMeters')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h4 className="font-semibold text-lg">{t('common:entire_facility')}</h4>
              </div>
              <p className="text-gray-600 mb-4">
                {t('common:book_entire_facility', { name: facilityName })}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">{t('facility:fields.capacity')}:</span>
                  <span className="ml-2">{capacity} {t('facility:card.people')}</span>
                </div>
                <div>
                  <span className="font-medium">{t('facility:fields.area')}:</span>
                  <span className="ml-2">{area} {t('facility:card.squareMeters')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="facilities" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('facility:amenities.available_title')}</h3>
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
            <p className="text-gray-600">{t('facility:amenities.no_amenities')}</p>
          )}

          {equipment.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">{t('facility:amenities.equipment_title')}</h4>
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
              <h4 className="text-lg font-semibold mb-4">{t('facility:amenities.suitable_for')}</h4>
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
          <h3 className="text-xl font-semibold mb-4">{t('facility:rules.title')}</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('facility:rules.noSmoking')}</p>
                <p className="text-gray-600 text-sm">{t('common:rules.smoking_not_allowed')}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('facility:rules.cleanupRequired')}</p>
                <p className="text-gray-600 text-sm">{t('common:rules.cleanup_required_desc')}</p>
              </div>
            </div>

            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('common:rules.noise_after_hours')}</p>
                <p className="text-gray-600 text-sm">{t('common:rules.noise_after_hours_desc')}</p>
              </div>
            </div>

            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('common:rules.cancellation')}</p>
                <p className="text-gray-600 text-sm">{t('common:rules.cancellation_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="faq" className="space-y-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">{t('common:faq.title')}</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleFAQ('booking-time')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('common:faq.booking_time')}
                </h4>
                {expandedFAQ === 'booking-time' ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedFAQ === 'booking-time' && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('common:faq.booking_time_answer')}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleFAQ('cancellation')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('common:faq.cancellation')}
                </h4>
                {expandedFAQ === 'cancellation' ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedFAQ === 'cancellation' && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('common:faq.cancellation_answer')}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleFAQ('parking')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('common:faq.parking')}
                </h4>
                {expandedFAQ === 'parking' ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedFAQ === 'parking' && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {amenities.some(a => a.toLowerCase().includes('parkering'))
                      ? t('common:faq.parking_available')
                      : t('common:faq.parking_contact')}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => toggleFAQ('food-drinks')}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('common:faq.food_drinks')}
                </h4>
                {expandedFAQ === 'food-drinks' ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedFAQ === 'food-drinks' && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('common:faq.food_drinks_answer')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

    </Tabs>
  );
};
