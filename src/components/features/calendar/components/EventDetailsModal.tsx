"use client";

import React from "react";
import type { IBookingEventWithMeta } from "@/types/calendar";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface IEventDetailsModalProps {
  readonly event: IBookingEventWithMeta;
  readonly onClose: () => void;
  readonly onEdit: (event: IBookingEventWithMeta) => void;
  readonly onDelete: (event: IBookingEventWithMeta) => void;
  readonly t: (key: string) => string;
}

export const EventDetailsModal = ({
  event,
  onClose,
  onEdit,
  onDelete,
  t,
}: IEventDetailsModalProps): JSX.Element => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {event.title}
            </h2>
            <button
              onClick={onClose}
              aria-label={t('pages.calendar.actions.close')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-3">
            <EventDetailRow
              label={t('pages.calendar.facility')}
              value={event.facilityName}
            />

            <EventDetailRow
              label={t('pages.calendar.date')}
              value={new Date(event.start).toLocaleDateString("nb-NO", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            />

            <EventDetailRow
              label={t('pages.calendar.time')}
              value={`${new Date(event.start).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit"
              })} - ${new Date(event.end).toLocaleTimeString("nb-NO", {
                hour: "2-digit",
                minute: "2-digit"
              })}`}
            />

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('pages.calendar.status')}:</span>
              <StatusBadge status={event.status} t={t} />
            </div>

            {event.meta?.priceText && (
              <EventDetailRow
                label={t('pages.calendar.price')}
                value={event.meta.priceText}
                valueClassName="font-medium"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <PrimaryButton
              onClick={() => onEdit(event)}
              aria-label={t('pages.calendar.actions.edit')}
              className="flex-1 h-12 px-4 font-medium rounded-lg shadow-md"
            >
              {t('pages.calendar.actions.edit')}
            </PrimaryButton>
            <button
              onClick={() => onDelete(event)}
              aria-label={t('pages.calendar.actions.delete')}
              className="flex-1 h-12 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors shadow-md"
            >
              {t('pages.calendar.actions.delete')}
            </button>
            <button
              onClick={onClose}
              aria-label={t('pages.calendar.actions.close')}
              className="flex-1 h-12 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              {t('pages.calendar.actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface IEventDetailRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueClassName?: string;
}

const EventDetailRow = ({ label, value, valueClassName }: IEventDetailRowProps): JSX.Element => {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}:</span>
      <span className={`text-gray-900 dark:text-white ${valueClassName || ''}`}>
        {value}
      </span>
    </div>
  );
};

interface IStatusBadgeProps {
  readonly status: 'confirmed' | 'pending' | 'cancelled';
  readonly t: (key: string) => string;
}

const StatusBadge = ({ status, t }: IStatusBadgeProps): JSX.Element => {
  const statusConfig = {
    confirmed: {
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: t('pages.calendar.status_labels.confirmed'),
    },
    pending: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      label: t('pages.calendar.status_labels.pending'),
    },
    cancelled: {
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: t('pages.calendar.status_labels.cancelled'),
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded text-sm ${config.className}`}>
      {config.label}
    </span>
  );
};
