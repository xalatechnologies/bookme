"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface IBookingFiltersProps {
  readonly bookingFilter: string;
  readonly onFilterChange: (value: string) => void;
}

const BookingFilters = (props: IBookingFiltersProps): JSX.Element => {
  const { bookingFilter, onFilterChange } = props;
  const { t } = useTranslation("common");

  const bookingFilters = [
    { value: "all", label: t("common.all") },
    { value: "confirmed", label: t("status.confirmed") },
    { value: "pending", label: t("status.pending") },
    { value: "cancelled", label: t("status.cancelled") },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Select value={bookingFilter} onValueChange={onFilterChange}>
        <SelectTrigger
          className="w-[180px]"
          aria-label={t("aria.filter_bookings", "Filter bookings")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {bookingFilters.map((filter) => (
            <SelectItem key={filter.value} value={filter.value}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BookingFilters;