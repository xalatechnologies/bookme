"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertTriangle, Clock, CheckCircle } from "lucide-react";

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

  const getMessageIcon = (type: ISystemMessage["type"]): JSX.Element => {
    const icons = {
      info: Bell,
      warning: AlertTriangle,
      maintenance: Clock,
      success: CheckCircle,
    };
    const Icon = icons[type];
    return <Icon className="h-4 w-4" />;
  };

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
          aria-label={`Merk melding "${message.title}" som lest`}
        >
          <div className="flex-shrink-0 mt-1">
            <div className="relative">
              {getMessageIcon(message.type)}
              {!message.isRead && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
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
                    {message.category}
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
