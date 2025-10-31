"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Star,
  Building2
} from "lucide-react";

interface ITrendData {
  readonly day: string;
  readonly value: number;
}

interface ITrendCardProps {
  readonly title: string;
  readonly data: readonly ITrendData[];
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly color: "blue" | "green" | "purple";
}

const TrendCard = ({ title, data, icon: Icon, color }: ITrendCardProps): JSX.Element => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;
  
  const getColorClasses = (): string => {
    const colors = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400", 
      purple: "text-purple-600 dark:text-purple-400"
    };
    return colors[color];
  };

  const getBarColor = (): string => {
    const colors = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500"
    };
    return colors[color];
  };

  const getTrendDirection = (): "up" | "down" | "stable" => {
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    
    if (lastValue > firstValue) return "up";
    if (lastValue < firstValue) return "down";
    return "stable";
  };

  const getTrendPercentage = (): number => {
    const firstValue = data[0]?.value || 0;
    const lastValue = data[data.length - 1]?.value || 0;
    
    if (firstValue === 0) return 0;
    return Math.round(((lastValue - firstValue) / firstValue) * 100);
  };

  const trendDirection = getTrendDirection();
  const trendPercentage = getTrendPercentage();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${getColorClasses()}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Trend indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {trendDirection === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : trendDirection === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <div className="h-4 w-4 bg-gray-400 rounded-full" />
              )}
              <span className={`text-sm font-medium ${
                trendDirection === "up" ? "text-green-600 dark:text-green-400" :
                trendDirection === "down" ? "text-red-600 dark:text-red-400" :
                "text-gray-600 dark:text-gray-400"
              }`}>
                {trendPercentage > 0 ? "+" : ""}{trendPercentage}%
              </span>
            </div>
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
              Siste 7 dager
            </Badge>
          </div>

          {/* Mini chart */}
          <div className="flex items-end justify-between h-16 space-x-1">
            {data.map((item, index) => {
              const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-full rounded-t ${getBarColor()} opacity-70 hover:opacity-100 transition-opacity`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`${item.day}: ${item.value}`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current value */}
          <div className="text-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {data[data.length - 1]?.value || 0}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {title.includes("Bookinger") ? "bookinger" : "lokaler"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendCard;
