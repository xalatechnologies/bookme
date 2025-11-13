"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { LocalizedSelect } from "@/components/common/LocalizedSelect";

interface ISystemMessageFiltersProps {
  readonly messageFilter: string;
  readonly onFilterChange: (value: string) => void;
  readonly unreadMessagesCount: number;
}

export const SystemMessageFilters = (
  props: ISystemMessageFiltersProps
): JSX.Element => {
  const { messageFilter, onFilterChange, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unreadMessagesCount: _unreadMessagesCount } = props;
  const { t } = useTranslation("common");

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <LocalizedSelect
          entityType="message_type"
          value={messageFilter}
          onValueChange={onFilterChange}
          className="w-[180px]"
          ariaLabel={t("aria.filter_system_messages", "Filter system messages")}
          includeAll={true}
        />
      </div>
    </div>
  );
};
