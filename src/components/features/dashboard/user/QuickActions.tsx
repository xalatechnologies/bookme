"use client";

/**
 * QuickActions Component
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Displays quick action buttons only
 * - Open/Closed: Extensible through quickActions prop
 * - Dependency Inversion: Uses i18n translations
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface IQuickAction {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly path: string;
  readonly color: string;
}

interface IQuickActionsProps {
  readonly quickActions: readonly IQuickAction[];
}

/**
 * QuickActions Component
 *
 * Displays a grid of quick action buttons for common user tasks
 *
 * @example
 * ```tsx
 * <QuickActions
 *   quickActions={[
 *     {
 *       id: 'book',
 *       title: 'Book Facility',
 *       description: 'Make a new booking',
 *       icon: Calendar,
 *       path: '/facilities',
 *       color: 'bg-blue-500'
 *     }
 *   ]}
 * />
 * ```
 */
export const QuickActions = (props: IQuickActionsProps): JSX.Element => {
  const { quickActions } = props;
  const { t } = useTranslation('user');
  const navigate = useNavigate();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('dashboard.quickActions')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
                onClick={() => {
                  navigate(action.path);
                }}
                aria-label={`${action.title}: ${action.description}`}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};


