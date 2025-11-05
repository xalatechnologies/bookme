"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Users } from 'lucide-react';

import type { Zone } from '@/types/booking';
import { useTranslation } from '@/i18n';
import { useFieldConfigStore } from '@/stores/fieldConfigStore';

import { FacilityCalendar } from '@/components/features/calendar/components/FacilityCalendar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { AmenityGrid } from './components/AmenityGrid';
import { TabPanel } from './components/TabPanel';
import { getVisibleFields, splitFieldsIntoColumns } from '@/utils/facility/fieldMappingUtils';
import { hasParkingAmenity } from '@/utils/facility/amenityIconUtils';
import { extractContactInfo, formatContactInfo } from '@/utils/facility/contactUtils';

interface FacilityInfoTabsProps {
  readonly description: string;
  readonly capacity: number;
  readonly equipment: readonly string[];
  readonly zones: readonly Zone[];
  readonly amenities: readonly string[];
  readonly area: string;
  readonly suitableFor: readonly string[];
  readonly facilityId: string;
  readonly facilityName: string;
  readonly showBookingInterface?: boolean;
}

export const FacilityInfoTabs: React.FC<FacilityInfoTabsProps> = ({
  description,
  capacity,
  equipment,
  zones,
  amenities,
  area,
  suitableFor,
  facilityId,
  facilityName,
  showBookingInterface = false
}): JSX.Element => {
  const { t, i18n } = useTranslation(['facility', 'common']);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (faqId: string): void => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  // Get field configs for this facility
  const { getFieldConfigsForFacility } = useFieldConfigStore();
  const fieldConfigs = getFieldConfigsForFacility(facilityId);
  const visibleFields = getVisibleFields(fieldConfigs);
  const { firstColumn, secondColumn } = splitFieldsIntoColumns(visibleFields);

  return (
    <Tabs defaultValue="book" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="book">{t('facility:actions.book')}</TabsTrigger>
        <TabsTrigger value="general">{t('facility:details.overview')}</TabsTrigger>
        <TabsTrigger value="zones">{t('facility:zones.title')}</TabsTrigger>
        <TabsTrigger value="facilities">{t('facility:details.facilities')}</TabsTrigger>
        <TabsTrigger value="rules">{t('facility:details.policies')}</TabsTrigger>
        <TabsTrigger value="faq">{t('common:faq.title')}</TabsTrigger>
      </TabsList>

      <TabsContent value="book" className="space-y-6 mt-6">
        <TabPanel>
          <div>
            {showBookingInterface && zones.length > 0 ? (
              <FacilityCalendar
                facilityId={facilityId}
                facilityName={facilityName}
                zones={zones}
                isLoading={false}
                error={undefined}
                openingHoursStart="08:00"
                openingHoursEnd="22:00"
                useStepByStepBooking={true}
              />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">{t('facility:details.book_facility')}</h3>
                <p className="text-gray-600">{t('facility:mobile_panel.booking_coming_soon')}</p>
              </div>
            )}
          </div>
        </TabPanel>
      </TabsContent>

      <TabsContent value="general" className="space-y-6 mt-6">
        <TabPanel>
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column: Description and Capacity */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('facility:fields.description')}</h3>
                  <p className="text-gray-700 leading-relaxed">{description}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('facility:fields.capacity')}</h3>
                  <p className="text-gray-600">
                    {t('facility:fields.max_allowed')}: {capacity} {t('facility:card.people')}
                  </p>
                </div>
              </div>
              
              {/* Right column: Contact Information and Opening Hours */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('facility:details.contact_info')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('common:common.email', 'Email')}
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {formatContactInfo(extractContactInfo(description)).email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common:common.phone', 'Phone')}</p>
                        <p className="text-gray-900 dark:text-white">
                          {formatContactInfo(extractContactInfo(description)).phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">{t('facility:fields.opening_hours')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('common:time.weekdays.monday')}-{t('common:time.weekdays.friday')}</span>
                        <span className="font-medium">08:00 - 22:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('common:time.weekdays.saturday')}</span>
                        <span className="font-medium">09:00 - 20:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('common:time.weekdays.sunday')}</span>
                        <span className="font-medium">10:00 - 18:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabsContent>

      <TabsContent value="zones" className="space-y-6 mt-6">
        <TabPanel>
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('facility:zones.available_zones')}</h3>
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
        </TabPanel>
      </TabsContent>

      <TabsContent value="facilities" className="space-y-6 mt-6">
        <TabPanel>
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('facility:amenities.available_title')}</h3>
            <AmenityGrid
              items={amenities}
              variant="default"
              emptyMessage={t('facility:amenities.no_amenities')}
            />

            {equipment.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">{t('facility:amenities.equipment_title')}</h4>
                <AmenityGrid items={equipment} variant="blue" />
              </div>
            )}

            {suitableFor.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">{t('facility:amenities.suitable_for')}</h4>
                <AmenityGrid items={suitableFor} variant="green" />
              </div>
            )}
          </div>
        </TabPanel>
      </TabsContent>

      <TabsContent value="rules" className="space-y-6 mt-6">
        <TabPanel>
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
        </TabPanel>
      </TabsContent>

      <TabsContent value="faq" className="space-y-6 mt-6">
        <TabPanel>
          <div>
            <h3 className="text-xl font-semibold mb-4">{t('common:faq.title')}</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleFAQ('booking-time')}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label={t('common:faq.booking_time')}
                  aria-expanded={expandedFAQ === 'booking-time'}
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
                  aria-label={t('common:faq.cancellation')}
                  aria-expanded={expandedFAQ === 'cancellation'}
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
                  aria-label={t('common:faq.parking')}
                  aria-expanded={expandedFAQ === 'parking'}
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
                      {hasParkingAmenity(amenities)
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
                  aria-label={t('common:faq.food_drinks')}
                  aria-expanded={expandedFAQ === 'food-drinks'}
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
        </TabPanel>
      </TabsContent>

    </Tabs>
  );
};
