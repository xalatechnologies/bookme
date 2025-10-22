"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

interface ISystemMessageFiltersProps {
  readonly messageFilter: string;
  readonly onFilterChange: (value: string) => void;
  readonly unreadMessagesCount: number;
}

const SystemMessageFilters = (props: ISystemMessageFiltersProps): JSX.Element => {
  const { messageFilter, onFilterChange, unreadMessagesCount } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Systemmeldinger
        </CardTitle>
        {unreadMessagesCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadMessagesCount}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Select value={messageFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]" aria-label="Filtrer systemmeldinger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="booking">Booking</SelectItem>
            <SelectItem value="news">Nyheter</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SystemMessageFilters;