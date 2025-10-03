import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";

interface CartDropdownProps {
  readonly onClose: () => void;
}

export const CartDropdown = ({ onClose }: CartDropdownProps): JSX.Element => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Valgte tider</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">Ingen valgte tider</p>
          <p className="text-sm text-gray-400">
            Velg fasiliteter og tider for å se dem her
          </p>
        </div>
      </div>
    </div>
  );
};
