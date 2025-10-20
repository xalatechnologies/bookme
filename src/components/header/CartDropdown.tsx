import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Trash2, Calendar, Clock, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { format, parseISO } from "date-fns";
import { nb } from "date-fns/locale";

interface CartDropdownProps {
  readonly onClose: () => void;
}

export const CartDropdown = ({ onClose }: CartDropdownProps): JSX.Element => {
  const navigate = useNavigate();
  const { items, totalPrice, removeItem, clearCart } = useCart();

  /**
   * Format time slot for display
   * 
   * @param slot - Time slot object
   * @returns Formatted string
   */
  const formatTimeSlot = (slot: { date: string | Date; timeSlot: string }): string => {
    const dateObj = typeof slot.date === 'string' ? parseISO(slot.date) : slot.date;
    const date = format(dateObj, "dd. MMM", { locale: nb });
    const time = slot.timeSlot.split('-')[0];
    return `${date} kl. ${time}`;
  };

  /**
   * Handle remove item
   * 
   * @param itemId - ID of item to remove
   */
  const handleRemoveItem = (itemId: string): void => {
    removeItem(itemId);
  };

  /**
   * Handle clear all items
   */
  const handleClearAll = (): void => {
    clearCart();
  };

  return (
    <div className="w-full bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Reservasjonskurv</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="p-4">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Ingen reservasjoner</p>
            <p className="text-sm text-gray-400">
              Velg fasiliteter og tider for å se dem her
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Cart Items */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((item) => {
              return (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {item.facilityName}
                    </h4>
                    <p className="text-xs text-gray-600">{item.zoneName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-100 p-1 h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Time Slots */}
                <div className="space-y-1">
                  {item.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimeSlot(slot)}</span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span>{slot.duration / 60} timer</span>
                    </div>
                  ))}
                </div>
                
                {/* Price */}
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Pris:</span>
                    <span className="font-medium">{item.pricing.finalPrice.toLocaleString('nb-NO')} kr</span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Total and Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-lg">Total:</span>
              <span className="font-bold text-lg">{totalPrice} kr</span>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => {
                  onClose();
                  navigate("/checkout");
                }}
                className="w-full"
                size="sm"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Gå til bestilling
              </Button>
              
              <Button
                onClick={handleClearAll}
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Tøm kurv
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
