"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface IBookingFiltersProps {
  readonly bookingFilter: string;
  readonly onFilterChange: (value: string) => void;
}

const BookingFilters = (props: IBookingFiltersProps): JSX.Element => {
  const { bookingFilter, onFilterChange } = props;

  const bookingFilters = [
    { value: "all", label: "Alle" },
    { value: "confirmed", label: "Bekreftet" },
    { value: "pending", label: "Ventende" },
    { value: "cancelled", label: "Avlyst" }
  ];

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Mine bookinger
      </CardTitle>
      <div className="flex items-center space-x-2">
        <Select value={bookingFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]" aria-label="Filtrer bookinger">
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
    </div>
  );
};

export default BookingFilters;