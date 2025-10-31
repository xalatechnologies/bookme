/**
 * EmptyState - Reusable No-Data Placeholder Component
 *
 * A consistent, accessible component for displaying empty states
 * across the application with optional actions.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Calendar />}
 *   title={t('no_bookings')}
 *   description={t('no_bookings_description')}
 *   action={{
 *     label: t('create_booking'),
 *     onClick: handleCreate,
 *     variant: 'primary'
 *   }}
 * />
 * ```
 */

import React from "react";
import { Button } from "@/components/ui/button";

/**
 * Action button configuration
 */
export interface EmptyStateAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Icon to display in button */
  icon?: React.ReactNode;
}

/**
 * EmptyState Props
 */
export interface EmptyStateProps {
  /** Icon to display (typically from lucide-react) */
  icon?: React.ReactNode;
  /** Main title text */
  title: string;
  /** Description/subtitle text */
  description?: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Additional className for container */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * EmptyState Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  size = "md",
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: "py-8",
      iconSize: "w-12 h-12",
      titleSize: "text-base",
      descriptionSize: "text-xs",
      spacing: "mt-2",
      actionSpacing: "mt-3",
    },
    md: {
      container: "py-12",
      iconSize: "w-16 h-16",
      titleSize: "text-lg",
      descriptionSize: "text-sm",
      spacing: "mt-4",
      actionSpacing: "mt-4",
    },
    lg: {
      container: "py-16",
      iconSize: "w-20 h-20",
      titleSize: "text-xl",
      descriptionSize: "text-base",
      spacing: "mt-6",
      actionSpacing: "mt-6",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`text-center px-4 ${config.container} ${className}`}>
      {/* Icon */}
      {icon && (
        <div className="flex justify-center">
          <div
            className={`${config.iconSize} text-gray-400 dark:text-gray-600`}
          >
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3
        className={`${config.spacing} ${config.titleSize} font-medium text-gray-900 dark:text-white`}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={`mt-2 ${config.descriptionSize} text-gray-500 dark:text-gray-400 max-w-md mx-auto`}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div
          className={`${config.actionSpacing} flex items-center justify-center gap-3`}
        >
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || "default"}
              size={action.size || "default"}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || "outline"}
              size={secondaryAction.size || "default"}
            >
              {secondaryAction.icon && (
                <span className="mr-2">{secondaryAction.icon}</span>
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
