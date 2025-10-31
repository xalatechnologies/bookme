"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useSystemMessageHelpers } from "../hooks/useSystemMessageHelpers";

interface ISystemMessage {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly type: "info" | "warning" | "maintenance" | "success";
  readonly date: string;
  readonly isRead?: boolean;
  readonly category?: "system" | "booking" | "news";
}

interface ISystemMessagesProps {
  readonly messages: readonly ISystemMessage[];
  readonly onMarkAsRead: (messageId: string) => void;
  readonly formatMessageDate: (dateString: string) => string;
}

export const SystemMessages = (props: ISystemMessagesProps): JSX.Element => {
  const { messages, onMarkAsRead, formatMessageDate } = props;
  const { t } = useTranslation("user");
  const { getMessageIcon, getCategoryLabel } = useSystemMessageHelpers();

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start space-x-3 p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
            message.isRead
              ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
          }`}
          onClick={() => onMarkAsRead(message.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onMarkAsRead(message.id);
            }
          }}
          aria-label={t("dashboard.system_messages.mark_as_read", { title: message.title })}
        >
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              {getMessageIcon(message.type)}
              {!message.isRead && (
                <div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                  aria-label={t("dashboard.system_messages.unread_indicator")}
                ></div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4
                className={`font-medium ${
                  message.isRead
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-900 dark:text-white font-semibold"
                }`}
              >
                {message.title}
              </h4>
              <div className="flex items-center gap-2">
                {message.category && (
                  <Badge variant="outline" className="text-xs">
                    {getCategoryLabel(message.category)}
                  </Badge>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {formatMessageDate(message.date)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {message.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
