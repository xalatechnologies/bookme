import React, { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ChevronRight } from "lucide-react";

export interface DataCardAction {
  readonly id: string;
  readonly label: string;
  readonly onClick: (id: string) => void;
  readonly variant?: "default" | "destructive" | "secondary";
  readonly icon?: React.ComponentType<{ className?: string }>;
}

export interface DataCardField {
  readonly id: string;
  readonly label: string;
  readonly value: React.ReactNode;
  readonly variant?: "default" | "accent" | "muted";
  readonly icon?: React.ComponentType<{ className?: string }>;
}

export interface DataCardProps {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly badge?: {
    readonly label: string;
    readonly variant?: "default" | "secondary" | "destructive" | "outline";
  };
  readonly fields: readonly DataCardField[];
  readonly actions: readonly DataCardAction[];
  readonly onCardClick?: (id: string) => void;
  readonly headerColor?:
    | "blue"
    | "green"
    | "red"
    | "yellow"
    | "purple"
    | "gray";
  readonly leftBorderColor?: string;
  readonly className?: string;
}

const getBorderColorClass = (color?: string): string => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    yellow: "border-yellow-500",
    purple: "border-purple-500",
    gray: "border-gray-500",
  };
  return colorMap[color || "gray"];
};

export const DataCard: React.FC<DataCardProps> = ({
  id,
  title,
  subtitle,
  badge,
  fields,
  actions,
  onCardClick,
  headerColor = "gray",
  leftBorderColor,
  className = "",
}) => {
  const handleCardClick = useCallback(() => {
    onCardClick?.(id);
  }, [id, onCardClick]);

  const borderClass = leftBorderColor || getBorderColorClass(headerColor);

  return (
    <Card
      className={`relative transition-all duration-200 border-l-4 ${borderClass} ${
        onCardClick ? "cursor-pointer hover:shadow-lg" : ""
      } ${className}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {badge && (
                <Badge variant={badge.variant || "secondary"}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action Menu */}
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(id);
                    }}
                    className={
                      action.variant === "destructive"
                        ? "text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                        : ""
                    }
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Fields */}
      <CardContent className="space-y-3">
        {fields.map((field) => {
          const Icon = field.icon;
          const variantClasses: Record<string, string> = {
            default: "text-gray-700 dark:text-gray-300",
            accent: "text-blue-600 dark:text-blue-400 font-semibold",
            muted: "text-gray-500 dark:text-gray-400 text-sm",
          };

          return (
            <div
              key={field.id}
              className="flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {Icon && (
                  <Icon className="h-4 w-4 text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {field.label}
                  </p>
                  <p
                    className={`${
                      variantClasses[field.variant || "default"]
                    } break-words`}
                  >
                    {field.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>

      {/* Click Indicator */}
      {onCardClick && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      )}
    </Card>
  );
};
