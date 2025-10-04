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
    switch (card.color) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      case "green":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "yellow":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case "red":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "purple":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
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
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${
              card.color === "blue" ? "bg-blue-100 dark:bg-blue-800" :
              card.color === "green" ? "bg-green-100 dark:bg-green-800" :
              card.color === "yellow" ? "bg-yellow-100 dark:bg-yellow-800" :
              card.color === "red" ? "bg-red-100 dark:bg-red-800" :
              card.color === "purple" ? "bg-purple-100 dark:bg-purple-800" :
              "bg-gray-100 dark:bg-gray-700"
            }`}>
              <IconComponent className={`w-5 h-5 ${
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
          
          <div className="mb-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {card.trend.period}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
