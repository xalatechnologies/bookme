"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { IKPICard } from "@/types/admin";
import { formatNumber } from "@/hooks/useStatistics";

interface IKPICardProps {
  readonly card: IKPICard;
}

/**
 * KPICard Component
 *
 * Displays a Key Performance Indicator card with internationalization support
 *
 * Features:
 * - Fully internationalized labels and trend indicators
 * - Locale-aware number formatting
 * - Accessible keyboard navigation
 * - Responsive hover effects
 * - Color-coded visual indicators
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only renders KPI card UI
 * - Open/Closed: Extensible through props without modification
 * - Dependency Inversion: Depends on IKPICard interface
 */
const KPICard = ({ card }: IKPICardProps): JSX.Element => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['admin', 'common']);

  const getTrendIcon = (): React.ReactNode => {
    switch (card.trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" aria-hidden="true" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" aria-hidden="true" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" aria-hidden="true" />;
    }
  };

  const getTrendColor = (): string => {
    switch (card.trend.direction) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTrendLabel = (): string => {
    switch (card.trend.direction) {
      case "up":
        return t('admin:dashboard.trends.up');
      case "down":
        return t('admin:dashboard.trends.down');
      default:
        return t('admin:dashboard.trends.stable');
    }
  };

  const getCardColorClasses = (): string => {
    // Reduced colors - only accent colors for specific categories
    switch (card.color) {
      case "blue":
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600";
      case "green":
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600";
      case "yellow":
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-600";
      case "red":
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600";
      case "purple":
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600";
      default:
        return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
    }
  };

  const getIconBackgroundColor = (): string => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-800",
      green: "bg-green-100 dark:bg-green-800",
      yellow: "bg-yellow-100 dark:bg-yellow-800",
      red: "bg-red-100 dark:bg-red-800",
      purple: "bg-purple-100 dark:bg-purple-800"
    };
    return colors[card.color] || "bg-gray-100 dark:bg-gray-700";
  };

  const getIconColor = (): string => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      red: "text-red-600 dark:text-red-400",
      purple: "text-purple-600 dark:text-purple-400"
    };
    return colors[card.color] || "text-gray-600 dark:text-gray-400";
  };

  const handleClick = (): void => {
    navigate(card.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const IconComponent = card.icon;
  const formattedValue = formatNumber(card.value, i18n.language);

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${getCardColorClasses()}`}
      role="button"
      tabIndex={0}
      aria-label={t('admin:dashboard.kpi.go_to', { title: card.title })}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getIconBackgroundColor()}`}>
              <IconComponent
                className={`w-6 h-6 ${getIconColor()}`}
                aria-hidden="true"
              />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {card.title}
            </h3>
          </div>

          <div className="mb-3">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {formattedValue}
            </p>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {card.description}
          </p>

          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {card.trend.percentage}% {getTrendLabel()}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {card.trend.period}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
