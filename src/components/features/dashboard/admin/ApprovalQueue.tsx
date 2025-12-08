"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, User } from "lucide-react";
import { IApprovalRequest } from "@/types/admin";
import { usePriorityHelpers } from "../hooks/usePriorityHelpers";
import { Button } from "@/components/ui/button";

interface IApprovalQueueProps {
  readonly requests: readonly IApprovalRequest[];
}

export const ApprovalQueue = ({
  requests,
}: IApprovalQueueProps): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation("admin");
  const { getPriorityIcon, getPriorityColor } = usePriorityHelpers();

  const handleViewAll = (): void => {
    navigate("/admin/approvals");
  };

  if (requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("pages.dashboard.approvals.title")}
          </h3>
          <Button
            onClick={handleViewAll}
            variant="link"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium p-0 h-auto"
            aria-label={t("pages.dashboard.approvals.view_all")}
          >
            {t("pages.dashboard.approvals.view_all")}
          </Button>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("pages.dashboard.approvals.no_pending")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t("pages.dashboard.approvals.all_updated")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("pages.dashboard.approvals.title")}
        </h3>
        <Button
          onClick={handleViewAll}
          variant="link"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium p-0 h-auto"
        >
          {t("pages.dashboard.approvals.view_all")}
        </Button>
      </div>

      <div className="space-y-3">
        {requests.slice(0, 3).map((request) => (
          <div
            key={request.id}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
              request.priority
            )} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer`}
            onClick={() => navigate("/admin/approvals")}
            role="button"
            tabIndex={0}
            aria-label={t("pages.dashboard.approvals.title")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/admin/approvals");
              }
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(request.priority)}
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {request.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {request.facility}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {request.requester}
                  </div>
                  <span>{request.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
