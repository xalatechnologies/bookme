import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

export interface DataTableColumn<T> {
  readonly id: string;
  readonly header: string;
  readonly accessor: (item: T) => React.ReactNode;
  readonly width?: string;
  readonly sortable?: boolean;
  readonly render?: (value: React.ReactNode, item: T) => React.ReactNode;
}

export interface DataTableAction<T> {
  readonly id: string;
  readonly label: string;
  readonly onClick: (item: T) => void;
  readonly icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableProps<T> {
  readonly data: readonly T[];
  readonly columns: readonly DataTableColumn<T>[];
  readonly selectable?: boolean;
  readonly onSelectionChange?: (selectedIds: string[]) => void;
  readonly getRowId: (item: T) => string;
  readonly onRowClick?: (item: T) => void;
  readonly className?: string;
  readonly emptyMessage?: string;
}

type SortOrder = "asc" | "desc" | null;

export const DataTable = React.forwardRef<
  HTMLDivElement,
  DataTableProps<unknown>
>(
  (
    {
      data,
      columns,
      selectable = false,
      onSelectionChange,
      getRowId,
      onRowClick,
      className = "",
      emptyMessage = "No data available",
    },
    ref
  ) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [sortConfig, setSortConfig] = useState<{
      columnId: string | null;
      order: SortOrder;
    }>({
      columnId: null,
      order: null,
    });

    const sortedData = useMemo(() => {
      if (!sortConfig.columnId || sortConfig.order === null) {
        return [...data];
      }

      const sorted = [...data].sort((a, b) => {
        const column = columns.find((col) => col.id === sortConfig.columnId);
        if (!column) return 0;

        const aValue = column.accessor(a);
        const bValue = column.accessor(b);

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison =
          String(aValue).localeCompare(String(bValue), undefined, {
            numeric: true,
          }) || (String(aValue) < String(bValue) ? -1 : 1);

        return sortConfig.order === "asc" ? comparison : -comparison;
      });

      return sorted;
    }, [data, sortConfig, columns]);

    const handleSort = useCallback((columnId: string) => {
      setSortConfig((prev) => {
        if (prev.columnId === columnId) {
          if (prev.order === "asc") {
            return { columnId, order: "desc" };
          } else if (prev.order === "desc") {
            return { columnId: null, order: null };
          }
        }
        return { columnId, order: "asc" };
      });
    }, []);

    const handleSelectAll = useCallback(() => {
      if (selectedIds.size === data.length) {
        const newSelected = new Set<string>();
        setSelectedIds(newSelected);
        onSelectionChange?.([]);
      } else {
        const newSelected = new Set(
          data.map((item) => getRowId(item as unknown))
        );
        setSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
      }
    }, [data, selectedIds, getRowId, onSelectionChange]);

    const handleSelectRow = useCallback(
      (rowId: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(rowId)) {
          newSelected.delete(rowId);
        } else {
          newSelected.add(rowId);
        }
        setSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
      },
      [selectedIds, onSelectionChange]
    );

    if (data.length === 0) {
      return (
        <div
          ref={ref}
          className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400 ${className}`}
        >
          {emptyMessage}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}
      >
        <div className="w-full border-collapse">
          {/* Header */}
          <div className="flex bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {selectable && (
              <div className="p-4 w-12 font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 flex items-center">
                <Checkbox
                  checked={selectedIds.size === data.length && data.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
            )}
            {columns.map((column) => {
              return (
                <div
                  key={column.id}
                  className="flex-1 p-4 font-semibold text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.id)}
                      className="h-auto px-0 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <span className="flex items-center gap-2">
                        {column.header}
                        {sortConfig.columnId === column.id &&
                          sortConfig.order &&
                          (sortConfig.order === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                        {(!sortConfig.columnId ||
                          sortConfig.columnId !== column.id) && (
                          <ArrowUpDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </Button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div>
            {sortedData.map((item) => {
              const rowId = getRowId(item as unknown);
              return (
                <div
                  key={rowId}
                  className={`flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <div
                      className="p-4 w-12 border-r border-gray-200 dark:border-gray-700 flex items-center"
                      onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                        e.stopPropagation()
                      }
                    >
                      <Checkbox
                        checked={selectedIds.has(rowId)}
                        onCheckedChange={() => handleSelectRow(rowId)}
                      />
                    </div>
                  )}
                  {columns.map((column) => {
                    const value = column.accessor(item);
                    const rendered = column.render
                      ? column.render(value, item)
                      : value;
                    return (
                      <div
                        key={column.id}
                        className="flex-1 p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        style={{ width: column.width }}
                      >
                        {rendered}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

DataTable.displayName = "DataTable";
