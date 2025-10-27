import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ISelectedTimeSlot, BookingType } from '@/components/features/bookings/types';
import { TimeSlotPackageDisplay } from './TimeSlotPackageDisplay';
import { IPriceCalculationResult } from '../hooks/usePriceCalculation';

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
  const { t } = useTranslation('bookings');

  const hasSlots = selectedSlots.length > 0 || recurringSlots.length > 0;
  const isRecurring = bookingType === 'recurring';

  /**
   * Get appropriate title based on state
   */
  const getTitle = (): string => {
    if (!hasSlots) {
      return t('details.select_slots_pricing', 'Velg tidspunkter og få en prisberegning');
    }

    if (isRecurring) {
      return recurringSlots.length > 0
        ? t('details.recurring_slots_pricing', 'Gjentakende tidspunkter og prisberegning')
        : t('details.select_pattern', 'Tidspunkter og prisberegning (velg gjentakelsesmønster)');
    }

    return t('details.selected_slots_pricing', 'Valgte tidspunkter og prisberegning');
  };

  return (
    <div className="sticky top-20 h-[calc(100vh-8rem)] overflow-y-auto space-y-4">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-700">
            {getTitle()}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {hasSlots ? (
            <>
              {/* Selected Slots Display */}
              <div className="space-y-2">
                {/* Show template for recurring or selected slots for one-time */}
                {isRecurring && recurringSlots.length > 0 ? (
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
                {isRecurring && recurringSlots.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">
                      {t('recurring.occurrences', 'Gjentakende forekomster')} ({recurringSlots.length} {t('common:total', 'totalt')}):
                    </div>

                    {/* Show first 5 occurrences */}
                    <div className="space-y-3">
                      {recurringSlots.slice(0, 5).map((slot, index) => (
                        <div key={slot.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                {slot.date instanceof Date
                                  ? slot.date.toLocaleDateString('nb-NO')
                                  : new Date(slot.date).toLocaleDateString('nb-NO')}
                                {' - '}
                                {slot.timeSlot}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {t('recurring.title', 'Gjentakende')}
                          </Badge>
                        </div>
                      ))}

                      {recurringSlots.length > 5 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          ... {t('common:and', 'og')} {recurringSlots.length - 5} {t('common:more', 'til')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Clear All Button */}
                {(selectedSlots.length > 1 || recurringSlots.length > 0) && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearAll}
                      className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                      aria-label={t('actions.clear_all', 'Fjern alle valgte tidspunkter')}
                    >
                      <X className="h-3 w-3 mr-1" />
                      {t('actions.clear_all', 'Fjern alle valgte tidspunkter')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold text-gray-900">
                  {t('details.pricing_breakdown', 'Prisberegning')}
                </h4>

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {priceCalculation.priceBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className={item.type === 'discount' ? 'text-green-600' : 'text-gray-700'}>
                        {item.description}
                      </span>
                      <span className={item.type === 'discount' ? 'text-green-600 font-medium' : 'text-gray-900'}>
                        {item.amount < 0 ? '-' : ''}kr {Math.abs(item.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-base font-bold text-gray-900">
                    {t('cart.total', 'Totalt')}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    kr {priceCalculation.totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Approval Notice */}
                {priceCalculation.requiresApproval && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      {t('messages.warnings.approval_required', 'Denne bookingen krever godkjenning')}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {t('details.select_slots_pricing', 'Velg tidspunkter og få en prisberegning')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
