"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { IKPICard } from "@/types/admin";

interface IKPICardProps {
  readonly card: IKPICard;
}

const KPICard = ({ card }: IKPICardProps): JSX.Element => {
  const navigate = useNavigate();
  const IconComponent = card.icon;

  const getTrendIcon = (): React.ReactNode => {
    switch (card.trend.direction) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
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

  const handleClick = (): void => {
    navigate(card.href);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${getCardColorClasses()}`}
      role="button"
      tabIndex={0}
      aria-label={`Gå til ${card.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${
              card.color === "blue" ? "bg-blue-100 dark:bg-blue-800" :
              card.color === "green" ? "bg-green-100 dark:bg-green-800" :
              card.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-800" :
              card.color === "red" ? "bg-red-100 dark:bg-red-800" :
              card.color === "purple" ? "bg-purple-100 dark:bg-purple-800" :
              "bg-gray-100 dark:bg-gray-700"
            }`}>
              <IconComponent className={`w-6 h-6 ${
                card.color === "blue" ? "text-blue-600 dark:text-blue-400" :
                card.color === "green" ? "text-green-600 dark:text-green-400" :
                card.color === "yellow" ? "text-yellow-600 dark:text-yellow-400" :
                card.color === "red" ? "text-red-600 dark:text-red-400" :
                card.color === "purple" ? "text-purple-600 dark:text-purple-400" :
                "text-gray-600 dark:text-gray-400"
              }`} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {card.title}
            </h3>
          </div>
          
          <div className="mb-3">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {card.value.toLocaleString()}
            </p>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {card.description}
          </p>
          
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {card.trend.percentage}% {card.trend.direction === "up" ? "opp" : card.trend.direction === "down" ? "ned" : "uendret"}
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
