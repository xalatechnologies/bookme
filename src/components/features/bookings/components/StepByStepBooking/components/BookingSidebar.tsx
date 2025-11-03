import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ISelectedTimeSlot, BookingType } from '@/components/features/bookings/types';
import { TimeSlotPackageDisplay } from './TimeSlotPackageDisplay';
import { IPriceCalculationResult } from '../hooks/usePriceCalculation';
import { useBookingSidebarDisplay } from '@/hooks/features/bookings/useBookingSidebarDisplay';

/**
 * Booking sidebar props
 */
export interface IBookingSidebarProps {
  readonly selectedSlots: readonly ISelectedTimeSlot[];
  readonly recurringSlots: readonly ISelectedTimeSlot[];
  readonly bookingType: BookingType;
  readonly priceCalculation: IPriceCalculationResult;
  readonly onClearAll: () => void;
}

/**
 * Booking sidebar component
 *
 * Displays selected slots and price calculation in the right sidebar
 * Shows both template slots and recurring occurrences for recurring bookings
 *
 * @param props - Component props
 * @returns JSX.Element
 */
export const BookingSidebar = ({
  selectedSlots,
  recurringSlots,
  bookingType,
  priceCalculation,
  onClearAll
}: IBookingSidebarProps): JSX.Element => {
  const { t } = useTranslation('booking');

  const {
    title,
    hasSlots,
    isRecurring,
    currentLocale,
    shouldShowTemplate,
    shouldShowRecurringPreview,
    visibleRecurringSlots,
    remainingRecurringSlotsCount,
    shouldShowClearButton,
    formatSlotDate,
    formatPrice,
  } = useBookingSidebarDisplay({
    selectedSlots,
    recurringSlots,
    bookingType,
    priceCalculation,
  });

  return (
    <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {hasSlots ? (
            <>
              {/* Selected Slots Display */}
              <div className="space-y-2">
                {/* Show template for recurring or selected slots for one-time */}
                {shouldShowTemplate ? (
                  <TimeSlotPackageDisplay
                    slots={selectedSlots}
                    variant="template"
                  />
                ) : (
                  <TimeSlotPackageDisplay
                    slots={selectedSlots}
                    variant="default"
                  />
                )}

                {/* Show recurring slots preview */}
                {shouldShowRecurringPreview && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      {t('recurring.occurrences', 'Gjentakende forekomster')} ({recurringSlots.length} {t('common:total', 'totalt')}):
                    </div>

                    {/* Show first 5 occurrences */}
                    <div className="space-y-3">
                      {visibleRecurringSlots.map((slot) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                {formatSlotDate(slot.date)} - {slot.timeSlot}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {t('recurring.title', 'Gjentakende')}
                          </Badge>
                        </div>
                      ))}

                      {remainingRecurringSlotsCount > 0 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          ... {t('common:and', 'og')} {remainingRecurringSlotsCount} {t('common:more', 'til')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clear All Button */}
                {shouldShowClearButton && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                      aria-label={t('booking:sidebar.clear_all_slots', 'Remove all selected time slots')}
                    >
                      <X className="h-3 w-3 mr-1" />
                      {t('booking:sidebar.clear_all_slots', 'Remove all selected time slots')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-900">
                  {t('booking:details.pricing_breakdown', 'Pricing Breakdown')}
                </h4>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {priceCalculation.priceBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className={item.type === 'discount' ? 'text-green-600' : 'text-gray-700'}>
                        {item.description}
                      </span>
                      <span className={item.type === 'discount' ? 'text-green-600 font-medium' : 'text-gray-900'}>
                        {item.amount < 0 ? '-' : ''}{formatPrice(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-base font-bold text-gray-900">
                    {t('booking:cart.total', 'Total')}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(priceCalculation.totalPrice)}
                  </span>
                </div>

                {/* Approval Notice */}
                {priceCalculation.requiresApproval && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      {t('booking:messages.warnings.approval_required', 'This booking requires approval')}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {t('booking:details.select_slots_pricing', 'Select time slots and get a price calculation')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
