/**
 * KPICard - Reusable Key Performance Indicator Card
 *
 * A flexible, accessible component for displaying metrics with trends.
 * Supports multiple formats, colors, and optional navigation.
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="Total Bookings"
 *   value={1234}
 *   format="number"
 *   trend={{ value: 12, direction: "up" }}
 *   icon={<Calendar />}
 *   color="blue"
 *   onClick={() => navigate('/bookings')}
 * />
 * ```
 */

import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * Trend direction
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * Value format type
 */
export type ValueFormat = "number" | "currency" | "percentage";

/**
 * Color variant
 */
export type KPIColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray";

/**
 * Trend data
 */
export interface KPITrend {
  /** Percentage change */
  value: number;
  /** Trend direction */
  direction: TrendDirection;
  /** Period description (e.g., "vs last month") */
  period?: string;
}

/**
 * KPICard Props
 */
export interface KPICardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: number;
  /** Value format */
  format?: ValueFormat;
  /** Description/subtitle */
  description?: string;
  /** Trend data */
  trend?: KPITrend;
  /** Icon component */
  icon?: React.ReactNode;
  /** Color scheme */
  color?: KPIColor;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Loading state */
  loading?: boolean;
}

/**
 * Format value based on type
 */
const formatValue = (
  value: number,
  format: ValueFormat,
  locale: string
): string => {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "NOK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0}).format(value);
    case "percentage":
      return `${value}%`;
    case "number":
    default:
      return new Intl.NumberFormat(locale).format(value);
  }
};

/**
 * KPICard Component
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  format = "number",
  description,
  trend,
  icon,
  color = "gray",
  onClick,
  className = "",
  size = "md",
  loading = false}) => {
  const { t: _t, i18n } = useTranslation("common");

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: "p-4",
      iconSize: "w-5 h-5",
      iconPadding: "p-1.5",
      titleSize: "text-xs",
      valueSize: "text-2xl",
      descriptionSize: "text-xs",
      trendSize: "text-xs"},
    md: {
      padding: "p-6",
      iconSize: "w-6 h-6",
      iconPadding: "p-2",
      titleSize: "text-sm",
      valueSize: "text-4xl",
      descriptionSize: "text-sm",
      trendSize: "text-sm"},
    lg: {
      padding: "p-8",
      iconSize: "w-7 h-7",
      iconPadding: "p-2.5",
      titleSize: "text-base",
      valueSize: "text-5xl",
      descriptionSize: "text-base",
      trendSize: "text-base"}};

  const config = sizeConfig[size];

  // Color configurations
  const colorConfig: Record<
    KPIColor,
    { border: string; iconBg: string; icon: string }
  > = {
    blue: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600",
      iconBg: "bg-blue-100 dark:bg-blue-800",
      icon: "text-blue-600 dark:text-blue-400"},
    green: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600",
      iconBg: "bg-green-100 dark:bg-green-800",
      icon: "text-green-600 dark:text-green-400"},
    yellow: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600",
      iconBg: "bg-yellow-100 dark:bg-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400"},
    red: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600",
      iconBg: "bg-red-100 dark:bg-red-800",
      icon: "text-red-600 dark:text-red-400"},
    purple: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600",
      iconBg: "bg-purple-100 dark:bg-purple-800",
      icon: "text-purple-600 dark:text-purple-400"},
    gray: {
      border:
        "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
      iconBg: "bg-gray-100 dark:bg-gray-700",
      icon: "text-gray-600 dark:text-gray-400"}};

  const colors = colorConfig[color];

  // Trend helpers
  const getTrendIcon = (direction: TrendDirection): React.ReactNode => {
    const iconClass = "w-4 h-4";
    switch (direction) {
      case "up":
        return (
          <TrendingUp
            className={`${iconClass} text-green-500`}
            aria-hidden="true"
          />
        );
      case "down":
        return (
          <TrendingDown
            className={`${iconClass} text-red-500`}
            aria-hidden="true"
          />
        );
      default:
        return (
          <Minus className={`${iconClass} text-gray-500`} aria-hidden="true" />
        );
    }
  };

  const getTrendColor = (direction: TrendDirection): string => {
    switch (direction) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleClick = (): void => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleClick();
    }
  };

  const formattedValue = formatValue(value, format, i18n.language);

  // Loading skeleton
  if (loading) {
    return (
      <div
        className={`${config.padding} rounded-xl border-2 ${colors.border} bg-white dark:bg-gray-800 ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`${config.iconPadding} rounded-lg ${colors.iconBg}`}
            >
              <div
                className={`${config.iconSize} bg-gray-300 dark:bg-gray-600 rounded`}
              />
            </div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
          </div>
          <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-3" />
          {description && (
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full mb-3" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
      className={`
        ${config.padding} 
        rounded-xl 
        border-2 
        ${colors.border}
        bg-white 
        dark:bg-gray-800 
        ${onClick ? "cursor-pointer hover:shadow-lg hover:scale-105" : ""}
        transition-all 
        duration-200
        ${className}
      `}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Navigate to ${title}` : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Icon & Title */}
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div
                className={`${config.iconPadding} rounded-lg ${colors.iconBg}`}
              >
                <div className={`${config.iconSize} ${colors.icon}`}>
                  {icon}
                </div>
              </div>
            )}
            <h3
              className={`${config.titleSize} font-semibold text-gray-700 dark:text-gray-300`}
            >
              {title}
            </h3>
          </div>

          {/* Value */}
          <div className="mb-3">
            <p
              className={`${config.valueSize} font-bold text-gray-900 dark:text-white`}
            >
              {formattedValue}
            </p>
          </div>

          {/* Description */}
          {description && (
            <p
              className={`${config.descriptionSize} text-gray-600 dark:text-gray-400 mb-3`}
            >
              {description}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-2">
              {getTrendIcon(trend.direction)}
              <span
                className={`${config.trendSize} font-medium ${getTrendColor(
                  trend.direction
                )}`}
              >
                {Math.abs(trend.value)}%
              </span>
              {trend.period && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
