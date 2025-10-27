"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Plus, Settings } from "lucide-react";

interface ISystemPageLayoutProps {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
  readonly searchPlaceholder?: string;
  readonly onSearch?: (query: string) => void;
  readonly showFilter?: boolean;
  readonly onFilter?: () => void;
  readonly primaryAction?: {
    readonly label: string;
    readonly icon?: React.ComponentType<{ className?: string }>;
    readonly onClick: () => void;
  };
  readonly secondaryActions?: readonly {
    readonly label: string;
    readonly icon?: React.ComponentType<{ className?: string }>;
    readonly onClick: () => void;
  }[];
}

const SystemPageLayout = ({
  title,
  description,
  children,
  searchPlaceholder = "Søk...",
  onSearch,
  showFilter = false,
  onFilter,
  primaryAction,
  secondaryActions = []
}: ISystemPageLayoutProps): JSX.Element => {
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </header>

      {/* Search and Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {onSearch && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          )}
          {showFilter && onFilter && (
            <Button variant="outline" size="sm" onClick={onFilter}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.onClick}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ))}
          {primaryAction && (
            <Button size="sm" onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon className="h-4 w-4 mr-2" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default SystemPageLayout;
