"use client";

// External libraries
import React from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Repeat } from "lucide-react";

// Internal libraries/utilities
import { Button } from "@/components/ui/button";

// Types
import type { BookingType } from "@/types/booking";

interface BookingTypeSelectorProps {
  readonly selectedType: BookingType;
  readonly onTypeChange: (type: BookingType) => void;
  readonly disabled?: boolean;
}

/**
 * BookingTypeSelector Component
 *
 * Allows users to select between one-time and recurring booking types.
 * Provides clear visual distinction between the two options with icons and descriptions.
 *
 * Features:
 * - Visual selection between one-time and recurring bookings
 * - Clear descriptions for each booking type
 * - Disabled state support
 * - Accessible design with proper ARIA labels
 *
 * Usage:
 * - Use selectedType to control the current selection
 * - Use onTypeChange to handle selection changes
 * - Use disabled to prevent interaction when needed
 */
export function BookingTypeSelector({
  selectedType,
  onTypeChange,
  disabled = false,
}: BookingTypeSelectorProps): JSX.Element {
  const { t } = useTranslation(["bookings", "common"]);

  const types = [
    {
      id: "one-time" as BookingType,
      label: t("bookings:booking_types.one_time_label"),
      description: t("bookings:booking_types.one_time_description"),
      icon: Calendar,
    },
    {
      id: "recurring" as BookingType,
      label: t("bookings:booking_types.recurring_label"),
      description: t("bookings:booking_types.recurring_description"),
      icon: Repeat,
    },
  ];

  return (
    <div className="flex gap-2">
      {types.map((type) => {
        const Icon = type.icon;
        const isSelected = selectedType === type.id;

        return (
          <Button
            key={type.id}
            variant={isSelected ? "default" : "outline"}
            onClick={() => !disabled && onTypeChange(type.id)}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
              isSelected
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                : "hover:bg-gray-50 border-gray-200"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            aria-pressed={isSelected}
            aria-label={t("bookings:booking_types.select_label", {
              type: type.label,
            })}
          >
            <Icon
              className={`w-4 h-4 ${
                isSelected ? "text-white" : "text-gray-600"
              }`}
            />
            <span
              className={`font-medium ${
                isSelected ? "text-white" : "text-gray-900"
              }`}
            >
              {type.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
