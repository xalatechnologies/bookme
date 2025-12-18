import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, ChevronDown } from "lucide-react";

export interface FilterOption {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface FilterGroup {
  readonly id: string;
  readonly label: string;
  readonly options: readonly FilterOption[];
  readonly isOpen?: boolean;
}

export interface FilterBarProps {
  readonly filters: readonly FilterGroup[];
  readonly selectedValues: Record<string, string[]>;
  readonly onFilterChange: (filterId: string, values: string[]) => void;
  readonly onReset: () => void;
  readonly searchPlaceholder?: string;
  readonly searchValue?: string;
  readonly onSearchChange?: (value: string) => void;
  readonly className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  selectedValues,
  onFilterChange,
  onReset,
  searchPlaceholder,
  searchValue = "",
  onSearchChange,
  className = "",
}) => {
  const { t } = useTranslation("common");

  const totalActiveFilters = useMemo(() => {
    return Object.values(selectedValues).reduce(
      (sum, vals) => sum + vals.length,
      0
    );
  }, [selectedValues]);

  const handleToggleFilter = useCallback(
    (filterId: string, value: string) => {
      const current = selectedValues[filterId] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFilterChange(filterId, updated);
    },
    [selectedValues, onFilterChange]
  );

  const handleClearFilter = useCallback(
    (filterId: string) => {
      onFilterChange(filterId, []);
    },
    [onFilterChange]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder || t("actions.search", "Search")}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        {filters.map((group) => (
          <div key={group.id} className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {group.label}
              {selectedValues[group.id]?.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedValues[group.id].length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3" />
            </Button>

            {/* Dropdown Menu */}
            <div className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-max">
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {group.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={(selectedValues[group.id] || []).includes(
                        option.value
                      )}
                      onChange={() =>
                        handleToggleFilter(group.id, option.value)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Clear Filter Option */}
              {selectedValues[group.id]?.length > 0 && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700" />
                  <Button
                    onClick={() => handleClearFilter(group.id)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <X className="h-3 w-3" />
                    {t("actions.clear", "Clear")}
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Reset All Button */}
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4 mr-1" />
            {t("actions.resetAll", "Reset All")}
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((group) =>
            (selectedValues[group.id] || []).map((value) => {
              const option = group.options.find((o) => o.value === value);
              return (
                <Badge
                  key={`${group.id}-${value}`}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {option?.label || value}
                  <Button
                    onClick={() => handleToggleFilter(group.id, value)}
                    variant="ghost"
                    size="icon"
                    className="ml-1 hover:text-red-600 p-0 h-auto w-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
